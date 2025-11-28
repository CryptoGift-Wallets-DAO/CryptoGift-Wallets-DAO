/**
 * 📡 REFERRAL TRACKING API
 *
 * POST - Track a click on a referral link
 * GET - Get referral code info (for landing page)
 *
 * @endpoint /api/referrals/track
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  trackClick,
  getReferralCodeByCode,
  hashIP,
  registerReferral,
  markClickConverted,
} from '@/lib/referrals/referral-service';

// Helper to detect device type from user agent
function detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  if (/windows|macintosh|linux/i.test(ua)) {
    return 'desktop';
  }
  return 'unknown';
}

// Helper to extract browser from user agent
function detectBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  return 'Other';
}

// Helper to extract OS from user agent
function detectOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return 'Other';
}

// GET /api/referrals/track?code=CG-XXXXXX
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const referralCode = await getReferralCodeByCode(code);

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    if (!referralCode.is_active) {
      return NextResponse.json(
        { error: 'Referral code is no longer active' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        code: referralCode.custom_code || referralCode.code,
        isValid: true,
        isActive: referralCode.is_active,
      },
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    return NextResponse.json(
      { error: 'Failed to validate referral code' },
      { status: 500 }
    );
  }
}

// POST /api/referrals/track - Track a click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, source, medium, campaign, referer, landingPage } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIP || 'unknown';

    // Hash IP for privacy
    const ipHash = await hashIP(ip);

    // Detect device info
    const deviceType = detectDeviceType(userAgent);
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);

    // Track the click
    await trackClick({
      referralCode: code,
      ipHash,
      userAgent,
      source: source || null,
      medium: medium || null,
      campaign: campaign || null,
      referer: referer || request.headers.get('referer') || null,
      landingPage: landingPage || null,
      deviceType,
      browser,
      os,
    });

    // Set cookie for conversion tracking
    const response = NextResponse.json({
      success: true,
      data: {
        tracked: true,
        ipHash, // Return for conversion tracking
      },
    });

    // Set referral code cookie (expires in 30 days)
    response.cookies.set('ref_code', code, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    // Set IP hash cookie for conversion tracking
    response.cookies.set('ref_ip', ipHash, {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error tracking referral click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}

// PUT /api/referrals/track - Register conversion (when user signs up)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, code, source, campaign } = body;

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Get referral code from cookie or body
    const refCode = code || request.cookies.get('ref_code')?.value;
    const ipHash = request.cookies.get('ref_ip')?.value;

    if (!refCode) {
      return NextResponse.json({
        success: true,
        data: {
          registered: false,
          message: 'No referral code found',
        },
      });
    }

    // Register the referral
    const referral = await registerReferral(wallet, refCode, source, campaign);

    if (!referral) {
      return NextResponse.json({
        success: true,
        data: {
          registered: false,
          message: 'User already registered or invalid referral code',
        },
      });
    }

    // Mark the click as converted
    if (ipHash) {
      await markClickConverted(ipHash, wallet);
    }

    // Clear referral cookies
    const response = NextResponse.json({
      success: true,
      data: {
        registered: true,
        referrer: referral.referrer_address,
        level: referral.level,
      },
    });

    response.cookies.delete('ref_code');
    response.cookies.delete('ref_ip');

    return response;
  } catch (error) {
    console.error('Error registering referral conversion:', error);
    return NextResponse.json(
      { error: 'Failed to register conversion' },
      { status: 500 }
    );
  }
}
