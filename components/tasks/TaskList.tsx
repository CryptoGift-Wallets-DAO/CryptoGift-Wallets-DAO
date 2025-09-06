/**
 * 📋 Task List Component
 * 
 * Displays available tasks with filtering and claiming functionality
 */

'use client'

import React, { useState, useEffect } from 'react'
import { TaskCard } from './TaskCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Search, Filter, Loader2 } from 'lucide-react'
import type { Task } from '@/lib/supabase/types'

interface TaskListProps {
  userAddress?: string
  refreshKey?: number
  onTaskClaimed?: (taskId: string) => void
}

export function TaskList({ userAddress, refreshKey = 0, onTaskClaimed }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [complexityFilter, setComplexityFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'reward' | 'complexity' | 'days'>('reward')

  useEffect(() => {
    loadTasks()
  }, [refreshKey])

  useEffect(() => {
    filterAndSortTasks()
  }, [tasks, searchTerm, complexityFilter, platformFilter, sortBy])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/tasks?status=available${userAddress ? `&address=${userAddress}` : ''}`)
      const data = await response.json()
      
      if (data.success) {
        setTasks(data.data || [])
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortTasks = () => {
    let filtered = [...tasks]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Complexity filter
    if (complexityFilter !== 'all') {
      const complexity = parseInt(complexityFilter)
      filtered = filtered.filter(task => task.complexity === complexity)
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(task => task.platform === platformFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'reward':
          return b.reward_cgc - a.reward_cgc
        case 'complexity':
          return a.complexity - b.complexity
        case 'days':
          return a.estimated_days - b.estimated_days
        default:
          return 0
      }
    })

    setFilteredTasks(filtered)
  }

  const handleClaimTask = async (taskId: string) => {
    if (!userAddress) {
      alert('Please connect your wallet to claim tasks')
      return
    }

    try {
      const response = await fetch('/api/tasks/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, userAddress }),
      })

      const data = await response.json()
      
      if (data.success) {
        onTaskClaimed?.(taskId)
        loadTasks() // Reload to update list
      } else {
        alert(data.error || 'Failed to claim task')
      }
    } catch (error) {
      console.error('Error claiming task:', error)
      alert('Failed to claim task. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={complexityFilter} onValueChange={setComplexityFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Complexity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Complexities</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
              <SelectItem key={level} value={level.toString()}>
                Level {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="github">GitHub</SelectItem>
            <SelectItem value="discord">Discord</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reward">Highest Reward</SelectItem>
            <SelectItem value="complexity">Lowest Complexity</SelectItem>
            <SelectItem value="days">Shortest Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks found matching your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClaim={() => handleClaimTask(task.task_id)}
              canClaim={!!userAddress}
            />
          ))}
        </div>
      )}
    </div>
  )
}