import { NextResponse } from 'next/server';

import { getMeterProvider, getMetricReader } from '@/config/otel';

export const dynamic = 'force-dynamic';

export async function GET() {
  const provider = getMeterProvider();

  if (!provider) {
    return NextResponse.json(
      { status: 'unavailable', message: 'Metrics provider not initialized.' },
      { status: 503 },
    );
  }

  const reader = getMetricReader();
  if (!reader) {
    return NextResponse.json(
      { status: 'unavailable', message: 'Metric reader not initialized.' },
      { status: 503 },
    );
  }

  try {
    await provider.forceFlush();
  } catch {
    // ignore flush errors
  }

  const collection = await reader.collect();

  const resourceMetrics = Array.isArray(collection)
    ? collection
    : 'resourceMetrics' in collection && Array.isArray(collection.resourceMetrics)
      ? collection.resourceMetrics
      : 'scopeMetrics' in collection
        ? [collection]
        : [];
  const lines: string[] = [];
  const emittedHeaders = new Set<string>();

  const normaliseName = (name: string) => name.replace(/[^a-zA-Z0-9:_]/g, '_');
  const formatLabels = (attributes: Record<string, unknown> = {}) =>
    Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');

  let recordedSamples = false;

  for (const record of resourceMetrics) {
    for (const scope of record.scopeMetrics ?? []) {
      for (const metric of scope.metrics ?? []) {
        const baseName = normaliseName(metric.name);
        const sampleName = metric.dataPointType === 'sum' ? `${baseName}_total` : baseName;
        const description = metric.description ?? metric.name;
        const headerKey = `${sampleName}_header`;
        if (!emittedHeaders.has(headerKey)) {
          lines.push(`# HELP ${sampleName} ${description}`);
          const type = metric.dataPointType === 'sum' ? 'counter' : 'gauge';
          lines.push(`# TYPE ${sampleName} ${type}`);
          emittedHeaders.add(headerKey);
        }

        if (metric.dataPointType === 'histogram') {
          // Simplistic histogram export: emit sum only
          for (const point of metric.dataPoints ?? []) {
            const labels = formatLabels(point.attributes as Record<string, unknown>);
            if ('sum' in point) {
              lines.push(`${sampleName}_sum{${labels}} ${point.sum ?? 0}`);
              recordedSamples = true;
            }
          }
          continue;
        }

        for (const point of metric.dataPoints ?? []) {
          const labels = formatLabels(point.attributes as Record<string, unknown>);
          const value = 'value' in point ? point.value : 'sum' in point ? point.sum : 0;
          lines.push(`${sampleName}{${labels}} ${value}`);
          recordedSamples = true;
        }
      }
    }
  }

  if (!recordedSamples) {
    lines.push('# HELP app_startups_total Number of application bootstraps');
    lines.push('# TYPE app_startups_total counter');
    lines.push('app_startups_total{} 0');
  }

  return new Response(lines.join('\n') + '\n', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; version=0.0.4',
    },
  });
}
