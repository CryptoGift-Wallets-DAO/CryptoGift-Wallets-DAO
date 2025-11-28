/**
 * 🤝 REFERRALS PAGE
 * Multi-level referral system for CryptoGift DAO
 * Protected with CGC token-based access control
 * 🌐 i18n: Full translation support for EN/ES
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/Navbar';
import { CGCAccessGate } from '@/components/auth/CGCAccessGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccount } from '@/lib/thirdweb';
import {
  useReferralDashboard,
  useReferralLeaderboard,
  type ReferralStats as HookReferralStats,
  type LeaderboardEntry as HookLeaderboardEntry,
} from '@/hooks/useReferrals';
import {
  Users,
  Copy,
  Check,
  ExternalLink,
  Gift,
  TrendingUp,
  Award,
  Share2,
  QrCode,
  ChevronRight,
  Sparkles,
  UserPlus,
  Coins,
  Trophy,
  Link as LinkIcon,
  Twitter,
  Send,
  MessageCircle,
  Download,
  Activity,
  Target,
  Zap,
  Network,
  Star,
  RefreshCw,
  Loader2
} from 'lucide-react';

// ===== TYPES =====
interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingRewards: number;
  totalEarned: number;
  level1Count: number;
  level2Count: number;
  level3Count: number;
  conversionRate: number;
}

interface Referral {
  id: string;
  address: string;
  level: 1 | 2 | 3;
  joinedAt: Date;
  tasksCompleted: number;
  cgcEarned: number;
  status: 'active' | 'inactive' | 'pending';
}

interface LeaderboardEntry {
  rank: number;
  address: string;
  referrals: number;
  earned: number;
}

// ===== HELPER FUNCTIONS =====
const generateReferralCode = (address: string): string => {
  if (!address) return 'CGDAO';
  const shortened = address.slice(2, 8).toUpperCase();
  return `CG-${shortened}`;
};

// Default stats when API is loading
const defaultStats: ReferralStats = {
  totalReferrals: 0,
  activeReferrals: 0,
  pendingRewards: 0,
  totalEarned: 0,
  level1Count: 0,
  level2Count: 0,
  level3Count: 0,
  conversionRate: 0
};

// ===== MAIN COMPONENT =====
export default function ReferralsPage() {
  const t = useTranslations('referrals');

  return (
    <>
      <Navbar />

      <CGCAccessGate
        title={`🤝 ${t('accessTitle')}`}
        description={t('accessDescription')}
        requiredBalance="0.01"
      >
        <div className="min-h-screen theme-gradient-bg">
          {/* Background effects */}
          <div className="fixed inset-0 opacity-30 dark:opacity-20 pointer-events-none overflow-hidden">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-400 dark:bg-cyan-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse"></div>
          </div>

          {/* Header */}
          <div className="relative z-10 border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('subtitle')}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  <Activity className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-8">
            <ReferralsDashboard />
          </div>
        </div>
      </CGCAccessGate>
    </>
  );
}

