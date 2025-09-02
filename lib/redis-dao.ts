/**
 * Redis Configuration for DAO
 * 
 * IMPORTANTE: Usando instancia compartida temporalmente
 * con prefijos para evitar colisiones con CryptoGift Wallets
 */

import { Redis } from '@upstash/redis';

// Prefijo único para todas las keys del DAO
const DAO_PREFIX = 'dao:';

// Cliente Redis con wrapper de seguridad
class DAORedisClient {
  private redis: Redis;
  
  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
      throw new Error(
        'Redis configuration missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.'
      );
    }
    
    this.redis = new Redis({ url, token });
  }

  /**
   * Asegura que todas las keys tengan el prefijo DAO
   */
  private ensureDAOPrefix(key: string): string {
    if (key.startsWith(DAO_PREFIX)) {
      return key;
    }
    return `${DAO_PREFIX}${key}`;
  }

  /**
   * GET con prefijo automático
   */
  async get(key: string) {
    const safeKey = this.ensureDAOPrefix(key);
    return await this.redis.get(safeKey);
  }

  /**
   * SET con prefijo automático
   */
  async set(key: string, value: any, options?: { ex?: number }) {
    const safeKey = this.ensureDAOPrefix(key);
    if (options?.ex) {
      return await this.redis.setex(safeKey, options.ex, value);
    }
    return await this.redis.set(safeKey, value);
  }

  /**
   * DELETE con prefijo automático
   */
  async del(key: string) {
    const safeKey = this.ensureDAOPrefix(key);
    return await this.redis.del(safeKey);
  }

  /**
   * EXISTS con prefijo automático
   */
  async exists(key: string) {
    const safeKey = this.ensureDAOPrefix(key);
    return await this.redis.exists(safeKey);
  }

  /**
   * HSET con prefijo automático
   */
  async hset(key: string, field: string, value: any) {
    const safeKey = this.ensureDAOPrefix(key);
    return await this.redis.hset(safeKey, { [field]: value });
  }

  /**
   * HGET con prefijo automático
   */
  async hget(key: string, field: string) {
    const safeKey = this.ensureDAOPrefix(key);
    return await this.redis.hget(safeKey, field);
  }

  /**
   * HGETALL con prefijo automático
   */
  async hgetall(key: string) {
    const safeKey = this.ensureDAOPrefix(key);
    return await this.redis.hgetall(safeKey);
  }

  /**
   * ZADD con prefijo automático
   */
  async zadd(key: string, score: number, member: string) {
    const safeKey = this.ensureDAOPrefix(key);
    return await this.redis.zadd(safeKey, { score, member });
  }

  /**
   * ZRANGE con prefijo automático
   */
  async zrange(key: string, start: number, stop: number) {
    const safeKey = this.ensureDAOPrefix(key);
    return await this.redis.zrange(safeKey, start, stop);
  }

  /**
   * TTL con prefijo automático
   */
  async ttl(key: string) {
    const safeKey = this.ensureDAOPrefix(key);
    return await this.redis.ttl(safeKey);
  }

  /**
   * EXPIRE con prefijo automático
   */
  async expire(key: string, seconds: number) {
    const safeKey = this.ensureDAOPrefix(key);
    return await this.redis.expire(safeKey, seconds);
  }

  /**
   * Listar todas las keys del DAO (solo para debug)
   */
  async listDAOKeys(): Promise<string[]> {
    const pattern = `${DAO_PREFIX}*`;
    const keys = await this.redis.keys(pattern);
    return keys;
  }

  /**
   * Limpiar todas las keys del DAO (CUIDADO!)
   */
  async clearDAOData(): Promise<number> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear DAO data in production');
    }
    
    const keys = await this.listDAOKeys();
    if (keys.length === 0) return 0;
    
    const deleted = await this.redis.del(...keys);
    return deleted;
  }

  /**
   * Health check
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
}

// Singleton instance
let redisClient: DAORedisClient | null = null;

export function getDAORedis(): DAORedisClient {
  if (!redisClient) {
    redisClient = new DAORedisClient();
  }
  return redisClient;
}

// Export types
export type { DAORedisClient };

// Key patterns for different DAO modules
export const RedisKeys = {
  // EAS Attestations
  attestation: (id: string) => `attestation:${id}`,
  attestationByUser: (userId: string) => `user:${userId}:attestations`,
  
  // Quest completions
  questCompletion: (questId: string, userId: string) => `quest:${questId}:user:${userId}`,
  userQuests: (userId: string) => `user:${userId}:quests`,
  
  // Token releases
  releaseOrder: (orderId: string) => `release:${orderId}`,
  releaseNonce: (address: string) => `nonce:${address}`,
  
  // User sessions
  session: (sessionId: string) => `session:${sessionId}`,
  userSession: (userId: string) => `user:${userId}:session`,
  
  // Webhooks
  webhookEvent: (eventId: string) => `webhook:${eventId}`,
  webhookRetry: (eventId: string) => `webhook:retry:${eventId}`,
  
  // Rate limiting
  rateLimit: (identifier: string) => `ratelimit:${identifier}`,
  
  // Cache
  cache: (key: string) => `cache:${key}`,
  
  // Leaderboard
  leaderboard: () => `leaderboard:xp`,
  userRank: (userId: string) => `rank:${userId}`,
} as const;

// TTL values in seconds
export const RedisTTL = {
  session: 86400, // 24 hours
  releaseOrder: 900, // 15 minutes (matches contract TTL)
  cache: 300, // 5 minutes
  rateLimit: 60, // 1 minute
  webhook: 3600, // 1 hour
  attestation: 2592000, // 30 days
} as const;