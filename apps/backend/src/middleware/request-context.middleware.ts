import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../services/logger.service';
import jwt from 'jsonwebtoken';

export interface RequestWithContext extends Request {
  requestId?: string;
}

/**
 * Attaches a correlation ID to each request and emits structured logs on completion.
 */
export function requestContext(req: RequestWithContext, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string | undefined) || uuidv4();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  // Attempt to enrich logs with session/tenant and tracing info when available
  const start = Date.now();
  let sessionId: string | undefined;
  let organizationId: string | undefined;
  try {
    const raw = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (raw) {
      const payload: any = jwt.decode(raw) as any;
      sessionId = payload?.sessionId;
      organizationId = payload?.organizationId || payload?.organization_id;
    }
  } catch (err) {
    // no-op
  }
  res.on('finish', async () => {
    const duration = Date.now() - start;

    // Try to capture active span context via OpenTelemetry API
    let traceId: string | undefined;
    let spanId: string | undefined;
    try {
      const api = await import('@opentelemetry/api');
      const span = api.trace.getSpan(api.context.active());
      const sc = span?.spanContext();
      if (sc) {
        traceId = sc.traceId;
        spanId = sc.spanId;
      }
    } catch (err) {
      // tracing not enabled or package not present — continue silently
    }

    const payload = {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: duration,
      traceId,
      spanId,
      sessionId,
      organizationId,
    };

    // Attach a request-scoped child logger for downstream handlers
    try {
      (req as any).logger = logger.child({ requestId, traceId, spanId, sessionId, organizationId });
    } catch (_) {
      // noop
    }

    logger.info(payload, 'request-complete');
  });

  next();
}
