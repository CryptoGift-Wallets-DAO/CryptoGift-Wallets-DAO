'use client';

import { useState, useEffect } from 'react';

export default function DAODashboard() {
  const [stats, setStats] = useState({
    totalSupply: '1,000,000 CGC',
    circulatingSupply: '0 CGC',
    treasuryBalance: '250,000 CGC',
    holdersCount: 0,
    proposalsActive: 0,
    questsCompleted: 0,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          CryptoGift DAO Dashboard
        </h1>
        <p className="text-gray-300">
          Governance and token distribution management
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Governance Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Governance
          </h2>
          <div className="space-y-4">
            <ActionButton
              label="View Proposals"
              onClick={() => console.log('View proposals')}
            />
            <ActionButton
              label="Create Proposal"
              onClick={() => console.log('Create proposal')}
            />
            <ActionButton
              label="Delegate Voting Power"
              onClick={() => console.log('Delegate')}
            />
          </div>
        </section>

        {/* Token Management Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Token Management
          </h2>
          <div className="space-y-4">
            <ActionButton
              label="Request Token Release"
              onClick={() => console.log('Request release')}
            />
            <ActionButton
              label="View Release History"
              onClick={() => console.log('View history')}
            />
            <ActionButton
              label="Check Vesting Schedule"
              onClick={() => console.log('Check vesting')}
            />
          </div>
        </section>

        {/* Quest Integration Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Quest Platform
          </h2>
          <div className="space-y-4">
            <ActionButton
              label="Active Quests"
              onClick={() => console.log('Active quests')}
            />
            <ActionButton
              label="Leaderboard"
              onClick={() => console.log('Leaderboard')}
            />
            <ActionButton
              label="Sync Zealy"
              onClick={() => console.log('Sync Zealy')}
            />
          </div>
        </section>

        {/* Admin Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Administration
          </h2>
          <div className="space-y-4">
            <ActionButton
              label="Safe Multisig"
              onClick={() => window.open('https://app.safe.global', '_blank')}
            />
            <ActionButton
              label="Contract Admin"
              onClick={() => console.log('Contract admin')}
            />
            <ActionButton
              label="System Status"
              onClick={() => console.log('System status')}
            />
          </div>
        </section>
      </div>

      {/* Shadow Mode Warning */}
      <div className="mt-8 bg-yellow-900/50 border border-yellow-600 rounded-lg p-4">
        <p className="text-yellow-300 text-sm">
          ⚠️ System is currently in SHADOW MODE - Transactions are simulated only
        </p>
      </div>
    </div>
  );
}

// Component: Stat Card
function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-400 text-sm uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

// Component: Action Button
function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
    >
      {label}
    </button>
  );
}