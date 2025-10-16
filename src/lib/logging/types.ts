export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogAttributes = Record<string, unknown>;

export type ClientLogPayload = {
  level: LogLevel;
  message: string;
  attributes?: LogAttributes;
  stack?: string;
};
