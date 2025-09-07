/**
 * 🎯 Task Claim API Endpoint
 * 
 * Handles task claiming by users
 */

import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/tasks/task-service'
import { authHelpers, type AuthContext } from '@/lib/auth/middleware'
import { getDAORedis, RedisKeys } from '@/lib/redis-dao'

const taskService = new TaskService()
const redis = getDAORedis()

export const POST = authHelpers.protected(async (request: NextRequest, context: AuthContext) => {
  try {
    const body = await request.json()
    const { taskId } = body
    
    // Get userAddress from context or body
    const userAddress = context.address || body.userAddress

    // Validate inputs
    if (!taskId || !userAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: taskId and userAddress',
        },
        { status: 400 }
      )
    }

    // Check rate limiting
    const rateLimitKey = RedisKeys.rateLimit(`claim:${userAddress}`)
    const attempts = await redis.get(rateLimitKey)
    
    if (attempts && parseInt(attempts as string) >= 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many claim attempts. Please try again later.',
        },
        { status: 429 }
      )
    }

    // Increment rate limit counter
    await redis.set(rateLimitKey, (parseInt(attempts as string || '0') + 1).toString(), { ex: 60 })

    // Claim the task
    const success = await taskService.claimTask(taskId, userAddress)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to claim task. It may no longer be available.',
        },
        { status: 400 }
      )
    }

    // Log activity
    await redis.zadd(
      RedisKeys.leaderboard(),
      Date.now(),
      userAddress
    )

    return NextResponse.json({
      success: true,
      message: 'Task claimed successfully',
      data: {
        taskId,
        userAddress,
        claimedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error claiming task:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to claim task',
      },
      { status: 500 }
    )
  }
})