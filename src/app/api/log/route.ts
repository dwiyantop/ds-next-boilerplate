import type { Counter } from '@opentelemetry/api';
import { SpanStatusCode } from '@opentelemetry/api';
import { NextRequest } from 'next/server';
import { z } from 'zod';

import { appConfig } from '@/config/app';
import { getMeter, getTracer } from '@/config/otel';
import { type LogAttributes, logWithLevel } from '@/lib/logging';

const payloadSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  message: z.string().min(1, 'message is required'),
  attributes: z.record(z.any()).optional(),
  stack: z.string().optional(),
});

const normalizeAttributes = (
  attributes?: Record<string, unknown>,
  stack?: string,
): LogAttributes => {
  const base: LogAttributes = attributes ? { ...attributes } : {};
  if (stack) {
    base.stack = stack;
  }

  return base;
};

export const dynamic = 'force-dynamic';

const tracer = getTracer(`${appConfig.slug}.api.log`);
let requestCounter: Counter | null = null;
const getRequestCounter = () => {
  if (requestCounter) {
    return requestCounter;
  }

  const meter = getMeter(`${appConfig.slug}.api`);
  if (!meter) {
    return null;
  }

  requestCounter = meter.createCounter('api.log.requests', {
    description: 'Number of log submissions received from clients',
  });

  return requestCounter;
};

export async function POST(request: NextRequest) {
  const span = tracer.startSpan('api.log.POST');

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    span.setStatus({ code: SpanStatusCode.ERROR, message: 'invalid_json' });
    span.end();
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = payloadSchema.safeParse(body);

  if (!result.success) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: 'invalid_payload' });
    span.end();
    return new Response(
      JSON.stringify({ error: 'Invalid payload', details: result.error.flatten() }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const { level, message, attributes, stack } = result.data;
  const safeAttributes = normalizeAttributes(attributes, stack);

  logWithLevel(level, message, safeAttributes);
  span.setAttribute('log.level', level);
  span.setAttribute('log.message', message);
  span.end();

  getRequestCounter()?.add(1, { level });

  return new Response(null, { status: 204 });
}

export function GET() {
  return new Response(null, { status: 405 });
}
