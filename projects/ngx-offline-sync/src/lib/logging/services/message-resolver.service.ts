import { inject, Injectable } from '@angular/core';
import { IMessageResolver } from '../interfaces/message-resolver.interface';
import { LogEvent } from '../enums/log-event.enum';
import { LogLanguage } from '../enums/log-language.enum';
import { OFFLINE_SYNC_CONFIG } from '../../config';

import enMessages from '../messages/en.messages';
import ruMessages from '../messages/ru.messages';

@Injectable()
export class MessageResolverService implements IMessageResolver {
  private readonly config = inject(OFFLINE_SYNC_CONFIG);

  resolve(event: LogEvent, params?: Record<string, unknown>): string {
    const language = this.config.language ?? LogLanguage.EN;

    const message = this.getMessage(language, event);

    return this.interpolate(message, params);
  }

  private getMessage(language: LogLanguage, event: LogEvent): string {
    const messages = language === LogLanguage.RU ? ruMessages : enMessages;

    return messages[event] ?? event;
  }

  private interpolate(message: string, params?: Record<string, unknown>): string {
    if (!params) {
      return message;
    }

    return message.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
      String(params[key] ?? `{{${key}}}`),
    );
  }
}
