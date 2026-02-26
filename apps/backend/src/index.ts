// ensure Node uses UTC time for runtime operations
process.env.TZ = process.env.TZ || 'UTC';

/**
 * Entry point for the backend API server. This file wires core middleware
 * (helmet, cors, JSON parsers) and mounts the application routes. It also
 * installs request-scoped context middleware used for correlation IDs and
 * structured request logging.
 *
 * The server listens on the port declared in `config.port` and logs a few
 * useful startup values for diagnostics (database type and Node environment).
 */
import express from 'express';
import { logger } from './services/logger.service';
import { initTracing } from './services/tracing.service';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import oidcRoutes from './routes/oidc.routes';
import sessionRoutes from './routes/session.routes';
import patientRoutes from './routes/patient.routes';
import problemRoutes from './routes/problem.routes';
import bayesianRoutes from './routes/bayesian.routes';
import trialRoutes from './routes/trial.routes';
import timelineRoutes from './routes/timeline.routes';
import diaryRoutes from './routes/diary.routes';
import securityRoutes from './routes/security.routes';
import pivotRoutes from './routes/pivot.routes';
import patientPivotRoutes from './routes/patient-pivot.routes';
import testRoutes from './routes/test.routes';
import biasRoutes from './routes/bias.routes';
import factRoutes from './routes/fact.routes';
import exportRoutes from './routes/export.routes';
import fhirRoutes from './routes/fhir.routes';
import importRoutes from './routes/import.routes';
import reportRoutes from './routes/report.routes';
import icdRoutes from './routes/icd.routes';
import aiRoutes from './routes/ai.routes';
import excelRoutes from './routes/excel.routes';
import { requestContext } from './middleware/request-context.middleware';
import { commonRateLimit, authRateLimit } from './middleware/rate-limit.middleware';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { metricsService } from './services/metrics.service';

const app = express();
const apiRouter = express.Router();

// Middleware
app.use(helmet());
app.use(metricsMiddleware);
app.use(commonRateLimit);
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ type: 'text/csv', limit: '5mb' }));

// Initialize tracing (optional) and attach correlation ID + structured request logging
initTracing().catch((err) => logger.warn({ err }, 'Tracing init failed'));
app.use(requestContext);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', metricsService.getContentType());
  res.send(await metricsService.getMetrics());
});

// API Routes
apiRouter.use('/auth', authRateLimit, authRoutes);
apiRouter.use('/auth/oidc', authRateLimit, oidcRoutes);
apiRouter.use('/auth/session', sessionRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/problems', problemRoutes);
apiRouter.use('/bayesian', bayesianRoutes);
apiRouter.use('/trials', trialRoutes);
apiRouter.use('/timeline', timelineRoutes);
apiRouter.use('/diary', diaryRoutes);
apiRouter.use('/pivots', pivotRoutes);
apiRouter.use('/patient-pivots', patientPivotRoutes);
apiRouter.use('/tests', testRoutes);
apiRouter.use('/bias', biasRoutes);
apiRouter.use('/facts', factRoutes);
apiRouter.use('/export', exportRoutes);
apiRouter.use('/fhir', fhirRoutes);
apiRouter.use('/import', importRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/icd', icdRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/excel', excelRoutes);
apiRouter.use('/security', securityRoutes);

// Keep backward compatibility on /api and add spec-aligned /api/v1
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error in request pipeline');
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = config.port;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info({ port: PORT, db: config.database.type, env: config.nodeEnv }, 'Medical Diagnosis API server started');
  });
}

export default app;
