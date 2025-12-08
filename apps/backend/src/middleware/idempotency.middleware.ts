import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';

// Header to use for idempotency
const IDEMPOTENCY_HEADER = 'idempotency-key';
const DEFAULT_TTL_SECONDS = 300; // 5 minutes cache

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
