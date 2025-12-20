/**
 * 🗳️ Proposals Page - CRYSTAL EDITION
 *
 * Community proposals for new tasks
 * Bidirectional sync with Discord
 * 🌐 i18n: Full translation support for EN/ES
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAccount } from '@/lib/thirdweb'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import {
  MessageSquarePlus,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle2,
  XCircle,
  Rocket,
  Users,
  RefreshCw,
  Filter,
  PlusCircle,
  ExternalLink,
  Bot,
} from 'lucide-react'

// Animation styles
const pageAnimations = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

interface Proposal {
  id: string
  title: string
  description: string | null
  source: 'discord' | 'web'
  proposedByDiscordUsername: string | null
  proposedByWallet: string | null
  votesUp: number
  votesDown: number
  voteScore: number
  approvalPercentage: number
  suggestedCategory: string | null
  suggestedReward: number | null
  suggestedDomain: string | null
  status: 'pending' | 'voting' | 'approved' | 'rejected' | 'converted'
  refinedTitle: string | null
  refinedDescription: string | null
  createdAt: string
}

export default function ProposalsPage() {
  const t = useTranslations('proposals')
  const tCommon = useTranslations('common')

  const { address, isConnected } = useAccount()
  const { success, error, warning } = useToast()

  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('active')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [syncStatus, setSyncStatus] = useState<any>(null)

  // Load proposals
  useEffect(() => {
    loadProposals()
    loadSyncStatus()
  }, [])

  const loadProposals = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/proposals')
      if (response.ok) {
        const result = await response.json()
        // API returns { success: true, data: [...], count: N }
        setProposals(result.data || result.proposals || [])
      }
    } catch (err) {
      console.error('Failed to load proposals:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSyncStatus = async () => {
    try {
      const response = await fetch('/api/discord/sync')
      if (response.ok) {
        const data = await response.json()
        setSyncStatus(data)
      }
    } catch (err) {
      console.error('Failed to load sync status:', err)
    }
  }

  const handleVote = async (proposalId: string, vote: 'up' | 'down') => {
    if (!isConnected) {
      warning('Connect your wallet to vote')
      return
    }

    try {
      const response = await fetch('/api/proposals/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId,
          voteType: vote,
          voterWallet: address,
          source: 'web',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const action = result.action === 'removed' ? 'Vote removed' : 'Vote recorded!'
        success(action)
        loadProposals()
      } else {
        const data = await response.json()
        error(data.error || 'Failed to vote')
      }
    } catch (err) {
      error('Failed to submit vote')
    }
  }

  const handleSync = async () => {
    try {
      const response = await fetch('/api/discord/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_new_proposals' }),
      })

      if (response.ok) {
        const data = await response.json()
        success(`Synced ${data.synced} proposals to Discord`)
        loadSyncStatus()
      } else {
        error('Sync failed')
      }
    } catch (err) {
      error('Failed to sync')
    }
  }

  const activeProposals = proposals.filter((p) => p.status === 'pending' || p.status === 'voting')
  const approvedProposals = proposals.filter((p) => p.status === 'approved' || p.status === 'converted')
  const rejectedProposals = proposals.filter((p) => p.status === 'rejected')

  return (
    <>
      <style jsx global>{pageAnimations}</style>

      <div className="min-h-screen theme-gradient-bg">
        {/* Header Section */}
        <div className="relative px-6 py-12 overflow-hidden">
          {/* Blur accents */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />

          <div className="relative max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-crystal mb-6"
                style={{ animation: 'float 3s ease-in-out infinite' }}
              >
                <MessageSquarePlus className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {t('badge')}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {t('title')}{' '}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  {t('titleHighlight')}
                </span>
              </h1>

              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                {t('subtitle')}
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass-crystal rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{activeProposals.length}</div>
                <div className="text-sm text-gray-400">{t('stats.activeProposals')}</div>
              </div>
              <div className="glass-crystal rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{approvedProposals.length}</div>
                <div className="text-sm text-gray-400">{t('stats.approved')}</div>
              </div>
              <div className="glass-crystal rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {proposals.reduce((sum, p) => sum + p.votesUp + p.votesDown, 0)}
                </div>
                <div className="text-sm text-gray-400">{t('stats.totalVotes')}</div>
              </div>
              <div className="glass-crystal rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {syncStatus?.proposals?.synced || 0}
                </div>
                <div className="text-sm text-gray-400">Discord Sync</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                {t('actions.proposeTask')}
              </Button>

              <Button
                onClick={handleSync}
                variant="outline"
                className="border-purple-500/30 hover:bg-purple-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('actions.refresh')}
              </Button>

              <Button
                variant="outline"
                className="border-blue-500/30 hover:bg-blue-500/10"
                asChild
              >
                <a href="https://discord.gg/XzmKkrvhHc" target="_blank" rel="noopener noreferrer">
                  <Bot className="w-4 h-4 mr-2" />
                  Discord Bot
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="glass-crystal mb-8">
              <TabsTrigger value="active" className="data-[state=active]:bg-purple-500/20">
                {t('tabs.voting')} ({activeProposals.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-green-500/20">
                {t('tabs.approved')} ({approvedProposals.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500/20">
                {t('tabs.rejected')} ({rejectedProposals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {isLoading ? (
                <div className="text-center py-12 text-gray-400">{t('loading.text')}</div>
              ) : activeProposals.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquarePlus className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">{t('empty.noProposals')}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {t('empty.beFirst')}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      onVote={handleVote}
                      isConnected={isConnected}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved">
              {approvedProposals.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  {t('empty.noMatching')}
                </div>
              ) : (
                <div className="grid gap-4">
                  {approvedProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      onVote={handleVote}
                      isConnected={isConnected}
                      readonly
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {rejectedProposals.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  {t('empty.noMatching')}
                </div>
              ) : (
                <div className="grid gap-4">
                  {rejectedProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      onVote={handleVote}
                      isConnected={isConnected}
                      readonly
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Proposal Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-crystal rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-white mb-4">{t('createModal.title')}</h2>
            <p className="text-gray-400 mb-6">
              {t('createModal.subtitle')}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('createModal.titleLabel')}</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                  placeholder={t('createModal.titlePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">{t('createModal.descriptionLabel')}</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 h-32"
                  placeholder={t('createModal.descriptionPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t('createModal.categoryLabel')}</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                    <option value="">{t('createModal.categoryPlaceholder')}</option>
                    <option value="development">{t('categories.development')}</option>
                    <option value="design">{t('categories.design')}</option>
                    <option value="marketing">{t('categories.marketing')}</option>
                    <option value="community">{t('categories.community')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">{t('createModal.rewardLabel')}</label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                    placeholder={t('createModal.rewardPlaceholder')}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                {t('createModal.cancel')}
              </Button>
              <Button
                onClick={() => {
                  warning('Proposal creation coming soon!')
                  setShowCreateModal(false)
                }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
              >
                {t('createModal.submit')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Proposal Card Component
function ProposalCard({
  proposal,
  onVote,
  isConnected,
  readonly = false,
}: {
  proposal: Proposal
  onVote: (id: string, vote: 'up' | 'down') => void
  isConnected: boolean
  readonly?: boolean
}) {
  const t = useTranslations('proposals')

  const votePercentage = proposal.approvalPercentage || (
    proposal.votesUp + proposal.votesDown > 0
      ? Math.round((proposal.votesUp / (proposal.votesUp + proposal.votesDown)) * 100)
      : 50
  )

  return (
    <div className="glass-crystal rounded-xl p-6 hover:border-purple-500/30 transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white">
              {proposal.refinedTitle || proposal.title}
            </h3>
            {proposal.source === 'discord' && (
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                <Bot className="w-3 h-3 mr-1" />
                Discord
              </Badge>
            )}
          </div>

          <p className="text-gray-400 text-sm line-clamp-2">
            {proposal.refinedDescription || proposal.description || 'No description provided'}
          </p>
        </div>

        <StatusBadge status={proposal.status} />
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
        <span>
          {t('card.by')}:{' '}
          <span className="text-gray-300">
            {proposal.proposedByDiscordUsername ||
              (proposal.proposedByWallet
                ? `${proposal.proposedByWallet.slice(0, 6)}...${proposal.proposedByWallet.slice(-4)}`
                : t('card.anonymous'))}
          </span>
        </span>

        {proposal.suggestedCategory && (
          <span>
            {t('card.category')}: <span className="text-purple-400">{proposal.suggestedCategory}</span>
          </span>
        )}

        {proposal.suggestedReward && (
          <span>
            {t('card.reward')}: <span className="text-green-400">{proposal.suggestedReward} CGC</span>
          </span>
        )}

        <span>
          {new Date(proposal.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Voting Section */}
      <div className="flex items-center gap-4">
        {/* Vote Progress Bar */}
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>✅ {proposal.votesUp} {t('card.votes')}</span>
            <span>{votePercentage}% {t('card.approval')}</span>
            <span>❌ {proposal.votesDown} {t('card.votes')}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400"
              style={{ width: `${votePercentage}%` }}
            />
          </div>
        </div>

        {/* Vote Buttons */}
        {!readonly && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onVote(proposal.id, 'up')}
              disabled={!isConnected}
              className="border-green-500/30 hover:bg-green-500/20 text-green-400"
              title={t('card.voteFor')}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onVote(proposal.id, 'down')}
              disabled={!isConnected}
              className="border-red-500/30 hover:bg-red-500/20 text-red-400"
              title={t('card.voteAgainst')}
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Status Badge Component with i18n
function StatusBadge({ status }: { status: string }) {
  const t = useTranslations('proposals')

  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
          <Clock className="w-3 h-3 mr-1" />
          {t('status.pending')}
        </Badge>
      )
    case 'voting':
      return (
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          <Users className="w-3 h-3 mr-1" />
          {t('status.voting')}
        </Badge>
      )
    case 'approved':
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {t('status.approved')}
        </Badge>
      )
    case 'rejected':
      return (
        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
          <XCircle className="w-3 h-3 mr-1" />
          {t('status.rejected')}
        </Badge>
      )
    case 'converted':
      return (
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          <Rocket className="w-3 h-3 mr-1" />
          {t('status.converted')}
        </Badge>
      )
    default:
      return null
  }
}
