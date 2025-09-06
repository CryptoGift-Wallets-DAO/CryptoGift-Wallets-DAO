/**
 * 📋 Task Service
 * 
 * Business logic for task management
 */

import { supabase, supabaseQuery, cachedQuery } from '@/lib/supabase/client'
import { getDAORedis, RedisKeys, RedisTTL } from '@/lib/redis-dao'
import type { Task, TaskInsert, TaskUpdate, Collaborator, TaskProposal } from '@/lib/supabase/types'
import { keccak256, toUtf8Bytes } from 'ethers'

// Task complexity to reward mapping (days * 50 CGC)
export const TASK_REWARDS = {
  calculateReward: (days: number): number => {
    return days * 50 // 50 CGC per day
  },
  
  getComplexityDays: (complexity: number): number => {
    // Map complexity 1-10 to estimated days
    const complexityMap: Record<number, number> = {
      1: 1,   // 1 day = 50 CGC
      2: 2,   // 2 days = 100 CGC
      3: 3,   // 3 days = 150 CGC
      4: 5,   // 5 days = 250 CGC
      5: 7,   // 7 days = 350 CGC
      6: 10,  // 10 days = 500 CGC
      7: 14,  // 14 days = 700 CGC
      8: 21,  // 21 days = 1050 CGC
      9: 30,  // 30 days = 1500 CGC
      10: 45, // 45 days = 2250 CGC
    }
    return complexityMap[complexity] || 7
  }
}

