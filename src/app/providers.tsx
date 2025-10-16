'use client';

import { type SpanAttributes, SpanStatusCode } from '@opentelemetry/api';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getWebMeter, getWebTracer, initWebTracer } from '@/config/otel-web';
import { logClientMessage } from '@/lib/logging/client-logger';
import { registerWebVitals } from '@/lib/telemetry/web-vitals';

type TraceInteractionFn = <T>(
  name: string,
  fn: () => Promise<T> | T,
  attributes?: SpanAttributes,
) => Promise<T>;

const TraceInteractionContext = createContext<TraceInteractionFn | null>(null);

export const useTraceInteraction = () => {
  const ctx = useContext(TraceInteractionContext);

  if (!ctx) {
    throw new Error('useTraceInteraction must be used within ClientProviders');
  }

  return ctx;
};

export const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);
  const tracerRef = useRef(getWebTracer());
  const initializedRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initializedRef.current) {
      setReady(true);
      return;
    }

    const provider = initWebTracer();
    if (!provider) {
      return;
    }

    tracerRef.current = getWebTracer();
    const span = tracerRef.current.startSpan('app.render');
    span.setAttribute('navigation.to', pathname ?? '');
    span.end();
    logClientMessage('debug', 'Web tracer initialized');

    // Initialize metrics and web vitals after tracer so meter provider exists
    getWebMeter();
    registerWebVitals();
    initializedRef.current = true;
    setReady(true);
  }, [pathname]);

  useEffect(() => {
    if (!ready || !pathname) {
      return;
    }

    if (previousPathRef.current === null) {
      previousPathRef.current = pathname;
      return;
    }

    const tracer = tracerRef.current;
    tracer.startActiveSpan(
      'navigation',
      {
        attributes: {
          'navigation.from': previousPathRef.current ?? '',
          'navigation.to': pathname,
        },
      },
      (span) => {
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
      },
    );

    previousPathRef.current = pathname;
  }, [pathname, ready]);

  const traceInteraction = useCallback<TraceInteractionFn>(async (name, fn, attributes) => {
    const tracer = tracerRef.current ?? getWebTracer();

    return tracer.startActiveSpan(name, { attributes }, async (span) => {
      try {
        const result = await fn();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'interaction_failed',
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }, []);

  const contextValue = useMemo(() => traceInteraction, [traceInteraction]);

  return (
    <TraceInteractionContext.Provider value={contextValue}>
      {children}
    </TraceInteractionContext.Provider>
  );
};
