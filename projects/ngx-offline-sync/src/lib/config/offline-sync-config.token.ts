import { InjectionToken } from '@angular/core';
import { IOfflineSyncConfig } from './offline-sync-config.interface';

export const OFFLINE_SYNC_CONFIG = new InjectionToken<IOfflineSyncConfig>('OFFLINE_SYNC_CONFIG');