// Initial task list
export const INITIAL_TASKS = [
  // Complexity 10
  {
    title: "RC-1155 Tokenbone Protocol & Reference",
    description: "Complete protocol specification with registry (6551 style for 1155), accounts/proxies, ERC-1271/165 compatibility, events, tests and examples",
    complexity: 10,
    estimated_days: 42, // 6 weeks average
    reward_cgc: 2100,
    platform: 'github' as const,
  },
  {
    title: "Academic Integration LTI 1.3 + xAPI + EAS",
    description: "SSO, grade passback, deep links, xAPI connector to LRS and EAS attestation emission synchronized with progress",
    complexity: 10,
    estimated_days: 35, // 5 weeks average
    reward_cgc: 1750,
    platform: 'github' as const,
  },
  // Complexity 9
  {
    title: "Wireless Connect + Swap 2.0",
    description: "Smart routing with 0x + Uniswap v3 + Permit2, fallbacks, fault tolerance, slippage limits, permit2 (approve-less), execution metrics",
    complexity: 9,
    estimated_days: 28, // 4 weeks average
    reward_cgc: 1400,
    platform: 'github' as const,
  },
  {
    title: "Multi-chain Indexer for 1155/6551",
    description: "Backfill with safe windows, WS live tail, reorg handling, idempotency by tx+logIndex, queues and retries",
    complexity: 9,
    estimated_days: 25,
    reward_cgc: 1250,
    platform: 'github' as const,
  },
  {
    title: "Anti-fraud/Anti-sybil Referral System",
    description: "EIP-712 rules, cooldowns, eligibility signals (attestations, account age), loop and multi-account detection",
    complexity: 9,
    estimated_days: 21,
    reward_cgc: 1050,
    platform: 'github' as const,
  },
  // Complexity 8
  {
    title: "Professional Referral Panel",
    description: "End-to-end attribution funnels click→claim→retention, cohorts, export, payout calculation and tier simulator",
    complexity: 8,
    estimated_days: 21,
    reward_cgc: 1050,
    platform: 'github' as const,
  },
  {
    title: "Creator Studio for Academy",
    description: "MDX/blocks editor with preview, versioning, shadow publish, multimedia library, rubrics and templates",
    complexity: 8,
    estimated_days: 21,
    reward_cgc: 1050,
    platform: 'github' as const,
  },
  {
    title: "Tokenbone + Account Abstraction (4337)",
    description: "validateUserOp, low-permission session keys, sponsor caps and policy module per account",
    complexity: 8,
    estimated_days: 21,
    reward_cgc: 1050,
    platform: 'github' as const,
  },
  // Complexity 7
  {
    title: "Wrapper 1155→721 per unit",
    description: "Escrow/wrap 1155 units to 721 to enable standard TBA when required (promote to NFT mode)",
    complexity: 7,
    estimated_days: 14,
    reward_cgc: 700,
    platform: 'github' as const,
  },
  {
    title: "Advanced Swap Observability",
    description: "Price impact, quote vs execution, failure tracking by source, alarms (timeouts, 429, bps deviation)",
    complexity: 7,
    estimated_days: 12,
    reward_cgc: 600,
    platform: 'github' as const,
  },
  {
    title: "Content Marketplace with Revenue Share",
    description: "Publishing, review, listing, commissions and attribution to content creators who bring students",
    complexity: 7,
    estimated_days: 14,
    reward_cgc: 700,
    platform: 'github' as const,
  },
  // Complexity 6
  {
    title: "Circuit-breakers & Safe Mode",
    description: "Granular pauses for mint/claim/swap, degradation to read-only and gas-paid only under events",
    complexity: 6,
    estimated_days: 7,
    reward_cgc: 350,
    platform: 'github' as const,
  },
  {
    title: "Transactional Notifications & Banners",
    description: "Context per operation, retries and recovery links with persistent banners",
    complexity: 6,
    estimated_days: 7,
    reward_cgc: 350,
    platform: 'github' as const,
  },
  {
    title: "Universal/Deep Links Mobile",
    description: "iOS/Android immediate wallet opening and app return; QR fallback",
    complexity: 6,
    estimated_days: 8,
    reward_cgc: 400,
    platform: 'github' as const,
  },
  {
    title: "EIP-712 Signature Audit",
    description: "Telemetry by device/wallet, rejection/error analysis, UX nudges",
    complexity: 6,
    estimated_days: 7,
    reward_cgc: 350,
    platform: 'github' as const,
  },
  // Complexity 5
  {
    title: "EAS Schema Catalog",
    description: "Schemas for Courses, Modules, Certificates, Rules with versioning and revocability",
    complexity: 5,
    estimated_days: 5,
    reward_cgc: 250,
    platform: 'github' as const,
  },
  {
    title: "Swap Fee Management",
    description: "Transparent calculation, caps per route and opt-out by jurisdiction",
    complexity: 5,
    estimated_days: 5,
    reward_cgc: 250,
    platform: 'github' as const,
  },
  {
    title: "Quick-switch Multi-chain",
    description: "Assisted network change and pre-signing validations with reminders",
    complexity: 5,
    estimated_days: 4,
    reward_cgc: 200,
    platform: 'github' as const,
  },
  {
    title: "Gateway Health-checks",
    description: "IPFS/0x latency/success monitoring, fallbacks and auto-throttle",
    complexity: 5,
    estimated_days: 4,
    reward_cgc: 200,
    platform: 'github' as const,
  },
  // Complexity 4
  {
    title: "Gift Bundle Templates",
    description: "Pre-built baskets, art/theme and post-claim upsell for themed campaigns",
    complexity: 4,
    estimated_days: 4,
    reward_cgc: 200,
    platform: 'manual' as const,
  },
  {
    title: "SCORM→xAPI Export/Import",
    description: "Basic conversion and attempt validation for courses",
    complexity: 4,
    estimated_days: 4,
    reward_cgc: 200,
    platform: 'github' as const,
  },
  {
    title: "Education Metrics Dashboard",
    description: "Engagement, time in lesson, completion funnels and basic analytics",
    complexity: 4,
    estimated_days: 4,
    reward_cgc: 200,
    platform: 'github' as const,
  },
  {
    title: "Runbooks Documentation",
    description: "Incident playbooks, checklists and internal SLA/SLO documentation",
    complexity: 4,
    estimated_days: 3,
    reward_cgc: 150,
    platform: 'manual' as const,
  },
  // Complexity 3
  {
    title: "Guided Onboarding with Tooltips",
    description: "Role-based tasks, visual state and next step guidance",
    complexity: 3,
    estimated_days: 3,
    reward_cgc: 150,
    platform: 'github' as const,
  },
  {
    title: "Key Rotation Policy",
    description: "Scheduled rotations, scoping and smoke tests for validators",
    complexity: 3,
    estimated_days: 3,
    reward_cgc: 150,
    platform: 'manual' as const,
  },
  {
    title: "NFT Metadata Integrity Validation",
    description: "Hash verification at claim, alerts for inconsistencies",
    complexity: 3,
    estimated_days: 2,
    reward_cgc: 100,
    platform: 'github' as const,
  },
  {
    title: "Accessibility Audit",
    description: "Contrast/keyboard/aria for key views with internal accessibility certification",
    complexity: 3,
    estimated_days: 3,
    reward_cgc: 150,
    platform: 'manual' as const,
  },
  // Complexity 2
  {
    title: "System Status Dashboard",
    description: "Basic health panel with ping, queues, indices and latencies",
    complexity: 2,
    estimated_days: 2,
    reward_cgc: 100,
    platform: 'github' as const,
  },
  {
    title: "Content Backup & Rollbacks",
    description: "Snapshots + 1-click restoration system",
    complexity: 2,
    estimated_days: 2,
    reward_cgc: 100,
    platform: 'github' as const,
  },
  {
    title: "Error Messages & UX Nudges",
    description: "Clear messages per case and recovery guidance (ES/EN)",
    complexity: 2,
    estimated_days: 2,
    reward_cgc: 100,
    platform: 'manual' as const,
  },
  // Complexity 1
  {
    title: "Module Feature Flags",
    description: "Runtime on/off switches for Tokenbone, Swap, Referrals, Creator, Academy",
    complexity: 1,
    estimated_days: 1,
    reward_cgc: 50,
    platform: 'github' as const,
  },
  {
    title: "Console/Logs Cleanup",
    description: "Remove noise; strict lint-staged in CI",
    complexity: 1,
    estimated_days: 1,
    reward_cgc: 50,
    platform: 'github' as const,
  },
  {
    title: "Release Verification Checklist",
    description: "Go/No-Go per module with smoke tests",
    complexity: 1,
    estimated_days: 1,
    reward_cgc: 50,
    platform: 'manual' as const,
  },
]

