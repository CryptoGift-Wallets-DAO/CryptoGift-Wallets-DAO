/**
 * 📋 Task Service
 * 
 * Business logic for task management
 */

import { supabase, supabaseAdmin, supabaseQuery, cachedQuery } from '@/lib/supabase/client'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { TypedSupabaseClient } from '@/lib/supabase/client-types'
import { getDAORedis, RedisKeys, RedisTTL } from '@/lib/redis-dao'
import { TaskStatus } from '@/lib/contracts/types'
import { getTaskRulesContract } from '@/lib/contracts/task-rules'
import type { Task, TaskInsert, TaskUpdate, Collaborator, TaskProposal } from '@/lib/supabase/types'
import { ethers } from 'ethers'

// Helper function to ensure supabase client is available with proper typing
function ensureSupabaseClient(): TypedSupabaseClient {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized. Please configure SUPABASE_DAO environment variables.')
  }
  return supabaseAdmin
}

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
      const client = ensureSupabaseClient()
      const { data, error } = await client
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
    const client = ensureSupabaseClient()
    return supabaseQuery(async () =>
      await client
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
    const client = ensureSupabaseClient()
    return supabaseQuery(async () =>
      await client
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
    const client = ensureSupabaseClient()
    const { data } = await client
      .from('tasks')
      .select('*')
      .eq('task_id', taskId)
      .single() as { data: Task | null; error: any }
    
    return data
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
      const client = ensureSupabaseClient()
      const { data, error } = await client.rpc('submit_task_evidence', {
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
   * Complete task and release payment - HYBRID MODEL
   * This is the ONLY place where blockchain interaction happens (for payment)
   */
  async completeTaskAndReleasepayment(
    taskId: string, 
    validatorAddress: string,
    validatorSignature?: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const client = ensureSupabaseClient()
      
      // 1. Get task from database with proper typing
      const { data: task, error: fetchError } = await client
        .from('tasks')
        .select('*')
        .eq('task_id', taskId)
        .single() as { data: Task | null; error: any }

      if (fetchError || !task) {
        return { success: false, error: fetchError?.message || 'Task not found' }
      }

      if (!task.assignee_address) {
        return { success: false, error: 'Task has no assignee' }
      }

      if (task.status === 'completed') {
        return { success: false, error: 'Task already completed' }
      }

      // 2. BLOCKCHAIN INTERACTION: Release payment from MilestoneEscrow
      const provider = new ethers.providers.JsonRpcProvider({
        url: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
        timeout: 15000
      }, {
        name: 'base',
        chainId: 8453,
        ensAddress: undefined
      })

      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_DAO_DEPLOYER!, provider)
      const ESCROW_ADDRESS = '0x8346CFcaECc90d678d862319449E5a742c03f109'
      
      // Simple ABI for MilestoneEscrow release function
      const ESCROW_ABI = [
        'function releaseMilestone(address recipient, uint256 amount, string memory milestoneId) external returns (bool)'
      ]
      
      const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, wallet)

      // Convert CGC amount to wei
      const amountWei = ethers.utils.parseEther(task.reward_cgc.toString())

      console.log(`💰 Releasing ${task.reward_cgc} CGC to ${task.assignee_address}`)

      // Execute payment transaction
      const tx = await escrowContract.releaseMilestone(
        task.assignee_address,
        amountWei,
        taskId
      )

      console.log(`📤 Transaction sent: ${tx.hash}`)
      const receipt = await tx.wait()

      if (receipt.status !== 1) {
        return { success: false, error: 'Payment transaction failed' }
      }

      // 3. Update database with completion and TX hash
      const updateData: TaskUpdate = {
        status: 'completed',
        completed_at: new Date().toISOString(),
        validation_hash: tx.hash,
        validators: [validatorAddress],
        metadata: {
          ...(task.metadata as Record<string, any> || {}),
          payment_tx: tx.hash,
          payment_amount_wei: amountWei.toString(),
          payment_block: receipt.blockNumber,
          gas_used: receipt.gasUsed.toString()
        }
      }
      
      const { error: updateError } = await client
        .from('tasks')
        .update(updateData)
        .eq('task_id', taskId)

      if (updateError) {
        console.error('Error updating task after payment:', updateError)
        // Payment was successful but DB update failed
        // TX hash is still valid proof of payment
      }

      console.log(`✅ Task ${taskId} completed and ${task.reward_cgc} CGC paid to ${task.assignee_address}`)
      console.log(`   TX Hash: ${tx.hash}`)

      return {
        success: true,
        txHash: tx.hash // This is the immutable proof of payment
      }

    } catch (error) {
      console.error('Error completing task and releasing payment:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to complete task and release payment' 
      }
    }
  }

  /**
   * Complete a task (after validation) - DEPRECATED: Use completeTaskAndReleasepayment
   */
  async completeTask(taskId: string, validatorAddress: string): Promise<void> {
    // Redirect to new hybrid model function
    const result = await this.completeTaskAndReleasepayment(taskId, validatorAddress)
    if (!result.success) {
      throw new Error(result.error || 'Failed to complete task')
    }
  }

  /**
   * Helper to update task status in database only (no blockchain)
   */
  async updateTaskStatus(taskId: string, status: 'available' | 'claimed' | 'in_progress' | 'submitted' | 'validated' | 'completed' | 'cancelled' | 'expired', validatorAddress?: string): Promise<void> {
    const client = ensureSupabaseClient()
    
    // First get the task to have its data
    const { data: task, error: fetchError } = await client
      .from('tasks')
      .select('*')
      .eq('task_id', taskId)
      .single() as { data: Task | null; error: any }
    
    if (fetchError || !task) {
      throw new Error(fetchError?.message || 'Task not found')
    }
    
    // Update task status
    const updateData: TaskUpdate = {
      status: status,
      updated_at: new Date().toISOString()
    }
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
      if (validatorAddress) {
        updateData.validators = [...(task.validators || []), validatorAddress]
      }
    }
    
    const { error: updateError } = await client
      .from('tasks')
      .update(updateData)
      .eq('task_id', taskId)
    
    if (updateError) {
      throw updateError
    }

    // Update collaborator stats only if task is completed and has assignee
    if (status === 'completed' && task.assignee_address) {
      const { data: collaborator } = await client
        .from('collaborators')
        .select('*')
        .eq('wallet_address', task.assignee_address)
        .single() as { data: Collaborator | null; error: any }

      if (collaborator) {
        const collabUpdate = {
          total_cgc_earned: collaborator.total_cgc_earned + task.reward_cgc,
          tasks_completed: collaborator.tasks_completed + 1,
          tasks_in_progress: Math.max(0, collaborator.tasks_in_progress - 1),
          last_activity: new Date().toISOString(),
        }
        
        const { error: collabError } = await client
          .from('collaborators')
          .update(collabUpdate)
          .eq('wallet_address', task.assignee_address)
        
        if (collabError) {
          console.error('Error updating collaborator stats:', collabError)
        }
      } else {
        // Create new collaborator
        const newCollaborator = {
          wallet_address: task.assignee_address,
          total_cgc_earned: task.reward_cgc,
          tasks_completed: 1,
          tasks_in_progress: 0,
        }
        
        const { error: insertError } = await client
          .from('collaborators')
          .insert(newCollaborator)
        
        if (insertError) {
          console.error('Error creating collaborator:', insertError)
        }
      }

      // Recalculate ranks
      await client.rpc('calculate_rank')
    }

    // Clear caches
    await this.redis.del(RedisKeys.cache('leaderboard'))
    await this.redis.del(RedisKeys.cache('tasks:available:all'))
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 100): Promise<Array<Database['public']['Views']['leaderboard_view']['Row']>> {
    return cachedQuery('leaderboard', async () => {
      const client = ensureSupabaseClient()
      const { data, error } = await client
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
    const client = ensureSupabaseClient()
    const { data } = await client
      .from('collaborators')
      .select('*')
      .eq('wallet_address', address)
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
    const client = ensureSupabaseClient()
    return supabaseQuery(async () =>
      await client
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
    const client = ensureSupabaseClient()
    return supabaseQuery(async () =>
      await client
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
      const client = ensureSupabaseClient()
      const { data: existingTasks } = await client
        .from('tasks')
        .select('id')
        .limit(1)

      if (existingTasks && existingTasks.length > 0) {
        console.log('Tasks already initialized')
        return
      }

      // Prepare tasks for insertion
      const tasksToInsert: TaskInsert[] = INITIAL_TASKS.map((task, index) => ({
        task_id: ethers.utils.id(`task_${index}_${Date.now()}`),
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
        const client = ensureSupabaseClient()
        await client.from('tasks').insert(chunk)
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
    try {
      const client = ensureSupabaseClient()
      
      // Get task from database
      const { data: task } = await client
        .from('tasks')
        .select('*')
        .eq('task_id', taskId)
        .single()

      if (!task) {
        throw new Error('Task not found')
      }

      // Initialize contract connection
      const contract = getTaskRulesContract()
      
      // Get on-chain task status
      const onChainStatus = await contract.getTaskStatus(taskId)
      const onChainAssignee = await contract.getTaskAssignee(taskId)
      
      // Sync database with on-chain state
      const updates: TaskUpdate = {}
      
      if (onChainStatus === TaskStatus.Claimed && !task.assignee_address && onChainAssignee) {
        updates.assignee_address = onChainAssignee
        updates.status = 'claimed'
        updates.claimed_at = new Date().toISOString()
      } else if (onChainStatus === TaskStatus.InProgress && task.status === 'claimed') {
        updates.status = 'in_progress'
      } else if (onChainStatus === TaskStatus.Completed && task.status !== 'completed') {
        updates.status = 'completed'
        updates.completed_at = new Date().toISOString()
      }
      
      if (Object.keys(updates).length > 0) {
        await client
          .from('tasks')
          .update(updates)
          .eq('task_id', taskId)
          
        console.log('Task synced with blockchain:', { taskId, updates })
      }

    } catch (error) {
      console.error('Error syncing task with blockchain:', error)
      throw error
    }
  }

  /**
   * Claim task - HYBRID MODEL (Offchain + EIP-712 signature)
   * No blockchain interaction during claim, only database update
   */
  async claimTask(taskId: string, claimantAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const client = ensureSupabaseClient()
      
      // 1. OFFCHAIN: Check if task exists and is available in database
      const { data: task } = await client
        .from('tasks')
        .select('*')
        .eq('task_id', taskId)
        .eq('status', 'available')
        .single() as { data: Task | null; error: any }

      if (!task) {
        return { success: false, error: 'Task not found or not available' }
      }

      // 2. OFFCHAIN: Validate claimant eligibility (can add custom rules here)
      if (!claimantAddress || !ethers.utils.isAddress(claimantAddress)) {
        return { success: false, error: 'Invalid claimant address' }
      }

      // 3. OFFCHAIN: Generate EIP-712 signature for future validation (no gas)
      const domain = {
        name: 'CryptoGift DAO Tasks',
        version: '1',
        chainId: 8453, // Base mainnet
        verifyingContract: '0x8346CFcaECc90d678d862319449E5a742c03f109' // MilestoneEscrow
      }

      const types = {
        TaskClaim: [
          { name: 'taskId', type: 'string' },
          { name: 'claimant', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'nonce', type: 'uint256' }
        ]
      }

      const value = {
        taskId: taskId,
        claimant: claimantAddress,
        timestamp: Math.floor(Date.now() / 1000),
        nonce: Date.now() // Simple nonce for uniqueness
      }

      // Store signature data for future validation (when payment is needed)
      const signatureData = {
        domain,
        types,
        value
      }

      // 4. OFFCHAIN: Update database with claim (no blockchain, no gas!)
      const claimUpdateData: TaskUpdate = {
        status: 'claimed',
        assignee_address: claimantAddress,
        claimed_at: new Date().toISOString(),
        metadata: {
          ...(task.metadata as Record<string, any> || {}),
          claim_signature: JSON.stringify(signatureData)
        }
      }
      
      const { error: updateError } = await client
        .from('tasks')
        .update(claimUpdateData)
        .eq('task_id', taskId)

      if (updateError) {
        console.error('Error updating task after claim:', updateError)
        return { success: false, error: 'Failed to update task status' }
      }

      // 5. Log the claim to history (optional)
      try {
        await client
          .from('task_history')
          .insert({
            task_id: taskId,
            action: 'claimed',
            actor_address: claimantAddress,
            metadata: { 
              claim_signature: JSON.stringify(signatureData),
              timestamp: new Date().toISOString()
            }
          } as Database['public']['Tables']['task_history']['Insert'])
      } catch (err) {
        console.warn('Failed to log task history:', err)
      }

      // 6. SUCCESS: Task claimed offchain, ready for work
      console.log(`✅ Task ${taskId} claimed by ${claimantAddress} (offchain)`)
      
      // Return success without TX hash (no blockchain interaction)
      return { 
        success: true, 
        error: undefined,
        // No txHash since we didn't touch blockchain
      }

    } catch (error) {
      console.error('Error claiming task:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Submit task evidence - HYBRID MODEL (offchain validation)
   */
  async submitTaskEvidence(
    taskId: string, 
    assigneeAddress: string, 
    evidenceUrl: string, 
    prUrl?: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const client = ensureSupabaseClient()
      
      // Verify task ownership
      const { data: task } = await client
        .from('tasks')
        .select('*')
        .eq('task_id', taskId)
        .eq('assignee_address', assigneeAddress)
        .in('status', ['claimed', 'in_progress'])
        .single() as { data: Task | null; error: any }

      if (!task) {
        return { success: false, error: 'Task not found or not assigned to you' }
      }

      // OFFCHAIN: Generate EIP-712 signature data for future validation (no gas)
      const submissionData = {
        taskId,
        assigneeAddress,
        evidenceUrl,
        prUrl,
        timestamp: Math.floor(Date.now() / 1000),
        nonce: Date.now()
      }

      // Update database with submission (no blockchain)
      const submissionUpdateData: TaskUpdate = {
        status: 'submitted',
        evidence_url: evidenceUrl,
        pr_url: prUrl,
        submitted_at: new Date().toISOString(),
        metadata: {
          ...(task.metadata as Record<string, any> || {}),
          submission_data: JSON.stringify(submissionData)
        }
      }
      
      const { error: updateError } = await client
        .from('tasks')
        .update(submissionUpdateData)
        .eq('task_id', taskId)

      if (updateError) {
        console.error('Error updating task after submission:', updateError)
        return { success: false, error: 'Failed to submit task evidence' }
      }

      // Log the submission
      try {
        await client
          .from('task_history')
          .insert({
            task_id: taskId,
            action: 'submitted',
            actor_address: assigneeAddress,
            metadata: { 
              evidenceUrl, 
              prUrl, 
              submission_data: JSON.stringify(submissionData)
            }
          } as Database['public']['Tables']['task_history']['Insert'])
      } catch (err) {
        console.warn('Failed to log submission history:', err)
      }

      console.log(`✅ Task ${taskId} evidence submitted by ${assigneeAddress} (offchain)`)
      
      // No txHash since we didn't touch blockchain
      return { success: true }

    } catch (error) {
      console.error('Error submitting task evidence:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Create task - HYBRID MODEL (database only, no blockchain)
   * @deprecated Use createTask() instead for hybrid model
   */
  async createTaskWithBlockchain(taskData: TaskInsert): Promise<{ success: boolean; txHash?: string; error?: string }> {
    // In hybrid model, we don't create tasks on blockchain
    // Just create in database
    return this.createTask(taskData)
  }

  /**
   * Create task in database only (HYBRID MODEL)
   */
  async createTask(taskData: TaskInsert): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const client = ensureSupabaseClient()
      
      // Create task in database
      const { data: createdTask, error: dbError } = await client
        .from('tasks')
        .insert(taskData)
        .select()
        .single()

      if (dbError || !createdTask) {
        return { success: false, error: dbError?.message || 'Failed to create task in database' }
      }

      // Log the creation
      try {
        await client
          .from('task_history')
          .insert({
            task_id: createdTask.task_id,
            action: 'created',
            actor_address: 'system',
            metadata: { 
              created_at: new Date().toISOString(),
              // No txHash in hybrid model
            }
          } as Database['public']['Tables']['task_history']['Insert'])
      } catch (err) {
        console.warn('Failed to log task creation:', err)
      }

      console.log(`✅ Task ${createdTask.task_id} created in database (offchain)`)

      // Return success without txHash (no blockchain interaction)
      return { success: true }

    } catch (error) {
      console.error('Error creating task with blockchain:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Update task with arbitrary data
   */
  async updateTask(taskId: string, updateData: TaskUpdate): Promise<boolean> {
    try {
      const client = ensureSupabaseClient()
      
      const { error } = await client
        .from('tasks')
        .update(updateData)
        .eq('task_id', taskId)
      
      if (error) {
        console.error('Error updating task:', error)
        return false
      }

      // Record in task history
      try {
        await client
          .from('task_history')
          .insert({
            task_id: taskId,
            action: 'updated' as any, // Temporary fix - action enum may not include 'updated'
            actor_address: updateData.validator_address || updateData.rejected_by || 'system',
            metadata: updateData
          } as Database['public']['Tables']['task_history']['Insert'])
      } catch (err) {
        console.warn('Failed to log task update history:', err)
      }

      return true
    } catch (error) {
      console.error('Error in updateTask:', error)
      return false
    }
  }

  /**
   * Get tasks by status
   */
  async getTasksByStatus(status: string): Promise<Task[]> {
    try {
      const client = ensureSupabaseClient()
      
      const { data, error } = await client
        .from('tasks')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching tasks by status:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getTasksByStatus:', error)
      return []
    }
  }
}