import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  initLoggerProvider,
  initMeterProvider,
  initTracerProvider,
  recordAppStartupMetric,
} from '@/config/otel';

import { GET } from './route';

describe('GET /api/status', () => {
  beforeEach(() => {
    process.env.OTEL_LOGS_EXPORTER = 'console';
    process.env.OTEL_TRACES_EXPORTER = 'console';
    process.env.OTEL_METRICS_EXPORTER = 'console';
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
    initLoggerProvider();
    initTracerProvider();
    initMeterProvider();
    recordAppStartupMetric();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns service status payload', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toMatchObject({
      service: expect.any(String),
      telemetry: {
        loggerReady: true,
        tracerReady: true,
        meterReady: true,
      },
    });
  });
});
