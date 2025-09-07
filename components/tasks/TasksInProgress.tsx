/**
 * ⏳ Tasks In Progress Component
 * 
 * Shows tasks currently being worked on
 */

'use client'

import React, { useState, useEffect } from 'react'
import { TaskCard } from './TaskCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Upload, ExternalLink } from 'lucide-react'
import type { Task } from '@/lib/supabase/types'
import { useTaskCompletion } from '@/lib/web3/hooks'
import { useAccount } from 'wagmi'

interface TasksInProgressProps {
  userAddress?: string
  refreshKey?: number
  onTaskSubmitted?: (taskId: string) => void
}

export function TasksInProgress({ 
  userAddress, 
  refreshKey = 0, 
  onTaskSubmitted 
}: TasksInProgressProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evidenceForm, setEvidenceForm] = useState({
    evidenceUrl: '',
    prUrl: '',
  })

  // Blockchain hooks
  const { address } = useAccount()
  const { submitCompletion, isPending: isSubmittingToBlockchain } = useTaskCompletion()

  useEffect(() => {
    loadTasks()
  }, [refreshKey])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tasks?status=in_progress')
      const data = await response.json()
      
      if (data.success) {
        setTasks(data.data || [])
      }
    } catch (error) {
      console.error('Error loading tasks in progress:', error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitEvidence = async () => {
    if (!selectedTask || !userAddress || !evidenceForm.evidenceUrl || !address) return

    try {
      setIsSubmitting(true)
      
      // Step 1: Submit evidence to database
      const response = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-wallet-address': userAddress
        },
        body: JSON.stringify({
          taskId: selectedTask.task_id,
          evidenceUrl: evidenceForm.evidenceUrl,
          prUrl: evidenceForm.prUrl || undefined,
          userAddress,
        }),
      })

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit evidence to database')
      }

      // Step 2: Submit completion to blockchain
      // Create a hash of the evidence URLs for proof
      const proofString = `${evidenceForm.evidenceUrl}${evidenceForm.prUrl || ''}`
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(proofString)
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const proofHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      await submitCompletion(selectedTask.task_id, proofHash)

      // Step 3: Update local state
      onTaskSubmitted?.(selectedTask.task_id)
      setSelectedTask(null)
      setEvidenceForm({ evidenceUrl: '', prUrl: '' })
      loadTasks()

      console.log('✅ Task completion submitted to blockchain and database')

    } catch (error: any) {
      console.error('Error submitting evidence:', error)
      
      let errorMessage = 'Failed to submit evidence. Please try again.'
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user.'
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const userTasks = tasks.filter(task => task.assignee_address === userAddress)
  const otherTasks = tasks.filter(task => task.assignee_address !== userAddress)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* User's Tasks */}
      {userAddress && userTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-glass mb-4">Your Tasks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                showProgress={true}
                onSubmit={() => setSelectedTask(task)}
                canClaim={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Tasks */}
      {otherTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-glass mb-4">
            Other Tasks In Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTasks.map((task) => (
              <div key={task.id} className="space-y-2">
                <TaskCard
                  task={task}
                  showProgress={true}
                  canClaim={false}
                />
                {task.assignee_address && (
                  <div className="text-xs text-glass-secondary px-4">
                    Assigned to: {task.assignee_address.slice(0, 8)}...{task.assignee_address.slice(-6)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No tasks message */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-glass-secondary">No tasks currently in progress</p>
        </div>
      )}

      {/* Submit Evidence Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Task Evidence</DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-1">{selectedTask.title}</h4>
                <p className="text-xs text-glass-secondary">
                  Provide evidence that you&apos;ve completed this task
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="evidenceUrl">Evidence URL *</Label>
                  <Input
                    id="evidenceUrl"
                    type="url"
                    placeholder="https://github.com/user/repo/pull/123"
                    value={evidenceForm.evidenceUrl}
                    onChange={(e) => setEvidenceForm(prev => ({ 
                      ...prev, 
                      evidenceUrl: e.target.value 
                    }))}
                  />
                  <p className="text-xs text-glass-secondary mt-1">
                    Link to your completed work (GitHub PR, demo URL, etc.)
                  </p>
                </div>

                <div>
                  <Label htmlFor="prUrl">Additional URL</Label>
                  <Input
                    id="prUrl"
                    type="url"
                    placeholder="https://demo.example.com"
                    value={evidenceForm.prUrl}
                    onChange={(e) => setEvidenceForm(prev => ({ 
                      ...prev, 
                      prUrl: e.target.value 
                    }))}
                  />
                  <p className="text-xs text-glass-secondary mt-1">
                    Optional: Demo link, documentation, or additional evidence
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTask(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitEvidence}
                  disabled={!evidenceForm.evidenceUrl || isSubmitting || isSubmittingToBlockchain}
                >
                  {(isSubmitting || isSubmittingToBlockchain) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {isSubmittingToBlockchain ? 'Confirming on blockchain...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit Evidence
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}