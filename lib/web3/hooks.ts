/**
 * Web3 React Hooks for CryptoGift DAO
 * Custom hooks to interact with smart contracts using Wagmi v2
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { contracts, targetChainId } from './config'
import { 
  CGC_TOKEN_ABI, 
  MILESTONE_ESCROW_ABI, 
  MASTER_CONTROLLER_ABI,
  TASK_RULES_ABI,
  ARAGON_DAO_ABI 
} from './abis'

// ===== CGC Token Hooks =====

/**
 * Get total supply of CGC tokens
 */
export function useCGCTotalSupply() {
  const { data, isError, isLoading } = useReadContract({
    address: contracts.cgcToken,
    abi: CGC_TOKEN_ABI,
    functionName: 'totalSupply',
    chainId: targetChainId,
  })

  return {
    totalSupply: data ? formatUnits(data as bigint, 18) : '0',
    totalSupplyRaw: data as bigint | undefined,
    isLoading,
    isError,
  }
}

/**
 * Get CGC token balance for an address
 */
export function useCGCBalance(address?: `0x${string}`) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: contracts.cgcToken,
    abi: CGC_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: targetChainId,
  })

  return {
    balance: data ? formatUnits(data as bigint, 18) : '0',
    balanceRaw: data as bigint | undefined,
    isLoading,
    isError,
    refetch,
  }
}

/**
 * Get total number of CGC token holders
 */
export function useCGCHolders() {
  const { data, isError, isLoading } = useReadContract({
    address: contracts.cgcToken,
    abi: CGC_TOKEN_ABI,
    functionName: 'totalHolders',
    chainId: targetChainId,
  })

  return {
    holders: data ? Number(data) : 0,
    isLoading,
    isError,
  }
}

/**
 * Get token owner address
 */
export function useCGCOwner() {
  const { data, isError, isLoading } = useReadContract({
    address: contracts.cgcToken,
    abi: CGC_TOKEN_ABI,
    functionName: 'owner',
    chainId: targetChainId,
  })

  return {
    owner: data as `0x${string}` | undefined,
    isLoading,
    isError,
  }
}

// ===== MilestoneEscrow Hooks =====

/**
 * Get total funds held in escrow
 */
export function useEscrowBalance() {
  const { data, isError, isLoading } = useReadContract({
    address: contracts.milestoneEscrow,
    abi: MILESTONE_ESCROW_ABI,
    functionName: 'totalFundsHeld',
    chainId: targetChainId,
  })

  return {
    escrowBalance: data ? formatUnits(data as bigint, 18) : '0',
    escrowBalanceRaw: data as bigint | undefined,
    isLoading,
    isError,
  }
}

/**
 * Get total milestones released
 */
export function useMilestonesReleased() {
  const { data, isError, isLoading } = useReadContract({
    address: contracts.milestoneEscrow,
    abi: MILESTONE_ESCROW_ABI,
    functionName: 'totalMilestonesReleased',
    chainId: targetChainId,
  })

  return {
    milestonesReleased: data ? Number(data) : 0,
    isLoading,
    isError,
  }
}

/**
 * Get collaborator earnings
 */
export function useCollaboratorEarnings(address?: `0x${string}`) {
  const { data, isError, isLoading } = useReadContract({
    address: contracts.milestoneEscrow,
    abi: MILESTONE_ESCROW_ABI,
    functionName: 'getCollaboratorEarnings',
    args: address ? [address] : undefined,
    chainId: targetChainId,
  })

  return {
    earnings: data ? formatUnits(data as bigint, 18) : '0',
    earningsRaw: data as bigint | undefined,
    isLoading,
    isError,
  }
}

// ===== Master Controller Hooks =====

/**
 * Get system status and limits
 */
