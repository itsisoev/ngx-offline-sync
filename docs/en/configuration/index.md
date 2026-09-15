# Configuration

**[← Back to table of contents](../../../README.md)**

**Documentation:** [Russian](../../ru/configuration/index.md) · English

`provideOfflineSync()` accepts an optional configuration object that lets you customize the behavior of the queue, synchronization, and logging.

```typescript
provideOfflineSync({
  batchSize: 10,
  maxQueueSize: 500,
  logLevel: LogLevel.ALL,
  language: LogLanguage.RU,

  onQueueFull: () => {
    // show toast
  },

  onNetworkStatusChange: (offline) => {
    // show / hide offline indicator
  },
})
```

## Available options

| Option                  | Type                         | Default          | Description                                                                                                   |
|-------------------------|------------------------------|------------------|---------------------------------------------------------------------------------------------------------------|
| `batchSize`             | `number`                     | `1`              | Number of requests from the queue processed in parallel during synchronization. [Learn more →](batch-size.md) |
| `maxQueueSize`          | `number`                     | `150`            | Maximum number of requests that can be stored in the offline queue. [Learn more →](max-queue-size.md)         |
| `onQueueFull`           | `() => void`                 | —                | Callback invoked when `maxQueueSize` is reached. [Learn more →](max-queue-size.md)                            |
| `onNetworkStatusChange` | `(offline: boolean) => void` | —                | Callback invoked when the network status changes (online/offline). [Learn more →](network-status.md)          |
| `logLevel`              | `LogLevel`                   | `LogLevel.NONE`  | Log verbosity level: from no logging at all to a full trace. [Learn more →](logging.md)                       |
| `language`              | `LogLanguage`                | `LogLanguage.EN` | Language used for log messages. [Learn more →](logging.md)                                                    |
| `retry`                 | `IRetryConfig`               | —                | Automatic retry settings for transient errors. [Learn more →](retry.md)                                       |

## Per-request priority

Besides the global `provideOfflineSync()` options, the library lets you set a priority **for an individual request** — which operations should be synced before the others.

Priority isn't set through `provideOfflineSync()`; it's set per-request, using `HttpContext`:

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
