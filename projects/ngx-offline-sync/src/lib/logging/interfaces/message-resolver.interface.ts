import { LogEvent } from '../enums/log-event.enum';

export interface IMessageResolver {
  resolve(event: LogEvent, params?: Record<string, unknown>): string;
}
