import type { Counter } from '@opentelemetry/api';
import { metrics, trace } from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import {
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

import { appConfig } from './app';
import { env } from './env';

type HeaderRecord = Record<string, string>;

type ExporterKind = 'logs' | 'traces' | 'metrics';

let loggerProvider: LoggerProvider | null = null;
let tracerProvider: NodeTracerProvider | null = null;
let meterProvider: MeterProvider | null = null;
let instrumentationsRegistered = false;
let resource: Resource | null = null;
let startupCounter: Counter | null = null;
let metricReader: PeriodicExportingMetricReader | null = null;

const parseHeaders = (raw?: string | null): HeaderRecord | undefined => {
  if (!raw) {
    return undefined;
  }

  return raw.split(',').reduce<HeaderRecord>((acc, pair) => {
    const [key, value] = pair.split('=').map((part) => part?.trim());
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const resolveEndpoint = (kind: ExporterKind) => {
  if (kind === 'traces') {
    return env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? env.OTEL_EXPORTER_OTLP_ENDPOINT;
  }

  if (kind === 'metrics') {
    return env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ?? env.OTEL_EXPORTER_OTLP_ENDPOINT;
  }

  return env.OTEL_EXPORTER_OTLP_ENDPOINT;
};

const getResource = () => {
  if (!resource) {
    resource = new Resource({
      'service.name': env.OTEL_SERVICE_NAME,
      'service.namespace': `${appConfig.slug}-service`,
      'deployment.environment': env.NODE_ENV,
    });
  }

  return resource;
};

const createLogExporter = () => {
  if (env.OTEL_LOGS_EXPORTER === 'otlp') {
    return new OTLPLogExporter({
      url: resolveEndpoint('logs'),
      headers: parseHeaders(env.OTEL_EXPORTER_OTLP_HEADERS),
    });
  }

  return new ConsoleLogRecordExporter();
};

const createTraceExporter = () => {
  if (env.OTEL_TRACES_EXPORTER === 'none') {
    return null;
  }

  if (env.OTEL_TRACES_EXPORTER === 'otlp') {
    return new OTLPTraceExporter({
      url: resolveEndpoint('traces'),
      headers: parseHeaders(env.OTEL_EXPORTER_OTLP_HEADERS),
    });
  }

  return new ConsoleSpanExporter();
};

const createMetricExporter = () => {
  if (env.OTEL_METRICS_EXPORTER === 'none') {
    return null;
  }

  if (env.OTEL_METRICS_EXPORTER === 'otlp') {
    return new OTLPMetricExporter({
      url: resolveEndpoint('metrics'),
      headers: parseHeaders(env.OTEL_EXPORTER_OTLP_HEADERS),
    });
  }

  return new ConsoleMetricExporter();
};

const ensureInstrumentations = () => {
  if (instrumentationsRegistered || !tracerProvider) {
    return;
  }

  registerInstrumentations({
    tracerProvider,
    instrumentations: [new HttpInstrumentation()],
  });

  instrumentationsRegistered = true;
};

export const initLoggerProvider = () => {
  if (loggerProvider || typeof window !== 'undefined') {
    return loggerProvider;
  }

  loggerProvider = new LoggerProvider({ resource: getResource() });
  loggerProvider.addLogRecordProcessor(
    new BatchLogRecordProcessor(createLogExporter(), {
      maxQueueSize: 2_048,
      scheduledDelayMillis: 5_000,
      exportTimeoutMillis: 30_000,
    }),
  );
  logs.setGlobalLoggerProvider(loggerProvider);

  return loggerProvider;
};

export const initTracerProvider = () => {
  if (tracerProvider || typeof window !== 'undefined') {
    return tracerProvider;
  }

  const exporter = createTraceExporter();
  if (!exporter) {
    return null;
  }

  tracerProvider = new NodeTracerProvider({ resource: getResource() });
  tracerProvider.addSpanProcessor(
    new BatchSpanProcessor(exporter, {
      maxQueueSize: 2_048,
      scheduledDelayMillis: 5_000,
      exportTimeoutMillis: 30_000,
    }),
  );
  tracerProvider.register();
  trace.setGlobalTracerProvider(tracerProvider);

  ensureInstrumentations();

  return tracerProvider;
};

export const initMeterProvider = () => {
  if (meterProvider || typeof window !== 'undefined') {
    return meterProvider;
  }

  const exporter = createMetricExporter();
  if (!exporter) {
    return null;
  }

  meterProvider = new MeterProvider({ resource: getResource() });
  metricReader = new PeriodicExportingMetricReader({
    exporter,
    exportIntervalMillis: 60_000,
    exportTimeoutMillis: 30_000,
  });

  meterProvider.addMetricReader(metricReader);
  metrics.setGlobalMeterProvider(meterProvider);

  return meterProvider;
};

export const getLoggerProvider = () => loggerProvider;
export const getTracerProvider = () => tracerProvider;
export const getMeterProvider = () => meterProvider;
export const getMetricReader = () => metricReader;

export const getTracer = (name = appConfig.slug) => trace.getTracer(name);
export const getMeter = (name = appConfig.slug) => meterProvider?.getMeter(name);

export const recordAppStartupMetric = () => {
  if (!meterProvider) {
    return;
  }

  if (!startupCounter) {
    const meter = meterProvider.getMeter(`${appConfig.slug}.lifecycle`);
    startupCounter = meter.createCounter('app.startups', {
      description: 'Number of times the application bootstrap has executed',
    });
  }

  startupCounter?.add(1, {
    service: env.OTEL_SERVICE_NAME,
    environment: env.NODE_ENV,
  });
};
