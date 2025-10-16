import { NextResponse } from 'next/server';

import { appConfig } from '@/config/app';
import { env } from '@/config/env';
import { getServerFeatureFlags } from '@/config/flags';
import { getLoggerProvider, getMeterProvider, getTracerProvider } from '@/config/otel';

import pkg from '../../../../package.json' assert { type: 'json' };

export const dynamic = 'force-dynamic';

type EndpointHealth = {
  url: string;
  reachable: boolean | null;
  status?: number;
  error?: string;
};

const checkEndpoint = async (url?: string | null): Promise<EndpointHealth> => {
  if (!url) {
    return { url: '', reachable: null };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2_000);
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    return {
      url,
      reachable: response.ok,
      status: response.status,
    };
  } catch (error) {
    return {
      url,
      reachable: false,
      error: error instanceof Error ? error.message : 'unknown_error',
    };
  }
};

export async function GET() {
  const loggerReady = Boolean(getLoggerProvider());
  const tracerReady = Boolean(getTracerProvider());
  const meterReady = Boolean(getMeterProvider());

  const [logsEndpoint, tracesEndpoint, metricsEndpoint] = await Promise.all([
    checkEndpoint(env.OTEL_EXPORTER_OTLP_ENDPOINT),
    checkEndpoint(env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT),
    checkEndpoint(env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT),
  ]);

  const otlpHealthy = [logsEndpoint, tracesEndpoint, metricsEndpoint]
    .filter((endpoint) => endpoint.reachable !== null)
    .every((endpoint) => endpoint.reachable);

  const body = {
    service: appConfig.serviceName,
    environment: env.NODE_ENV,
    build: {
      version: (pkg as { version: string }).version,
      commit:
        process.env.VERCEL_GIT_COMMIT_SHA ??
        process.env.GIT_COMMIT_SHA ??
        process.env.COMMIT_REF ??
        null,
      timestamp: process.env.BUILD_TIMESTAMP ?? null,
    },
    telemetry: {
      loggerReady,
      tracerReady,
      meterReady,
      otlp: {
        logs: logsEndpoint,
        traces: tracesEndpoint,
        metrics: metricsEndpoint,
      },
    },
    featureFlags: getServerFeatureFlags(),
    status: loggerReady && tracerReady && otlpHealthy ? 'ok' : 'degraded',
  };

  const statusCode = body.status === 'ok' ? 200 : 206;

  return NextResponse.json(body, { status: statusCode });
}
