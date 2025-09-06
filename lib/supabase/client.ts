/**
 * 🗄️ Supabase Client for CryptoGift DAO
 * 
 * Manages database connections for tasks, collaborators, and proposals
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_DAO_URL || process.env.SUPABASE_DAO_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_DAO_ANON_KEY || process.env.SUPABASE_DAO_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_DAO_SERVICE_KEY

// During build time, Supabase might not be configured yet
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not configured. Some features will be disabled.')
}

// Public client for client-side operations
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-application': 'cryptogift-dao',
        },
      },
    })
  : null

// Admin client for server-side operations (with service role key)
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
    })
  : null

// Helper functions
export async function getServerClient() {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized')
  }
  return supabaseAdmin
}

// Error handling wrapper
export async function supabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please configure SUPABASE_DAO environment variables.')
  }
  
  const { data, error } = await queryFn()
  
  if (error) {
    console.error('Supabase query error:', error)
    throw new Error(error.message || 'Database query failed')
  }
  
  if (!data) {
    throw new Error('No data returned from query')
  }
  
  return data
}

// Real-time subscriptions helper
export function subscribeToTable<T>(
  table: string,
  callback: (payload: T) => void,
  filter?: string
) {
  if (!supabase) {
    console.warn('Supabase client not initialized. Subscriptions disabled.')
    return () => {} // Return no-op unsubscribe function
  }
  
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      (payload) => {
        callback(payload.new as T)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Batch operations helper
export async function batchInsert<T extends Record<string, any>>(
  table: string,
  records: T[],
  chunkSize = 100
) {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please configure SUPABASE_DAO environment variables.')
  }
  
  const chunks = []
  for (let i = 0; i < records.length; i += chunkSize) {
    chunks.push(records.slice(i, i + chunkSize))
  }

  const results = []
  for (const chunk of chunks) {
    const { data, error } = await supabase.from(table).insert(chunk).select()
    if (error) throw error
    results.push(...(data || []))
  }

  return results
}

// Cache helper with TTL
const cache = new Map<string, { data: any; expires: number }>()

export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  const cached = cache.get(key)
  
  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  const data = await queryFn()
  cache.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000,
  })

  return data
}

// Clear cache utility
export function clearCache(pattern?: string) {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}