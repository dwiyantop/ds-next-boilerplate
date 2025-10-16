import { env } from './env';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'app';

export const appConfig = {
  serviceName: env.OTEL_SERVICE_NAME,
  slug: slugify(env.OTEL_SERVICE_NAME),
};
