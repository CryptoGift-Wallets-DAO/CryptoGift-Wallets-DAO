'use client';

/**
 * ProfileThumbnail - Level 1 of ProfileCard system
 *
 * Small thumbnail avatar (48px default):
 * - Click → Opens Level 2 (Expanded Avatar)
 * - Flow: L1 → L2 → L4 (L3 is only for shared links)
 * - When card is open (L2+), shows "traveling" emoji instead of avatar
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

// Size mapping for the "traveling" placeholder
const sizeMap = {
  sm: { container: 'w-12 h-12', emoji: 'text-2xl' },
  md: { container: 'w-16 h-16', emoji: 'text-3xl' },
  lg: { container: 'w-20 h-20', emoji: 'text-4xl' },
};

export function ProfileThumbnail({
  size = 'sm',
  showBadge = false,
  badgeCount = 0,
  enableFloat = false,
  className = '',
}: ProfileThumbnailProps) {
  const { profile, currentLevel, openLevel, thumbnailRef } = useProfileCard();

  // Hover → Open Level 2 (Expanded Avatar)
  // Mouse leave from L2 will close it (handled in ProfileExpanded)
  const handleMouseEnter = () => {
    if ((currentLevel ?? 0) <= 1) {
      openLevel(2);
    }
  };

  // Click → Also open Level 2 (same as hover, for mobile/touch)
  const handleClick = () => {
    if ((currentLevel ?? 0) <= 1) {
      openLevel(2);
    }
  };

  // When any card level is open (L2, L3, L4), show "traveling" emoji
  const isCardOpen = (currentLevel ?? 0) > 1;

  return (
    <div
      ref={thumbnailRef as React.RefObject<HTMLDivElement>}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className="relative cursor-pointer"
    >
      {isCardOpen ? (
        // "Traveling" placeholder - avatar is away exploring the card!
        <div
          className={`${sizeMap[size].container} rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-2 border-dashed border-slate-400/50 dark:border-slate-500/50 flex items-center justify-center transition-all duration-300 ${className}`}
          title="Exploring profile..."
        >
          <span
            className={`${sizeMap[size].emoji} animate-bounce`}
            role="img"
            aria-label="Traveling"
          >
            🚀
          </span>
        </div>
      ) : (
        <ApexAvatar
          size={size}
          showBadge={showBadge}
          badgeCount={badgeCount}
          enableFloat={enableFloat}
          imageSrc={profile?.avatar_url || undefined}
          className={className}
        />
      )}
    </div>
  );
}

export default ProfileThumbnail;
