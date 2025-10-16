import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initMeterProvider, recordAppStartupMetric } from '@/config/otel';

import { GET } from './route';

describe('GET /api/metrics', () => {
  beforeEach(() => {
    process.env.OTEL_METRICS_EXPORTER = 'console';
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
    initMeterProvider();
    recordAppStartupMetric();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns prometheus formatted metrics', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');

    const text = await response.text();
    expect(text).toContain('app_startups_total');
  });
});
