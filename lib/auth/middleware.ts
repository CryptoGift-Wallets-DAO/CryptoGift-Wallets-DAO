/**
 * 🔐 Authentication Middleware
 * 
 * Simple authentication and rate limiting for API endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDAORedis } from '@/lib/redis-dao'

const redis = getDAORedis()

// Rate limiting configuration
const RATE_LIMITS = {
  public: { requests: 100, window: 900 }, // 100 requests per 15 minutes
  protected: { requests: 50, window: 900 }, // 50 requests per 15 minutes
  admin: { requests: 20, window: 900 }, // 20 requests per 15 minutes
} as const

// Simple API key validation
const VALID_API_KEYS = [
  process.env.INTERNAL_API_KEY,
  process.env.ADMIN_API_KEY,
].filter(Boolean)

// Admin addresses - should match validate route
const ADMIN_ADDRESSES = [
  '0xc655BF2Bd9AfA997c757Bef290A9Bb6ca41c5dE6', // Deployer
  '0x3244DFBf9E5374DF2f106E89Cf7972E5D4C9ac31', // DAO
]

export interface AuthContext {
  isAuthenticated: boolean
  isAdmin: boolean
  address?: string
  rateLimited: boolean
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.ip
  
  return (
    (forwarded && forwarded.split(',')[0].trim()) ||
    realIP ||
    remoteAddr ||
    'unknown'
  )
}

/**
 * Rate limiting check
 */
async function checkRateLimit(
  ip: string, 
  endpoint: string, 
  limit: { requests: number; window: number }
): Promise<boolean> {
  try {
    const key = `rate_limit:${ip}:${endpoint}`
    const current = await redis.get(key)
    
    if (!current) {
      await redis.setex(key, limit.window, '1')
      return false // Not rate limited
    }
    
    const count = parseInt(current as string, 10)
    if (count >= limit.requests) {
      return true // Rate limited
    }
    
    await redis.incr(key)
    return false // Not rate limited
  } catch (error) {
    console.warn('Rate limit check failed, allowing request:', error)
    return false // Allow on Redis error
  }
}

/**
 * Basic authentication middleware
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requireAdmin?: boolean
    rateLimitType?: 'public' | 'protected' | 'admin'
  } = {}
): Promise<NextResponse> {
  const {
    requireAuth = false,
    requireAdmin = false,
    rateLimitType = 'public'
  } = options

  const clientIP = getClientIP(request)
  const endpoint = request.nextUrl.pathname
  const apiKey = request.headers.get('x-api-key')
  const walletAddress = request.headers.get('x-wallet-address')?.toLowerCase()

  // Rate limiting check
  const rateLimit = RATE_LIMITS[rateLimitType]
  const rateLimited = await checkRateLimit(clientIP, endpoint, rateLimit)
  
  if (rateLimited) {
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMITED',
        retryAfter: rateLimit.window
      },
      { status: 429 }
    )
  }

  // API key authentication
  const hasValidApiKey = apiKey && VALID_API_KEYS.includes(apiKey)
  
  // Admin check
  const isAdmin = walletAddress ? ADMIN_ADDRESSES.includes(walletAddress) : false
  
  // Wallet authentication - any valid wallet address is authenticated
  const hasValidWallet = walletAddress && walletAddress.startsWith('0x') && walletAddress.length === 42
  
  // Authentication check
  const isAuthenticated = hasValidApiKey || isAdmin || hasValidWallet

  // Build auth context
  const authContext: AuthContext = {
    isAuthenticated,
    isAdmin,
    address: walletAddress,
    rateLimited: false
  }

  // Require authentication
  if (requireAuth && !isAuthenticated) {
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required. Provide x-api-key or x-wallet-address header.',
        code: 'UNAUTHORIZED'
      },
      { status: 401 }
    )
  }

  // Require admin
  if (requireAdmin && !isAdmin) {
    return NextResponse.json(
      {
        success: false,
        error: 'Admin access required.',
        code: 'FORBIDDEN'
      },
      { status: 403 }
    )
  }

  // Log access for monitoring
  console.log(`[API] ${request.method} ${endpoint} - IP: ${clientIP} - Auth: ${isAuthenticated} - Admin: ${isAdmin} - Wallet: ${walletAddress || 'none'}`)

  return handler(request, authContext)
}

/**
 * Webhook signature validation
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    const providedSignature = signature.replace('sha256=', '')
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    )
  } catch (error) {
    console.error('Webhook signature validation failed:', error)
    return false
  }
}

/**
 * Helper functions for common auth patterns
 */
export const authHelpers = {
  // Public endpoint with rate limiting
  public: (handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>) =>
    (req: NextRequest) => withAuth(req, handler, { rateLimitType: 'public' }),

  // Protected endpoint requiring authentication
  protected: (handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>) =>
    (req: NextRequest) => withAuth(req, handler, { 
      requireAuth: true, 
      rateLimitType: 'protected' 
    }),

  // Admin endpoint requiring admin privileges
  admin: (handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>) =>
    (req: NextRequest) => withAuth(req, handler, { 
      requireAdmin: true, 
      rateLimitType: 'admin' 
    }),
}