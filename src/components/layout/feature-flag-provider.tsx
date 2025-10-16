'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { appConfig } from '@/config/app';
import {
  type FeatureFlagKey,
  type FeatureFlagSchema,
  featureFlagSchema,
} from '@/types/feature-flags';

export type FeatureFlagContextValue = {
  flags: FeatureFlagSchema;
  isEnabled: <K extends FeatureFlagKey>(key: K, fallback?: boolean) => boolean;
  setFlag: (key: FeatureFlagKey, value: boolean) => void;
};

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined);

export type FeatureFlagProviderProps = {
  initialFlags: FeatureFlagSchema;
  children: React.ReactNode;
};

export const FeatureFlagProvider = ({ initialFlags, children }: FeatureFlagProviderProps) => {
  const [flags, setFlags] = useState<FeatureFlagSchema>(initialFlags);
  const storageKey = `${appConfig.slug}-flag-overrides`;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return;
      }

      const parsed = featureFlagSchema.partial().safeParse(JSON.parse(raw));

      if (parsed.success) {
        setFlags((prev) => ({ ...prev, ...parsed.data }));
      }
    } catch {
      // ignore corrupt overrides
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(flags));
    } catch {
      // ignore storage errors
    }
  }, [flags, storageKey]);

  const value = useMemo<FeatureFlagContextValue>(
    () => ({
      flags,
      isEnabled: (key, fallback = false) => flags[key] ?? fallback,
      setFlag: (key, value) => {
        setFlags((prev) => ({ ...prev, [key]: value }));
      },
    }),
    [flags],
  );

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
};

export const useFeatureFlagContext = () => {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error('useFeatureFlagContext must be used within a FeatureFlagProvider');
  }

  return context;
};

export const useFeatureFlags = () => {
  const { flags } = useFeatureFlagContext();
  return flags;
};

export const useFeatureFlag = <K extends FeatureFlagKey>(key: K, fallback = false) => {
  const { isEnabled } = useFeatureFlagContext();
  return isEnabled(key, fallback);
};
