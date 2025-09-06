/**
 * 📋 Tasks API Endpoint
 * 
 * Handles CRUD operations for tasks
 */

import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/tasks/task-service'
import { getDAORedis } from '@/lib/redis-dao'

const taskService = new TaskService()
const redis = getDAORedis()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userAddress = searchParams.get('address')
    const limit = parseInt(searchParams.get('limit') || '50')

    let tasks

    switch (status) {
      case 'available':
        tasks = await taskService.getAvailableTasks(userAddress || undefined)
        break
      case 'in_progress':
        tasks = await taskService.getTasksInProgress()
        break
      case 'completed':
        tasks = await taskService.getCompletedTasks(limit)
        break
      default:
        tasks = await taskService.getAvailableTasks()
    }

    return NextResponse.json({
      success: true,
      data: tasks,
      count: tasks.length,
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'initialize') {
      // Initialize tasks (only for admin)
      const authHeader = request.headers.get('authorization')
      if (!authHeader || !authHeader.includes('admin-key')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }

      await taskService.initializeTasks()
      
      return NextResponse.json({
        success: true,
        message: 'Tasks initialized successfully',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in tasks POST:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Operation failed',
      },
      { status: 500 }
    )
  }
}