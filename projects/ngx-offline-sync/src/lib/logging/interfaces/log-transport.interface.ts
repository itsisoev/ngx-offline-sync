import { ILogEntry } from './log-entry.interface';

export interface ILogTransport {
  write(entry: ILogEntry): void;
}
