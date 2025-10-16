export type ChangelogEntry = {
  version: string;
  date: string;
  summary: string;
};

const demoChangelog: ChangelogEntry[] = [
  {
    version: '2024.10',
    date: '2024-10-01',
    summary:
      'Initial boilerplate release with Tailwind-first design system and observability baked in.',
  },
  {
    version: '2024.11',
    date: '2024-11-12',
    summary: 'Added web telemetry, feature flag dashboard, and Prometheus-ready metrics endpoint.',
  },
  {
    version: '2024.12',
    date: '2024-12-02',
    summary: 'Refined Docker workflow, CI template, and mock authentication helpers.',
  },
];

export const getChangelogEntries = async (): Promise<ChangelogEntry[]> => {
  return demoChangelog;
};
