# Max Queue Size

**[← Back to Configuration](index.md)**

> Offline queue size limit and safe handling of concurrent requests

**Documentation:** English · [Русский](../../ru/configuration/max-queue-size.md)

---

The library limits the maximum number of requests that can be stored in the offline queue.

`maxQueueSize` helps prevent uncontrolled growth of the queue and IndexedDB if the application remains offline for a long time.

---

## How the Limit Works

The option is configured through `provideOfflineSync()`:

```ts
provideOfflineSync({
  maxQueueSize: 500,
})
