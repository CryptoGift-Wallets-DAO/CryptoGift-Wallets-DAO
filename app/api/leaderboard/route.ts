/**
 * 🏆 Leaderboard API Endpoint
 * 
 * Returns collaborator rankings
 */

import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/tasks/task-service'

const taskService = new TaskService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const address = searchParams.get('address')

    // Get leaderboard
    const leaderboard = await taskService.getLeaderboard(limit)

    // If specific address requested, get their details
    let userRank = null
    if (address) {
      const collaborator = await taskService.getCollaborator(address)
      if (collaborator) {
        userRank = {
          ...collaborator,
          position: leaderboard.findIndex(c => c.address === address) + 1,
        }
      }
    }

    // Calculate statistics
    const totalCGCDistributed = leaderboard.reduce(
      (sum, c) => sum + c.total_cgc_earned,
      0
    )
    const totalTasksCompleted = leaderboard.reduce(
      (sum, c) => sum + c.tasks_completed,
      0
    )

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        userRank,
        statistics: {
          totalCollaborators: leaderboard.length,
          totalCGCDistributed,
          totalTasksCompleted,
          averageCGCPerCollaborator: 
            leaderboard.length > 0 ? totalCGCDistributed / leaderboard.length : 0,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
      },
      { status: 500 }
    )
  }
}