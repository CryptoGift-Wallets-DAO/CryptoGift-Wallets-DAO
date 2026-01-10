'use client';

/**
 * ============================================================================
 * 🏛️ DAO Dashboard - Enterprise Grade with RBAC
 * ============================================================================
 *
 * Dashboard with Role-Based Access Control (RBAC).
 * Admin wallets determined PROGRAMMATICALLY from Aragon Gnosis Safe contracts.
 *
 * Features:
 * - My Governance Panel: Voting power, delegation, proposals
 * - My Wallet Panel: Balance, earnings, token actions
 * - My Tasks Panel: Task overview linked to /tasks
 * - Admin Dashboard: ONLY for Gnosis Safe signers (programmatic)
 *
 * @version 2.0.0
 * @updated December 2025
 * ============================================================================
 */

import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PermissionsProvider } from '@/components/auth/RoleGate';
import {
  MyGovernancePanel,
  MyWalletPanel,
  MyTasksPanel,
  AdminDashboardPanel,
} from '@/components/dashboard';
import { useDashboardStats } from '@/lib/web3/hooks';
import { useAccount, useNetwork, useAutoSwitchToBase } from '@/lib/thirdweb';
import { base } from 'thirdweb/chains';
import {
  TrendingUp,
  Users,
  Vote,
  CheckCircle2,
  Repeat2,
  Lock,
  Zap,
  Target,
  Wallet,
} from 'lucide-react';

export default function CryptoGiftDAODashboard() {
  const { isConnected } = useAccount();
  const { chainId } = useNetwork();

  // 🌐 I18N: Hooks para traducciones de diferentes namespaces
  const tDashboard = useTranslations('dashboard');
  const tWallet = useTranslations('wallet');

  // Auto-switch to Base Mainnet (using Thirdweb hook)
  useAutoSwitchToBase();

  // Get real blockchain data for stats
  const {
    totalSupply,
    circulatingSupply,
    treasuryBalance,
    escrowBalance,
    holdersCount,
    proposalsActive,
    questsCompleted,
    activeTasks,
    milestonesReleased,
  } = useDashboardStats();

  // Format numbers for display
  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(2)}K`;
    return n.toFixed(2);
  };

  return (
    <PermissionsProvider>
      <div className="min-h-screen theme-gradient-bg">
        {/* Professional Navbar */}
        <Navbar />

        {/* Glassmorphism Background Effect - Theme Aware */}
        <div className="fixed inset-0 opacity-30 dark:opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
          {/* Main Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            <StatCard
              title={tDashboard('stats.totalSupply')}
              value={`${formatNumber(totalSupply)} CGC`}
              icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
              loading={!totalSupply || totalSupply === '0'}
              delay="0.2s"
            />
            <StatCard
              title={tDashboard('stats.holders')}
              value={holdersCount.toString()}
              icon={<Users className="w-6 h-6 text-green-500" />}
              loading={holdersCount === 0}
              delay="0.3s"
            />
            <StatCard
              title={tDashboard('stats.proposals')}
              value={proposalsActive.toString()}
              icon={<Vote className="w-6 h-6 text-purple-500" />}
              delay="0.4s"
            />
            <StatCard
              title={tDashboard('stats.tasksCompleted')}
              value={questsCompleted.toString()}
              icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              delay="0.5s"
            />
            <StatCard
              title={tDashboard('stats.circulatingSupply')}
              value={`${formatNumber(circulatingSupply)} CGC`}
              icon={<Repeat2 className="w-6 h-6 text-indigo-500" />}
              delay="0.6s"
            />
          </section>

          {/* Secondary Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title={tDashboard('stats.treasuryBalance')}
              value={`${formatNumber(treasuryBalance)} CGC`}
              icon={<Wallet className="w-6 h-6 text-amber-500" />}
              loading={!treasuryBalance}
              delay="0.7s"
            />
            <StatCard
              title={tDashboard('stats.escrowBalance')}
              value={`${formatNumber(escrowBalance)} CGC`}
              icon={<Lock className="w-6 h-6 text-red-500" />}
              delay="0.8s"
            />
            <StatCard
              title={tDashboard('system.usage')}
              value={activeTasks.toString()}
              icon={<Zap className="w-6 h-6 text-yellow-500" />}
              delay="0.9s"
            />
            <StatCard
              title={tDashboard('stats.milestonesReleased')}
              value={milestonesReleased.toString()}
              icon={<Target className="w-6 h-6 text-pink-500" />}
              delay="1.0s"
            />
          </section>

          {/* ============================================================
             RBAC-Based Dashboard Panels
             Each panel uses programmatic role checks from Aragon/Gnosis Safe
             ============================================================ */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* My Governance Panel - Shows voting power, delegation status */}
            <MyGovernancePanel />

            {/* My Wallet Panel - Shows balance, earnings, token actions */}
            <MyWalletPanel />

            {/* My Tasks Panel - Links to /tasks page with task overview */}
            <MyTasksPanel />

            {/* Admin Dashboard Panel - ONLY visible to Gnosis Safe signers */}
            <AdminDashboardPanel />
          </section>

          {/* System Status Footer */}
          <footer className="glass-panel p-6 spring-in" style={{ animationDelay: '1.6s' }}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                {/* Production mode - always show green active status */}
                <div className="w-3 h-3 rounded-full bg-green-400 pulse-glow"></div>
                <span className="text-glass-secondary text-sm">
                  {tDashboard('system.active')}
                </span>
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  {tDashboard('system.operational')}
                </span>
              </div>

              {!isConnected && (
                <div className="text-center">
                  <p className="text-glass-secondary text-sm">
                    {tWallet('connect')}
                  </p>
                </div>
              )}

              {isConnected && chainId !== base.id && (
                <div className="text-center">
                  <p className="text-orange-500 text-sm">
                    {tWallet('unsupportedNetwork')}
                  </p>
                </div>
              )}
            </div>
          </footer>
        </div>

        {/* Full-width Footer */}
        <Footer />
      </div>
    </PermissionsProvider>
  );
}

// Stat Card Component with Glass morphism
function StatCard({ 
  title, 
  value, 
  icon, 
  loading = false,
  delay = "0s"
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
  loading?: boolean;
  delay?: string;
}) {
  return (
    <div className="glass-card p-6 spring-in" style={{ animationDelay: delay }}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 glass-bubble">
          {icon}
        </div>
        <div className="text-right">
          <p className="text-glass-secondary text-xs uppercase tracking-wider font-medium">
            {title}
          </p>
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-glass rounded animate-pulse"></div>
      ) : (
        <p className="text-2xl font-bold text-glass">{value}</p>
      )}
    </div>
  );
}

