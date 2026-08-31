# Setup

**[← Back to overview](../../../README.md)**

**Documentation:** English · [German](../../de/guides/setup.md) · [Русский](../../ru/guides/setup.md) · [日本語]()

Add `provideOfflineSync()` and `offlineSyncInterceptor` to your application configuration:

```typescript
import { ApplicationConfig } from '@angular/core';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  provideOfflineSync,
  offlineSyncInterceptor,
} from 'ngx-offline-sync';

export const appConfig: ApplicationConfig = {
  providers: [
    provideOfflineSync(),

    provideHttpClient(
      withInterceptors([
        offlineSyncInterceptor,
      ]),
    ),
  ],
};
```

Once set up, the library manages the queue, storage, synchronization, and retries on its own. No additional registration of internal services is required.

> `provideOfflineSync()` also accepts an optional configuration object (e.g. `batchSize`). See [Configuration](configuration/index.md) for the full list of options.

## Next

- [Usage](usage.md) — how to send requests
- [Configuration](configuration/index.md) — tuning queue behavior
