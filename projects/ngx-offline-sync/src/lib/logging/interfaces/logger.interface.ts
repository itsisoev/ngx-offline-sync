import { LogEvent } from '../enums/log-event.enum';

export interface ILogger {
  info(event: LogEvent, context?: Record<string, unknown>): void;
  success(event: LogEvent, context?: Record<string, unknown>): void;
  warning(event: LogEvent, context?: Record<string, unknown>): void;
  error(event: LogEvent, context?: Record<string, unknown>): void;
}
