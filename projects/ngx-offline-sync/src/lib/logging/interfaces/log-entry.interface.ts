import { LogEvent } from '../enums/log-event.enum';
import { LogLevel } from '../enums/log-level.enum';

export interface ILogEntry {
  level: LogLevel;
  event: LogEvent;
  message: string;
  context?: Record<string, unknown>;
  timestamp: number;
}
