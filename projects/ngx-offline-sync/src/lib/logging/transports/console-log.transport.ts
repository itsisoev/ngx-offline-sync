import { Injectable } from '@angular/core';
import { ILogTransport } from '../interfaces/log-transport.interface';
import { ILogEntry } from '../interfaces/log-entry.interface';
import { LogLevel } from '../enums/log-level.enum';

@Injectable()
export class ConsoleLogTransport implements ILogTransport {
  write(entry: ILogEntry): void {
    const message = entry.message;
    const context = entry.context ?? '';

    switch (entry.level) {
      case LogLevel.INFO:
        console.info(message, context);
        break;

      case LogLevel.SUCCESS:
        console.log(message, context);
        break;

      case LogLevel.WARNING:
        console.warn(message, context);
        break;

      case LogLevel.ERROR:
        console.error(message, context);
        break;
    }
  }
}
