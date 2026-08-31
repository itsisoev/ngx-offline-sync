# batchSize

**[← Back to configuration](index.md)**

**Documentation:** English · [Deutsch](../../../de/guides/configuration/batch-size.md) · [Русский](../../../ru/guides/configuration/batch-size.md)

| Type     | Default |
|----------|---------|
| `number` | `1`     |

```typescript
provideOfflineSync({
  batchSize: 10,
})
```

## Why this option exists

By default, the library processes the queue **sequentially** — one request at a time: the next request is only sent once the previous one finishes (either successfully or with an error).

This is safe, but it can be slow if the user was offline for a while and a lot of requests piled up in the queue.

`batchSize` sets the maximum number of requests the library processes in parallel within a single batch.

## How it works

**`batchSize: 1` (default)** — requests are executed strictly one after another:

```
PENDING [1] [2] [3] [4] [5]
             ↓
          SYNCING [1] → COMPLETED [1]
             ↓
          SYNCING [2] → COMPLETED [2]
             ↓
             ...
```

**`batchSize: 3`** — the queue is split into batches of 3 items; requests within a batch run in parallel:

```
PENDING [1] [2] [3] [4] [5]
             ↓
     SYNCING [1] [2] [3]   (in parallel)
             ↓
   COMPLETED [1] [2] [3]
             ↓
     SYNCING [4] [5]
             ↓
   COMPLETED [4] [5]
```

The next batch only starts once the current one finishes.

## When to increase it

- The queue regularly builds up a lot of requests (e.g. the app is used heavily offline — warehouse, field work, transit).
- The backend can handle parallel requests from a single client without hitting rate limits.
- Requests are independent of each other, and execution order doesn't matter.

## When to keep the default (`1`)

- Requests depend on each other's order (e.g. creating an entity, then updating it).
- The API has strict limits on the number of concurrent requests.
- Guaranteed sequential execution matters (e.g. financial operations).

## Example

```typescript
provideOfflineSync({
  batchSize: 5
});
```

When the connection is restored, a queue of 20 requests forms 4 batches of 5. Batches are processed sequentially — one at a time — with requests inside each batch running in parallel.

> ⚠️ Increasing `batchSize` speeds up synchronization, but it also increases load on the server the moment the connection is restored. Pick a value that fits what your backend can handle.

## See also

- [Architecture](../architecture.md) — `SyncService` and where `batchSize` is applied
- [Request statuses](../statuses.md) — how to track a batch's progress
