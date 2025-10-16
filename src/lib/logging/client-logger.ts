'use client';

import {
  DEFAULT_SAMPLE_RATE,
  LOG_CACHE_KEY,
  LOG_ENDPOINT,
  LOG_SAMPLE_RATE_KEY,
  MAX_CLIENT_LOGS,
} from './constants';
import { SessionLRU } from './lru-cache';
import type { ClientLogPayload, LogAttributes, LogLevel } from './types';

const signatureCache = new SessionLRU(LOG_CACHE_KEY, MAX_CLIENT_LOGS);
const pendingQueue: ClientLogPayload[] = [];
let retryTimeout: ReturnType<typeof setTimeout> | null = null;
let currentSampleRate = DEFAULT_SAMPLE_RATE;
let sampleRateFetched = false;

const loadSampleRate = () => {
  if (sampleRateFetched) {
    return currentSampleRate;
  }

  sampleRateFetched = true;

  try {
    const stored = localStorage.getItem(LOG_SAMPLE_RATE_KEY);
    if (!stored) {
      return currentSampleRate;
    }

    const parsed = Number.parseFloat(stored);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
      currentSampleRate = parsed;
    }
  } catch {
    currentSampleRate = DEFAULT_SAMPLE_RATE;
  }

  return currentSampleRate;
};

const shouldSample = () => {
  const rate = loadSampleRate();
  if (rate >= 1) {
    return true;
  }

  if (rate <= 0) {
    return false;
  }

  return Math.random() <= rate;
};

const enqueue = (payload: ClientLogPayload) => {
  pendingQueue.push(payload);
  if (retryTimeout) {
    return;
  }
  retryTimeout = setTimeout(flushQueue, 1000);
};

const flushQueue = async () => {
  retryTimeout = null;
  if (pendingQueue.length === 0) {
    return;
  }
  const item = pendingQueue.shift();
  if (!item) {
    return;
  }
  const ok = await postLog(item);
  if (!ok) {
    enqueue(item);
  }
  if (pendingQueue.length > 0 && !retryTimeout) {
    retryTimeout = setTimeout(flushQueue, 2000);
  }
};

const postLog = async (payload: ClientLogPayload): Promise<boolean> => {
  const body = JSON.stringify(payload);

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const delivered = navigator.sendBeacon(
      LOG_ENDPOINT,
      new Blob([body], { type: 'application/json' }),
    );
    if (delivered) {
      return true;
    }
  }

  try {
    const response = await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    });

    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }

    return true;
  } catch (error) {
    console.warn('[OTEL] Failed to deliver client log, will retry', error);
    return false;
  }
};

const serializeError = (
  error: unknown,
): { message: string; stack?: string; attributes?: LogAttributes } => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack ?? undefined,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(error, Object.getOwnPropertyNames(error ?? {}));
  } catch {
    serialized = undefined;
  }

  return {
    message: 'Unknown client error',
    attributes: serialized ? { serialized } : undefined,
  };
};

const buildClientAttributes = (attributes?: LogAttributes): LogAttributes => {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  const perf = typeof performance !== 'undefined' ? performance.now() : undefined;

  return {
    ...attributes,
    browser: nav?.userAgent,
    language: nav?.language,
    platform: nav?.platform,
    online: nav?.onLine,
    timestamp: Date.now(),
    perfNow: perf,
  };
};

const deliver = (payload: ClientLogPayload) => {
  if (!shouldSample()) {
    return;
  }

  enqueue(payload);
};

export const sendClientLog = (payload: ClientLogPayload) => {
  deliver({ ...payload, attributes: buildClientAttributes(payload.attributes) });
};

export const logClientMessage = (level: LogLevel, message: string, attributes?: LogAttributes) => {
  const signature = `${level}:${message}`;
  if (signatureCache.has(signature)) {
    return;
  }

  signatureCache.add(signature);

  sendClientLog({
    level,
    message,
    attributes,
  });
};

export const logClientError = (error: unknown, context: LogAttributes = {}) => {
  const { message, stack, attributes } = serializeError(error);
  const signature = `${message}:${stack ?? ''}`;

  if (signatureCache.has(signature)) {
    return;
  }

  signatureCache.add(signature);

  const mergedAttributes = {
    ...context,
    ...attributes,
  };

  sendClientLog({
    level: 'error',
    message,
    stack,
    attributes: mergedAttributes,
  });
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushQueue().catch(() => {
      /* noop */
    });
  });
}
