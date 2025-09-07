/**
 * ✅ Task Validation API Endpoint
 * 
 * Handles task validation by authorized validators
 */

import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/tasks/task-service'
import { getDAORedis, RedisKeys } from '@/lib/redis-dao'

const taskService = new TaskService()
const redis = getDAORedis()

// Hardcoded validators for now - should be from smart contract roles
const AUTHORIZED_VALIDATORS = [
  '0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6', // Deployer
  '0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31', // DAO
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, validatorAddress, approved, notes } = body

    // Validate inputs
    if (!taskId || !validatorAddress || approved === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: taskId, validatorAddress, and approved',
        },
        { status: 400 }
      )
    }

    // Check if validator is authorized
    const isAuthorized = AUTHORIZED_VALIDATORS.some(
      addr => addr.toLowerCase() === validatorAddress.toLowerCase()
    )

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized validator address',
        },
        { status: 403 }
      )
    }

    // Get task to verify it exists and has evidence
    const task = await taskService.getTaskById(taskId)
    
    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found',
        },
        { status: 404 }
      )
    }

    if (task.status !== 'in_progress' || !task.evidence_url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task must be in progress with evidence submitted',
        },
        { status: 400 }
      )
    }

    // Update task status based on validation
    let newStatus = 'in_progress'
    let updateData: any = {}

    if (approved) {
      newStatus = 'validated'
      updateData = {
        status: 'validated',
        validated_at: new Date().toISOString(),
        validator_address: validatorAddress,
        validation_notes: notes,
      }

      // Store validation in Redis
      await redis.hset(
        RedisKeys.questCompletion(taskId, task.assignee_address!),
        'status',
        'validated'
      )
      await redis.hset(
        RedisKeys.questCompletion(taskId, task.assignee_address!),
        'validated_at',
        new Date().toISOString()
      )
      await redis.hset(
        RedisKeys.questCompletion(taskId, task.assignee_address!),
        'validator',
        validatorAddress
      )

      console.log(`✅ Task ${taskId} validated by ${validatorAddress}`)
    } else {
      // Rejected - reset to in_progress, clear evidence
      updateData = {
        status: 'in_progress',
        evidence_url: null,
        pr_url: null,
        validation_notes: notes,
        rejected_at: new Date().toISOString(),
        rejected_by: validatorAddress,
      }

      console.log(`❌ Task ${taskId} rejected by ${validatorAddress}`)
    }

    // Update task in database
    const updated = await taskService.updateTask(taskId, updateData)

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update task status',
        },
        { status: 500 }
      )
    }

    // TODO: If approved, trigger smart contract validation
    // This would call TaskRulesEIP712.validateCompletion()
    // and MilestoneEscrow.releaseMilestonePayment()

    return NextResponse.json({
      success: true,
      message: approved ? 'Task validated successfully' : 'Task validation rejected',
      data: {
        taskId,
        status: newStatus,
        validatedBy: validatorAddress,
        approved,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error validating task:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate task',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get tasks pending validation
    const tasks = await taskService.getTasksByStatus('in_progress')
    
    // Filter to only tasks with evidence submitted
    const pendingValidation = tasks.filter(task => task.evidence_url)

    return NextResponse.json({
      success: true,
      data: pendingValidation,
      count: pendingValidation.length,
    })
  } catch (error) {
    console.error('Error fetching tasks for validation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tasks for validation',
      },
      { status: 500 }
    )
  }
}