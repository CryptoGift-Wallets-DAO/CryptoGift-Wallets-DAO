'use client';

/**
 * 👤 PROFILE PAGE
 *
 * User profile management with recovery options.
 * Follows i18n pattern and enterprise design standards.
 *
 * @version 1.1.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/Navbar';
import { useAccount } from '@/lib/thirdweb';
import { useProfileManager, useUsernameCheck } from '@/hooks/useProfile';
import { SocialEngagementModal } from '@/components/social/SocialEngagementModal';
import { SocialEngagementPlatform } from '@/lib/supabase/types';
import {
  User,
  Settings,
  Shield,
  Activity,
  Camera,
  Check,
  X,
  AlertCircle,
  Mail,
  Lock,
  Globe,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  Loader2,
  Send,
} from 'lucide-react';

// Custom Social Icons
const TwitterXIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

// Tab types
type TabId = 'overview' | 'settings' | 'recovery' | 'activity';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [mounted, setMounted] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Social Engagement Modal state
  const [showEngagementModal, setShowEngagementModal] = useState(false);
  const [engagementPlatform, setEngagementPlatform] = useState<SocialEngagementPlatform>('twitter');
  const [engagementUsername, setEngagementUsername] = useState<string>('');

  const {
    profile,
    isLoading,
    updateProfile,
    isUpdating,
    settings,
    updateSettings,
    hasRecoverySetup,
    setupRecovery,
    isSettingUpRecovery,
    recoveryError,
    refetch,
  } = useProfileManager(address);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle social engagement modal trigger from OAuth callback
  useEffect(() => {
    if (!mounted || !address) return;

    const showEngagement = searchParams.get('showEngagement');
    const platform = searchParams.get('platform');
    const username = searchParams.get('username');
    const verification = searchParams.get('verification');

    // Only show modal on successful verification with showEngagement flag
    if (showEngagement === 'true' && verification === 'success' && platform && username) {
      // Validate platform is twitter or discord
      if (platform === 'twitter' || platform === 'discord') {
        setEngagementPlatform(platform as SocialEngagementPlatform);
        setEngagementUsername(decodeURIComponent(username));
        setShowEngagementModal(true);

        // Clean up URL parameters to prevent re-triggering on refresh
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('showEngagement');
        newUrl.searchParams.delete('verification');
        newUrl.searchParams.delete('platform');
        newUrl.searchParams.delete('username');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [mounted, address, searchParams]);

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !address) return;

    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('wallet', address);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      // Refresh profile to get updated avatar URL
      refetch();
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  if (!mounted) {
    return <ProfileSkeleton />;
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {tCommon('pleaseConnectWallet')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Connect your wallet to view and manage your profile
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const tabs = [
    { id: 'overview' as TabId, label: t('tabs.overview'), icon: User },
    { id: 'settings' as TabId, label: t('tabs.settings'), icon: Settings },
    { id: 'recovery' as TabId, label: t('tabs.recovery'), icon: Shield },
    { id: 'activity' as TabId, label: t('tabs.activity'), icon: Activity },
  ];

  return (
    <>
      <Navbar />

      {/* Social Engagement Modal - Triggered after OAuth connection */}
      <SocialEngagementModal
        isOpen={showEngagementModal}
        onClose={() => setShowEngagementModal(false)}
        platform={engagementPlatform}
        username={engagementUsername}
        walletAddress={address}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t('title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden">
                {isUploadingAvatar ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <Image
                    src="/profile%20picture.png"
                    alt="Default Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to User icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile?.display_name || profile?.username || `${address.slice(0, 6)}...${address.slice(-4)}`}
                </h2>
                {profile?.tier && (
                  <span
                    className="px-2 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: profile.tier_color + '30', color: profile.tier_color }}
                  >
                    {profile.tier}
                  </span>
                )}
              </div>
              {profile?.username && (
                <p className="text-slate-500 dark:text-slate-400 mb-2">@{profile.username}</p>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                {address}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile?.total_tasks_completed || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('overview.tasksCompleted')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {profile?.total_cgc_earned?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">CGC</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile?.reputation_score || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('overview.reputation')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          {activeTab === 'overview' && (
            <OverviewTab profile={profile} t={t} address={address} onProfileUpdate={refetch} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab
              profile={profile}
              settings={settings}
              updateSettings={updateSettings}
              updateProfile={updateProfile}
              isUpdating={isUpdating}
              t={t}
              address={address}
              refetch={refetch}
            />
          )}
          {activeTab === 'recovery' && (
            <RecoveryTab
              profile={profile}
              hasRecoverySetup={hasRecoverySetup}
              setupRecovery={setupRecovery}
              isSettingUp={isSettingUpRecovery}
              error={recoveryError}
              t={t}
            />
          )}
          {activeTab === 'activity' && (
            <ActivityTab t={t} address={address} />
          )}
        </div>
        </div>
      </div>
    </>
  );
}

// Overview Tab Component
function OverviewTab({ profile, t, address, onProfileUpdate }: { profile: any; t: any; address: string; onProfileUpdate?: () => void }) {
  const stats = [
    { label: t('overview.tasksCompleted'), value: profile?.total_tasks_completed || 0, icon: CheckCircle, color: 'text-green-500' },
    { label: t('overview.cgcEarned'), value: `${(profile?.total_cgc_earned || 0).toLocaleString()} CGC`, icon: Award, color: 'text-amber-500' },
    { label: t('overview.referrals'), value: profile?.total_referrals || 0, icon: Users, color: 'text-blue-500' },
    { label: t('overview.reputation'), value: profile?.reputation_score || 0, icon: TrendingUp, color: 'text-purple-500' },
  ];

  // Dynamically import the EmailVerificationCard to avoid circular deps
  const { EmailVerificationCard } = require('@/components/profile/EmailVerificationCard');
  const { VotingPowerCard } = require('@/components/profile/VotingPowerCard');

  return (
    <div className="p-6">
      {/* Voting Power Card - Prominent CTA for DAO governance */}
      <div className="mb-6">
        <VotingPowerCard
          wallet={address}
          onActivated={onProfileUpdate}
        />
      </div>

      {/* Email Verification Card - Prominent at top if not verified */}
      <div className="mb-6">
        <EmailVerificationCard
          wallet={address}
          currentEmail={profile?.email}
          isEmailVerified={profile?.email_verified}
          onEmailVerified={onProfileUpdate}
        />
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        {t('overview.statsTitle')}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tier Progress */}
      {profile?.tier && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-900 dark:text-white">{t('overview.tier')}: {profile.tier}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{t('overview.tierProgress')}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
              style={{ width: `${Math.min((profile.reputation_score % 500) / 5, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Member Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-sm">
          <span className="text-slate-500 dark:text-slate-400">{t('overview.memberSince')}</span>
          <p className="font-medium text-slate-900 dark:text-white">
            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
          </p>
        </div>
        <div className="text-sm">
          <span className="text-slate-500 dark:text-slate-400">{t('overview.lastLogin')}</span>
          <p className="font-medium text-slate-900 dark:text-white">
            {profile?.last_login_at ? new Date(profile.last_login_at).toLocaleDateString() : '-'}
          </p>
        </div>
        <div className="text-sm">
          <span className="text-slate-500 dark:text-slate-400">{t('overview.loginCount')}</span>
          <p className="font-medium text-slate-900 dark:text-white">{profile?.login_count || 0}</p>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ profile, settings, updateSettings, updateProfile, isUpdating, t, address, refetch }: any) {
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    twitter_handle: profile?.twitter_handle || '',
    telegram_handle: profile?.telegram_handle || '',
    discord_handle: profile?.discord_handle || '',
    website_url: profile?.website_url || '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        twitter_handle: profile.twitter_handle || '',
        telegram_handle: profile.telegram_handle || '',
        discord_handle: profile.discord_handle || '',
        website_url: profile.website_url || '',
      });
    }
  }, [profile]);

  const { checkUsername, result: usernameResult, isChecking } = useUsernameCheck(address);

  const handleUsernameChange = (value: string) => {
    setFormData({ ...formData, username: value });
    checkUsername(value);
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    setSaveError(null);

    try {
      // Call the mutation and wait for response
      await new Promise<void>((resolve, reject) => {
        updateProfile(formData, {
          onSuccess: () => {
            setSaveSuccess(true);
            // Refetch to ensure data is in sync
            refetch?.();
            setTimeout(() => setSaveSuccess(false), 3000);
            resolve();
          },
          onError: (error: Error) => {
            setSaveError(error.message || 'Failed to save profile');
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error('Profile save error:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Profile Information
          </h3>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('form.username')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder={t('form.usernamePlaceholder')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {formData.username.length >= 3 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking ? (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    ) : usernameResult?.available ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('form.usernameHelp')}
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('form.displayName')}
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder={t('form.displayNamePlaceholder')}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t('form.bio')}
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={t('form.bioPlaceholder')}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {formData.bio.length}/500 {t('form.bioHelp')}
              </p>
            </div>
          </div>

          {/* Social Links */}
          <h4 className="text-md font-bold text-slate-900 dark:text-white mt-6 mb-4">
            {t('form.socialLinks')}
          </h4>
          <div className="space-y-4">
            {/* Twitter/X */}
            <div className="flex items-center gap-3">
              <TwitterXIcon className={`w-5 h-5 ${profile?.twitter_verified ? 'text-sky-500' : 'text-slate-400'}`} />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.twitter_handle}
                  onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
                  placeholder={t('form.twitterPlaceholder')}
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    profile?.twitter_verified
                      ? 'border-green-400 dark:border-green-600 pr-10'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
                {profile?.twitter_verified && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
            {/* Discord */}
            <div className="flex items-center gap-3">
              <DiscordIcon className={`w-5 h-5 ${profile?.discord_verified ? 'text-indigo-500' : 'text-slate-400'}`} />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.discord_handle}
                  onChange={(e) => setFormData({ ...formData, discord_handle: e.target.value })}
                  placeholder={t('form.discordPlaceholder')}
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    profile?.discord_verified
                      ? 'border-green-400 dark:border-green-600 pr-10'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
                {profile?.discord_verified && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
            {/* Telegram */}
            <div className="flex items-center gap-3">
              <TelegramIcon className={`w-5 h-5 ${profile?.telegram_verified ? 'text-blue-500' : 'text-slate-400'}`} />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.telegram_handle}
                  onChange={(e) => setFormData({ ...formData, telegram_handle: e.target.value })}
                  placeholder={t('form.telegramPlaceholder')}
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    profile?.telegram_verified
                      ? 'border-green-400 dark:border-green-600 pr-10'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
                {profile?.telegram_verified && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
            {/* Website */}
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-slate-400" />
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder={t('form.websitePlaceholder')}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {saveSuccess && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('form.saveSuccess')}
            </div>
          )}

          {saveError && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {saveError}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isUpdating}
            className={`mt-4 w-full py-2 px-4 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              saveSuccess
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white'
            }`}
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('form.saving')}
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                {t('form.saved')}
              </>
            ) : (
              t('form.saveChanges')
            )}
          </button>
        </div>

        {/* Privacy Settings */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {t('settings.title')}
          </h3>

          <div className="space-y-4">
            <ToggleSetting
              label={t('settings.publicProfile')}
              description={t('settings.publicProfileDesc')}
              checked={settings?.is_public ?? true}
              onChange={(checked) => updateSettings({ is_public: checked })}
            />
            <ToggleSetting
              label={t('settings.showEmail')}
              description={t('settings.showEmailDesc')}
              checked={settings?.show_email ?? false}
              onChange={(checked) => updateSettings({ show_email: checked })}
            />
            <ToggleSetting
              label={t('settings.showBalance')}
              description={t('settings.showBalanceDesc')}
              checked={settings?.show_balance ?? true}
              onChange={(checked) => updateSettings({ show_balance: checked })}
            />
            <ToggleSetting
              label={t('settings.notifications')}
              description={t('settings.notificationsDesc')}
              checked={settings?.notifications_enabled ?? true}
              onChange={(checked) => updateSettings({ notifications_enabled: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Toggle Setting Component
function ToggleSetting({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// Recovery Tab Component
function RecoveryTab({ profile, hasRecoverySetup, setupRecovery, isSettingUp, error, t }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  const handleSetup = () => {
    if (password !== confirmPassword) {
      return;
    }
    setupRecovery({ email, password });
  };

  const passwordsMatch = password === confirmPassword;
  const isValid = email && password.length >= 8 && passwordsMatch;

  return (
    <div className="p-6">
      <div className="max-w-xl">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {t('recovery.title')}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {t('recovery.description')}
        </p>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-slate-500 dark:text-slate-400">Status:</span>
          {hasRecoverySetup ? (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
              <CheckCircle className="w-4 h-4" />
              {t('recovery.status.configured')}
            </span>
          ) : profile?.email && !profile?.email_verified ? (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm">
              <AlertCircle className="w-4 h-4" />
              {t('recovery.status.pendingVerification')}
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-sm">
              <X className="w-4 h-4" />
              {t('recovery.status.notConfigured')}
            </span>
          )}
        </div>

        {!hasRecoverySetup && (
          <>
            {/* Benefits */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                {t('recovery.benefits.title')}
              </h4>
              <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {t('recovery.benefits.benefit1')}
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {t('recovery.benefits.benefit2')}
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {t('recovery.benefits.benefit3')}
                </li>
              </ul>
            </div>

            {/* Setup Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {t('recovery.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('recovery.emailPlaceholder')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('recovery.emailHelp')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <Lock className="w-4 h-4 inline mr-2" />
                  {t('recovery.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('recovery.passwordPlaceholder')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t('recovery.passwordHelp')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <Lock className="w-4 h-4 inline mr-2" />
                  {t('recovery.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('recovery.confirmPasswordPlaceholder')}
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    confirmPassword && !passwordsMatch
                      ? 'border-red-500'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500 mt-1">
                    {t('recovery.passwordMismatch')}
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error.message}
                </div>
              )}

              <button
                onClick={handleSetup}
                disabled={!isValid || isSettingUp}
                className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('recovery.settingUp')}
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    {t('recovery.setupButton')}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                <Lock className="w-3 h-3 inline mr-1" />
                {t('recovery.warning')}
              </p>
            </div>
          </>
        )}

        {hasRecoverySetup && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Recovery credentials configured</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                Email: {profile?.email}
              </p>
            </div>

            {changeSuccess && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {changeSuccess}
              </div>
            )}

            {changeError && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {changeError}
              </div>
            )}

            {/* Change Email Form */}
            {showChangeEmail && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
                <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t('recovery.changeEmail')}
                </h4>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t('recovery.newEmailPlaceholder') || 'New email address'}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('recovery.currentPasswordPlaceholder') || 'Current password'}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowChangeEmail(false);
                      setNewEmail('');
                      setCurrentPassword('');
                      setChangeError(null);
                    }}
                    className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    {t('recovery.cancel') || 'Cancel'}
                  </button>
                  <button
                    onClick={async () => {
                      if (!newEmail || !currentPassword) {
                        setChangeError('Please fill in all fields');
                        return;
                      }
                      setIsChanging(true);
                      setChangeError(null);
                      try {
                        // TODO: Implement email change API
                        setChangeSuccess('Email change request sent. Please check your new email for verification.');
                        setShowChangeEmail(false);
                        setNewEmail('');
                        setCurrentPassword('');
                      } catch (err) {
                        setChangeError('Failed to change email');
                      } finally {
                        setIsChanging(false);
                      }
                    }}
                    disabled={isChanging || !newEmail || !currentPassword}
                    className="flex-1 py-2 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isChanging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {t('recovery.confirm') || 'Confirm'}
                  </button>
                </div>
              </div>
            )}

            {/* Change Password Form */}
            {showChangePassword && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
                <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t('recovery.changePassword')}
                </h4>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('recovery.currentPasswordPlaceholder') || 'Current password'}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('recovery.newPasswordPlaceholder') || 'New password (min 8 characters)'}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder={t('recovery.confirmNewPasswordPlaceholder') || 'Confirm new password'}
                  className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    confirmNewPassword && newPassword !== confirmNewPassword
                      ? 'border-red-500'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                />
                {confirmNewPassword && newPassword !== confirmNewPassword && (
                  <p className="text-xs text-red-500">{t('recovery.passwordMismatch')}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowChangePassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setChangeError(null);
                    }}
                    className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    {t('recovery.cancel') || 'Cancel'}
                  </button>
                  <button
                    onClick={async () => {
                      if (!currentPassword || !newPassword || newPassword !== confirmNewPassword) {
                        setChangeError('Please fill in all fields correctly');
                        return;
                      }
                      if (newPassword.length < 8) {
                        setChangeError('Password must be at least 8 characters');
                        return;
                      }
                      setIsChanging(true);
                      setChangeError(null);
                      try {
                        // TODO: Implement password change API
                        setChangeSuccess('Password changed successfully');
                        setShowChangePassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmNewPassword('');
                      } catch (err) {
                        setChangeError('Failed to change password');
                      } finally {
                        setIsChanging(false);
                      }
                    }}
                    disabled={isChanging || !currentPassword || !newPassword || newPassword !== confirmNewPassword || newPassword.length < 8}
                    className="flex-1 py-2 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isChanging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    {t('recovery.confirm') || 'Confirm'}
                  </button>
                </div>
              </div>
            )}

            {/* Buttons - only show if no form is open */}
            {!showChangeEmail && !showChangePassword && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowChangeEmail(true);
                    setShowChangePassword(false);
                    setChangeSuccess(null);
                    setChangeError(null);
                  }}
                  className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {t('recovery.changeEmail')}
                </button>
                <button
                  onClick={() => {
                    setShowChangePassword(true);
                    setShowChangeEmail(false);
                    setChangeSuccess(null);
                    setChangeError(null);
                  }}
                  className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {t('recovery.changePassword')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Activity Tab Component
function ActivityTab({ t, address }: { t: any; address: string }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivity() {
      if (!address) return;

      try {
        setIsLoading(true);
        const res = await fetch(`/api/profile/activity?wallet=${address}&limit=20`);
        const data = await res.json();

        if (data.success) {
          setActivities(data.data.activities || []);
        } else {
          setError(data.error || 'Failed to load activity');
        }
      } catch (err) {
        setError('Failed to load activity');
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivity();
  }, [address]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'reward_received':
        return <Award className="w-5 h-5 text-amber-500" />;
      case 'referral_signup':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'login':
        return <User className="w-5 h-5 text-purple-500" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        {t('activity.title')}
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500 dark:text-red-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{error}</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('activity.noActivity')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium text-slate-900 dark:text-white truncate">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
                  {activity.description}
                </p>
                {activity.amount > 0 && (
                  <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    +{activity.amount} CGC
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Skeleton Loader
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-8" />

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-24" />
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 h-96" />
        </div>
      </div>
    </div>
  );
}