export function useSystemStatus() {
  const { data: isActive, isLoading: isLoadingActive } = useReadContract({
    address: contracts.masterController,
    abi: MASTER_CONTROLLER_ABI,
    functionName: 'isActive',
    chainId: targetChainId,
  })

  const { data: dailyLimit } = useReadContract({
    address: contracts.masterController,
    abi: MASTER_CONTROLLER_ABI,
    functionName: 'getDailyLimit',
    chainId: targetChainId,
  })

  const { data: weeklyLimit } = useReadContract({
    address: contracts.masterController,
    abi: MASTER_CONTROLLER_ABI,
    functionName: 'getWeeklyLimit',
    chainId: targetChainId,
  })

  const { data: monthlyLimit } = useReadContract({
    address: contracts.masterController,
    abi: MASTER_CONTROLLER_ABI,
    functionName: 'getMonthlyLimit',
    chainId: targetChainId,
  })

  const { data: dailyUsage } = useReadContract({
    address: contracts.masterController,
    abi: MASTER_CONTROLLER_ABI,
    functionName: 'getCurrentDailyUsage',
    chainId: targetChainId,
  })

  const { data: weeklyUsage } = useReadContract({
    address: contracts.masterController,
    abi: MASTER_CONTROLLER_ABI,
    functionName: 'getCurrentWeeklyUsage',
    chainId: targetChainId,
  })

  const { data: monthlyUsage } = useReadContract({
    address: contracts.masterController,
    abi: MASTER_CONTROLLER_ABI,
    functionName: 'getCurrentMonthlyUsage',
    chainId: targetChainId,
  })

  return {
    isActive: isActive as boolean | undefined,
    limits: {
      daily: dailyLimit ? formatUnits(dailyLimit as bigint, 18) : '0',
      weekly: weeklyLimit ? formatUnits(weeklyLimit as bigint, 18) : '0',
      monthly: monthlyLimit ? formatUnits(monthlyLimit as bigint, 18) : '0',
    },
    usage: {
      daily: dailyUsage ? formatUnits(dailyUsage as bigint, 18) : '0',
      weekly: weeklyUsage ? formatUnits(weeklyUsage as bigint, 18) : '0',
      monthly: monthlyUsage ? formatUnits(monthlyUsage as bigint, 18) : '0',
    },
    isLoading: isLoadingActive,
  }
}

// ===== Task Rules Hooks =====

/**
 * Get task statistics
 */
export function useTaskStats() {
  const { data: createdCount } = useReadContract({
    address: contracts.taskRules,
    abi: TASK_RULES_ABI,
    functionName: 'totalTasksCreated',
    chainId: targetChainId,
  })

  const { data: completedCount } = useReadContract({
    address: contracts.taskRules,
    abi: TASK_RULES_ABI,
    functionName: 'totalTasksCompleted',
    chainId: targetChainId,
  })

  return {
    activeTasks: createdCount && completedCount ? Number(createdCount) - Number(completedCount) : 0,
    completedTasks: completedCount ? Number(completedCount) : 0,
    totalTasks: createdCount ? Number(createdCount) : 0,
  }
}

// ===== Aragon DAO Hooks =====

/**
 * Get proposal count from Aragon DAO
 */
export function useAragonProposals() {
  const { data, isError, isLoading } = useReadContract({
    address: contracts.aragonDao,
    abi: ARAGON_DAO_ABI,
    functionName: 'proposalCount',
    chainId: targetChainId,
  })

  return {
    proposalCount: data ? Number(data) : 0,
    isLoading,
    isError,
  }
}

// ===== Write Hooks (Transactions) =====

/**
 * Transfer CGC tokens
 */
