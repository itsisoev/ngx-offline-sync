# Configuration

**[← Back to overview](../../../../README.md)**

**Documentation:** English · [Русский](../../../ru/guides/configuration/index.md) · [日本語]()

`provideOfflineSync()` accepts an optional configuration object that controls queue, synchronization, and logging behavior.

```ts
provideOfflineSync({
  batchSize: 10,
  logLevel: LogLevel.ALL,
  language: LogLanguage.RU,
})
```

## Available options

| Option      | Type          | Default          | Description                                                                                |
|-------------|---------------|------------------|--------------------------------------------------------------------------------------------|
| `batchSize` | `number`      | `1`              | Number of queued requests processed in parallel during sync. [Learn more →](batch-size.md) |
| `logLevel`  | `LogLevel`    | `LogLevel.NONE`  | Verbosity of logging, from fully disabled to a full trace. [Learn more →](logging.md)      |
| `language`  | `LogLanguage` | `LogLanguage.EN` | Language of the log messages. [Learn more →](logging.md)                                   |

More options will be added here as the library grows — for example, retry strategies and request priority (see [Roadmap](../roadmap.md)). Each option gets its own file to keep things easy to find and maintain.

## Next

- [batchSize](batch-size.md) — parallel queue processing
- [logLevel and language](logging.md) — logging configuration
- [Architecture](../architecture.md) — where configuration is applied in the pipeline
