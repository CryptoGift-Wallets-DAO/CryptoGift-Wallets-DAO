/**
 * 🎯 Task Card Component
 * 
 * Individual task display card with details and actions
 */

'use client'

import React from 'react'
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
  Zap
} from 'lucide-react'
import type { Task } from '@/lib/supabase/types'

interface TaskCardProps {
  task: Task
  onClaim?: () => void
  onSubmit?: () => void
  canClaim?: boolean
  showProgress?: boolean
}

export function TaskCard({ 
  task, 
  onClaim, 
  onSubmit,
  canClaim = true,
  showProgress = false 
}: TaskCardProps) {
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

  // Calculate progress if in progress
  const calculateProgress = () => {
    if (!showProgress || task.status !== 'in_progress') return 0
    
    const startTime = new Date(task.created_at).getTime()
    const now = Date.now()
    const totalTime = task.estimated_days * 24 * 60 * 60 * 1000
    const elapsed = now - startTime
    
    return Math.min(100, Math.round((elapsed / totalTime) * 100))
  }

  const progress = calculateProgress()

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

      <CardFooter>
        {task.status === 'available' && (
          <Button
            onClick={onClaim}
            disabled={!canClaim}
            className="w-full"
            variant="default"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Claim Task
          </Button>
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
    </Card>
  )
}