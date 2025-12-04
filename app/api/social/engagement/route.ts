/**
 * 🎯 Social Engagement API
 *
 * GET /api/social/engagement - Get engagement status for wallet
 * POST /api/social/engagement - Claim engagement reward
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getEngagementStatus,
  claimEngagementReward,
  recordEngagementClick,
  getEngagementUrl,
} from '@/lib/social/social-engagement-service';
import { SocialEngagementPlatform, SOCIAL_ENGAGEMENT_CONFIG } from '@/lib/supabase/types';

// ============================================
// GET - Get engagement status
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address required' },
      { status: 400 }
    );
  }

  try {
    const status = await getEngagementStatus(walletAddress);

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        urls: {
          twitter: SOCIAL_ENGAGEMENT_CONFIG.twitter.followUrl,
          discord: SOCIAL_ENGAGEMENT_CONFIG.discord.joinUrl,
        },
      },
    });
  } catch (error) {
    console.error('Error getting engagement status:', error);
    return NextResponse.json(
      { error: 'Failed to get engagement status' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Claim reward or record click
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, platform, action } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    if (!platform || !['twitter', 'discord'].includes(platform)) {
      return NextResponse.json(
        { error: 'Valid platform required (twitter or discord)' },
        { status: 400 }
      );
    }

    const platformType = platform as SocialEngagementPlatform;

    // Handle different actions
    if (action === 'click') {
      // Record that user clicked the follow/join button
      await recordEngagementClick(walletAddress, platformType);
      return NextResponse.json({
        success: true,
        url: getEngagementUrl(platformType),
        message: `Opening ${platform === 'twitter' ? 'Twitter/X' : 'Discord'}...`,
      });
    }

    if (action === 'claim') {
      // Claim the reward
      const result = await claimEngagementReward(walletAddress, platformType);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            alreadyClaimed: result.alreadyClaimed,
          },
          { status: result.alreadyClaimed ? 409 : 400 }
        );
      }

      return NextResponse.json({
        success: true,
        platform: result.platform,
        rewardAmount: result.rewardAmount,
        message: `Congratulations! You earned ${result.rewardAmount} CGC for ${platform === 'twitter' ? 'following us on Twitter/X' : 'joining our Discord'}!`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action (use "click" or "claim")' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing engagement action:', error);
    return NextResponse.json(
      { error: 'Failed to process engagement action' },
      { status: 500 }
    );
  }
}
