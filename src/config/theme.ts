import { appConfig } from '@/config/app';
import { type ThemeMode } from '@/types/theme';

export const THEME_STORAGE_KEY = `${appConfig.slug}-theme`;

export const AVAILABLE_THEMES: ThemeMode[] = ['light', 'dark', 'system'];

export const DEFAULT_THEME: ThemeMode = 'system';
