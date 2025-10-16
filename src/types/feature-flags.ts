import { z } from 'zod';

export const featureFlagSchema = z.object({
  'landing.changelogCta': z.boolean().default(false),
  'landing.experimentalBadge': z.boolean().default(false),
});

export type FeatureFlagSchema = z.infer<typeof featureFlagSchema>;

export type FeatureFlagKey = keyof FeatureFlagSchema;
