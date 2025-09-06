/**
 * 🔗 TaskRulesEIP712 Contract Integration
 * 
 * Handles interaction with the deployed TaskRulesEIP712 smart contract
 * Validates task operations and manages on-chain state
 */

import { ethers } from 'ethers'
import type { Database } from '@/lib/supabase/types'
import { TaskStatus } from './types'

// Re-export TaskStatus for backward compatibility
export { TaskStatus }

type Task = Database['public']['Tables']['tasks']['Row']

// Contract ABI for TaskRulesEIP712
const TASK_RULES_ABI = [
  // Task management functions
  'function createTask(bytes32 taskId, uint256 rewardAmount, uint8 complexity, string memory title) external',
  'function claimTask(bytes32 taskId, address claimant, bytes calldata signature) external',
  'function validateSubmission(bytes32 taskId, string memory evidenceUrl, bytes calldata signature) external returns (bool)',
  'function completeTask(bytes32 taskId) external',
  
  // View functions
  'function getTask(bytes32 taskId) external view returns (tuple(bytes32 id, uint256 reward, uint8 complexity, string title, address assignee, uint8 status))',
  'function isTaskClaimable(bytes32 taskId) external view returns (bool)',
  'function getTaskAssignee(bytes32 taskId) external view returns (address)',
  'function getTaskStatus(bytes32 taskId) external view returns (uint8)',
  
  // Events
  'event TaskCreated(bytes32 indexed taskId, uint256 rewardAmount, uint8 complexity)',
  'event TaskClaimed(bytes32 indexed taskId, address indexed claimant)',
  'event TaskSubmitted(bytes32 indexed taskId, address indexed assignee, string evidenceUrl)',
  'event TaskCompleted(bytes32 indexed taskId, address indexed assignee, uint256 rewardAmount)',
  
  // EIP-712 related
  'function DOMAIN_SEPARATOR() external view returns (bytes32)',
  'function nonces(address) external view returns (uint256)',
]

// Contract configuration
const CONTRACT_ADDRESS = process.env.TASK_RULES_ADDRESS || '0xdDcfFF04eC6D8148CDdE3dBde42456fB32bcC5bb'
const RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org'


export class TaskRulesContract {
  private contract: ethers.Contract
  private provider: ethers.providers.JsonRpcProvider
  private signer?: ethers.Signer

