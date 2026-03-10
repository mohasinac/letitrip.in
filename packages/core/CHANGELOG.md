# @lir/core — Changelog

## [0.1.0] — 2026-01-01 — Initial extraction

### Added

- **`Logger`** — Singleton logger with configurable log levels (`debug|info|warn|error`), console output, localStorage storage, and optional file logging via HTTP POST. `enableFileLogging: true` is a backward-compat alias for `logFileUrl: "/api/logs/write"`.
- **`Queue`** — Generic FIFO queue with configurable max size. `enqueue`, `dequeue`, `peek`, `clear`, `size`, and `toArray` methods.
- **`StorageManager`** — Per-prefix `localStorage`/`sessionStorage` manager. `get`, `set`, `remove`, `clear`, `has`, `keys`, `size`, `isAvailable`, `getAll` methods. `storageManager` singleton (empty prefix) exported for convenience.
- **`EventBus`** — Singleton pub/sub event bus. `on`, `once`, `off`, `emit`, `removeAllListeners`, `listenerCount`, `eventNames`, `hasListeners` methods. `eventBus` singleton exported.
- **`CacheManager`** — TTL-based in-memory cache with configurable max size (LRU eviction on overflow). `get`, `set`, `has`, `delete`, `clear`, `size`, `keys`, `cleanExpired`, `getStats` methods. `cacheManager` singleton exported.
- **Exports**: All classes, singletons, and types re-exported from `index.ts`.
