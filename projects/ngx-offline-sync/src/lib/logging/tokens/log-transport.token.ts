import { InjectionToken } from '@angular/core';
import { ILogTransport } from '../interfaces/log-transport.interface';

export const LOG_TRANSPORT = new InjectionToken<ILogTransport>('LOG_TRANSPORT');
