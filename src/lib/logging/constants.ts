import { appConfig } from '@/config/app';

export const LOG_ENDPOINT = '/api/log';
export const MAX_CLIENT_LOGS = 10;
export const LOG_CACHE_KEY = `${appConfig.slug}-log-cache-v1`;
export const LOG_SAMPLE_RATE_KEY = `${appConfig.slug}-log-sample-rate`;
export const DEFAULT_SAMPLE_RATE = 1;
