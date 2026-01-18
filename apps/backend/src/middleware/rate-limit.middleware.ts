import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../services/logger.service';

let redisClient: Redis | null = null;
const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  try {
    redisClient = new Redis(redisUrl);
    logger.info('Redis connected for rate limiting');
  } catch (err) {
    logger.warn({ err }, 'Redis connection failed for rate limiting, falling back to memory');
  }
}

export const commonRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    // @ts-expect-error - expect-error because of version differences in types
    sendCommand: (...args: string[]) => redisClient!.call(...args),
  }) : undefined,
  message: {
    error: 'Too many requests, please try again later.',
  },
});

export const authRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login/register attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    // @ts-expect-error - version diff
    sendCommand: (...args: string[]) => redisClient!.call(...args),
  }) : undefined,
  message: {
    error: 'Too many authentication attempts, please try again in an hour.',
  },
});
