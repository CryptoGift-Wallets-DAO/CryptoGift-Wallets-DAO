/**
 * 📋 Task Details Modal
 * 
 * Comprehensive modal showing detailed information about a specific task
 * Provides in-depth view before user claims the task
 */

'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  X, 
  Clock, 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Copy,
  MessageCircle,
  Github,
  FileText,
  Zap,
  Target,
  Users,
  Calendar,
  Star,
  Shield
} from 'lucide-react'
import type { Task } from '@/lib/supabase/types'

interface TaskDetailsModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onClaim: () => void
  canClaim: boolean
  isClaimingTask: boolean
}

export function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onClaim,
  canClaim,
  isClaimingTask
}: TaskDetailsModalProps) {
  
  // Calculate difficulty visualization
  const getDifficultyStars = (complexity: number) => {
    return Array.from({ length: 10 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < complexity ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
      />
    ))
  }

  // Get priority color and icon
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'critical': return { color: 'text-red-600 bg-red-50', icon: AlertTriangle, label: '🔴 Critical' }
      case 'high': return { color: 'text-orange-600 bg-orange-50', icon: TrendingUp, label: '🟠 High' }
      case 'medium': return { color: 'text-blue-600 bg-blue-50', icon: Clock, label: '🔵 Medium' }
      case 'low': return { color: 'text-green-600 bg-green-50', icon: CheckCircle2, label: '🟢 Low' }
      default: return { color: 'text-gray-600 bg-gray-50', icon: Clock, label: '⚪ Normal' }
    }
  }

  // Get platform icon
  const getPlatformIcon = () => {
    switch (task.platform) {
      case 'github': return <Github className="w-4 h-4" />
      case 'discord': return <MessageCircle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  // Copy task ID to clipboard
  const copyTaskId = async () => {
    try {
      await navigator.clipboard.writeText(task.task_id)
      // You could add a toast notification here
      console.log('Task ID copied to clipboard')
    } catch (error) {
      console.error('Failed to copy task ID:', error)
    }
  }

  const priorityInfo = getPriorityInfo(task.priority)
  const estimatedUsdValue = (task.reward_cgc * 0.85).toFixed(2) // Assuming 1 CGC ≈ $0.85

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                🎯 {task.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Level {task.complexity} Challenge • Task ID: {task.task_id.slice(0, 8)}...
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-6">
            
            {/* Overview Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                📊 Overview
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reward */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-amber-800">💰 Reward</span>
                    <Coins className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-amber-900">{task.reward_cgc} CGC</div>
                  <div className="text-xs text-amber-700">~${estimatedUsdValue} USD</div>
                </div>

                {/* Timeline */}
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">⏰ Timeline</span>
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{task.estimated_days}</div>
                  <div className="text-xs text-blue-700">days estimated</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Difficulty */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">🎯 Difficulty</span>
                    <Zap className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex items-center space-x-1 mb-1">
                    {getDifficultyStars(task.complexity)}
                  </div>
                  <div className="text-xs text-gray-600">Level {task.complexity}/10</div>
                </div>

                {/* Priority */}
                <div className={`p-4 rounded-lg border ${priorityInfo.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">🚨 Priority</span>
                    <priorityInfo.icon className="w-4 h-4" />
                  </div>
                  <div className="font-semibold">{priorityInfo.label}</div>
                </div>

                {/* Platform */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">🔧 Platform</span>
                    {getPlatformIcon()}
                  </div>
                  <div className="font-semibold capitalize">{task.platform}</div>
                  <div className="text-xs text-gray-600">{task.category}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                📝 Description
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {task.description || 'No detailed description provided yet.'}
                </p>
              </div>
            </div>

            <Separator />

            {/* Technical Requirements */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                🛠️ Technical Requirements
              </h3>
              
              {/* Required Skills */}
              {task.required_skills && task.required_skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {task.required_skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Success Criteria */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                ✅ Success Criteria
              </h3>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    Implement working solution according to requirements
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    Provide clear evidence of completion (screenshots, URLs, videos)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    Follow project coding standards and best practices
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    Pass admin validation review
                  </li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* Completion Process */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-600" />
                🏆 Completion Process
              </h3>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <ol className="space-y-3 text-sm text-indigo-800">
                  <li className="flex items-start">
                    <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                    <span><strong>Claim Task</strong> - Reserves the task exclusively for you</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                    <span><strong>Develop Solution</strong> - Work on your implementation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                    <span><strong>Submit Evidence</strong> - Upload proof of completion</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                    <span><strong>Admin Review</strong> - Wait for validation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">5</span>
                    <span><strong>Get Paid</strong> - Automatic CGC payment to your wallet</span>
                  </li>
                </ol>
              </div>
            </div>

          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            {canClaim && (
              <Button
                onClick={onClaim}
                disabled={isClaimingTask}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isClaimingTask ? (
                  <>
                    <div className="w-4 h-4 animate-spin mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    🚀 Claim This Task
                  </>
                )}
              </Button>
            )}
            
            <Button
              onClick={copyTaskId}
              variant="outline"
              className="flex-shrink-0"
            >
              <Copy className="w-4 h-4 mr-2" />
              📋 Copy Task ID
            </Button>
            
            <Button
              variant="outline"
              className="flex-shrink-0"
              onClick={() => {
                // This could open a Discord channel or help system
                console.log('Opening help for task:', task.task_id)
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              💬 Ask Questions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}