import { inject, Injectable } from '@angular/core';
import { ILogger } from '../interfaces/logger.interface';
import { ILogEntry } from '../interfaces/log-entry.interface';
import { OFFLINE_SYNC_CONFIG } from '../../config';
import { LOG_TRANSPORT } from '../tokens/log-transport.token';
import { LogEvent } from '../enums/log-event.enum';
import { LogLevel } from '../enums/log-level.enum';
import { LogLanguage } from '../enums/log-language.enum';
import { ruMessages } from '../messages/ru.messages';
import { enMessages } from '../messages/en.messages';

@Injectable()
export class LoggerService implements ILogger {
  private readonly config = inject(OFFLINE_SYNC_CONFIG);
  private readonly transport = inject(LOG_TRANSPORT);

  info(event: LogEvent, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, event, context);
  }

  success(event: LogEvent, context?: Record<string, unknown>): void {
    this.log(LogLevel.SUCCESS, event, context);
  }

  warning(event: LogEvent, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARNING, event, context);
  }

  error(event: LogEvent, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, event, context);
  }

  private log(level: LogLevel, event: LogEvent, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const language = this.config.language ?? LogLanguage.EN;

    const message = this.getMessage(language, event, context);

    const entry: ILogEntry = {
      level,
      event,
      message,
      context,
      timestamp: Date.now(),
    };

    this.transport.write(entry);
  }

  private getMessage(
    language: LogLanguage,
    event: LogEvent,
    context?: Record<string, unknown>,
  ): string {
    const messages = language === LogLanguage.RU ? ruMessages : enMessages;

    let message = messages[event] ?? event;

    if (!context) {
      return message;
    }

    for (const [key, value] of Object.entries(context)) {
      message = message.replace(`{{${key}}}`, String(value));
    }

    return message;
  }

  private shouldLog(level: LogLevel): boolean {
    const configuredLevel = this.config.logLevel ?? LogLevel.NONE;

    if (configuredLevel === LogLevel.NONE) {
      return false;
    }

    if (configuredLevel === LogLevel.ALL) {
      return true;
    }

    return configuredLevel === level;
  }
}
