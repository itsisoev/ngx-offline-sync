import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { IAppShellConfig } from '../interfaces/app-shell-config.interface';

export const OFFLINE_APP_SHELL_CONFIG = new InjectionToken<IAppShellConfig>('OFFLINE_APP_SHELL_CONFIG');

@Injectable({ providedIn: 'root' })
export class AppShellService {
  constructor(
    @Optional() private readonly swUpdate: SwUpdate | null,
    @Optional() @Inject(OFFLINE_APP_SHELL_CONFIG) private readonly config: IAppShellConfig | null,
  ) {}

  isEnabled(): boolean {
    return this.config?.enabled ?? false;
  }

  async checkForUpdate(): Promise<boolean> {
    if (!this.swUpdate || !this.swUpdate.isEnabled) {
      return false;
    }

    return this.swUpdate.checkForUpdate();
  }
}
