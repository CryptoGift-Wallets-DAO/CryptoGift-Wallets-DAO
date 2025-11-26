/**
 * 🎯 Task Claim Confirmation Modal
 *
 * Shows task details and requires confirmation before claiming
 * 🌐 i18n: Full translation support for EN/ES
 */

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  Coins,
  Code,
  MessageSquare,
  FileText,
  Calendar,
  Zap,
  TrendingUp,
  AlertTriangle,
  Timer,
  Loader2
} from 'lucide-react'
import type { Task } from '@/lib/supabase/types'
import { TASK_CLAIM_CONFIG } from '@/lib/tasks/task-service'

interface TaskClaimModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onConfirmClaim: () => void
  isClaimingTask: boolean
}

export function TaskClaimModal({
  task,
  isOpen,
  onClose,
  onConfirmClaim,
  isClaimingTask
}: TaskClaimModalProps) {
  // 🌐 Translation hooks
  const t = useTranslations('tasks.claimModal')
  const tCommon = useTranslations('common')

  if (!task) return null

  // Get platform icon
  const getPlatformIcon = () => {
    switch (task.platform) {
      case 'github':
        return <Code className="w-5 h-5" />
      case 'discord':
        return <MessageSquare className="w-5 h-5" />
      case 'manual':
        return <FileText className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  // Get complexity color
  const getComplexityColor = () => {
    if (task.complexity <= 3) return 'bg-green-100 text-green-800 border-green-200'
    if (task.complexity <= 6) return 'bg-amber-100 text-amber-800 border-amber-200'
    if (task.complexity <= 8) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  // Calculate claim timeout info
  const timeoutHours = TASK_CLAIM_CONFIG.getClaimTimeoutHours(task.estimated_days)
  const timeoutDisplay = timeoutHours >= 24 
    ? `${Math.floor(timeoutHours / 24)}d ${Math.floor(timeoutHours % 24)}h`
    : `${timeoutHours}h`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-xl">
            {getPlatformIcon()}
            <span>{t('title')}</span>
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Title and Category */}
          <div>
            <h3 className="text-lg font-semibold text-glass mb-2">{task.title}</h3>
            <div className="flex items-center space-x-2 mb-3">
              <Badge className={`border ${getComplexityColor()}`}>
                {t('complexityLabel')} {task.complexity}/10
              </Badge>
              {task.category && (
                <Badge variant="outline" className="capitalize">
                  {task.category}
                </Badge>
              )}
              {task.priority && (
                <Badge 
                  variant={task.priority === 'critical' || task.priority === 'high' ? 'destructive' : 'secondary'}
                  className="capitalize"
                >
                  {task.priority}
                </Badge>
              )}
            </div>
          </div>

          {/* Task Description */}
          {task.description && (
            <div>
              <h4 className="text-sm font-semibold text-glass-secondary mb-2">{t('descriptionLabel')}</h4>
              <p className="text-sm text-glass leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Task Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg">
              <Coins className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-glass-secondary">{t('rewardLabel')}</p>
                <p className="font-semibold text-glass">{task.reward_cgc} CGC</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-glass-secondary">{t('estimatedLabel')}</p>
                <p className="font-semibold text-glass">{task.estimated_days} {tCommon('days')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
              <Timer className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-xs text-glass-secondary">{t('claimTimeLabel')}</p>
                <p className="font-semibold text-glass">{timeoutDisplay}</p>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          {task.required_skills && task.required_skills.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-glass-secondary mb-2">{t('requiredSkills')}</h4>
              <div className="flex flex-wrap gap-2">
                {task.required_skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-glass-secondary mb-2">{t('tags')}</h4>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-amber-800">{t('importantNotice')}</h4>
                <div className="text-xs text-amber-700 space-y-1">
                  <p>• {t('exclusiveAccessNotice', { time: timeoutDisplay })}</p>
                  <p>• {t('afterTimeoutNotice')}</p>
                  <p>• {t('canStillCompleteNotice')}</p>
                  <p>• {t('submitBeforeOthersNotice')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isClaimingTask}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={onConfirmClaim}
            disabled={isClaimingTask}
            className="min-w-[120px]"
          >
            {isClaimingTask ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('claiming')}
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                {t('claimTask')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}