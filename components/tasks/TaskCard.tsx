/**
 * 🎯 Task Card Component
 * 
 * Individual task display card with details and actions
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Coins, 
  Code, 
  MessageSquare, 
  FileText,
  TrendingUp,
  Calendar,
  Zap,
  Loader2,
  Timer,
  AlertTriangle
} from 'lucide-react'
import type { Task } from '@/lib/supabase/types'
import { TASK_CLAIM_CONFIG } from '@/lib/tasks/task-service'
import { TaskClaimModal } from './TaskClaimModal'

interface TaskCardProps {
  task: Task
  onClaim?: () => void
  onSubmit?: () => void
  onViewDetails?: () => void
  canClaim?: boolean
  showProgress?: boolean
  isClaimingTask?: boolean
  showClaimModal?: boolean
}

export function TaskCard({ 
  task, 
  onClaim, 
  onSubmit,
  onViewDetails,
  canClaim = true,
  showProgress = false,
  isClaimingTask = false,
  showClaimModal = true
}: TaskCardProps) {
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  // Get platform icon
  const getPlatformIcon = () => {
    switch (task.platform) {
      case 'github':
        return <Code className="w-4 h-4" />
      case 'discord':
        return <MessageSquare className="w-4 h-4" />
      case 'manual':
        return <FileText className="w-4 h-4" />
      default:
        return <Zap className="w-4 h-4" />
    }
  }

  // Get complexity color
  const getComplexityColor = () => {
    if (task.complexity <= 3) return 'bg-green-100 text-green-800'
    if (task.complexity <= 6) return 'bg-amber-100 text-amber-800'
    if (task.complexity <= 8) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  // Calculate progress if in progress (SSR-safe)
  const [progress, setProgress] = useState(0)
  const [remainingTime, setRemainingTime] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  
  useEffect(() => {
    const calculateProgress = () => {
      if (!showProgress || task.status !== 'in_progress') return 0
      
      const startTime = new Date(task.created_at).getTime()
      const now = Date.now()
      const totalTime = task.estimated_days * 24 * 60 * 60 * 1000
      const elapsed = now - startTime
      
      return Math.min(100, Math.round((elapsed / totalTime) * 100))
    }

    const updateCountdown = () => {
      if ((task.status === 'claimed' || task.status === 'in_progress') && task.claimed_at) {
        const remainingMs = TASK_CLAIM_CONFIG.getRemainingTimeMs(task.claimed_at, task.estimated_days)
        const formattedTime = TASK_CLAIM_CONFIG.formatRemainingTime(remainingMs)
        const expired = remainingMs <= 0
        
        setRemainingTime(formattedTime)
        setIsExpired(expired)
      }
    }

    setProgress(calculateProgress())
    updateCountdown()
    
    // Update both progress and countdown every minute
    let interval: NodeJS.Timeout | null = null
    if (task.status === 'in_progress' || task.status === 'claimed') {
      interval = setInterval(() => {
        setProgress(calculateProgress())
        updateCountdown()
      }, 60000) // Update every minute
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [task.status, task.created_at, task.estimated_days, task.claimed_at, showProgress])

  return (
    <Card className="glass-panel hover:shadow-lg transition-all duration-300 spring-in">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className={`${getComplexityColor()} border-0`}>
            Level {task.complexity}
          </Badge>
          <Badge variant="outline" className="glass-bubble">
            {getPlatformIcon()}
            <span className="ml-1 capitalize">{task.platform}</span>
          </Badge>
        </div>
        
        <h3 className="font-semibold text-lg text-glass line-clamp-2">
          {task.title}
        </h3>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-glass-secondary line-clamp-3">
          {task.description || 'No description available'}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-xs text-glass-secondary">Reward</p>
              <p className="font-semibold text-glass">{task.reward_cgc} CGC</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-glass-secondary">Duration</p>
              <p className="font-semibold text-glass">{task.estimated_days} days</p>
            </div>
          </div>
        </div>

        {/* Show assignee for claimed/in-progress tasks */}
        {(task.status === 'claimed' || task.status === 'in_progress') && task.assignee_address && (
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${task.status === 'claimed' ? 'bg-yellow-500' : 'bg-blue-500'} animate-pulse`} />
              <span className="text-xs text-glass-secondary">
                {task.status === 'claimed' ? 'Claimed by:' : 'Working on:'}
              </span>
            </div>
            <span className="text-xs font-mono text-glass">
              {task.assignee_address.slice(0, 6)}...{task.assignee_address.slice(-4)}
            </span>
          </div>
        )}

        {/* Countdown timer for claimed/in-progress tasks */}
        {(task.status === 'claimed' || task.status === 'in_progress') && task.claimed_at && (
          <div className={`flex items-center justify-between p-2 rounded-lg ${
            isExpired 
              ? 'bg-red-50 border border-red-200' 
              : remainingTime.includes('h') && !remainingTime.includes('d')
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center space-x-2">
              {isExpired ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <Timer className={`w-4 h-4 ${
                  remainingTime.includes('h') && !remainingTime.includes('d')
                    ? 'text-amber-500'
                    : 'text-green-500'
                }`} />
              )}
              <span className="text-xs text-glass-secondary">
                {isExpired ? 'Expired - Open to all' : 'Time remaining:'}
              </span>
            </div>
            <span className={`text-xs font-semibold ${
              isExpired 
                ? 'text-red-600' 
                : remainingTime.includes('h') && !remainingTime.includes('d')
                  ? 'text-amber-600'
                  : 'text-green-600'
            }`}>
              {remainingTime}
            </span>
          </div>
        )}

        {/* Progress bar for in-progress tasks */}
        {showProgress && task.status === 'in_progress' && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-glass-secondary">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Evidence URLs for in-progress tasks */}
        {task.evidence_url && (
          <div className="pt-2 border-t">
            <p className="text-xs text-glass-secondary mb-1">Evidence Submitted</p>
            <a 
              href={task.evidence_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              View Evidence
            </a>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col space-y-2">
        {task.status === 'available' && (
          <div className="flex w-full space-x-2">
            <Button
              onClick={onViewDetails}
              variant="outline"
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Details
            </Button>
            <Button
              onClick={showClaimModal ? () => setIsClaimModalOpen(true) : onClaim}
              disabled={!canClaim || isClaimingTask}
              className="flex-1"
              variant="default"
            >
              {isClaimingTask ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Claim Task
                </>
              )}
            </Button>
          </div>
        )}
        
        {task.status === 'in_progress' && !task.evidence_url && (
          <Button
            onClick={onSubmit}
            className="w-full"
            variant="default"
          >
            <Clock className="w-4 h-4 mr-2" />
            Submit Evidence
          </Button>
        )}
        
        {task.status === 'in_progress' && task.evidence_url && (
          <Badge variant="outline" className="w-full justify-center py-2 bg-amber-50">
            Pending Validation
          </Badge>
        )}
        
        {task.status === 'completed' && (
          <Badge variant="outline" className="w-full justify-center py-2 bg-green-50">
            ✅ Completed
          </Badge>
        )}
      </CardFooter>

      {/* Task Claim Confirmation Modal */}
      {showClaimModal && (
        <TaskClaimModal
          task={task}
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          onConfirmClaim={() => {
            setIsClaimModalOpen(false)
            onClaim?.()
          }}
          isClaimingTask={isClaimingTask}
        />
      )}
    </Card>
  )
}