  constructor(privateKey?: string) {
    this.provider = new ethers.providers.JsonRpcProvider(RPC_URL)
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, TASK_RULES_ABI, this.provider)
    
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider)
      this.contract = this.contract.connect(this.signer)
    }
  }

  /**
   * Create a task on-chain
   */
  async createTask(task: Task): Promise<string | null> {
    if (!this.signer) {
      throw new Error('Signer required for creating tasks')
    }

    try {
      const taskId = ethers.utils.id(task.task_id)
      const rewardWei = ethers.utils.parseEther(task.reward_cgc.toString())
      
      const tx = await this.contract.createTask(
        taskId,
        rewardWei,
        task.complexity,
        task.title
      )
      
      console.log('Task creation transaction:', tx.hash)
      await tx.wait()
      
      return tx.hash
    } catch (error) {
      console.error('Error creating task on-chain:', error)
      return null
    }
  }

  /**
   * Claim a task with EIP-712 signature
   */
  async claimTask(taskId: string, claimantAddress: string, signature: string): Promise<string | null> {
    if (!this.signer) {
      throw new Error('Signer required for claiming tasks')
    }

    try {
      const taskIdBytes32 = ethers.utils.id(taskId)
      
      const tx = await this.contract.claimTask(
        taskIdBytes32,
        claimantAddress,
        signature
      )
      
      console.log('Task claim transaction:', tx.hash)
      await tx.wait()
      
      return tx.hash
    } catch (error) {
      console.error('Error claiming task on-chain:', error)
      return null
    }
  }

  /**
   * Validate task submission with evidence
   */
  async validateSubmission(
    taskId: string, 
    evidenceUrl: string, 
    signature: string
  ): Promise<{ isValid: boolean; txHash?: string }> {
    if (!this.signer) {
      throw new Error('Signer required for validating submissions')
    }

    try {
      const taskIdBytes32 = ethers.utils.id(taskId)
      
      const tx = await this.contract.validateSubmission(
        taskIdBytes32,
        evidenceUrl,
        signature
      )
      
      console.log('Submission validation transaction:', tx.hash)
      const receipt = await tx.wait()
      
      // Check if validation was successful
      const isValid = receipt.status === 1
      
      return { isValid, txHash: tx.hash }
    } catch (error) {
      console.error('Error validating submission on-chain:', error)
      return { isValid: false }
    }
  }

  /**
   * Complete a task (admin function)
   */
  async completeTask(taskId: string): Promise<string | null> {
    if (!this.signer) {
      throw new Error('Signer required for completing tasks')
    }

    try {
      const taskIdBytes32 = ethers.utils.id(taskId)
      
      const tx = await this.contract.completeTask(taskIdBytes32)
      
      console.log('Task completion transaction:', tx.hash)
      await tx.wait()
      
      return tx.hash
    } catch (error) {
      console.error('Error completing task on-chain:', error)
      return null
    }
  }

  /**
   * Get task information from contract
   */
  async getTask(taskId: string): Promise<any | null> {
    try {
      const taskIdBytes32 = ethers.utils.id(taskId)
      const taskData = await this.contract.getTask(taskIdBytes32)
      
      return {
        id: taskData.id,
        reward: ethers.utils.formatEther(taskData.reward),
        complexity: taskData.complexity,
        title: taskData.title,
        assignee: taskData.assignee,
        status: taskData.status
      }
    } catch (error) {
      console.error('Error fetching task from contract:', error)
      return null
    }
  }

  /**
   * Check if task is claimable
   */
  async isTaskClaimable(taskId: string): Promise<boolean> {
    try {
      const taskIdBytes32 = ethers.utils.id(taskId)
      return await this.contract.isTaskClaimable(taskIdBytes32)
    } catch (error) {
      console.error('Error checking task claimability:', error)
      return false
    }
  }

  /**
   * Get task assignee
   */
  async getTaskAssignee(taskId: string): Promise<string | null> {
    try {
      const taskIdBytes32 = ethers.utils.id(taskId)
      const assignee = await this.contract.getTaskAssignee(taskIdBytes32)
      return assignee === ethers.constants.AddressZero ? null : assignee
    } catch (error) {
      console.error('Error fetching task assignee:', error)
      return null
    }
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    try {
      const taskIdBytes32 = ethers.utils.id(taskId)
      const status = await this.contract.getTaskStatus(taskIdBytes32)
      return status
    } catch (error) {
      console.error('Error fetching task status:', error)
      return TaskStatus.Available
    }
  }

  /**
   * Generate EIP-712 signature for task claiming
   */
  async generateClaimSignature(
    taskId: string,
    claimantAddress: string,
    deadline: number
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for generating signatures')
    }

    try {
      const domain = {
        name: 'TaskRulesEIP712',
        version: '1',
        chainId: 8453, // Base mainnet
        verifyingContract: CONTRACT_ADDRESS
      }

      const types = {
        ClaimTask: [
          { name: 'taskId', type: 'bytes32' },
          { name: 'claimant', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'nonce', type: 'uint256' }
        ]
      }

      const nonce = await this.contract.nonces(claimantAddress)
      const taskIdBytes32 = ethers.utils.id(taskId)

      const value = {
        taskId: taskIdBytes32,
        claimant: claimantAddress,
        deadline: deadline,
        nonce: nonce
      }

      return await (this.signer as any)._signTypedData(domain, types, value)
    } catch (error) {
      console.error('Error generating claim signature:', error)
      throw error
    }
  }

  /**
   * Generate EIP-712 signature for submission validation
   */
  async generateSubmissionSignature(
    taskId: string,
    assigneeAddress: string,
    evidenceUrl: string,
    deadline: number
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for generating signatures')
    }

    try {
      const domain = {
        name: 'TaskRulesEIP712',
        version: '1',
        chainId: 8453, // Base mainnet
        verifyingContract: CONTRACT_ADDRESS
      }

      const types = {
        ValidateSubmission: [
          { name: 'taskId', type: 'bytes32' },
          { name: 'assignee', type: 'address' },
          { name: 'evidenceUrl', type: 'string' },
          { name: 'deadline', type: 'uint256' },
          { name: 'nonce', type: 'uint256' }
        ]
      }

      const nonce = await this.contract.nonces(assigneeAddress)
      const taskIdBytes32 = ethers.utils.id(taskId)

      const value = {
        taskId: taskIdBytes32,
        assignee: assigneeAddress,
        evidenceUrl: evidenceUrl,
        deadline: deadline,
        nonce: nonce
      }

      return await (this.signer as any)._signTypedData(domain, types, value)
    } catch (error) {
      console.error('Error generating submission signature:', error)
      throw error
    }
  }

  /**
   * Listen for contract events
   */
  setupEventListeners() {
    // Task Created
    this.contract.on('TaskCreated', (taskId, rewardAmount, complexity) => {
      console.log('Task created on-chain:', {
        taskId: taskId,
        reward: ethers.utils.formatEther(rewardAmount),
        complexity: complexity
      })
    })

    // Task Claimed
    this.contract.on('TaskClaimed', (taskId, claimant) => {
      console.log('Task claimed on-chain:', {
        taskId: taskId,
        claimant: claimant
      })
    })

    // Task Submitted
    this.contract.on('TaskSubmitted', (taskId, assignee, evidenceUrl) => {
      console.log('Task submitted on-chain:', {
        taskId: taskId,
        assignee: assignee,
        evidenceUrl: evidenceUrl
      })
    })

    // Task Completed
    this.contract.on('TaskCompleted', (taskId, assignee, rewardAmount) => {
      console.log('Task completed on-chain:', {
        taskId: taskId,
        assignee: assignee,
        reward: ethers.utils.formatEther(rewardAmount)
      })
    })
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return CONTRACT_ADDRESS
  }

  /**
   * Get domain separator
   */
  async getDomainSeparator(): Promise<string> {
    try {
      return await this.contract.DOMAIN_SEPARATOR()
    } catch (error) {
      console.error('Error fetching domain separator:', error)
      throw error
    }
  }
}

// Singleton instance for the app
let taskRulesInstance: TaskRulesContract | null = null

export function getTaskRulesContract(privateKey?: string): TaskRulesContract {
  if (!taskRulesInstance) {
    const key = privateKey || process.env.PRIVATE_KEY_DAO_DEPLOYER
    taskRulesInstance = new TaskRulesContract(key)
  }
  return taskRulesInstance
}

// Helper functions
export function taskIdToBytes32(taskId: string): string {
  return ethers.utils.id(taskId)
}

export function formatTaskReward(rewardWei: string): string {
  return ethers.utils.formatEther(rewardWei)
}

export function parseTaskReward(rewardCGC: string): string {
  return ethers.utils.parseEther(rewardCGC).toString()
}