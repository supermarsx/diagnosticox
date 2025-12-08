import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

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

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const payload = {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: duration,
    };
    console.log(JSON.stringify(payload));
  });

  next();
}
