'use client';

import { useState } from 'react';
import { LoadingButton, LoadingCard, LoadingSkeleton } from '@/components/ui/loading';
import { useToast } from '@/components/ui/toast';

export default function DAODashboard() {
  const [stats] = useState({
    totalSupply: '1,000,000 CGC',
    circulatingSupply: '0 CGC',
    treasuryBalance: '250,000 CGC',
    holdersCount: 0,
    proposalsActive: 0,
    questsCompleted: 0,
  });

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

  const [isLoading, setIsLoading] = useState(false);
  const { success, error, warning } = useToast();

  const handleAction = async (action: string, loadingKey: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // Simulate API call with random success/error
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const shouldSucceed = Math.random() > 0.3;
      
      if (shouldSucceed) {
        success(`${action} completed`, 'Operation executed successfully');
      } else {
        throw new Error('Simulated API error');
      }
      
      console.log(action);
    } catch (err) {
      error(`${action} failed`, 'Please try again or check your connection');
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          CryptoGift DAO Dashboard
        </h1>
        <p className="text-gray-300 text-sm sm:text-base">
          Governance and token distribution management
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Supply"
          value={stats.totalSupply}
          icon="💰"
        />
        <StatCard
          title="Treasury Balance"
          value={stats.treasuryBalance}
          icon="🏦"
        />
        <StatCard
          title="Token Holders"
          value={stats.holdersCount.toString()}
          icon="👥"
        />
        <StatCard
          title="Active Proposals"
          value={stats.proposalsActive.toString()}
          icon="📋"
        />
        <StatCard
          title="Quests Completed"
          value={stats.questsCompleted.toString()}
          icon="✅"
        />
        <StatCard
          title="Circulating Supply"
          value={stats.circulatingSupply}
          icon="🔄"
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
            >
              View Proposals
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.createProposal}
              onClick={() => handleAction('Create proposal', 'createProposal')}
            >
              Create Proposal
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.delegate}
              onClick={() => handleAction('Delegate voting power', 'delegate')}
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
              loading={loadingStates.release}
              onClick={() => handleAction('Request token release', 'release')}
            >
              Request Token Release
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.history}
              onClick={() => handleAction('View release history', 'history')}
            >
              View Release History
            </LoadingButton>
            <LoadingButton
              loading={loadingStates.vesting}
              onClick={() => handleAction('Check vesting schedule', 'vesting')}
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
            >
              Active Quests
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

      {/* Shadow Mode Warning */}
      <div className="mt-6 sm:mt-8 bg-yellow-900/50 border border-yellow-600 rounded-lg p-3 sm:p-4">
        <p className="text-yellow-300 text-xs sm:text-sm">
          ⚠️ System is currently in SHADOW MODE - Transactions are simulated only
        </p>
      </div>
    </div>
  );
}

// Component: Stat Card
function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-xl sm:text-2xl">{icon}</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white break-all">{value}</p>
    </div>
  );
}

