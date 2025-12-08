import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';

// Header to use for idempotency
const IDEMPOTENCY_HEADER = 'idempotency-key';
const DEFAULT_TTL_SECONDS = 300; // 5 minutes cache

/**
 * idempotencyHandler
 *
 * Express middleware that supports HTTP idempotency via the `Idempotency-Key`
 * request header. When a client sends a POST/PUT with an idempotency key, the
 * first response is saved in the cache (Redis or memory fallback) and repeated
 * requests using the same key will return the cached response instead of
 * re-processing the operation.
 *
 * - The middleware is intentionally simple and caches the final status, headers
 *   and body as JSON under `idem:{key}`.
 * - TTL is configurable via DEFAULT_TTL_SECONDS in this module (defaults to 5min).
 * - Failures to access the cache are intentionally non-blocking — the request
 *   proceeds as normal if the cache layer fails.
 *
 * Note: For production-grade idempotency,the caching layer should store a
 * canonical request fingerprint, lock processing while the first request is
 * running, and store a structured response type. This middleware is a practical
 * and safe starting point for prototyping idempotency behavior.
 */
export async function idempotencyHandler(req: Request, res: Response, next: NextFunction) {
  const key = (req.headers[IDEMPOTENCY_HEADER] as string | undefined)?.trim();

  if (!key) return next();

  try {
    const cacheKey = `idem:${key}`;
    const existing = await cacheService.get(cacheKey);
    if (existing) {
      // cached value contains { status, headers, body }
      const parsed = JSON.parse(existing) as { status: number; headers: Record<string,string>; body: any };
      // apply headers
      for (const [h, v] of Object.entries(parsed.headers || {})) {
        try { res.setHeader(h, v); } catch { /* ignore invalid header keys */ }
      }
      return res.status(parsed.status).send(parsed.body);
    }

    // capture response
    const originalSend = res.send.bind(res);
    let chunks: any = null;

    // override send to capture
    (res as any).send = (body?: any) => {
      chunks = body;
      // store in cache asynchronously (status + body + headers)
      const store = JSON.stringify({ status: res.statusCode, headers: res.getHeaders(), body });
      cacheService.set(cacheKey, store, DEFAULT_TTL_SECONDS).catch(() => {});
      return originalSend(body);
    };

    return next();
  } catch (err) {
    // on external failure, don't block the request
    return next();
  }
}
