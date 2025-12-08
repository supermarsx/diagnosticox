import pino from 'pino';
import { config } from '../config';

// Basic pino logger. In dev we'll enable pretty printing via env
const pretty = config.nodeEnv !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (config.nodeEnv === 'production' ? 'info' : 'debug'),
  transport: pretty ? { target: 'pino-pretty' } as any : undefined,
  base: { service: 'diagnosticox-backend' },
});

export default logger;
