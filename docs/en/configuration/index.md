# Configuration

**[← Back to table of contents](../../../README.md)**

**Documentation:** [Русский](../../ru/configuration/index.md) · English

`provideOfflineSync()` accepts an optional configuration object that lets you customize queue behavior, synchronization, logging, and application caching.

```typescript
provideOfflineSync({
  batchSize: 10,
  maxQueueSize: 500,
  logLevel: LogLevel.ALL,
  language: LogLanguage.EN,

  appShellCache: {
    enabled: true,
  },

  onQueueFull: () => {
    // show toast
  },

  onNetworkStatusChange: (offline) => {
    // show / hide offline indicator
  },
})
```

## Available options

| Option                  | Type                         | Default              | Description                                                                                                             |
|-------------------------|------------------------------|----------------------|-------------------------------------------------------------------------------------------------------------------------|
| `batchSize`             | `number`                     | `1`                  | Number of queued requests processed in parallel during synchronization. [Learn more →](batch-size.md)                   |
| `maxQueueSize`          | `number`                     | `150`                | Maximum number of requests that can be stored in the offline queue. [Learn more →](max-queue-size.md)                   |
| `onQueueFull`           | `() => void`                 | —                    | Callback invoked when `maxQueueSize` is reached. [Learn more →](max-queue-size.md)                                      |
| `onNetworkStatusChange` | `(offline: boolean) => void` | —                    | Callback invoked when the network status changes (online/offline). [Learn more →](network-status.md)                    |
| `logLevel`              | `LogLevel`                   | `LogLevel.NONE`      | Log verbosity: from no logging at all to a full trace. [Learn more →](logging.md)                                       |
| `language`              | `LogLanguage`                | `LogLanguage.EN`     | Language of the log messages. [Learn more →](logging.md)                                                                |
| `retry`                 | `IRetryConfig`               | —                    | Settings for automatic retries on temporary errors. [Learn more →](retry.md)                                            |
| `appShellCache`         | `{ enabled: boolean }`       | `{ enabled: false }` | Caches application files via a Service Worker so the app can open without a network. [Learn more →](app-shell-cache.md) |

## App Shell Cache

The `appShellCache` option makes sure the application **opens after a page reload without an internet connection**. A Service Worker stores the application files (HTML, JavaScript, CSS, fonts, images) in the browser's `Cache Storage` and serves them when the network is unavailable.

```typescript
provideOfflineSync({
  appShellCache: {
    enabled: true,
  },
})
```

> App Shell Cache does not replace the offline queue: it is responsible for loading the app itself, while the queue is responsible for sending `POST`, `PUT`, `PATCH`, and `DELETE` requests. [Learn more → App Shell Cache](app-shell-cache.md)

## Per-request priority

In addition to the global `provideOfflineSync()` options, the library lets you set a priority **for a specific request** — which operations should be synchronized before the others.

The priority is not set through `provideOfflineSync()`; it is set per request using `HttpContext`:

```typescript
const context = new HttpContext().set(
  OFFLINE_SYNC_PRIORITY,
  QueuePriority.HIGH,
);

this.http.post('/api/orders', order, {
  context,
});
```

Three levels are available: `HIGH`, `NORMAL` (default), and `LOW`. [Learn more → Priority Queue](priority-queue.md)
