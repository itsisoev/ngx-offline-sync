# Request statuses

**[← Back to overview](../../../README.md)**

**Documentation:** English · [Deutsch](../../de/guides/statuses.md) · [Русский](../../ru/guides/statuses.md)

Each request in the queue has one of the following statuses:

| Status | Description |
|---|---|
| `PENDING` | The request is waiting to be executed |
| `SYNCING` | The request is being executed |
| `COMPLETED` | The request was executed successfully |
| `FAILED` | The request could not be executed |

## Basic lifecycle

```
PENDING → SYNCING → COMPLETED
```

A request enters the queue (`PENDING`), then starts executing (`SYNCING`), and on success gets the final `COMPLETED` status.

## On error

```
SYNCING → RetryPolicy → PENDING → Retry
```

If a request fails, `RetryPolicy` decides whether it should be retried — see [Retries](retries.md).

## If the request should no longer be retried

```
SYNCING → FAILED
```

When `RetryPolicy` decides further attempts are pointless (e.g. the retry limit is exceeded), the request moves to `FAILED` and stays there.

## Next

- [Retries](retries.md) — a closer look at how the retry decision is made
