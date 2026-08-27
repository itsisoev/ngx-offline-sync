# Configuration

**[← Back to overview](../../../../README.md)**

**Documentation:** English · [Русский](../../../ru/guides/configuration/index.md) · [日本語]()

`provideOfflineSync()` accepts an optional configuration object that controls queue and synchronization behavior.

```ts
provideOfflineSync({
  batchSize: 10
})
```

## Available options

| Option | Type | Default | Description |
|---|---|---|---|
| `batchSize` | `number` | `1` | Number of queued requests processed in parallel during sync. [Learn more →](batch-size.md) |

More options will be added here as the library grows — for example, retry strategies and request priority (see [Roadmap](../roadmap.md)). Each option gets its own file to keep things easy to find and maintain.

## Next

- [batchSize](batch-size.md) — parallel queue processing
- [Architecture](../architecture.md) — where configuration is applied in the pipeline
