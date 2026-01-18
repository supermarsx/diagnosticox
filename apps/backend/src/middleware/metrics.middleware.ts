import { Request, Response, NextFunction } from 'express';
import { metricsService } from '../services/metrics.service';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    
    const route = req.route ? req.route.path : req.path;
    const status = res.statusCode.toString();
    const method = req.method;

    metricsService.httpRequestCounter.inc({ method, route, status });
    metricsService.httpRequestDuration.observe({ method, route, status }, durationInSeconds);
  });

  next();
}
