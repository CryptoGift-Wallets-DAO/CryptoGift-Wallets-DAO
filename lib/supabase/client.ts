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

// Build-time fallback URL and key (these won't work but satisfy TypeScript)
const BUILD_TIME_URL = supabaseUrl || 'https://placeholder.supabase.co'
const BUILD_TIME_ANON_KEY = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
const BUILD_TIME_SERVICE_KEY = supabaseServiceKey || BUILD_TIME_ANON_KEY

// Public client for client-side operations - ALWAYS returns a typed client
export const supabase = createClient<Database>(
  BUILD_TIME_URL,
  BUILD_TIME_ANON_KEY,
  {
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
  }
)

// Admin client for server-side operations - ALWAYS returns a typed client
export const supabaseAdmin = createClient<Database>(
  BUILD_TIME_URL,
  BUILD_TIME_SERVICE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  }
)

// Helper functions
export async function getServerClient() {
  // Check if we have real credentials
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin client not properly configured')
  }
  return supabaseAdmin
}

// Type-safe client getter for task operations
export function getTypedClient() {
  // Check if we have real credentials
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase client not properly configured, using placeholder')
  }
  // Always return the admin client which is always typed
  return supabaseAdmin
}

// Error handling wrapper
export async function supabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  // Check if we have real credentials
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase client not properly configured')
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
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase client not properly configured. Subscriptions disabled.')
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
): Promise<T[]> {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please configure SUPABASE_DAO environment variables.')
  }
  
  const chunks: T[][] = []
  for (let i = 0; i < records.length; i += chunkSize) {
    chunks.push(records.slice(i, i + chunkSize))
  }

  const results: T[] = []
  for (const chunk of chunks) {
    const { data, error } = await supabase.from(table).insert(chunk as any).select()
    if (error) throw error
    results.push(...(data as T[] || []))
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