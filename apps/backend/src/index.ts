import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import problemRoutes from './routes/problem.routes';
import bayesianRoutes from './routes/bayesian.routes';
import trialRoutes from './routes/trial.routes';
import timelineRoutes from './routes/timeline.routes';
import diaryRoutes from './routes/diary.routes';
import securityRoutes from './routes/security.routes';
import pivotRoutes from './routes/pivot.routes';
import biasRoutes from './routes/bias.routes';
import factRoutes from './routes/fact.routes';
import exportRoutes from './routes/export.routes';
import fhirRoutes from './routes/fhir.routes';
import importRoutes from './routes/import.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/bayesian', bayesianRoutes);
app.use('/api/trials', trialRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/pivots', pivotRoutes);
app.use('/api/bias', biasRoutes);
app.use('/api/facts', factRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/fhir', fhirRoutes);
app.use('/api/import', importRoutes);
app.use('/api/security', securityRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Medical Diagnosis API server running on port ${PORT}`);
  console.log(`Database type: ${config.database.type}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
