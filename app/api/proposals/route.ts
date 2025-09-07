/**
 * 💡 Proposals API Endpoint
 * 
 * Handles task proposal operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/tasks/task-service'
import { authHelpers } from '@/lib/auth/middleware'

const taskService = new TaskService()

export const GET = authHelpers.public(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    
    let proposals

    if (status === 'pending') {
      proposals = await taskService.getPendingProposals()
    } else {
      // For now, only pending proposals are supported
      proposals = await taskService.getPendingProposals()
    }

    return NextResponse.json({
      success: true,
      data: proposals,
      count: proposals.length,
    })
  } catch (error) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch proposals',
      },
      { status: 500 }
    )
  }
})

export const POST = authHelpers.protected(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const {
      title,
      description,
      proposed_by_address,
      proposed_by_discord,
      platform_origin,
      estimated_complexity,
      estimated_days,
    } = body

    // Validate required fields
    if (!title || !description || !platform_origin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: title, description, and platform_origin',
        },
        { status: 400 }
      )
    }

    // Create proposal
    const proposal = await taskService.createProposal({
      title,
      description,
      proposed_by_address,
      proposed_by_discord,
      platform_origin,
      estimated_complexity,
      estimated_days,
    })

    return NextResponse.json({
      success: true,
      message: 'Proposal submitted successfully',
      data: proposal,
    })
  } catch (error) {
    console.error('Error creating proposal:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create proposal',
      },
      { status: 500 }
    )
  }
})