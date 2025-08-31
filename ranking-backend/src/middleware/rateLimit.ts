import { Request, Response, NextFunction } from 'express'
import { redis } from '@/services/redis'
import { appConfig } from '@/config'
import logger from '@/utils/logger'

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: Request) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  message?: string
}

export class RateLimiter {
  private options: RateLimitOptions

  constructor(options: Partial<RateLimitOptions> = {}) {
    this.options = {
      windowMs: appConfig.RATE_LIMIT_WINDOW_MS,
      maxRequests: appConfig.RATE_LIMIT_MAX_REQUESTS,
      keyGenerator: (req: Request) => req.ip || 'unknown',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: 'Too many requests from this IP, please try again later.',
      ...options
    }
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.generateKey(req)
        const current = await this.getCurrentCount(key)
        
        if (current >= this.options.maxRequests) {
          logger.warn(`Rate limit exceeded for key: ${key}`, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            current,
            limit: this.options.maxRequests
          })

          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: this.options.message,
            retryAfter: Math.ceil(this.options.windowMs / 1000),
            limit: this.options.maxRequests,
            current,
            resetTime: new Date(Date.now() + this.options.windowMs)
          })
        }

        await this.incrementCount(key)
        
        const remaining = Math.max(0, this.options.maxRequests - current - 1)
        const resetTime = Date.now() + this.options.windowMs

        res.set({
          'X-RateLimit-Limit': this.options.maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetTime.toString(),
          'X-RateLimit-Window': this.options.windowMs.toString()
        })

        next()
      } catch (error) {
        logger.error('Rate limiting error:', error)
        next()
      }
    }
  }

  private generateKey(req: Request): string {
    const baseKey = this.options.keyGenerator!(req)
    return `ratelimit:${baseKey}:${Math.floor(Date.now() / this.options.windowMs)}`
  }

  private async getCurrentCount(key: string): Promise<number> {
    try {
      const count = await redis.get<number>(key)
      return count || 0
    } catch (error) {
      logger.error('Redis get error in rate limiter:', error)
      return 0
    }
  }

  private async incrementCount(key: string): Promise<void> {
    try {
      const windowSeconds = Math.ceil(this.options.windowMs / 1000)
      await redis.incrementCounter(key, windowSeconds)
    } catch (error) {
      logger.error('Redis increment error in rate limiter:', error)
    }
  }
}

export const createRateLimiter = (options?: Partial<RateLimitOptions>) => {
  const limiter = new RateLimiter(options)
  return limiter.middleware()
}

export const defaultRateLimit = createRateLimiter()

export const strictRateLimit = createRateLimiter({
  windowMs: 60000,
  maxRequests: 10,
  message: 'Too many requests. Please wait before trying again.'
})

export const apiRateLimit = createRateLimiter({
  windowMs: appConfig.RATE_LIMIT_WINDOW_MS,
  maxRequests: appConfig.RATE_LIMIT_MAX_REQUESTS,
  keyGenerator: (req: Request) => {
    const forwarded = req.get('X-Forwarded-For')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip
    return `api:${ip}`
  }
})

export const websocketRateLimit = createRateLimiter({
  windowMs: 60000,
  maxRequests: 200,
  keyGenerator: (req: Request) => {
    const forwarded = req.get('X-Forwarded-For')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip
    return `ws:${ip}`
  }
})