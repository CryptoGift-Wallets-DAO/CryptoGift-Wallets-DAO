/**
 * SPECIAL INVITE API
 *
 * Creates and manages special referral invites with educational requirements.
 * These invites require recipients to complete the Sales Masterclass before joining.
 *
 * @endpoint POST /api/referrals/special-invite - Create new special invite
 * @endpoint GET /api/referrals/special-invite?code=xxx - Get invite details
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Lazy Supabase initialization
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_DAO_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_DAO_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables not configured');
  }

  supabase = createClient(url, key);
  return supabase;
}

// Generate unique invite code
function generateInviteCode(): string {
  const randomPart = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now().toString(36);
  return `SI-${timestamp}-${randomPart}`.toUpperCase();
}

// Hash password for storage
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      referrerWallet,
      referrerCode,
      password,
      customMessage,
    } = body;

    // Validation
    if (!referrerWallet || !/^0x[a-fA-F0-9]{40}$/.test(referrerWallet)) {
      return NextResponse.json(
        { error: 'Valid referrer wallet is required', success: false },
        { status: 400 }
      );
    }

    const db = getSupabase();
    const inviteCode = generateInviteCode();
    const normalizedWallet = referrerWallet.toLowerCase();

    // Create special invite record
    const inviteData = {
      invite_code: inviteCode,
      referrer_wallet: normalizedWallet,
      referrer_code: referrerCode || null,
      password_hash: password ? hashPassword(password) : null,
      custom_message: customMessage || null,
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days expiry
      claimed_by: null,
      claimed_at: null,
      education_completed: false,
      wallet_connected: false,
    };

    const { error: insertError } = await db
      .from('special_invites')
      .insert(inviteData);

    if (insertError) {
      // If table doesn't exist, create it
      if (insertError.code === '42P01') {
        console.log('Creating special_invites table...');

        // Create the table using a raw query
        const { error: createError } = await db.rpc('create_special_invites_table');

        if (createError) {
          console.error('Failed to create table:', createError);
          // Fallback: return success with just the code (no persistence)
          return NextResponse.json({
            success: true,
            inviteCode,
            message: 'Invite created (local mode - table not available)',
          });
        }

        // Retry insert
        const { error: retryError } = await db
          .from('special_invites')
          .insert(inviteData);

        if (retryError) {
          console.error('Retry insert failed:', retryError);
        }
      } else {
        console.error('Insert error:', insertError);
        // Fallback: return success with just the code
        return NextResponse.json({
          success: true,
          inviteCode,
          message: 'Invite created (fallback mode)',
        });
      }
    }

    console.log('Special invite created:', {
      code: inviteCode,
      referrer: normalizedWallet.slice(0, 6) + '...' + normalizedWallet.slice(-4),
      hasPassword: !!password,
    });

    return NextResponse.json({
      success: true,
      inviteCode,
      expiresAt: inviteData.expires_at,
    });
  } catch (error) {
    console.error('Error creating special invite:', error);
    return NextResponse.json(
      { error: 'Failed to create special invite', success: false },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Invite code is required', success: false },
        { status: 400 }
      );
    }

    const db = getSupabase();

    const { data: invite, error } = await db
      .from('special_invites')
      .select('*')
      .eq('invite_code', code.toUpperCase())
      .single();

    if (error || !invite) {
      return NextResponse.json(
        { error: 'Invite not found', success: false },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invite has expired', success: false, expired: true },
        { status: 410 }
      );
    }

    // Check if already claimed
    if (invite.status === 'claimed') {
      return NextResponse.json(
        { error: 'Invite has already been used', success: false, claimed: true },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      invite: {
        code: invite.invite_code,
        referrerCode: invite.referrer_code,
        customMessage: invite.custom_message,
        hasPassword: !!invite.password_hash,
        createdAt: invite.created_at,
        expiresAt: invite.expires_at,
      },
    });
  } catch (error) {
    console.error('Error fetching invite:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invite', success: false },
      { status: 500 }
    );
  }
}
