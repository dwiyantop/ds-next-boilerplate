import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FEATURE_FLAGS: z.string().optional(),
  OTEL_SERVICE_NAME: z.string().min(1).default('app-service'),
  OTEL_LOGS_EXPORTER: z.enum(['console', 'otlp']).default('console'),
  OTEL_TRACES_EXPORTER: z.enum(['console', 'otlp', 'none']).default('otlp'),
  OTEL_METRICS_EXPORTER: z.enum(['console', 'otlp', 'none']).default('otlp'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.string().url().optional(),
  OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: z.string().url().optional(),
  OTEL_EXPORTER_OTLP_HEADERS: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_FEATURE_FLAGS: z.string().optional(),
  NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.string().url().optional(),
});

const mergedSchema = serverSchema.merge(clientSchema);

const parsed = mergedSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_FEATURE_FLAGS: process.env.NEXT_PUBLIC_FEATURE_FLAGS,
  NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT,
  NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:
    process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
  FEATURE_FLAGS: process.env.FEATURE_FLAGS,
  OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
  OTEL_LOGS_EXPORTER: process.env.OTEL_LOGS_EXPORTER,
  OTEL_TRACES_EXPORTER: process.env.OTEL_TRACES_EXPORTER,
  OTEL_METRICS_EXPORTER: process.env.OTEL_METRICS_EXPORTER,
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
  OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
  OTEL_EXPORTER_OTLP_HEADERS: process.env.OTEL_EXPORTER_OTLP_HEADERS,
});

if (!parsed.success) {
  console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
