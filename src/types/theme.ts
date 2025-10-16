export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = Extract<ThemeMode, 'light' | 'dark'>;
