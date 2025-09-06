/**
 * 💡 Task Proposal Component
 * 
 * Form for proposing new tasks
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, PlusCircle, AlertCircle } from 'lucide-react'

interface TaskProposalProps {
  userAddress?: string
  onProposalSubmitted?: () => void
}

export function TaskProposal({ userAddress, onProposalSubmitted }: TaskProposalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    estimatedComplexity: '',
    estimatedDays: '',
    platformOrigin: 'manual',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userAddress) {
      alert('Please connect your wallet to propose tasks')
      return
    }

    if (!form.title || !form.description) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          proposed_by_address: userAddress,
          platform_origin: form.platformOrigin,
          estimated_complexity: form.estimatedComplexity ? parseInt(form.estimatedComplexity) : null,
          estimated_days: form.estimatedDays ? parseInt(form.estimatedDays) : null,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        onProposalSubmitted?.()
        setForm({
          title: '',
          description: '',
          estimatedComplexity: '',
          estimatedDays: '',
          platformOrigin: 'manual',
        })
      } else {
        alert(data.error || 'Failed to submit proposal')
      }
    } catch (error) {
      console.error('Error submitting proposal:', error)
      alert('Failed to submit proposal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Calculate estimated reward based on complexity and days
  const estimatedReward = (() => {
    const days = parseInt(form.estimatedDays) || 0
    return days * 50 // 50 CGC per day
  })()

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Task Proposal Guidelines</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Be specific about deliverables and success criteria</li>
                <li>• Estimate complexity on a scale of 1-10</li>
                <li>• Provide realistic time estimates</li>
                <li>• Include technical requirements if applicable</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposal Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Implement dark mode for dashboard"
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the task in detail, including requirements, deliverables, and acceptance criteria..."
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="complexity">Estimated Complexity</Label>
            <Select value={form.estimatedComplexity} onValueChange={(v) => updateForm('estimatedComplexity', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select complexity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Level 1 - Very Easy</SelectItem>
                <SelectItem value="2">Level 2 - Easy</SelectItem>
                <SelectItem value="3">Level 3 - Simple</SelectItem>
                <SelectItem value="4">Level 4 - Moderate</SelectItem>
                <SelectItem value="5">Level 5 - Medium</SelectItem>
                <SelectItem value="6">Level 6 - Challenging</SelectItem>
                <SelectItem value="7">Level 7 - Hard</SelectItem>
                <SelectItem value="8">Level 8 - Very Hard</SelectItem>
                <SelectItem value="9">Level 9 - Expert</SelectItem>
                <SelectItem value="10">Level 10 - Master</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estimatedDays">Estimated Days</Label>
            <Input
              id="estimatedDays"
              type="number"
              placeholder="e.g., 7"
              min="1"
              max="60"
              value={form.estimatedDays}
              onChange={(e) => updateForm('estimatedDays', e.target.value)}
            />
            {estimatedReward > 0 && (
              <p className="text-sm text-green-600 mt-1">
                Estimated reward: {estimatedReward} CGC
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="platform">Platform Origin</Label>
            <Select value={form.platformOrigin} onValueChange={(v) => updateForm('platformOrigin', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Where is this proposed from?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Entry</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="github">GitHub Issue</SelectItem>
                <SelectItem value="custom">Custom Platform</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setForm({
              title: '',
              description: '',
              estimatedComplexity: '',
              estimatedDays: '',
              platformOrigin: 'manual',
            })}
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            disabled={!form.title || !form.description || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 mr-2" />
                Submit Proposal
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}