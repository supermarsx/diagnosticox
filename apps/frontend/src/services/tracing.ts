/**
 * Frontend tracing bootstrap (optional).
 *
 * This module will attempt to initialize a lightweight OpenTelemetry tracer
 * for the browser (Console exporter) when the OTEL packages are available
 * and tracing is enabled via VITE_ENABLE_TRACING.
 */
const ENABLE_TRACING = import.meta.env.VITE_ENABLE_TRACING === 'true';

export async function initTracing() {
  if (!ENABLE_TRACING) return;

  try {
    const { WebTracerProvider } = await import('@opentelemetry/sdk-trace-web');
    const { ConsoleSpanExporter, SimpleSpanProcessor } = await import('@opentelemetry/sdk-trace-base');
    const { registerInstrumentations } = await import('@opentelemetry/instrumentation');
    const { ZoneContextManager } = await import('@opentelemetry/context-zone');

    const provider = new WebTracerProvider();
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
    provider.register({ contextManager: new ZoneContextManager() as any });

    // Optionally register automatic instrumentations (fetch, user interactions)
    try {
      await registerInstrumentations({ instrumentations: [] });
    } catch {
      // ignore
    }

    // noop if packages unavailable
    // eslint-disable-next-line no-console
    console.info('Frontend tracing initialized (console exporter)');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Frontend tracing packages missing or init failed', err);
  }
}

export default { initTracing };