export class TaskService {
  private redis = getDAORedis()

  /**
   * Get all available tasks
   */
  async getAvailableTasks(userAddress?: string): Promise<Task[]> {
    const cacheKey = `tasks:available:${userAddress || 'all'}`
    
    return cachedQuery(cacheKey, async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'available')
        .order('reward_cgc', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    }, 30) // Cache for 30 seconds
  }

  /**
   * Get tasks in progress
   */
  async getTasksInProgress(): Promise<Task[]> {
    return supabaseQuery(() =>
      supabase
        .from('tasks')
        .select('*')
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
    )
  }

  /**
   * Get completed tasks
   */
  async getCompletedTasks(limit = 50): Promise<Task[]> {
    return supabaseQuery(() =>
      supabase
        .from('tasks')
        .select('*')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(limit)
    )
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<Task | null> {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('task_id', taskId)
      .single()
    
    return data
  }

  /**
   * Claim a task
   */
  async claimTask(taskId: string, userAddress: string): Promise<boolean> {
    try {
      // Check if user already has a task in progress
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('assignee_address', userAddress)
        .eq('status', 'in_progress')

      if (existingTasks && existingTasks.length >= 3) {
        throw new Error('You can only have 3 tasks in progress at a time')
      }

      // Claim the task using stored procedure
      const { data, error } = await supabase.rpc('claim_task', {
        p_task_id: taskId,
        p_user_address: userAddress,
      })

      if (error) throw error

      // Clear cache
      await this.redis.del(RedisKeys.cache('tasks:available:all'))
      await this.redis.del(RedisKeys.cache(`tasks:available:${userAddress}`))

      // Log to Redis for real-time updates
      await this.redis.zadd(
        RedisKeys.userQuests(userAddress),
        Date.now(),
        taskId
      )

      return data === true
    } catch (error) {
      console.error('Error claiming task:', error)
      throw error
    }
  }

  /**
   * Submit task evidence
   */
  async submitEvidence(
    taskId: string,
    evidenceUrl: string,
    prUrl?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('submit_task_evidence', {
        p_task_id: taskId,
        p_evidence_url: evidenceUrl,
        p_pr_url: prUrl,
      })

      if (error) throw error

      // Store in Redis for validation queue
      await this.redis.hset(
        RedisKeys.questCompletion(taskId, 'pending'),
        'evidence',
        evidenceUrl
      )
      await this.redis.expire(
        RedisKeys.questCompletion(taskId, 'pending'),
        RedisTTL.webhook
      )

      return data === true
    } catch (error) {
      console.error('Error submitting evidence:', error)
      throw error
    }
  }

  /**
   * Complete a task (after validation)
   */
  async completeTask(taskId: string, validatorAddress: string): Promise<void> {
    const task = await this.getTaskById(taskId)
    if (!task) throw new Error('Task not found')

    // Update task status
    await supabaseQuery(() =>
      supabase
        .from('tasks')
        .update({
          status: 'completed' as const,
          completed_at: new Date().toISOString(),
          validators: [...(task.validators || []), validatorAddress],
        })
        .eq('task_id', taskId)
    )

    // Update collaborator stats
    if (task.assignee_address) {
      const { data: collaborator } = await supabase
        .from('collaborators')
        .select('*')
        .eq('address', task.assignee_address)
        .single()

      if (collaborator) {
        await supabase
          .from('collaborators')
          .update({
            total_cgc_earned: collaborator.total_cgc_earned + task.reward_cgc,
            tasks_completed: collaborator.tasks_completed + 1,
            tasks_in_progress: Math.max(0, collaborator.tasks_in_progress - 1),
            last_activity: new Date().toISOString(),
          })
          .eq('address', task.assignee_address)
      } else {
        // Create new collaborator
        await supabase.from('collaborators').insert({
          address: task.assignee_address,
          total_cgc_earned: task.reward_cgc,
          tasks_completed: 1,
          tasks_in_progress: 0,
        })
      }

      // Recalculate ranks
      await supabase.rpc('calculate_rank')
    }

    // Clear caches
    await this.redis.del(RedisKeys.cache('leaderboard'))
    await this.redis.del(RedisKeys.cache('tasks:available:all'))
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 100): Promise<Collaborator[]> {
    return cachedQuery('leaderboard', async () => {
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('*')
        .limit(limit)

      if (error) throw error
      return data || []
    }, 60) // Cache for 1 minute
  }

  /**
   * Get collaborator by address
   */
  async getCollaborator(address: string): Promise<Collaborator | null> {
    const { data } = await supabase
      .from('collaborators')
      .select('*')
      .eq('address', address)
      .single()
    
    return data
  }

  /**
   * Create task proposal
   */
  async createProposal(proposal: {
    title: string
    description: string
    proposed_by_address?: string
    proposed_by_discord?: string
    platform_origin: string
    estimated_complexity?: number
    estimated_days?: number
  }): Promise<TaskProposal> {
    return supabaseQuery(() =>
      supabase
        .from('task_proposals')
        .insert(proposal)
        .select()
        .single()
    )
  }

  /**
   * Get pending proposals
   */
  async getPendingProposals(): Promise<TaskProposal[]> {
    return supabaseQuery(() =>
      supabase
        .from('task_proposals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
    )
  }

  /**
   * Initialize database with initial tasks
   */
  async initializeTasks(): Promise<void> {
    try {
      // Check if tasks already exist
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('id')
        .limit(1)

      if (existingTasks && existingTasks.length > 0) {
        console.log('Tasks already initialized')
        return
      }

      // Prepare tasks for insertion
      const tasksToInsert: TaskInsert[] = INITIAL_TASKS.map((task, index) => ({
        task_id: keccak256(toUtf8Bytes(`task_${index}_${Date.now()}`)),
        title: task.title,
        description: task.description,
        complexity: task.complexity,
        reward_cgc: task.reward_cgc,
        estimated_days: task.estimated_days,
        platform: task.platform,
        status: 'available',
      }))

      // Insert in batches
      const chunkSize = 10
      for (let i = 0; i < tasksToInsert.length; i += chunkSize) {
        const chunk = tasksToInsert.slice(i, i + chunkSize)
        await supabase.from('tasks').insert(chunk)
      }

      console.log(`Initialized ${tasksToInsert.length} tasks`)
    } catch (error) {
      console.error('Error initializing tasks:', error)
      throw error
    }
  }

  /**
   * Sync task with blockchain
   */
  async syncWithBlockchain(taskId: string): Promise<void> {
    // This will be implemented to sync with TaskRulesEIP712 contract
    // For now, it's a placeholder
    console.log('Syncing task with blockchain:', taskId)
  }
}