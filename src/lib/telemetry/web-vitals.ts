'use client';

import type { Histogram } from '@opentelemetry/api';
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

import { getWebMeter } from '@/config/otel-web';
import { logClientMessage } from '@/lib/logging/client-logger';

const histogramCache = new Map<string, Histogram>();

const units: Record<string, string> = {
  cls: 'ratio',
  fcp: 'ms',
  inp: 'ms',
  lcp: 'ms',
  ttfb: 'ms',
};

const ensureHistogram = (name: string, description: string) => {
  if (histogramCache.has(name)) {
    return histogramCache.get(name) ?? null;
  }

  const meter = getWebMeter();
  if (!meter) {
    return null;
  }

  const shortName = name.replace('web_vital_', '');
  const histogram = meter.createHistogram(name, {
    description,
    unit: units[shortName] ?? 'unitless',
  });

  histogramCache.set(name, histogram);
  return histogram;
};

const recordMetric = (metric: Metric) => {
  const name = `web_vital_${metric.name.toLowerCase()}`;
  const histogram = ensureHistogram(name, `${metric.name} reported by web-vitals`);

  histogram?.record(metric.value, {
    rating: metric.rating,
    metricId: metric.id,
  });

  logClientMessage('debug', `web-vital:${metric.name}`, {
    value: metric.value,
    rating: metric.rating,
  });
};

export const registerWebVitals = () => {
  if (typeof window === 'undefined') {
    return;
  }

  onCLS(recordMetric);
  onFCP(recordMetric);
  onLCP(recordMetric);
  onINP(recordMetric);
  onTTFB(recordMetric);
};
