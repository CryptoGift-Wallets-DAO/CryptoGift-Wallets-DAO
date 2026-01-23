/**
 * Refresh Materialized Views API
 *
 * Refreshes all analytics materialized views
 * Called via Vercel cron every hour
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_DAO_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_DAO_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase not configured')
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false }
  })
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseClient()

    // Refresh each materialized view
    const views = [
      'mv_gift_funnel_daily',
      'mv_task_operations_daily',
      'mv_referral_network_daily'
    ]

    const results: Record<string, string> = {}

    for (const view of views) {
      try {
        // REFRESH MATERIALIZED VIEW CONCURRENTLY requires unique index (which we have)
        const { error } = await supabase.rpc('refresh_single_view', { view_name: view })

        if (error) {
          // Fallback: direct SQL if RPC doesn't exist
          const { error: sqlError } = await supabase
            .from('sync_state')
            .select('id')
            .limit(1)

          if (!sqlError) {
            // Use raw SQL via postgres function
            await supabase.rpc('exec_sql', {
              sql: `REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`
            }).catch(() => {
              // If exec_sql doesn't exist, log it
              console.log(`Note: ${view} refresh skipped - no exec_sql function`)
            })
          }
          results[view] = 'attempted'
        } else {
          results[view] = 'refreshed'
        }
      } catch (viewError) {
        results[view] = `error: ${(viewError as Error).message}`
      }
    }

    // Update sync state
    await supabase
      .from('sync_state')
      .upsert({
        id: 'materialized_views_refresh',
        last_run_at: new Date().toISOString(),
        status: 'idle',
        run_duration_ms: Date.now() - startTime
      })

    return NextResponse.json({
      success: true,
      duration_ms: Date.now() - startTime,
      views: results
    })

  } catch (error) {
    console.error('Refresh views error:', error)
    return NextResponse.json(
      { error: 'Refresh failed', message: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    const { data } = await supabase
      .from('sync_state')
      .select('*')
      .eq('id', 'materialized_views_refresh')
      .single()

    return NextResponse.json({
      last_refresh: data?.last_run_at || null,
      status: data?.status || 'never_run',
      last_duration_ms: data?.run_duration_ms || null
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Status check failed', message: (error as Error).message },
      { status: 500 }
    )
  }
}
