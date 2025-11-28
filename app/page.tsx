'use client';

/**
 * ============================================================================
 * 🌐 I18N PATTERN - INSTRUCCIONES PARA TRADUCCIONES
 * ============================================================================
 *
 * Para agregar traducciones a cualquier componente:
 *
 * 1. Importar useTranslations:
 *    import { useTranslations } from 'next-intl';
 *
 * 2. En el componente, usar el hook con el namespace:
 *    const t = useTranslations('dashboard');  // usa src/locales/{locale}.json -> dashboard
 *
 * 3. Usar t() para obtener traducciones:
 *    <span>{t('title')}</span>  // "Dashboard" en EN, "Panel" en ES
 *
 * 4. Para textos anidados:
 *    t('stats.totalSupply')  // accede a dashboard.stats.totalSupply
 *
 * 5. Las traducciones están en:
 *    - src/locales/en.json (English - default)
 *    - src/locales/es.json (Spanish)
 *
 * 6. Agregar nuevas traducciones: editar AMBOS archivos json
 * ============================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CGCAccessGate } from '@/components/auth/CGCAccessGate';
import { useDashboardStats, useCGCTransfer, useMilestoneRelease } from '@/lib/web3/hooks';
import { useAccount, useNetwork, useSwitchChain, useAutoSwitchToBase } from '@/lib/thirdweb';
import { useToast } from '@/components/ui/toast';
import { base } from 'thirdweb/chains';
import { stringToHex } from 'viem';
import { ensureEthereumAddress } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  Users,
  Vote,
  CheckCircle2,
  Repeat2,
  Lock,
  Zap,
  Target,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

export default function CryptoGiftDAODashboard() {
  const { address, isConnected } = useAccount();
  const { chainId } = useNetwork();
  const { success, error, warning, info } = useToast();

  // 🌐 I18N: Hooks para traducciones de diferentes namespaces
  const tDashboard = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const tWallet = useTranslations('wallet');

  // Auto-switch to Base Mainnet (using Thirdweb hook)
  useAutoSwitchToBase();

  // Get real blockchain data
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
    userBalance,
    userEarnings,
    systemActive,
    systemLimits,
    systemUsage,
  } = useDashboardStats();

  // Transaction hooks
  const { transfer, isPending: isTransferPending, isSuccess: isTransferSuccess, hash: transferHash } = useCGCTransfer();
  const { releaseMilestone, isPending: isReleasePending, isSuccess: isReleaseSuccess, hash: releaseHash } = useMilestoneRelease();

  const [loadingStates, setLoadingStates] = useState({
    proposals: false,
    createProposal: false,
    delegate: false,
    release: false,
    history: false,
    vesting: false,
    quests: false,
    leaderboard: false,
    sync: false,
    safe: false,
    admin: false,
    status: false,
  });

  const [balanceVisible, setBalanceVisible] = useState(true);

  // Show transaction success messages
  useEffect(() => {
    if (isTransferSuccess && transferHash) {
      success('Transfer Successful', `Transaction confirmed: ${transferHash.slice(0, 10)}...`);
    }
  }, [isTransferSuccess, transferHash, success]);

  useEffect(() => {
    if (isReleaseSuccess && releaseHash) {
      success('Milestone Released', `Payment released: ${releaseHash.slice(0, 10)}...`);
    }
  }, [isReleaseSuccess, releaseHash, success]);

  const handleAction = async (action: string, loadingKey: keyof typeof loadingStates) => {
    if (!isConnected) {
      warning('Wallet Required', 'Please connect your wallet to continue');
      return;
    }

    if (chainId !== 8453) {
      warning('Wrong Network', 'Please switch to Base Network');
      return;
    }

    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // Handle real blockchain actions
      switch (action) {
        case 'Request token release':
          // Example: Release 100 CGC tokens to connected wallet
          if (address) {
            const recipientAddress = ensureEthereumAddress(address);
            if (recipientAddress) {
              // Use a more predictable milestone ID to avoid SSR hydration issues
              const milestoneIdString = `milestone-user-${address.slice(-8)}`;
              const milestoneId: `0x${string}` = stringToHex(milestoneIdString, { size: 32 });
              await releaseMilestone(recipientAddress, '100', milestoneId);
              info('Transaction Submitted', 'Waiting for confirmation...');
            }
          }
          break;
          
        case 'Check system status':
          const status = systemActive ? 'Active' : 'Paused';
          const dailyUsage = `${systemUsage.daily}/${systemLimits.daily} CGC`;
          info('System Status', `Status: ${status}, Daily Usage: ${dailyUsage}`);
          break;
          
        case 'Open Safe Multisig':
          window.open('https://app.safe.global/base:0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31', '_blank');
          success('Opening Safe', 'Redirecting to Safe multisig...');
          break;
          
        default:
          // Placeholder for other actions
          await new Promise(resolve => setTimeout(resolve, 1500));
          info(`${action}`, 'Feature coming soon...');
          break;
      }
      
    } catch (err: any) {
      error(`${action} failed`, err?.message || 'Please try again');
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Format numbers for display
  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(2)}K`;
    return n.toFixed(2);
  };

  return (
    <div className="min-h-screen theme-gradient-bg">
      {/* Professional Navbar */}
      <Navbar />

      {/* Glassmorphism Background Effect - Theme Aware */}
      <div className="fixed inset-0 opacity-30 dark:opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* User Profile Section (if connected) */}
        {isConnected && address && (
          <section className="glass-card mb-8 p-6 spring-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white">
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-glass">{tWallet('connected')}</h3>
                  <p className="text-glass-secondary font-mono text-sm">
                    {address.slice(0, 8)}...{address.slice(-6)}
                  </p>
                  <p className="text-xs text-glass-secondary">{tWallet('base')} • {chainId === base.id ? tWallet('network') : tWallet('unsupportedNetwork')}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <p className="text-glass-secondary text-sm">{tWallet('cgcBalance')}</p>
                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="text-glass-secondary hover:text-glass transition-colors"
                    >
                      {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-2xl font-bold text-glass">
                    {balanceVisible ? `${formatNumber(userBalance)} CGC` : '••••••'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-glass-secondary text-sm">{tDashboard('yourStats.earnings')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{formatNumber(userEarnings)} CGC
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

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

        {/* Main Action Panels */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Governance Panel */}
          <ActionPanel
            title={tDashboard('panels.governance.title')}
            description={tDashboard('panels.governance.description')}
            icon={<Vote className="w-6 h-6 text-purple-500" />}
            actions={[
              {
                label: tDashboard('panels.governance.viewProposals'),
                action: () => handleAction('View proposals', 'proposals'),
                loading: loadingStates.proposals,
                disabled: !isConnected
              },
              {
                label: tDashboard('panels.governance.createProposal'),
                action: () => handleAction('Create proposal', 'createProposal'),
                loading: loadingStates.createProposal,
                disabled: !isConnected
              },
              {
                label: tDashboard('panels.governance.delegateVoting'),
                action: () => handleAction('Delegate voting power', 'delegate'),
                loading: loadingStates.delegate,
                disabled: !isConnected
              }
            ]}
            delay="1.1s"
          />

          {/* Token Management Panel - Protected */}
          <CGCAccessGate
            requiredBalance="0.01"
            title={`🪙 ${tDashboard('panels.tokenManagement.accessTitle')}`}
            description={tDashboard('panels.tokenManagement.accessDescription')}
          >
            <ActionPanel
              title={tDashboard('panels.tokenManagement.title')}
              description={tDashboard('panels.tokenManagement.description')}
              icon={<Wallet className="w-6 h-6 text-green-500" />}
              actions={[
                {
                  label: isReleasePending ? tDashboard('panels.tokenManagement.releasing') : tDashboard('panels.tokenManagement.requestRelease'),
                  action: () => handleAction('Request token release', 'release'),
                  loading: loadingStates.release || isReleasePending,
                  disabled: !isConnected || isReleasePending,
                  primary: true
                },
                {
                  label: tDashboard('panels.tokenManagement.releaseHistory'),
                  action: () => handleAction('View release history', 'history'),
                  loading: loadingStates.history,
                  disabled: !isConnected
                },
                {
                  label: tDashboard('panels.tokenManagement.vestingSchedule'),
                  action: () => handleAction('Check vesting schedule', 'vesting'),
                  loading: loadingStates.vesting,
                  disabled: !isConnected
                }
              ]}
              delay="1.2s"
            />
          </CGCAccessGate>

          {/* Quest Platform Panel */}
          <ActionPanel
            title={tDashboard('panels.quests.title')}
            description={tDashboard('panels.quests.description')}
            icon={<CheckCircle2 className="w-6 h-6 text-blue-500" />}
            actions={[
              {
                label: `${tDashboard('panels.quests.activeQuests')} (${activeTasks})`,
                action: () => handleAction('View active quests', 'quests'),
                loading: loadingStates.quests,
                disabled: !isConnected
              },
              {
                label: tDashboard('panels.quests.leaderboard'),
                action: () => handleAction('View leaderboard', 'leaderboard'),
                loading: loadingStates.leaderboard
              },
              {
                label: tDashboard('panels.quests.syncZealy'),
                action: () => handleAction('Sync with Zealy', 'sync'),
                loading: loadingStates.sync,
                disabled: !isConnected,
                secondary: true
              }
            ]}
            delay="1.3s"
          />

          {/* Administration Panel - Protected */}
          <CGCAccessGate
            requiredBalance="1.0"
            title={`⚙️ ${tDashboard('panels.administration.accessTitle')}`}
            description={tDashboard('panels.administration.accessDescription')}
          >
            <ActionPanel
              title={tDashboard('panels.administration.title')}
              description={tDashboard('panels.administration.description')}
              icon={<Settings className="w-6 h-6 text-gray-500" />}
              actions={[
                {
                  label: tDashboard('panels.administration.safeMultisig'),
                  action: () => handleAction('Open Safe Multisig', 'safe'),
                  loading: loadingStates.safe
                },
                {
                  label: tDashboard('panels.administration.contractAdmin'),
                  action: () => handleAction('Access contract admin', 'admin'),
                  loading: loadingStates.admin,
                  disabled: !isConnected
                },
                {
                  label: tDashboard('panels.administration.systemStatus'),
                  action: () => handleAction('Check system status', 'status'),
                  loading: loadingStates.status,
                  secondary: true
                }
              ]}
              delay="1.4s"
            />
          </CGCAccessGate>
        </section>

        {/* System Status Footer */}
        <footer className="glass-panel p-6 spring-in" style={{ animationDelay: '1.5s' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${systemActive ? 'bg-green-400 pulse-glow' : 'bg-red-400'}`}></div>
              <span className="text-glass-secondary text-sm">
                {tDashboard('system.title')}: {systemActive ? tDashboard('system.active') : tDashboard('system.inactive')}
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

// Action Panel Component
function ActionPanel({
  title,
  description,
  icon,
  actions,
  delay = "0s"
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  actions: Array<{
    label: string;
    action: () => void;
    loading?: boolean;
    disabled?: boolean;
    primary?: boolean;
    secondary?: boolean;
  }>;
  delay?: string;
}) {
  return (
    <div className="glass-panel p-6 spring-in" style={{ animationDelay: delay }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 glass-bubble">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-glass">{title}</h3>
          <p className="text-glass-secondary text-sm">{description}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`glass-button w-full text-left flex items-center justify-between group ${
              action.primary ? 'pulse-glow' : ''
            } ${
              action.secondary ? 'opacity-75' : ''
            }`}
            onClick={action.action}
            disabled={action.disabled || action.loading}
          >
            <span className={action.loading ? 'opacity-50' : ''}>{action.label}</span>
            {action.loading && (
              <div className="w-4 h-4 border-2 border-glass-secondary border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}