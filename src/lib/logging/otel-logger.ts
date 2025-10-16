import { type AnyValueMap, logs, SeverityNumber } from '@opentelemetry/api-logs';

import { appConfig } from '@/config/app';
import { env } from '@/config/env';

import type { LogAttributes, LogLevel } from './types';

const logger = logs.getLogger(appConfig.serviceName);

const severityByLevel: Record<LogLevel, { number: SeverityNumber; text: string }> = {
  debug: { number: SeverityNumber.DEBUG, text: 'DEBUG' },
  info: { number: SeverityNumber.INFO, text: 'INFO' },
  warn: { number: SeverityNumber.WARN, text: 'WARN' },
  error: { number: SeverityNumber.ERROR, text: 'ERROR' },
};

const emit = (level: LogLevel, body: string, attributes?: LogAttributes) => {
  const severity = severityByLevel[level];

  if (typeof window !== 'undefined') {
    if (severity.number >= SeverityNumber.ERROR) {
      console.error(`[${severity.text}] ${body}`, attributes);
    } else {
      console.warn(`[${severity.text}] ${body}`, attributes);
    }
    return;
  }

  logger.emit({
    body,
    attributes: attributes as AnyValueMap | undefined,
    severityNumber: severity.number,
    severityText: severity.text,
    timestamp: Date.now() * 1_000_000, // convert ms to ns expected by spec
  });
};

export const logWithLevel = (level: LogLevel, message: string, attributes?: LogAttributes) => {
  emit(level, message, attributes);
};

export const otelLogger = {
  debug(message: string, attributes?: LogAttributes) {
    emit('debug', message, attributes);
  },
  info(message: string, attributes?: LogAttributes) {
    emit('info', message, attributes);
  },
  warn(message: string, attributes?: LogAttributes) {
    emit('warn', message, attributes);
  },
  error(message: string, attributes?: LogAttributes) {
    emit('error', message, attributes);
  },
};

export const logStartupMetadata = () => {
  otelLogger.info('Application bootstrapped', {
    serviceName: env.OTEL_SERVICE_NAME,
    exporter: env.OTEL_LOGS_EXPORTER,
  });
};

export type { LogAttributes, LogLevel } from './types';
