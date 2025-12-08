import Redis from 'ioredis';
import { config } from '../config';

type CacheValue = string;

class CacheService {
  private client: Redis | null = null;
  private fallback = new Map<string, CacheValue>();

  constructor() {
    const url = config?.redis?.url || process.env.REDIS_URL;
    if (url) {
      try {
        this.client = new Redis(url);
      } catch (err) {
        // graceful fallback to in-memory
        this.client = null;
      }
    }
  }

  async get(key: string): Promise<CacheValue | null> {
    if (this.client) {
      const v = await this.client.get(key);
      return v;
    }
    return this.fallback.get(key) ?? null;
  }

  async set(key: string, value: CacheValue, ttlSeconds?: number) {
    if (this.client) {
      if (typeof ttlSeconds === 'number') {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
      return;
    }
    this.fallback.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => this.fallback.delete(key), ttlSeconds * 1000);
    }
  }

  async del(key: string) {
    if (this.client) {
      await this.client.del(key);
      return;
    }
    this.fallback.delete(key);
  }
}

export const cacheService = new CacheService();
