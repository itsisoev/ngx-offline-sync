# Usage

**[← Back to overview](../../../README.md)**

**Documentation:** English · [German](../../de/guides/usage.md) · [Русский](../../ru/guides/usage.md) · [日本語]()


Once set up, the library doesn't require any special API for sending requests. Just use the regular `HttpClient`:

```typescript
this.http.post('/api/products', product).subscribe();
```

- If an internet connection is available, the request is sent as usual.
- If the connection is unavailable, the request is automatically added to the queue.

No extra wrapper, dedicated service, or manual queue management is required — `offlineSyncInterceptor` intercepts the request before it hits the network and decides what to do with it.

## Supported methods

The library only queues methods that mutate data on the server:

- `POST`
- `PUT`
- `PATCH`
- `DELETE`

`GET` requests are never saved to the queue — see [Limitations](limitations.md) for details.

## Next

- [How it works](how-it-works.md) — what happens to a request inside the library
- [Request statuses](statuses.md) — how to track a request's state
