'use client';

import { useState, useEffect } from 'react';
import { LoadingButton, LoadingCard, LoadingSkeleton } from '@/components/ui/loading';
import { useToast } from '@/components/ui/toast';
import { ConnectWallet } from '@/components/web3/ConnectWallet';
import { FloatingAgentButton } from '@/components/agent/FloatingAgentButton';
import { useDashboardStats, useCGCTransfer, useMilestoneRelease } from '@/lib/web3/hooks';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { parseUnits, formatUnits } from 'viem';
import { getExplorerUrl } from '@/lib/web3/config';

export default function DAODashboard() {
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header with Wallet Connection */}
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              CryptoGift DAO Dashboard
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Governance and token distribution management
            </p>
          </div>
          <a 
            href="/agent" 
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-300 bg-blue-900/30 border border-blue-600 rounded-full hover:bg-blue-900/50 transition-colors"
          >
            🤖 AI Agent
          </a>
        </div>
        <ConnectWallet />
      </header>

      {/* User Stats (if connected) */}
      {isConnected && address && (
        <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <p className="text-blue-300 text-sm">Your Wallet</p>
              <p className="text-white font-mono text-xs sm:text-sm">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
            <div>
              <p className="text-blue-300 text-sm">CGC Balance</p>
              <p className="text-white font-bold text-lg">{formatNumber(userBalance)} CGC</p>
            </div>
            <div>
              <p className="text-blue-300 text-sm">Total Earnings</p>
              <p className="text-white font-bold text-lg">{formatNumber(userEarnings)} CGC</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - Now with REAL DATA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Supply"
          value={`${formatNumber(totalSupply)} CGC`}
          icon="💰"
          loading={!totalSupply || totalSupply === '0'}
        />
        <StatCard
          title="Treasury Balance"
          value={`${formatNumber(treasuryBalance)} CGC`}
          icon="🏦"
          loading={!treasuryBalance}
        />
        <StatCard
          title="Token Holders"
          value={holdersCount.toString()}
          icon="👥"
          loading={holdersCount === 0}
        />
        <StatCard
          title="Active Proposals"
          value={proposalsActive.toString()}
          icon="📋"
        />
        <StatCard
          title="Quests Completed"
          value={questsCompleted.toString()}
          icon="✅"
        />
        <StatCard
          title="Circulating Supply"
          value={`${formatNumber(circulatingSupply)} CGC`}
          icon="🔄"
        />
        <StatCard
          title="Escrow Balance"
          value={`${formatNumber(escrowBalance)} CGC`}
          icon="🔒"
        />
        <StatCard
          title="Active Tasks"
          value={activeTasks.toString()}
          icon="⚡"
        />
        <StatCard
          title="Milestones Released"
          value={milestonesReleased.toString()}
          icon="🎯"
        />
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Governance Section */}
        <section className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
            Governance
          </h2>
          <div className="space-y-4">
            <LoadingButton
              loading={loadingStates.proposals}
              onClick={() => handleAction('View proposals', 'proposals')}
              disabled={!isConnected}
            >
              View Proposals
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.createProposal}
              onClick={() => handleAction('Create proposal', 'createProposal')}
              disabled={!isConnected}
            >
              Create Proposal
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.delegate}
              onClick={() => handleAction('Delegate voting power', 'delegate')}
              disabled={!isConnected}
            >
              Delegate Voting Power
            </LoadingButton>
          </div>
        </section>

        {/* Token Management Section */}
        <section className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
            Token Management
          </h2>
          <div className="space-y-4">
            <LoadingButton
              loading={loadingStates.release || isReleasePending}
              onClick={() => handleAction('Request token release', 'release')}
              disabled={!isConnected || isReleasePending}
            >
              {isReleasePending ? 'Releasing...' : 'Request Token Release'}
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.history}
              onClick={() => handleAction('View release history', 'history')}
              disabled={!isConnected}
            >
              View Release History
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.vesting}
              onClick={() => handleAction('Check vesting schedule', 'vesting')}
              disabled={!isConnected}
            >
              Check Vesting Schedule
            </LoadingButton>
          </div>
        </section>

        {/* Quest Integration Section */}
        <section className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
            Quest Platform
          </h2>
          <div className="space-y-4">
            <LoadingButton
              loading={loadingStates.quests}
              onClick={() => handleAction('View active quests', 'quests')}
              disabled={!isConnected}
            >
              Active Quests ({activeTasks})
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.leaderboard}
              onClick={() => handleAction('View leaderboard', 'leaderboard')}
            >
              Leaderboard
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.sync}
              onClick={() => handleAction('Sync with Zealy', 'sync')}
              variant="secondary"
              disabled={!isConnected}
            >
              Sync Zealy
            </LoadingButton>
          </div>
        </section>

        {/* Admin Section */}
        <section className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
            Administration
          </h2>
          <div className="space-y-4">
            <LoadingButton
              loading={loadingStates.safe}
              onClick={() => handleAction('Open Safe Multisig', 'safe')}
            >
              Safe Multisig
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.admin}
              onClick={() => handleAction('Access contract admin', 'admin')}
              disabled={!isConnected}
            >
              Contract Admin
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.status}
              onClick={() => handleAction('Check system status', 'status')}
              variant="secondary"
            >
              System Status
            </LoadingButton>
          </div>
        </section>
      </div>

      {/* System Status Footer */}
      <div className="mt-6 sm:mt-8">
        {systemActive === false && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-red-300 text-xs sm:text-sm">
              ⚠️ System is currently PAUSED - Transactions are disabled
            </p>
          </div>
        )}
        
        {!isConnected && (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-3 sm:p-4">
            <p className="text-yellow-300 text-xs sm:text-sm">
              🔗 Connect your wallet to access all features
            </p>
          </div>
        )}
        
        {isConnected && chainId !== base.id && (
          <div className="bg-orange-900/50 border border-orange-600 rounded-lg p-3 sm:p-4">
            <p className="text-orange-300 text-xs sm:text-sm">
              🔄 Please switch to Base Network to continue
            </p>
          </div>
        )}
      </div>

      {/* Floating Agent Button */}
      <FloatingAgentButton />
    </div>
  );
}

// Component: Stat Card with loading state
function StatCard({ 
  title, 
  value, 
  icon, 
  loading = false 
}: { 
  title: string; 
  value: string; 
  icon: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-xl sm:text-2xl">{icon}</span>
      </div>
      {loading ? (
        <LoadingSkeleton className="h-8 w-24" />
      ) : (
        <p className="text-xl sm:text-2xl font-bold text-white break-all">{value}</p>
      )}
    </div>
  );
}