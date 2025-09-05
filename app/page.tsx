'use client';

import { useState, useEffect } from 'react';
import { ConnectWallet } from '@/components/web3/ConnectWallet';
import { ApexAgent } from '@/components/agent/ApexAgent';
import { useDashboardStats, useCGCTransfer, useMilestoneRelease } from '@/lib/web3/hooks';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { useToast } from '@/components/ui/toast';
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
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';

export default function CryptoGiftDAODashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { success, error, warning, info } = useToast();
  
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

  // Check network and prompt switch if needed
  useEffect(() => {
    if (isConnected && chainId !== base.id) {
      warning('Wrong Network', 'Please switch to Base Network');
      switchChain?.({ chainId: base.id });
    }
  }, [isConnected, chainId, switchChain, warning]);

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

    if (chainId !== base.id) {
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
            await releaseMilestone(address, '100', `milestone-${Date.now()}`);
            info('Transaction Submitted', 'Waiting for confirmation...');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Glassmorphism Background Effect */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Navigation */}
        <header className="glass-panel mb-8 p-6 spring-in">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg relative">
                  <img 
                    src="/apeX.png" 
                    alt="apeX Assistant"
                    className="absolute inset-0 w-full h-full object-cover rounded-full"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: 'center',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-glass bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CryptoGift DAO
                  </h1>
                  <p className="text-glass-secondary text-sm">
                    Governance & Token Distribution Platform
                  </p>
                </div>
              </div>
              
              {/* Quick Nav */}
              <nav className="hidden lg:flex items-center gap-2">
                <a href="/governance" className="glass-button text-sm">
                  Governance
                </a>
                <a href="/quests" className="glass-button text-sm">
                  Quests
                </a>
                <a href="/treasury" className="glass-button text-sm">
                  Treasury
                </a>
                <a href="/agent" className="glass-button text-sm flex items-center gap-1">
                  <span>apeX Assistant</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </nav>
            </div>
            
            <ConnectWallet />
          </div>
        </header>

        {/* User Profile Section (if connected) */}
        {isConnected && address && (
          <section className="glass-card mb-8 p-6 spring-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white">
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-glass">Connected Wallet</h3>
                  <p className="text-glass-secondary font-mono text-sm">
                    {address.slice(0, 8)}...{address.slice(-6)}
                  </p>
                  <p className="text-xs text-glass-secondary">Base Network • {chainId === base.id ? 'Correct Network' : 'Wrong Network'}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <p className="text-glass-secondary text-sm">CGC Balance</p>
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
                  <p className="text-glass-secondary text-sm">Total Earnings</p>
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
            title="Total Supply"
            value={`${formatNumber(totalSupply)} CGC`}
            icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
            loading={!totalSupply || totalSupply === '0'}
            delay="0.2s"
          />
          <StatCard
            title="Token Holders"
            value={holdersCount.toString()}
            icon={<Users className="w-6 h-6 text-green-500" />}
            loading={holdersCount === 0}
            delay="0.3s"
          />
          <StatCard
            title="Active Proposals"
            value={proposalsActive.toString()}
            icon={<Vote className="w-6 h-6 text-purple-500" />}
            delay="0.4s"
          />
          <StatCard
            title="Quests Completed"
            value={questsCompleted.toString()}
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
            delay="0.5s"
          />
          <StatCard
            title="Circulating Supply"
            value={`${formatNumber(circulatingSupply)} CGC`}
            icon={<Repeat2 className="w-6 h-6 text-indigo-500" />}
            delay="0.6s"
          />
        </section>

        {/* Secondary Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Treasury Balance"
            value={`${formatNumber(treasuryBalance)} CGC`}
            icon={<Wallet className="w-6 h-6 text-amber-500" />}
            loading={!treasuryBalance}
            delay="0.7s"
          />
          <StatCard
            title="Escrow Balance"
            value={`${formatNumber(escrowBalance)} CGC`}
            icon={<Lock className="w-6 h-6 text-red-500" />}
            delay="0.8s"
          />
          <StatCard
            title="Active Tasks"
            value={activeTasks.toString()}
            icon={<Zap className="w-6 h-6 text-yellow-500" />}
            delay="0.9s"
          />
          <StatCard
            title="Milestones Released"
            value={milestonesReleased.toString()}
            icon={<Target className="w-6 h-6 text-pink-500" />}
            delay="1.0s"
          />
        </section>

        {/* Main Action Panels */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Governance Panel */}
          <ActionPanel
            title="Governance & Voting"
            description="Participate in DAO governance and voting"
            icon={<Vote className="w-6 h-6 text-purple-500" />}
            actions={[
              {
                label: "View Proposals",
                action: () => handleAction('View proposals', 'proposals'),
                loading: loadingStates.proposals,
                disabled: !isConnected
              },
              {
                label: "Create Proposal", 
                action: () => handleAction('Create proposal', 'createProposal'),
                loading: loadingStates.createProposal,
                disabled: !isConnected
              },
              {
                label: "Delegate Voting Power",
                action: () => handleAction('Delegate voting power', 'delegate'),
                loading: loadingStates.delegate,
                disabled: !isConnected
              }
            ]}
            delay="1.1s"
          />

          {/* Token Management Panel */}
          <ActionPanel
            title="Token Management"
            description="Manage your CGC tokens and rewards"
            icon={<Wallet className="w-6 h-6 text-green-500" />}
            actions={[
              {
                label: isReleasePending ? 'Releasing...' : "Request Token Release",
                action: () => handleAction('Request token release', 'release'),
                loading: loadingStates.release || isReleasePending,
                disabled: !isConnected || isReleasePending,
                primary: true
              },
              {
                label: "Release History",
                action: () => handleAction('View release history', 'history'),
                loading: loadingStates.history,
                disabled: !isConnected
              },
              {
                label: "Vesting Schedule",
                action: () => handleAction('Check vesting schedule', 'vesting'),
                loading: loadingStates.vesting,
                disabled: !isConnected
              }
            ]}
            delay="1.2s"
          />

          {/* Quest Platform Panel */}
          <ActionPanel
            title="Quest Platform"
            description="Complete quests and earn rewards"
            icon={<CheckCircle2 className="w-6 h-6 text-blue-500" />}
            actions={[
              {
                label: `Active Quests (${activeTasks})`,
                action: () => handleAction('View active quests', 'quests'),
                loading: loadingStates.quests,
                disabled: !isConnected
              },
              {
                label: "Leaderboard",
                action: () => handleAction('View leaderboard', 'leaderboard'),
                loading: loadingStates.leaderboard
              },
              {
                label: "Sync Zealy",
                action: () => handleAction('Sync with Zealy', 'sync'),
                loading: loadingStates.sync,
                disabled: !isConnected,
                secondary: true
              }
            ]}
            delay="1.3s"
          />

          {/* Administration Panel */}
          <ActionPanel
            title="Administration"
            description="Advanced system administration"
            icon={<Settings className="w-6 h-6 text-gray-500" />}
            actions={[
              {
                label: "Safe Multisig",
                action: () => handleAction('Open Safe Multisig', 'safe'),
                loading: loadingStates.safe
              },
              {
                label: "Contract Admin",
                action: () => handleAction('Access contract admin', 'admin'),
                loading: loadingStates.admin,
                disabled: !isConnected
              },
              {
                label: "System Status",
                action: () => handleAction('Check system status', 'status'),
                loading: loadingStates.status,
                secondary: true
              }
            ]}
            delay="1.4s"
          />
        </section>

        {/* System Status Footer */}
        <footer className="glass-panel p-6 spring-in" style={{ animationDelay: '1.5s' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${systemActive ? 'bg-green-400 pulse-glow' : 'bg-red-400'}`}></div>
              <span className="text-glass-secondary text-sm">
                System Status: {systemActive ? 'Operational' : 'Maintenance'}
              </span>
            </div>
            
            {!isConnected && (
              <div className="text-center">
                <p className="text-glass-secondary text-sm">
                  🔗 Connect your wallet to access all features
                </p>
              </div>
            )}
            
            {isConnected && chainId !== base.id && (
              <div className="text-center">
                <p className="text-orange-500 text-sm">
                  🔄 Please switch to Base Network to continue
                </p>
              </div>
            )}
          </div>
        </footer>
      </div>

      {/* apeX Agent Floating Bubble */}
      <ApexAgent />
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