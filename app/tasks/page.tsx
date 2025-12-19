/**
 * 🎯 Tasks & Rewards Page - PREMIUM EDITION
 *
 * Stunning visual effects with glass morphism, holographic animations,
 * and orbital floating elements. Enterprise-level design.
 * 🌐 i18n: Full translation support for EN/ES
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAccount } from '@/lib/thirdweb'
import { useCGCBalance } from '@/lib/web3/hooks'
import { TaskList } from '@/components/tasks/TaskList'
import { TasksInProgress } from '@/components/tasks/TasksInProgress'
import { TaskProposal } from '@/components/tasks/TaskProposal'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { StatsOverview } from '@/components/leaderboard/StatsOverview'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import {
  Trophy,
  Target,
  Clock,
  PlusCircle,
  Users,
  Zap,
  Award,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Rocket,
  Star,
  Crown,
  Flame
} from 'lucide-react'

// Premium animations for the page
const pageAnimations = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
  }

  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(-2deg); }
  }

  @keyframes orbital {
    0% { transform: rotate(0deg) translateX(150px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%) rotate(15deg); }
    100% { transform: translateX(200%) rotate(15deg); }
  }

  @keyframes holographic {
    0%, 100% {
      background-position: 0% 50%;
      filter: hue-rotate(0deg);
    }
    50% {
      background-position: 100% 50%;
      filter: hue-rotate(15deg);
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(147, 51, 234, 0.4),
                  0 0 40px rgba(59, 130, 246, 0.2),
                  0 0 60px rgba(236, 72, 153, 0.1);
    }
    50% {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.5),
                  0 0 60px rgba(147, 51, 234, 0.3),
                  0 0 90px rgba(236, 72, 153, 0.15);
    }
  }

  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  @keyframes sparkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

export default function TasksPage() {
  // 🌐 Translation hooks
  const t = useTranslations('tasks')
  const tCommon = useTranslations('common')

  const { address, isConnected } = useAccount()
  const { balance } = useCGCBalance(address as `0x${string}` | undefined)
  const { success, error, warning, info } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    availableTasks: 0,
    tasksInProgress: 0,
    completedTasks: 0,
    totalRewards: 0,
    activeCollaborators: 0,
    userRank: 0,
  })

  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTab, setSelectedTab] = useState('available')

  // Load statistics
  useEffect(() => {
    loadStatistics()
  }, [address])

  const loadStatistics = async () => {
    try {
      setIsLoading(true)

      // Fetch tasks statistics
      const [availableRes, progressRes, leaderboardRes] = await Promise.all([
        fetch('/api/tasks?status=available'),
        fetch('/api/tasks?status=in_progress'),
        fetch(`/api/leaderboard${address ? `?address=${address}` : ''}`),
      ])

      const availableData = await availableRes.json()
      const progressData = await progressRes.json()
      const leaderboardData = await leaderboardRes.json()

      setStats({
        availableTasks: availableData.count || 0,
        tasksInProgress: progressData.count || 0,
        completedTasks: leaderboardData.data?.statistics?.totalTasksCompleted || 0,
        totalRewards: leaderboardData.data?.statistics?.totalCGCDistributed || 0,
        activeCollaborators: leaderboardData.data?.statistics?.totalCollaborators || 0,
        userRank: leaderboardData.data?.userRank?.position || 0,
      })
    } catch (err) {
      console.error('Error loading statistics:', err)
      error(t('toasts.failedToLoadStats'), t('toasts.failedToLoadStatsDesc'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    loadStatistics()
    info(t('toasts.refreshing'), t('toasts.refreshingDesc'))
  }

  const handleInitializeTasks = async () => {
    try {
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || process.env.ADMIN_DAO_API_TOKEN

      const response = await fetch('/api/admin/init-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        success(
          t('toasts.tasksInitialized'),
          t('toasts.tasksInitializedDesc', { count: data.data.tasksCreated, rewards: data.data.totalRewards })
        )
        handleRefresh()
      } else {
        error(t('toasts.initFailed'), data.error)
      }
    } catch (err) {
      console.error('Error initializing tasks:', err)
      error(t('toasts.errorInitializing'), tCommon('pleaseRetry'))
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30">
      <style jsx>{pageAnimations}</style>

      {/* Premium Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orbs */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 70%)',
            animation: 'float 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-30 dark:opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 70%)',
            animation: 'float-delayed 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 dark:opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(147, 51, 234, 0.15) 40%, transparent 60%)',
            animation: 'float 15s ease-in-out infinite 2s',
          }}
        />

        {/* Orbital Elements */}
        <div className="absolute top-1/4 right-1/4 hidden lg:block">
          <div
            className="w-4 h-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
            style={{ animation: 'orbital 20s linear infinite' }}
          />
        </div>
        <div className="absolute bottom-1/3 left-1/3 hidden lg:block">
          <div
            className="w-3 h-3 bg-gradient-to-r from-pink-400 to-amber-400 rounded-full"
            style={{ animation: 'orbital 25s linear infinite reverse' }}
          />
        </div>

        {/* Sparkle Effects */}
        <div className="absolute top-20 left-[10%] hidden md:block">
          <Sparkles
            className="w-6 h-6 text-purple-400/60"
            style={{ animation: 'sparkle 3s ease-in-out infinite' }}
          />
        </div>
        <div className="absolute top-40 right-[15%] hidden md:block">
          <Star
            className="w-5 h-5 text-amber-400/60"
            style={{ animation: 'sparkle 4s ease-in-out infinite 1s' }}
          />
        </div>
        <div className="absolute bottom-40 left-[20%] hidden md:block">
          <Zap
            className="w-5 h-5 text-blue-400/60"
            style={{ animation: 'sparkle 3.5s ease-in-out infinite 2s' }}
          />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Page Header */}
        <header
          className="mb-10 relative"
          style={{ animation: 'slide-up 0.6s ease-out' }}
        >
          {/* Holographic Header Background */}
          <div
            className="absolute inset-0 -m-4 rounded-3xl overflow-hidden opacity-50 dark:opacity-30"
            style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1), rgba(236, 72, 153, 0.05))',
            }}
          >
            <div
              className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ animation: 'shimmer 6s infinite' }}
            />
          </div>

          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 py-4">
            <div>
              {/* Premium Title with Gradient */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg"
                  style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}
                >
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1
                    className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #7c3aed, #3b82f6, #ec4899, #7c3aed)',
                      backgroundSize: '300% 300%',
                      animation: 'holographic 8s ease infinite',
                    }}
                  >
                    {t('title')}
                  </h1>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg ml-1">
                {t('subtitle')}
              </p>
            </div>

            {/* Premium Action Badges */}
            <div className="flex flex-wrap items-center gap-3">
              {address && (
                <div
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))',
                    borderColor: 'rgba(251, 191, 36, 0.3)',
                  }}
                >
                  <Crown className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-amber-700 dark:text-amber-300">
                    {t('page.rankLabel')} #{stats.userRank || '∞'}
                  </span>
                </div>
              )}
              <div
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                style={{
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(59, 130, 246, 0.1))',
                  borderColor: 'rgba(147, 51, 234, 0.3)',
                }}
              >
                <Zap className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  {balance} {tCommon('cgc')}
                </span>
              </div>
              <Button
                onClick={handleRefresh}
                className="px-5 py-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:scale-105 transition-all duration-300 hover:shadow-lg"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {tCommon('refresh')}
              </Button>
            </div>
          </div>
        </header>

        {/* Statistics Overview with enhanced styling */}
        <div style={{ animation: 'slide-up 0.6s ease-out 0.1s backwards' }}>
          <StatsOverview
            stats={{
              available: stats.availableTasks,
              inProgress: stats.tasksInProgress,
              completed: stats.completedTasks,
              totalRewards: stats.totalRewards,
              collaborators: stats.activeCollaborators,
            }}
            isLoading={isLoading}
          />
        </div>

        {/* Premium Tabs Container */}
        <div
          className="mt-10"
          style={{ animation: 'slide-up 0.6s ease-out 0.2s backwards' }}
        >
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            {/* Premium Tab List */}
            <div
              className="p-1.5 rounded-2xl backdrop-blur-xl border shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.9) 100%)',
                borderColor: 'rgba(148, 163, 184, 0.2)',
              }}
            >
              <TabsList className="grid w-full grid-cols-4 bg-transparent gap-1">
                {[
                  { value: 'available', icon: Target, label: t('tabs.available'), color: 'from-blue-500 to-cyan-500' },
                  { value: 'progress', icon: Clock, label: t('tabs.inProgress'), color: 'from-amber-500 to-orange-500' },
                  { value: 'leaderboard', icon: Trophy, label: t('tabs.leaderboard'), color: 'from-purple-500 to-pink-500' },
                  { value: 'propose', icon: PlusCircle, label: t('tabs.propose'), color: 'from-green-500 to-emerald-500' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`relative py-3 px-4 rounded-xl font-medium transition-all duration-300 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:bg-gray-100 dark:data-[state=inactive]:hover:bg-gray-800/50 ${
                      selectedTab === tab.value ? `bg-gradient-to-r ${tab.color} shadow-lg` : 'bg-transparent'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 mr-2 inline-block ${selectedTab === tab.value ? 'text-white' : ''}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Available Tasks Tab */}
            <TabsContent value="available" className="mt-8">
              <div
                className="rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,245,249,0.95) 100%)',
                  borderColor: 'rgba(59, 130, 246, 0.2)',
                }}
              >
                {/* Card Header with shimmer */}
                <div
                  className="relative px-6 py-5 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.05))',
                  }}
                >
                  <div
                    className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{ animation: 'shimmer 5s infinite' }}
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {t('page.availableTasksTitle')}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('page.availableTasksDescription')}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg"
                    >
                      <Flame className="w-4 h-4 mr-1" />
                      {t('page.availableTasksCount', { count: stats.availableTasks })}
                    </Badge>
                  </div>
                </div>
                <div className="p-6 dark:bg-slate-900/50">
                  <TaskList
                    userAddress={address}
                    refreshKey={refreshKey}
                    onTaskClaimed={() => {
                      success(t('toasts.taskClaimed'), t('toasts.taskClaimedDesc'))
                      handleRefresh()
                    }}
                  />
                </div>
              </div>

              {/* Admin: Initialize Tasks Button */}
              {stats.availableTasks === 0 && (
                <div
                  className="mt-6 rounded-2xl overflow-hidden border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))',
                    borderColor: 'rgba(251, 191, 36, 0.3)',
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-900 dark:text-amber-100 text-lg">{t('page.noTasksAvailable')}</h4>
                        <p className="text-amber-700 dark:text-amber-300 mt-1">
                          {t('page.noTasksMessage')}
                        </p>
                        <Button
                          onClick={handleInitializeTasks}
                          className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                          <Rocket className="w-4 h-4 mr-2" />
                          {t('page.initializeTasks')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* In Progress Tab */}
            <TabsContent value="progress" className="mt-8">
              <div
                className="rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,251,235,0.95) 100%)',
                  borderColor: 'rgba(251, 191, 36, 0.2)',
                }}
              >
                <div
                  className="relative px-6 py-5 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))',
                  }}
                >
                  <div
                    className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{ animation: 'shimmer 5s infinite' }}
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {t('page.inProgressTitle')}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('page.inProgressDescription')}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      {t('page.inProgressCount', { count: stats.tasksInProgress })}
                    </Badge>
                  </div>
                </div>
                <div className="p-6 dark:bg-slate-900/50">
                  <TasksInProgress
                    userAddress={address}
                    refreshKey={refreshKey}
                    onTaskSubmitted={() => {
                      success(t('toasts.evidenceSubmitted'), t('toasts.evidenceSubmittedDesc'))
                      handleRefresh()
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="mt-8">
              <div
                className="rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,245,255,0.95) 100%)',
                  borderColor: 'rgba(147, 51, 234, 0.2)',
                }}
              >
                <div
                  className="relative px-6 py-5 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.05))',
                  }}
                >
                  <div
                    className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{ animation: 'shimmer 5s infinite' }}
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {t('page.leaderboardTitle')}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('page.leaderboardDescription')}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      {t('page.leaderboardCount', { count: stats.activeCollaborators })}
                    </Badge>
                  </div>
                </div>
                <div className="p-6 dark:bg-slate-900/50">
                  <LeaderboardTable
                    userAddress={address}
                    refreshKey={refreshKey}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Propose Task Tab */}
            <TabsContent value="propose" className="mt-8">
              <div
                className="rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,253,244,0.95) 100%)',
                  borderColor: 'rgba(34, 197, 94, 0.2)',
                }}
              >
                <div
                  className="relative px-6 py-5 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))',
                  }}
                >
                  <div
                    className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{ animation: 'shimmer 5s infinite' }}
                  />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                      <PlusCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t('page.proposeTitle')}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('page.proposeDescription')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 dark:bg-slate-900/50">
                  <TaskProposal
                    userAddress={address}
                    onProposalSubmitted={() => {
                      success(t('toasts.proposalSubmitted'), t('toasts.proposalSubmittedDesc'))
                      handleRefresh()
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Premium Footer */}
        <footer
          className="mt-10 rounded-2xl overflow-hidden border shadow-xl backdrop-blur-xl"
          style={{
            animation: 'slide-up 0.6s ease-out 0.3s backwards',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.9) 100%)',
            borderColor: 'rgba(148, 163, 184, 0.2)',
          }}
        >
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"
                  style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
                />
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {t('page.systemOperational')}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))',
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-green-700 dark:text-green-300">
                    {stats.completedTasks} {t('page.completedLabel')}
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))',
                  }}
                >
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-amber-700 dark:text-amber-300">
                    {stats.totalRewards.toFixed(0)} {t('page.cgcDistributed')}
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.05))',
                  }}
                >
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                    {stats.activeCollaborators} {t('page.contributorsLabel')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
