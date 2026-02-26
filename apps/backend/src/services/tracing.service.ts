/**
 * Tracing bootstrap
 *
 * This module attempts to initialize OpenTelemetry tracing when the
 * environment enables tracing and the required packages are available.
 * It uses dynamic imports so the runtime will still work if OTEL packages
 * are not installed (useful for development environments where instrumentation
 * is optional).
 */
import { config } from '../config';
import logger from './logger.service';

export async function initTracing() {
  if (!config.tracing?.enabled) {
    logger.info('Tracing not enabled via config.tracing.enabled');
    return;
  }

  try {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');

    const sdk = new NodeSDK({
      instrumentations: [getNodeAutoInstrumentations()],
    });

    // Export configuration is handled by environment variables understood by NodeSDK.
    // This keeps tracing initialization resilient across OTEL package version changes.

    await sdk.start();
    logger.info('OpenTelemetry SDK initialized');
  } catch (err: any) {
    logger.warn({ err }, 'OpenTelemetry packages not available — tracing disabled');
  }
}

export default { initTracing };
