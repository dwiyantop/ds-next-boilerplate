'use client';

import { metrics as otMetrics, trace as otTrace } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';

import { appConfig } from '@/config/app';

let provider: WebTracerProvider | null = null;
let meterProvider: MeterProvider | null = null;

const getRetryOptions = () => ({
  maxTimeout: 30_000,
  maxAttempts: 5,
  delay: 1_000,
});

const createExporter = () =>
  new OTLPTraceExporter({
    url:
      process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ??
      process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT ??
      'http://localhost:4318/v1/traces',
    timeoutMillis: 10_000,
    retryOptions: getRetryOptions(),
  });

const createMetricExporter = () =>
  new OTLPMetricExporter({
    url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/metrics',
    timeoutMillis: 10_000,
    retryOptions: getRetryOptions(),
  });

export const initWebTracer = () => {
  if (typeof window === 'undefined' || provider) {
    return provider;
  }

  provider = new WebTracerProvider({
    resource: new Resource({
      'service.name': appConfig.serviceName,
      'service.namespace': `${appConfig.slug}-web`,
    }),
  });

  provider.addSpanProcessor(
    new BatchSpanProcessor(createExporter(), {
      maxQueueSize: 2_048,
      scheduledDelayMillis: 5_000,
      exportTimeoutMillis: 30_000,
    }),
  );
  provider.register();

  return provider;
};

export const getWebTracer = (name = `${appConfig.slug}.web`) => {
  initWebTracer();
  return otTrace.getTracer(name);
};

export const initWebMeter = () => {
  if (typeof window === 'undefined' || meterProvider) {
    return meterProvider;
  }

  const exporter = createMetricExporter();

  meterProvider = new MeterProvider({
    resource: new Resource({
      'service.name': appConfig.serviceName,
      'service.namespace': `${appConfig.slug}-web`,
    }),
  });

  meterProvider.addMetricReader(
    new PeriodicExportingMetricReader({
      exporter,
      exportIntervalMillis: 60_000,
      exportTimeoutMillis: 30_000,
    }),
  );

  otMetrics.setGlobalMeterProvider(meterProvider);

  return meterProvider;
};

export const getWebMeter = (name = `${appConfig.slug}.web`) => {
  initWebMeter();
  return meterProvider?.getMeter(name);
};
