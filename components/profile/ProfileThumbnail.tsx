'use client';

/**
 * ProfileThumbnail - Level 1 of ProfileCard system
 *
 * Small thumbnail avatar (48px default):
 * - Click → Opens Level 4 (Full Card) directly
 * - No hover expand (L2/L3 are now part of Share flow only)
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import React from 'react';
import { useProfileCard } from './ProfileCardProvider';
import { ApexAvatar } from '@/components/apex/ApexAvatar';

interface ProfileThumbnailProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  badgeCount?: number;
  enableFloat?: boolean;
  className?: string;
}

export function ProfileThumbnail({
  size = 'sm',
  showBadge = false,
  badgeCount = 0,
  enableFloat = false,
  className = '',
}: ProfileThumbnailProps) {
  const { profile, currentLevel, goToLevel, thumbnailRef } = useProfileCard();

  // Click → Open Level 4 directly (skip L2/L3 which are now share flow only)
  const handleClick = () => {
    goToLevel(4);
  };

  return (
    <div
      ref={thumbnailRef as React.RefObject<HTMLDivElement>}
      onClick={handleClick}
      className="relative cursor-pointer"
    >
      <ApexAvatar
        size={size}
        showBadge={showBadge}
        badgeCount={badgeCount}
        enableFloat={enableFloat && currentLevel === 1}
        imageSrc={profile?.avatar_url || undefined}
        className={className}
      />
    </div>
  );
}

export default ProfileThumbnail;
