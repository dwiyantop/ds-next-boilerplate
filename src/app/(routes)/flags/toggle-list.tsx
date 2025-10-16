'use client';

import { type ChangeEvent, useCallback } from 'react';

import { useFeatureFlagContext } from '@/components/layout/feature-flag-provider';
import type { FeatureFlagKey } from '@/types/feature-flags';

const FlagToggleList = ({ flagKey, initial }: { flagKey: FeatureFlagKey; initial: boolean }) => {
  const { isEnabled, setFlag } = useFeatureFlagContext();
  const current = isEnabled(flagKey, initial);

  const handleToggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFlag(flagKey, event.target.checked);
    },
    [flagKey, setFlag],
  );

  return (
    <label className="flex items-center gap-3 text-sm font-medium">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border border-foreground/30"
        checked={current}
        onChange={handleToggle}
      />
      <span>{current ? 'Enabled' : 'Disabled'}</span>
    </label>
  );
};

export default FlagToggleList;