// ===== DASHBOARD =====
function ReferralsDashboard() {
  const t = useTranslations('referrals');
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'rewards' | 'leaderboard'>('overview');
  const [copied, setCopied] = useState(false);

  // Use real data from hooks
  const { code, stats: apiStats, links, isLoading, refetchAll } = useReferralDashboard(address);

  // Map API stats to local format
  const stats: ReferralStats = apiStats.stats ? {
    totalReferrals: apiStats.stats.totalReferrals,
    activeReferrals: apiStats.stats.activeReferrals,
    pendingRewards: apiStats.stats.pendingRewards,
    totalEarned: apiStats.stats.totalEarned,
    level1Count: apiStats.stats.network?.level1 || 0,
    level2Count: apiStats.stats.network?.level2 || 0,
    level3Count: apiStats.stats.network?.level3 || 0,
    conversionRate: apiStats.stats.engagement?.conversionRate || 0,
  } : defaultStats;

  // Use API-generated code or fallback to generated code
  const referralCode = code.code || generateReferralCode(address || '');
  const referralLink = links.links?.default || (typeof window !== 'undefined'
    ? `${window.location.origin}?ref=${referralCode}`
    : `https://cryptogift-dao.com?ref=${referralCode}`);

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const tabs = [
    { id: 'overview', label: t('tabs.overview'), icon: Target },
    { id: 'network', label: t('tabs.network'), icon: Network },
    { id: 'rewards', label: t('tabs.rewards'), icon: Gift },
    { id: 'leaderboard', label: t('tabs.leaderboard'), icon: Trophy },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('stats.totalReferrals')}
          value={stats.totalReferrals.toString()}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          trend="+0 this week"
        />
        <StatCard
          title={t('stats.activeReferrals')}
          value={stats.activeReferrals.toString()}
          icon={<Activity className="h-5 w-5 text-green-500" />}
          trend="Active now"
        />
        <StatCard
          title={t('stats.pendingRewards')}
          value={`${stats.pendingRewards} CGC`}
          icon={<Coins className="h-5 w-5 text-amber-500" />}
          trend="Claimable"
        />
        <StatCard
          title={t('stats.totalEarned')}
          value={`${stats.totalEarned} CGC`}
          icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
          trend={t('stats.allTime')}
        />
      </div>

      {/* Referral Code Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <LinkIcon className="h-5 w-5 text-blue-500" />
              <span>{t('code.title')}</span>
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {t('code.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Code Display */}
            <div className="flex items-center space-x-3">
              <div className="flex-1 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Referral Code</p>
                    <p className="text-2xl font-bold font-mono text-gray-900 dark:text-white">{referralCode}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(referralCode)}
                    className="dark:border-slate-600"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-2">{copied ? t('code.copied') : t('code.copyCode')}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Link Display */}
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Referral Link</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                  {referralLink}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(referralLink)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="dark:border-slate-600">
                <Twitter className="h-4 w-4 mr-2" />
                {t('share.twitter')}
              </Button>
              <Button variant="outline" size="sm" className="dark:border-slate-600">
                <Send className="h-4 w-4 mr-2" />
                {t('share.telegram')}
              </Button>
              <Button variant="outline" size="sm" className="dark:border-slate-600">
                <MessageCircle className="h-4 w-4 mr-2" />
                {t('share.discord')}
              </Button>
              <Button variant="outline" size="sm" className="dark:border-slate-600">
                <QrCode className="h-4 w-4 mr-2" />
                {t('share.qrCode')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Network Overview */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Network className="h-5 w-5 text-purple-500" />
              <span>{t('network.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NetworkLevelCard level={1} count={stats.level1Count} percentage={10} />
            <NetworkLevelCard level={2} count={stats.level2Count} percentage={5} />
            <NetworkLevelCard level={3} count={stats.level3Count} percentage={2.5} />
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('network.totalNetwork')}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.level1Count + stats.level2Count + stats.level3Count}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-slate-700 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'network' && <NetworkTab stats={stats} />}
      {activeTab === 'rewards' && <RewardsTab />}
      {activeTab === 'leaderboard' && <LeaderboardTabWithData />}
    </div>
  );
}

// ===== TAB COMPONENTS =====

