# Configuration

**[← Back to table of contents](../README.md)**

**Documentation:** English · [Deutsch](../../de/configuration/index.md) · [Русский](../../ru/configuration/index.md)

`provideOfflineSync()` accepts an optional configuration object that lets you customize the behavior of the queue, synchronization, and logging.

```typescript
provideOfflineSync({
  batchSize: 10,
  logLevel: LogLevel.ALL,
  language: LogLanguage.EN,
})
```

## Available options

| Option      | Type          | Default          | Description                                                                                               |
|-------------|---------------|------------------|-----------------------------------------------------------------------------------------------------------|
| `batchSize` | `number`      | `1`              | The number of queued requests processed in parallel during synchronization. [Learn more →](batch-size.md) |
| `logLevel`  | `LogLevel`    | `LogLevel.NONE`  | The verbosity of logging: from no logging at all to a full trace. [Learn more →](logging.md)              |
| `language`  | `LogLanguage` | `LogLanguage.EN` | The language used for log messages.  [Learn more →](logging.md)                                           |

## Per-request priority

In addition to the global `provideOfflineSync()` options, the library lets you set a priority **for an individual request** — which operations should be synchronized before others.

Priority isn't set through `provideOfflineSync()`; instead, it's set on a per-request basis using `HttpContext`:

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
