'use client';

/**
 * ProfileCardProvider - Context provider for 4-level ProfileCard system
 *
 * Manages:
 * - Current display level (1-4)
 * - Profile data loading (own vs public)
 * - Level transitions
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useAccount } from '@/lib/thirdweb';
import { useProfile, usePublicProfile, type ProfileWithTier } from '@/hooks/useProfile';
import type { PublicProfile } from '@/lib/supabase/types';

// =====================================================
// TYPES
// =====================================================

export type ProfileLevel = 1 | 2 | 3 | 4 | null;

export interface ProfileData {
  wallet_address: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  twitter_handle: string | null;
  telegram_handle: string | null;
  discord_handle: string | null;
  website_url: string | null;
  total_tasks_completed: number;
  total_cgc_earned: number;
  total_referrals: number;
  reputation_score: number;
  tier: string;
  tier_color: string;
}

interface ProfileCardContextValue {
  // State
  currentLevel: ProfileLevel;
  profile: ProfileData | null;
  isOwnProfile: boolean;
  isLoading: boolean;
  isError: boolean;

  // Actions
  openLevel: (level: ProfileLevel) => void;
  closeLevel: () => void;
  goToLevel: (level: ProfileLevel) => void;
  nextLevel: () => void;
  prevLevel: () => void;
}

// =====================================================
// CONTEXT
// =====================================================

const ProfileCardContext = createContext<ProfileCardContextValue | null>(null);

export function useProfileCard() {
  const context = useContext(ProfileCardContext);
  if (!context) {
    throw new Error('useProfileCard must be used within ProfileCardProvider');
  }
  return context;
}

// =====================================================
// PROVIDER
// =====================================================

interface ProfileCardProviderProps {
  children: ReactNode;
  /** Wallet address to show. If not provided, uses connected wallet */
  wallet?: string;
  /** Initial level to show (default: 1) */
  initialLevel?: ProfileLevel;
  /** Callback when level changes */
  onLevelChange?: (level: ProfileLevel) => void;
}

export function ProfileCardProvider({
  children,
  wallet: walletProp,
  initialLevel = 1,
  onLevelChange,
}: ProfileCardProviderProps) {
  const { address: connectedAddress, isConnected } = useAccount();

  // Determine which wallet to show
  const targetWallet = walletProp || connectedAddress;
  const isOwnProfile = !walletProp || (isConnected && walletProp?.toLowerCase() === connectedAddress?.toLowerCase());

  // Current display level
  const [currentLevel, setCurrentLevel] = useState<ProfileLevel>(initialLevel);

  // Load profile data
  // Use useProfile for own profile (allows mutations), usePublicProfile for others
  const ownProfile = useProfile(isOwnProfile ? targetWallet : undefined);
  const publicProfile = usePublicProfile(!isOwnProfile ? targetWallet : undefined);

  // Normalize profile data to common format
  const profile = useMemo<ProfileData | null>(() => {
    const source = isOwnProfile ? ownProfile.profile : publicProfile.profile;
    if (!source) return null;

    return {
      wallet_address: source.wallet_address,
      username: source.username,
      display_name: source.display_name,
      bio: source.bio,
      avatar_url: source.avatar_url,
      twitter_handle: source.twitter_handle,
      telegram_handle: source.telegram_handle,
      discord_handle: source.discord_handle,
      website_url: source.website_url,
      total_tasks_completed: source.total_tasks_completed,
      total_cgc_earned: source.total_cgc_earned,
      total_referrals: source.total_referrals,
      reputation_score: source.reputation_score,
      tier: source.tier,
      tier_color: source.tier_color,
    };
  }, [isOwnProfile, ownProfile.profile, publicProfile.profile]);

  const isLoading = isOwnProfile ? ownProfile.isLoading : publicProfile.isLoading;
  const isError = isOwnProfile ? ownProfile.isError : publicProfile.isError;

  // Level actions
  const openLevel = useCallback((level: ProfileLevel) => {
    setCurrentLevel(level);
    onLevelChange?.(level);
  }, [onLevelChange]);

  const closeLevel = useCallback(() => {
    setCurrentLevel(null);
    onLevelChange?.(null);
  }, [onLevelChange]);

  const goToLevel = useCallback((level: ProfileLevel) => {
    setCurrentLevel(level);
    onLevelChange?.(level);
  }, [onLevelChange]);

  const nextLevel = useCallback(() => {
    setCurrentLevel((prev) => {
      if (prev === null || prev >= 4) return prev;
      const next = (prev + 1) as ProfileLevel;
      onLevelChange?.(next);
      return next;
    });
  }, [onLevelChange]);

  const prevLevel = useCallback(() => {
    setCurrentLevel((prev) => {
      if (prev === null || prev <= 1) return prev;
      const next = (prev - 1) as ProfileLevel;
      onLevelChange?.(next);
      return next;
    });
  }, [onLevelChange]);

  // Context value
  const value = useMemo<ProfileCardContextValue>(
    () => ({
      currentLevel,
      profile,
      isOwnProfile,
      isLoading,
      isError,
      openLevel,
      closeLevel,
      goToLevel,
      nextLevel,
      prevLevel,
    }),
    [currentLevel, profile, isOwnProfile, isLoading, isError, openLevel, closeLevel, goToLevel, nextLevel, prevLevel]
  );

  return (
    <ProfileCardContext.Provider value={value}>
      {children}
    </ProfileCardContext.Provider>
  );
}

export default ProfileCardProvider;