function OverviewTab() {
  const t = useTranslations('referrals');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* How It Works */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>{t('how.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StepCard
            step={1}
            title={t('how.step1.title')}
            description={t('how.step1.desc')}
            icon={<LinkIcon className="h-5 w-5" />}
          />
          <StepCard
            step={2}
            title={t('how.step2.title')}
            description={t('how.step2.desc')}
            icon={<Share2 className="h-5 w-5" />}
          />
          <StepCard
            step={3}
            title={t('how.step3.title')}
            description={t('how.step3.desc')}
            icon={<UserPlus className="h-5 w-5" />}
          />
          <StepCard
            step={4}
            title={t('how.step4.title')}
            description={t('how.step4.desc')}
            icon={<Coins className="h-5 w-5" />}
          />
        </CardContent>
      </Card>

      {/* Reward Structure Preview */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Gift className="h-5 w-5 text-green-500" />
            <span>{t('rewards.title')}</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {t('rewards.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RewardTierCard
            level={1}
            title={t('rewards.level1Title')}
            description={t('rewards.level1Desc')}
            percentage={10}
            color="blue"
          />
          <RewardTierCard
            level={2}
            title={t('rewards.level2Title')}
            description={t('rewards.level2Desc')}
            percentage={5}
            color="purple"
          />
          <RewardTierCard
            level={3}
            title={t('rewards.level3Title')}
            description={t('rewards.level3Desc')}
            percentage={2.5}
            color="cyan"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function NetworkTab({ stats }: { stats: ReferralStats }) {
  const t = useTranslations('referrals');

  const hasReferrals = stats.totalReferrals > 0;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
          <Network className="h-5 w-5 text-purple-500" />
          <span>{t('network.title')}</span>
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {t('network.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasReferrals ? (
          <div className="space-y-4">
            {/* Network visualization would go here */}
            <p className="text-gray-600 dark:text-gray-400">Network tree visualization coming soon...</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('network.noReferrals')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RewardsTab() {
  const t = useTranslations('referrals');

  return (
    <div className="space-y-6">
      {/* Reward Structure */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Gift className="h-5 w-5 text-green-500" />
            <span>{t('rewards.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <RewardTierCard
              level={1}
              title={t('rewards.level1Title')}
              description={t('rewards.level1Desc')}
              percentage={10}
              color="blue"
            />
            <RewardTierCard
              level={2}
              title={t('rewards.level2Title')}
              description={t('rewards.level2Desc')}
              percentage={5}
              color="purple"
            />
            <RewardTierCard
              level={3}
              title={t('rewards.level3Title')}
              description={t('rewards.level3Desc')}
              percentage={2.5}
              color="cyan"
            />
          </div>
        </CardContent>
      </Card>

      {/* Milestone Bonuses */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Award className="h-5 w-5 text-amber-500" />
            <span>{t('rewards.bonusTitle')}</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {t('rewards.bonusDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <MilestoneCard milestone={5} bonus={50} />
            <MilestoneCard milestone={10} bonus={150} />
            <MilestoneCard milestone={25} bonus={500} />
            <MilestoneCard milestone={50} bonus={1500} />
            <MilestoneCard milestone={100} bonus={5000} />
          </div>
        </CardContent>
      </Card>

      {/* Reward History */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span>{t('history.title')}</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {t('history.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('history.noHistory')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrapper component that fetches leaderboard data from API
function LeaderboardTabWithData() {
  const { address } = useAccount();
  const { leaderboard, isLoading, userPosition, refetch } = useReferralLeaderboard({
    wallet: address,
    limit: 20,
  });

  // Convert API data to local format
  const formattedLeaderboard: LeaderboardEntry[] = leaderboard.map(entry => ({
    rank: entry.rank,
    address: entry.addressShort,
    referrals: entry.totalReferrals,
    earned: entry.totalEarnings,
  }));

  if (isLoading) {
    return (
      <Card className="glass-panel">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  return <LeaderboardTab leaderboard={formattedLeaderboard} userPosition={userPosition} />;
}

function LeaderboardTab({ leaderboard, userPosition }: { leaderboard: LeaderboardEntry[]; userPosition?: any }) {
  const t = useTranslations('referrals');

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span>{t('leaderboard.title')}</span>
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {t('leaderboard.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* User Position Banner */}
        {userPosition && userPosition.rank > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Your Position: #{userPosition.rank}
              </span>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {userPosition.totalEarnings} CGC earned
              </span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('leaderboard.rank')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('leaderboard.referrer')}
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('leaderboard.referrals')}
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t('leaderboard.earned')}
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length > 0 ? (
                leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {entry.rank <= 3 && (
                          <span className={`text-lg ${
                            entry.rank === 1 ? 'text-amber-500' :
                            entry.rank === 2 ? 'text-gray-400' :
                            'text-amber-700'
                          }`}>
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">
                          #{entry.rank}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                        {entry.address}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {entry.referrals}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {entry.earned} CGC
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No referrers yet. Be the first to start building your network!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== HELPER COMPONENTS =====

function StatCard({
  title,
  value,
  icon,
  trend
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <Card className="glass-panel">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800">
            {icon}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{trend}</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      </CardContent>
    </Card>
  );
}

function NetworkLevelCard({
  level,
  count,
  percentage
}: {
  level: number;
  count: number;
  percentage: number;
}) {
  const colors = {
    1: 'from-blue-500 to-blue-600',
    2: 'from-purple-500 to-purple-600',
    3: 'from-cyan-500 to-cyan-600',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors[level as keyof typeof colors]} flex items-center justify-center text-white text-sm font-bold`}>
          {level}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Level {level}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}% commission</p>
        </div>
      </div>
      <span className="text-lg font-bold text-gray-900 dark:text-white">{count}</span>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  icon
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
        {step}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
          {icon}
          {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

function RewardTierCard({
  level,
  title,
  description,
  percentage,
  color
}: {
  level: number;
  title: string;
  description: string;
  percentage: number;
  color: 'blue' | 'purple' | 'cyan';
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600 border-blue-200 dark:border-blue-800',
    purple: 'from-purple-500 to-purple-600 border-purple-200 dark:border-purple-800',
    cyan: 'from-cyan-500 to-cyan-600 border-cyan-200 dark:border-cyan-800',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]} bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900`}>
      <div className="flex items-center justify-between mb-2">
        <Badge className={`bg-gradient-to-r ${colors[color]} text-white border-0`}>
          Level {level}
        </Badge>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
      </div>
      <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
  );
}

function MilestoneCard({
  milestone,
  bonus
}: {
  milestone: number;
  bonus: number;
}) {
  return (
    <div className="text-center p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10">
      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center">
        <Star className="h-6 w-6 text-white" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{milestone} Referrals</p>
      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">+{bonus} CGC</p>
    </div>
  );
}
