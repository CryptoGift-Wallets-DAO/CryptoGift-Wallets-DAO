'use client';

/**
 * ProfileThumbnail - Level 1 of ProfileCard system
 *
 * Small thumbnail avatar (48px default) with hover-to-expand behavior:
 * - Hover → Opens Level 2 (expanded avatar)
 * - Click → Locks Level 2 in place
 * - Mouse out → Closes if not locked
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
  const { profile, currentLevel, openLevel, lockLevel, thumbnailRef } = useProfileCard();

  // Hover → Open Level 2
  const handleMouseEnter = () => {
    if (currentLevel === 1) {
      openLevel(2);
    }
  };

  // Click → Lock Level 2
  const handleClick = () => {
    if (currentLevel === 2) {
      lockLevel();
    } else {
      openLevel(2);
      lockLevel();
    }
  };

  return (
    <div
      ref={thumbnailRef as React.RefObject<HTMLDivElement>}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className="relative"
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
