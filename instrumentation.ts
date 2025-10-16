import { appConfig } from '@/config/app';
import {
  getTracer,
  initLoggerProvider,
  initMeterProvider,
  initTracerProvider,
  recordAppStartupMetric,
} from '@/config/otel';
import { logStartupMetadata } from '@/lib/logging';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') {
    return;
  }

  initLoggerProvider();
  initTracerProvider();
  initMeterProvider();

  const tracer = getTracer(`${appConfig.slug}.bootstrap`);
  const span = tracer.startSpan('app.bootstrap');
  span.setAttribute('service.name', appConfig.serviceName);
  span.setAttribute('deployment.environment', process.env.NODE_ENV ?? 'development');
  span.end();

  recordAppStartupMetric();
  logStartupMetadata();
}
