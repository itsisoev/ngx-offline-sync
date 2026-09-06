# Retry Policy

**[← Back to configuration](index.md)**

> Automatic retries for temporary errors

**Documentation:** English · [Русский](../../ru/configuration/retry.md)

---

The library automatically retries requests that failed with a temporary error.

Retry helps ride out temporary network or server issues without the need to resend the request manually.

---

## How Retry works

For every request, the library tracks the number of attempts and calculates the delay before the next attempt.

By default, **linear delay** is used:

```text
Attempt 1 → 5 seconds
Attempt 2 → 10 seconds
Attempt 3 → request finally fails
```

The delay is calculated using the formula:

```text
delay = baseDelay × attempt
```

For example, with the default configuration (`baseDelay = 5000 ms`):

```text
attempt 1 → 5000 ms
attempt 2 → 10000 ms
```

Once the maximum number of attempts is reached, the request is removed from the queue.

---

## Configuration

Retry can be configured via `provideOfflineSync()`:

```ts
provideOfflineSync({
  retry: {
    maxAttempts: 5,
    delay: 3000,
  },
})
```

## Available options

| Option        | Type     | Default | Description                                        |
|---------------|----------|---------|----------------------------------------------------|
| `maxAttempts` | `number` | `3`     | Maximum number of attempts to send the request     |
| `delay`       | `number` | `5000`  | Base delay between retry attempts, in milliseconds |

**Example:**

```ts
provideOfflineSync({
  retry: {
    maxAttempts: 5,
    delay: 3000,
  },
})
```

produces the following sequence:

```text
Attempt 1 → error → 3 seconds
Attempt 2 → error → 6 seconds
Attempt 3 → error → 9 seconds
Attempt 4 → error → 12 seconds
Attempt 5 → error → final error
```

---

## Which errors are retried

Retry applies to errors that may be temporary. In particular:

- network errors;
- 5xx server errors.

> Client errors, such as `401` or `404`, are **not** retried automatically.

---

## Storing Retry in the queue

When an error occurs, the request stays in the queue with the status `PENDING`.

The library stores:

```json
{
  "attempts": 1,
  "nextRetryAt": 1750000000000
}
```

`nextRetryAt` determines the moment when the request can be processed again.

After the current sync finishes, the library automatically schedules the next attempt.

The user doesn't need to refresh the page or resend the request manually.

---

## Successful sync

If a retry attempt succeeds, the request is removed from the queue:

```text
PENDING
   ↓
SYNCING
   ↓
SUCCESS
   ↓
removed from queue
```

---

## Final error

If the request could not be completed after all allowed attempts, it is removed from the queue:

```text
PENDING
   ↓
RETRY
   ↓
RETRY
   ↓
FAILED
   ↓
removed from queue
```

`SyncResult.FAILED` is then used for sync statistics.

---

## Full configuration

Retry can be used together with the other settings:

```ts
provideOfflineSync({
  batchSize: 10,
  logLevel: LogLevel.ALL,
  language: LogLanguage.EN,

  retry: {
    maxAttempts: 3,
    delay: 5000,
  },
})
```
