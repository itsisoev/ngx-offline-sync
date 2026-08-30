import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  offlineSyncInterceptor,
  provideOfflineSync,
  LogLevel,
  LogLanguage,
} from 'ngx-offline-sync';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([offlineSyncInterceptor])),
    provideOfflineSync({
      batchSize: 10,
      logLevel: LogLevel.ALL,
      language: LogLanguage.RU,
    }),
  ],
};