export function useCGCTransfer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const transfer = async (to: `0x${string}`, amount: string) => {
    const amountWei = parseUnits(amount, 18)
    return writeContract({
      address: contracts.cgcToken,
      abi: CGC_TOKEN_ABI,
      functionName: 'transfer',
      args: [to, amountWei],
      chainId: targetChainId,
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    transfer,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

/**
 * Release milestone payment
 */
export function useMilestoneRelease() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const releaseMilestone = async (
    recipient: `0x${string}`, 
    amount: string, 
    milestoneId: string
  ) => {
    const amountWei = parseUnits(amount, 18)
    return writeContract({
      address: contracts.milestoneEscrow,
      abi: MILESTONE_ESCROW_ABI,
      functionName: 'releaseMilestonePayment',
      args: [recipient, amountWei, milestoneId],
      chainId: targetChainId,
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    releaseMilestone,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

/**
 * Create task on blockchain
 */
export function useTaskCreate() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const createTask = async (
    taskId: string,
    platform: string,
    assignee: `0x${string}`,
    complexity: number,
    customReward: string,
    deadline: number,
    verificationHash: string
  ) => {
    const taskIdBytes32 = `0x${taskId.padStart(64, '0')}` as `0x${string}`
    const verificationBytes32 = `0x${verificationHash.padStart(64, '0')}` as `0x${string}`
    const customRewardWei = parseUnits(customReward, 18)
    
    return writeContract({
      address: contracts.taskRules,
      abi: TASK_RULES_ABI,
      functionName: 'createTask',
      args: [
        taskIdBytes32,
        platform,
        assignee,
        complexity,
        customRewardWei,
        BigInt(deadline),
        verificationBytes32
      ],
      chainId: targetChainId,
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    createTask,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

/**
 * Submit task completion
 */
export function useTaskCompletion() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const submitCompletion = async (
    taskId: string,
    proofHash: string
  ) => {
    const taskIdBytes32 = `0x${taskId.padStart(64, '0')}` as `0x${string}`
    const proofBytes32 = `0x${proofHash.padStart(64, '0')}` as `0x${string}`
    
    return writeContract({
      address: contracts.taskRules,
      abi: TASK_RULES_ABI,
      functionName: 'submitCompletion',
      args: [taskIdBytes32, proofBytes32],
      chainId: targetChainId,
    })
  }

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    submitCompletion,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

/**
 * Get blockchain task details
 */
export function useBlockchainTask(taskId?: string) {
  const taskIdBytes32 = taskId ? `0x${taskId.padStart(64, '0')}` as `0x${string}` : undefined

  const { data: taskExists } = useReadContract({
    address: contracts.taskRules,
    abi: TASK_RULES_ABI,
    functionName: 'taskExists',
    args: taskIdBytes32 ? [taskIdBytes32] : undefined,
    chainId: targetChainId,
  })

  // Only query task data if taskId exists and task is confirmed to exist
  const shouldFetchTask = !!taskIdBytes32 && !!taskExists
  
  const { data: taskData, isLoading, isError, refetch } = useReadContract({
    address: contracts.taskRules,
    abi: TASK_RULES_ABI,
    functionName: 'getTask',
    args: shouldFetchTask ? [taskIdBytes32] : undefined,
    chainId: targetChainId,
  })

  return {
    task: taskData,
    exists: !!taskExists,
    isLoading,
    isError,
    refetch,
  }
}

// ===== Utility Hooks =====

/**
 * Get all dashboard stats in one hook
 */
export function useDashboardStats() {
  const { address } = useAccount()
  const { totalSupply } = useCGCTotalSupply()
  const { holders } = useCGCHolders()
  const { balance: treasuryBalance } = useCGCBalance(contracts.aragonDao)
  const { escrowBalance } = useEscrowBalance()
  const { milestonesReleased } = useMilestonesReleased()
  const { proposalCount } = useAragonProposals()
  const { activeTasks, completedTasks, totalTasks } = useTaskStats()
  const { balance: userBalance } = useCGCBalance(address)
  const { earnings } = useCollaboratorEarnings(address)
  const { isActive, limits, usage } = useSystemStatus()

  // Calculate circulating supply (total - treasury - escrow)
  const treasuryNum = parseFloat(treasuryBalance || '0')
  const escrowNum = parseFloat(escrowBalance || '0')
  const totalNum = parseFloat(totalSupply || '0')
  const circulatingSupply = Math.max(0, totalNum - treasuryNum - escrowNum)

  return {
    totalSupply,
    circulatingSupply: circulatingSupply.toFixed(2),
    treasuryBalance,
    escrowBalance,
    holdersCount: holders,
    proposalsActive: proposalCount,
    questsCompleted: completedTasks,
    activeTasks,
    totalTasks,
    milestonesReleased,
    userBalance,
    userEarnings: earnings,
    systemActive: isActive,
    systemLimits: limits,
    systemUsage: usage,
  }
}