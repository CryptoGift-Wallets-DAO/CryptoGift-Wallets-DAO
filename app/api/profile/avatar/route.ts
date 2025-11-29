/**
 * AVATAR UPLOAD API
 *
 * Handles avatar image uploads with validation and Supabase storage.
 * Supports image validation, size limits, and proper cleanup.
 *
 * @endpoint POST /api/profile/avatar
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Avatar constraints
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const AVATAR_BUCKET = 'avatars';

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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const wallet = formData.get('wallet') as string | null;

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', success: false },
        { status: 400 }
      );
    }

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address', success: false },
        { status: 400 }
      );
    }

    // Type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP', success: false },
        { status: 400 }
      );
    }

    // Size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 5MB', success: false },
        { status: 400 }
      );
    }

    const db = getSupabase();
    const normalizedWallet = wallet.toLowerCase();

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${normalizedWallet}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await db.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload avatar', success: false },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = db.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Update user profile with new avatar URL
    const { error: updateError } = await db
      .from('user_profiles')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', normalizedWallet);

    if (updateError) {
      console.error('Profile update error:', updateError);
      // Clean up uploaded file
      await db.storage.from(AVATAR_BUCKET).remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to update profile', success: false },
        { status: 500 }
      );
    }

    console.log('✅ Avatar uploaded:', {
      wallet: normalizedWallet.slice(0, 6) + '...' + normalizedWallet.slice(-4),
      url: avatarUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        avatar_url: avatarUrl,
        file_path: filePath,
      },
    });
  } catch (error) {
    console.error('❌ Avatar upload failed:', error);
    return NextResponse.json(
      { error: 'Avatar upload failed', success: false },
      { status: 500 }
    );
  }
}

// DELETE /api/profile/avatar - Remove avatar
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address', success: false },
        { status: 400 }
      );
    }

    const db = getSupabase();
    const normalizedWallet = wallet.toLowerCase();

    // Get current avatar URL
    const { data: profile } = await db
      .from('user_profiles')
      .select('avatar_url')
      .eq('wallet_address', normalizedWallet)
      .single();

    if (profile?.avatar_url) {
      // Extract file path from URL
      const urlParts = profile.avatar_url.split('/');
      const filePath = `profiles/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      await db.storage.from(AVATAR_BUCKET).remove([filePath]);
    }

    // Clear avatar URL in profile
    const { error: updateError } = await db
      .from('user_profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', normalizedWallet);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to remove avatar', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
    });
  } catch (error) {
    console.error('❌ Avatar removal failed:', error);
    return NextResponse.json(
      { error: 'Avatar removal failed', success: false },
      { status: 500 }
    );
  }
}
