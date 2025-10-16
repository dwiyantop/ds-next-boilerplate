'use client';

import { useEffect } from 'react';

import { logClientError, logClientMessage } from '@/lib/logging/client-logger';

export const ClientErrorListener = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const payload = event.error ?? event.message ?? 'Unhandled error';

      logClientError(payload, {
        source: 'window.error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      logClientError(event.reason, {
        source: 'window.unhandledrejection',
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        logClientMessage('debug', 'document.visible');
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (process.env.NODE_ENV !== 'production') {
      logClientMessage('info', 'Client error listeners registered');
    }

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
};
