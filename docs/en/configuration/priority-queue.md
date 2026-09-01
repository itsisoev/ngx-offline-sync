# Priority Queue

**[← Back to table of contents](index.md)**

**Documentation:** English · [Deutsch](../../de/configuration/index.md) · [Русский](../../ru/configuration/index.md)

When the application is offline, requests are stored in a local queue and synchronized after the connection is restored.

However, not all requests are equally important.

Imagine an e-commerce application. While the user is offline, different actions may occur:

* updating the user's profile;
* adding a product to the cart;
* placing an order;
* sending analytics data.

If all requests have the same priority, they will be processed in queue order. But some operations are more important than others — for example, placing an order should usually be synchronized before sending analytics data.

**Priority Queue** allows you to define how important a particular request is.

## Priority levels

Three priority levels are available:

* `HIGH` — processed first.
* `NORMAL` — the default priority.
* `LOW` — processed after requests with `HIGH` and `NORMAL` priority.

## Example

Imagine an e-commerce application where the user is offline.

The user performs the following actions:

```text
1. Send analytics event          → LOW
2. Update profile                → NORMAL
3. Place an order                → HIGH
4. Send another analytics event  → LOW
5. Update cart                   → HIGH
```

The requests are added to the queue in this order:

```text
LOW
NORMAL
HIGH
LOW
HIGH
```

After the connection is restored, the queue processes them according to their priority:

```text
HIGH
HIGH
NORMAL
LOW
LOW
```

Requests with the same priority preserve their original queue order.

## Setting request priority

You can set the priority of an HTTP request using Angular's `HttpContext`:

```typescript
const context = new HttpContext().set(
  OFFLINE_SYNC_PRIORITY,
  QueuePriority.HIGH,
);

this.http.post('/api/orders', order, {
  context,
});
```

In this example, the order request receives `HIGH` priority and will be processed before requests with `NORMAL` or `LOW` priority.

## Default priority

If no priority is specified, the request automatically receives `QueuePriority.NORMAL`:

```typescript
this.http.post('/api/profile', profile);
```

This is equivalent to:

```typescript
const context = new HttpContext().set(
  OFFLINE_SYNC_PRIORITY,
  QueuePriority.NORMAL,
);

this.http.post('/api/profile', profile, {
  context,
});
```

## Available priorities

| Priority               | Description                                                |
|------------------------|------------------------------------------------------------|
| `QueuePriority.HIGH`   | Processed before requests with `NORMAL` and `LOW` priority |
| `QueuePriority.NORMAL` | Default priority                                           |
| `QueuePriority.LOW`    | Processed after requests with `HIGH` and `NORMAL` priority |

Priority Queue is useful when an application has different types of offline operations and some requests need to be synchronized before others.
