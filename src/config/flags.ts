import {
  type FeatureFlagKey,
  type FeatureFlagSchema,
  featureFlagSchema,
} from '@/types/feature-flags';

import { env } from './env';

const parseFlags = (raw?: string | null): Partial<FeatureFlagSchema> => {
  if (!raw) {
    return {};
  }

  try {
    const json = JSON.parse(raw);
    const parsed = featureFlagSchema.partial().safeParse(json);
    if (parsed.success) {
      return parsed.data;
    }
  } catch {
    // fall back to key:value parsing
  }

  return raw.split(',').reduce<Partial<FeatureFlagSchema>>((acc, entry) => {
    const [key, value = 'true'] = entry.split(':').map((part) => part.trim());
    if (!key) {
      return acc;
    }

    if (key in featureFlagSchema.shape) {
      acc[key as FeatureFlagKey] = ['true', '1', 'on', 'enabled'].includes(value.toLowerCase());
    }

    return acc;
  }, {});
};

const defaultFlags = featureFlagSchema.parse({});

const serverFlags: FeatureFlagSchema = featureFlagSchema.parse({
  ...defaultFlags,
  ...parseFlags(env.NEXT_PUBLIC_FEATURE_FLAGS),
  ...parseFlags(env.FEATURE_FLAGS),
});

export const getServerFeatureFlags = (): FeatureFlagSchema => ({ ...serverFlags });

export const isFeatureEnabled = <K extends FeatureFlagKey>(key: K, fallback?: boolean): boolean => {
  return (serverFlags[key] ?? fallback ?? false) as boolean;
};

export const serializeFeatureFlags = (flags: Partial<FeatureFlagSchema> = serverFlags) =>
  JSON.stringify(flags);
