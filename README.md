# ngx-offline-sync

<div>
  <img src="https://img.shields.io/npm/dt/ngx-offline-sync"  alt="npm"/>
  <a href="https://www.npmjs.com/package/ngx-offline-sync">
    <img src="https://img.shields.io/badge/npm-ngx--offline--sync-CB3837?logo=npm&logoColor=white" alt="npm package" />
  </a>
  <img src="https://img.shields.io/github/stars/itsisoev/ngx-offline-sync"  alt="github"/>
</div>

An Angular library that automatically saves HTTP requests when there is no internet connection and synchronizes them once the connection is restored.

**Documentation:** English · [Русский](docs/ru/README.md) · [日本語](docs/ja/README.md)

## Documentation

- [Setup](docs/en/guides/setup.md) — installation and provider registration
- [Usage](docs/en/guides/usage.md) — sending requests via `HttpClient`
- [How it works](docs/en/guides/how-it-works.md) — the request lifecycle online / offline / after reconnect
- [Configuration](docs/en/guides/configuration/index.md) — all `provideOfflineSync()` options
  - [batchSize](docs/en/guides/configuration/batch-size.md) — parallel queue processing
- [Request statuses](docs/en/guides/statuses.md) — the `PENDING → SYNCING → COMPLETED / FAILED` lifecycle
- [Retries](docs/en/guides/retries.md) — how `RetryPolicy` works
- [Architecture](docs/en/guides/architecture.md) — internal services and how they interact
- [Roadmap](docs/en/guides/roadmap.md) — what's next
- [Limitations](docs/en/guides/limitations.md) — what to know before using the library

## License

See [LICENSE](LICENSE).
