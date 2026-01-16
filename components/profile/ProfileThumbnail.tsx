'use client';

/**
 * ProfileThumbnail - Level 1 of ProfileCard system
 *
 * Small thumbnail avatar (48px default) that opens Level 2 on click.
 * Wrapper over ApexAvatar for integration with ProfileCard system.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

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
  const { profile, currentLevel, openLevel } = useProfileCard();

  const handleClick = () => {
    // Open Level 2 (expanded panel)
    openLevel(2);
  };

  return (
    <ApexAvatar
      size={size}
      showBadge={showBadge}
      badgeCount={badgeCount}
      enableFloat={enableFloat && currentLevel === 1}
      onClick={handleClick}
      imageSrc={profile?.avatar_url || undefined}
      className={className}
    />
  );
}

export default ProfileThumbnail;
