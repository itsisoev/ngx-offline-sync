import {
  EnvironmentProviders,
  ENVIRONMENT_INITIALIZER,
  makeEnvironmentProviders,
} from '@angular/core';
import { IAppShellCacheConfig } from './interfaces/app-shell-cache-config.interface';

const DEFAULT_SW_PATH = '/ngx-offline-sync-sw.js';

async function registerAppShellCacheWorker(config: IAppShellCacheConfig): Promise<void> {
  if (!config.enabled) {
    return;
  }

  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register(config.swPath ?? DEFAULT_SW_PATH, {
      scope: '/',
    });
  } catch (error) {
    console.error('[ngx-offline-sync] Failed to register app shell service worker', error);
  }
}

/**
 * Registers the app shell caching Service Worker, if enabled in the config.
 * Called internally from provideOfflineSync() — not meant to be used standalone.
 */
export function provideAppShellCache(config: IAppShellCacheConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        void registerAppShellCacheWorker(config);
      },
    },
  ]);
}
