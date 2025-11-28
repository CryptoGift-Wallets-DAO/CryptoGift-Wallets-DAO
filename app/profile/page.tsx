'use client';

/**
 * 👤 PROFILE PAGE
 *
 * User profile management with recovery options.
 * Follows i18n pattern and enterprise design standards.
 *
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAccount } from '@/lib/thirdweb';
import { useProfileManager, useUsernameCheck } from '@/hooks/useProfile';
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
  Twitter,
  MessageCircle,
  Globe,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  Loader2,
} from 'lucide-react';

// Tab types
type TabId = 'overview' | 'settings' | 'recovery' | 'activity';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [mounted, setMounted] = useState(false);

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
  } = useProfileManager(address);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center border border-slate-200 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <OverviewTab profile={profile} t={t} />
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
            <ActivityTab t={t} />
          )}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ profile, t }: { profile: any; t: any }) {
  const stats = [
    { label: t('overview.tasksCompleted'), value: profile?.total_tasks_completed || 0, icon: CheckCircle, color: 'text-green-500' },
    { label: t('overview.cgcEarned'), value: `${(profile?.total_cgc_earned || 0).toLocaleString()} CGC`, icon: Award, color: 'text-amber-500' },
    { label: t('overview.referrals'), value: profile?.total_referrals || 0, icon: Users, color: 'text-blue-500' },
    { label: t('overview.reputation'), value: profile?.reputation_score || 0, icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div className="p-6">
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
function SettingsTab({ profile, settings, updateSettings, updateProfile, isUpdating, t, address }: any) {
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    twitter_handle: profile?.twitter_handle || '',
    telegram_handle: profile?.telegram_handle || '',
    discord_handle: profile?.discord_handle || '',
    website_url: profile?.website_url || '',
  });

  const { checkUsername, result: usernameResult, isChecking } = useUsernameCheck(address);

  const handleUsernameChange = (value: string) => {
    setFormData({ ...formData, username: value });
    checkUsername(value);
  };

  const handleSave = () => {
    updateProfile(formData);
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
            <div className="flex items-center gap-3">
              <Twitter className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.twitter_handle}
                onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
                placeholder={t('form.twitterPlaceholder')}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.telegram_handle}
                onChange={(e) => setFormData({ ...formData, telegram_handle: e.target.value })}
                placeholder={t('form.telegramPlaceholder')}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
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

          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="mt-6 w-full py-2 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('form.saving')}
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

            <div className="flex gap-3">
              <button className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                {t('recovery.changeEmail')}
              </button>
              <button className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                {t('recovery.changePassword')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Activity Tab Component
function ActivityTab({ t }: { t: any }) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        {t('activity.title')}
      </h3>

      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>{t('activity.noActivity')}</p>
      </div>
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
