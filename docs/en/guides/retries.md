# Retries

**[← Back to overview](../../../README.md)**

**Documentation:** English · [Deutsch](../../de/guides/retries.md) · [Русский](../../ru/guides/retries.md)

If synchronization fails, the library passes the error to the `RetryPolicy`.

The policy determines:

- whether the request should be retried;
- the delay before the next attempt;
- when the request should be marked as `FAILED`.

## Lifecycle on error

```
SYNCING → Request failed → RetryPolicy → PENDING → Retry
```

After a failed execution, the request goes back to `PENDING` and waits for the next sync attempt.

## After a successful attempt

```
PENDING → SYNCING → COMPLETED
```

## If attempts are exhausted

```
SYNCING → Request failed → FAILED
```

Once the number of attempts exceeds the allowed limit, the request permanently moves to `FAILED` and no longer takes part in synchronization.

## Next

- [Request statuses](statuses.md) — the full status transition diagram
- [Roadmap](roadmap.md) — configurable retry strategies are already on the roadmap
