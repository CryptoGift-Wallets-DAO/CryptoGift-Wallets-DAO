/**
 * 🎯 Tasks & Rewards Page
 *
 * Complete task management and rewards system
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
  TrendingUp,
  Users,
  Zap,
  Award,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Glassmorphism Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {t('title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {address && (
                <Badge variant="outline" className="glass-bubble px-4 py-2">
                  <Trophy className="w-4 h-4 mr-2" />
                  {t('page.rankLabel')} #{stats.userRank || '∞'}
                </Badge>
              )}
              <Badge variant="outline" className="glass-bubble px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                {balance} {tCommon('cgc')}
              </Badge>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="glass-button"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {tCommon('refresh')}
              </Button>
            </div>
          </div>
        </header>

        {/* Statistics Overview */}
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

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-8">
          <TabsList className="glass-panel p-1 grid w-full grid-cols-4">
            <TabsTrigger value="available" className="data-[state=active]:glass-bubble">
              <Target className="w-4 h-4 mr-2" />
              {t('tabs.available')}
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:glass-bubble">
              <Clock className="w-4 h-4 mr-2" />
              {t('tabs.inProgress')}
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:glass-bubble">
              <Trophy className="w-4 h-4 mr-2" />
              {t('tabs.leaderboard')}
            </TabsTrigger>
            <TabsTrigger value="propose" className="data-[state=active]:glass-bubble">
              <PlusCircle className="w-4 h-4 mr-2" />
              {t('tabs.propose')}
            </TabsTrigger>
          </TabsList>

          {/* Available Tasks Tab */}
          <TabsContent value="available" className="mt-6 space-y-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    {t('page.availableTasksTitle')}
                  </span>
                  <Badge variant="secondary" className="glass-bubble">
                    {t('page.availableTasksCount', { count: stats.availableTasks })}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {t('page.availableTasksDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskList
                  userAddress={address}
                  refreshKey={refreshKey}
                  onTaskClaimed={() => {
                    success(t('toasts.taskClaimed'), t('toasts.taskClaimedDesc'))
                    handleRefresh()
                  }}
                />
              </CardContent>
            </Card>

            {/* Admin: Initialize Tasks Button */}
            {stats.availableTasks === 0 && (
              <Card className="glass-panel border-amber-200 bg-amber-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-900">{t('page.noTasksAvailable')}</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        {t('page.noTasksMessage')}
                      </p>
                      <Button
                        onClick={handleInitializeTasks}
                        className="mt-3"
                        variant="default"
                      >
                        {t('page.initializeTasks')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* In Progress Tab */}
          <TabsContent value="progress" className="mt-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    {t('page.inProgressTitle')}
                  </span>
                  <Badge variant="secondary" className="glass-bubble">
                    {t('page.inProgressCount', { count: stats.tasksInProgress })}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {t('page.inProgressDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TasksInProgress
                  userAddress={address}
                  refreshKey={refreshKey}
                  onTaskSubmitted={() => {
                    success(t('toasts.evidenceSubmitted'), t('toasts.evidenceSubmittedDesc'))
                    handleRefresh()
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    {t('page.leaderboardTitle')}
                  </span>
                  <Badge variant="secondary" className="glass-bubble">
                    {t('page.leaderboardCount', { count: stats.activeCollaborators })}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {t('page.leaderboardDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardTable
                  userAddress={address}
                  refreshKey={refreshKey}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Propose Task Tab */}
          <TabsContent value="propose" className="mt-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  {t('page.proposeTitle')}
                </CardTitle>
                <CardDescription>
                  {t('page.proposeDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskProposal
                  userAddress={address}
                  onProposalSubmitted={() => {
                    success(t('toasts.proposalSubmitted'), t('toasts.proposalSubmittedDesc'))
                    handleRefresh()
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <footer className="glass-panel mt-8 p-6 spring-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-400 pulse-glow"></div>
              <span className="text-glass-secondary text-sm">
                {t('page.systemOperational')}
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-glass-secondary">
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                {stats.completedTasks} {t('page.completedLabel')}
              </span>
              <span className="flex items-center">
                <Award className="w-4 h-4 mr-1 text-amber-500" />
                {stats.totalRewards.toFixed(0)} {t('page.cgcDistributed')}
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-blue-500" />
                {stats.activeCollaborators} {t('page.contributorsLabel')}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}