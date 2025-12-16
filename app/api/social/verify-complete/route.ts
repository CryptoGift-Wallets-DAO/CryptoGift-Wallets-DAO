/**
 * 🔐 Complete Verification API (Server-Side)
 *
 * POST /api/social/verify-complete
 *
 * Reads OAuth credentials from httpOnly cookies (stored during OAuth callback)
 * and performs verification server-side.
 *
 * This endpoint exists because:
 * 1. Frontend cannot read httpOnly cookies
 * 2. We need to verify after user follows/joins (not during initial OAuth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Discord Bot Token for guild membership check
const DISCORD_BOT_TOKEN = process.env.DISCORD_DAO_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_DAO_GUILD_ID || '1440971032818090006';
const TWITTER_CRYPTOGIFT_USERNAME = 'cryptogiftdao';

/**
 * Check if user is a member of the Discord guild using Bot token
 */
async function checkDiscordMembership(discordUserId: string): Promise<boolean> {
  if (!DISCORD_BOT_TOKEN) {
    console.error('[Discord] Bot token not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordUserId}`,
      {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
      }
    );
    console.log(`[Discord] Membership check for ${discordUserId}: status ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.error('[Discord] Membership check error:', error);
    return false;
  }
}

/**
 * Check if user follows @cryptogiftdao using their access token
 */
async function checkTwitterFollow(accessToken: string, userId: string): Promise<boolean> {
  try {
    // Get @cryptogiftdao user ID
    const targetResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${TWITTER_CRYPTOGIFT_USERNAME}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!targetResponse.ok) {
      console.error('[Twitter] Failed to get target user:', await targetResponse.text());
      return false;
    }

    const targetData = await targetResponse.json();
    const targetUserId = targetData.data?.id;
    if (!targetUserId) {
      console.error('[Twitter] No user ID in response');
      return false;
    }

    console.log(`[Twitter] Checking if ${userId} follows ${targetUserId} (@${TWITTER_CRYPTOGIFT_USERNAME})`);

    // Check following list (paginated, check first 1000)
    let nextToken: string | undefined;
    let isFollowing = false;

    do {
      const url = new URL(`https://api.twitter.com/2/users/${userId}/following`);
      url.searchParams.set('max_results', '1000');
      if (nextToken) url.searchParams.set('pagination_token', nextToken);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        console.error('[Twitter] Following check failed:', await response.text());
        break;
      }

      const data = await response.json();

      if (data.data?.some((user: { id: string }) => user.id === targetUserId)) {
        isFollowing = true;
        break;
      }

      nextToken = data.meta?.next_token;
    } while (nextToken);

    console.log(`[Twitter] Follow status for ${userId}: ${isFollowing}`);
    return isFollowing;
  } catch (error) {
    console.error('[Twitter] Follow check error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform } = body;

    if (!platform || !['twitter', 'discord'].includes(platform)) {
      return NextResponse.json(
        { error: 'Valid platform required (twitter or discord)', verified: false },
        { status: 400 }
      );
    }

    // Read credentials from httpOnly cookies (set during OAuth callback)
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(`${platform}_oauth_token`);
    const userIdCookie = cookieStore.get(`${platform}_oauth_user_id`);

    if (!tokenCookie?.value || !userIdCookie?.value) {
      return NextResponse.json({
        success: false,
        verified: false,
        error: 'No authorization found. Please authorize first.',
        needsAuth: true,
      });
    }

    const accessToken = tokenCookie.value;
    const userId = userIdCookie.value;

    console.log(`[VerifyComplete] Verifying ${platform} for user ${userId}`);

    let verified = false;
    let error: string | undefined;

    if (platform === 'twitter') {
      verified = await checkTwitterFollow(accessToken, userId);
      if (!verified) {
        error = 'Please follow @cryptogiftdao first';
      }
    } else if (platform === 'discord') {
      verified = await checkDiscordMembership(userId);
      if (!verified) {
        error = 'Please join our Discord server first';
      }
    }

    console.log(`[VerifyComplete] Result: platform=${platform}, verified=${verified}`);

    return NextResponse.json({
      success: true,
      verified,
      platform,
      error,
      userId,
    });
  } catch (error) {
    console.error('[VerifyComplete] Error:', error);
    return NextResponse.json(
      { error: 'Verification failed', verified: false },
      { status: 500 }
    );
  }
}
