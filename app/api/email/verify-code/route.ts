/**
 * EMAIL VERIFICATION API - VERIFY OTP CODE
 * Verifies 6-digit OTP code and saves email to user profile.
 * Includes rate limiting and attempt tracking for security.
 *
 * @endpoint POST /api/email/verify-code
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateRedisForEmail } from '@/lib/redis/config';
import { createClient } from '@supabase/supabase-js';

// Security limits
const MAX_VERIFICATION_ATTEMPTS = 5;
const VERIFICATION_LOCKOUT = 15 * 60; // 15 minutes in seconds

// Lazy Supabase initialization
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables not configured');
  }

  supabase = createClient(url, key);
  return supabase;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, wallet } = body;

    // Validation
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required', success: false },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Code must be 6 digits', success: false },
        { status: 400 }
      );
    }

    // Get Redis connection
    const redis = validateRedisForEmail('email_verification_verify');
    if (!redis) {
      return NextResponse.json(
        { error: 'Verification service temporarily unavailable', success: false },
        { status: 503 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const verificationKey = `dao_email_verify:${normalizedEmail}`;
    const lockoutKey = `dao_email_lockout:${normalizedEmail}`;

    // Check if account is locked out
    const lockout = await redis.get(lockoutKey);
    if (lockout) {
      const lockoutData = typeof lockout === 'string' ? JSON.parse(lockout) : lockout;
      const timeRemaining = Math.ceil((lockoutData.expiresAt - Date.now()) / 1000 / 60);

      return NextResponse.json(
        {
          error: `Too many failed attempts. Try again in ${timeRemaining} minutes.`,
          success: false,
          rateLimited: true,
        },
        { status: 429 }
      );
    }

    // Get verification data
    const verificationData = await redis.get(verificationKey);
    if (!verificationData) {
      return NextResponse.json(
        {
          error: 'Verification code not found or expired. Please request a new code.',
          success: false,
          expired: true,
        },
        { status: 404 }
      );
    }

    const data = typeof verificationData === 'string' ? JSON.parse(verificationData) : verificationData;

    // Check if code has expired
    if (Date.now() > data.expiresAt) {
      await redis.del(verificationKey);
      return NextResponse.json(
        {
          error: 'Code has expired. Please request a new one.',
          success: false,
          expired: true,
        },
        { status: 400 }
      );
    }

    // Check attempts
    if (data.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      // Lock account
      const lockoutData = {
        email: normalizedEmail,
        lockedAt: Date.now(),
        expiresAt: Date.now() + VERIFICATION_LOCKOUT * 1000,
        reason: 'too_many_attempts',
      };

      await redis.setex(lockoutKey, VERIFICATION_LOCKOUT, JSON.stringify(lockoutData));
      await redis.del(verificationKey);

      return NextResponse.json(
        {
          error: 'Too many failed attempts. Account locked for 15 minutes.',
          success: false,
          rateLimited: true,
        },
        { status: 429 }
      );
    }

    // Verify code
    if (data.code !== code) {
      // Increment attempts
      const updatedData = {
        ...data,
        attempts: data.attempts + 1,
        lastAttempt: Date.now(),
      };

      const ttl = await redis.ttl(verificationKey);
      await redis.setex(verificationKey, ttl > 0 ? ttl : 300, JSON.stringify(updatedData));

      const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - updatedData.attempts;

      return NextResponse.json(
        {
          error: `Incorrect code. ${remainingAttempts} attempts remaining.`,
          success: false,
          verified: false,
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // Code is correct - save email to profile
    const walletToUse = wallet || data.wallet;

    if (walletToUse) {
      try {
        const db = getSupabase();

        // Update user profile with verified email
        const { error: updateError } = await db
          .from('user_profiles')
          .update({
            email: normalizedEmail,
            email_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq('wallet_address', walletToUse.toLowerCase());

        if (updateError) {
          console.error('Failed to update profile with email:', updateError);
          // Don't fail the verification, just log the error
        } else {
          console.log('✅ Email saved to profile:', {
            email: normalizedEmail.replace(/(.{2}).*(@.*)/, '$1***$2'),
            wallet: walletToUse.slice(0, 6) + '...' + walletToUse.slice(-4),
          });
        }
      } catch (dbError) {
        console.error('Database error saving email:', dbError);
        // Continue anyway - verification was successful
      }
    }

    // Store verified email in Redis (30 days expiry)
    const verifiedKey = `dao_email_verified:${normalizedEmail}`;
    const verifiedData = {
      email: normalizedEmail,
      wallet: walletToUse,
      verifiedAt: Date.now(),
    };
    await redis.setex(verifiedKey, 30 * 24 * 60 * 60, JSON.stringify(verifiedData));

    // Clean up verification data
    await redis.del(verificationKey);
    await redis.del(lockoutKey);

    console.log('✅ Email verification successful:', {
      email: normalizedEmail.replace(/(.{2}).*(@.*)/, '$1***$2'),
      verifiedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      verified: true,
    });
  } catch (error) {
    console.error('❌ Email verification failed:', error);
    return NextResponse.json(
      { error: 'Verification failed', success: false },
      { status: 500 }
    );
  }
}
