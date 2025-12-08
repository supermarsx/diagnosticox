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
    const { Resource } = await import('@opentelemetry/resources');
    const { semanticConventions } = await import('@opentelemetry/semantic-conventions');
    const { ConsoleSpanExporter, SimpleSpanProcessor } = await import('@opentelemetry/sdk-trace-base');
    const { getNodeAutoInstrumentations } = await import('@opentelemetry/auto-instrumentations-node');

    // collect service metadata if available (allow overriding via env)
    let svcVersion = process.env.SERVICE_VERSION || null;
    try {
      if (!svcVersion) {
        // read package.json for backend service version
        const pkg = await import('../../package.json');
        svcVersion = pkg?.version || null;
      }
    } catch (err) {
      // ignore
    }

    const os = await import('os');

    const sdk = new NodeSDK({
      resource: new Resource({
        [semanticConventions.SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME || 'diagnosticox-backend',
        [semanticConventions.SemanticResourceAttributes.SERVICE_VERSION]: svcVersion || process.env.npm_package_version || 'unknown',
        'deployment.environment': config.nodeEnv,
        'host.name': os.hostname(),
      }),
      instrumentations: [getNodeAutoInstrumentations()],
    });

    // If OTLP export endpoint is provided, try to wire OTLP exporter dynamically
    const otlpEndpoint = process.env.TRACING_OTLP_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (otlpEndpoint) {
      try {
        const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
        const traceExporter = new OTLPTraceExporter({ url: otlpEndpoint });
        // attach a simple console span exporter + otlp exporter if available
        const spanProcessor = new (await import('@opentelemetry/sdk-trace-base')).SimpleSpanProcessor(traceExporter);
        sdk.configureTracerProvider((provider: any) => {
          provider.addSpanProcessor(spanProcessor);
          provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
        });
      } catch (err) {
        logger.warn({ err }, 'Failed to initialize OTLP exporter — falling back to console exporter');
      }
    } else {
      // by default attach a console exporter so traces are visible in dev
      sdk.configureTracerProvider((provider: any) => {
        provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
      });
    }

    await sdk.start();
    logger.info('OpenTelemetry SDK initialized');
  } catch (err: any) {
    logger.warn({ err }, 'OpenTelemetry packages not available — tracing disabled');
  }
}

export default { initTracing };
