# `@lir/core` Package

**Package:** `packages/core/`  
**Alias:** `@lir/core`  
**Purpose:** Pure TypeScript utility classes (no framework dependencies) for logging, async task queuing, persistence, pub/sub events, and TTL caching.

All classes export both a class constructor and a pre-instantiated singleton for convenience.

---

## Logger

**File:** `packages/core/src/Logger.ts`

Structured logging with severity levels, metadata support, and pluggable output handlers.

### Types

```ts
type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string; // module/component name
  data?: Record<string, unknown>;
  error?: Error;
}

interface LoggerOptions {
  level?: LogLevel; // minimum level to emit (default: "info")
  context?: string; // default context label
  handlers?: LogHandler[]; // output destinations
}
```

### Usage

```ts
import { logger } from "@lir/core"; // pre-instantiated singleton

// Basic
logger.info("Product fetched", { productId });
logger.error("Payment failed", { orderId, error });

// With context
const log = logger.createChild("CartService");
log.debug("Item added", { itemId });

// Custom instance
import { Logger } from "@lir/core";
const log = new Logger({ level: "debug", context: "MyModule" });
```

### Key Methods

| Method                          | Description                                                           |
| ------------------------------- | --------------------------------------------------------------------- |
| `debug(message, data?)`         | Debug-level entry                                                     |
| `info(message, data?)`          | Informational entry                                                   |
| `warn(message, data?)`          | Warning entry                                                         |
| `error(message, data?, error?)` | Error entry                                                           |
| `fatal(message, data?, error?)` | Fatal error                                                           |
| `createChild(context)`          | Returns a new Logger inheriting parent settings with override context |
| `addHandler(handler)`           | Add custom output handler (e.g. Sentry transport)                     |
| `setLevel(level)`               | Update minimum log level at runtime                                   |

**Client code** imports the `logger` singleton from `src/classes/logger.ts` (which re-exports `@lir/core`).  
**API routes** use `serverLogger` from `src/lib/serverLogger.ts`.

---

## Queue

**File:** `packages/core/src/Queue.ts`

Generic async task queue with configurable concurrency — prevents overwhelming external APIs with parallel requests.

### Types

```ts
interface QueueOptions {
  concurrency?: number; // max parallel tasks (default: 1)
  timeout?: number; // task timeout ms (default: none)
  onError?: (error: Error, task: Task<unknown>) => void;
}

interface Task<T> {
  id: string;
  fn: () => Promise<T>;
  priority?: number; // higher = runs first (default: 0)
}
```

### Usage

```ts
import { Queue } from "@lir/core";

const uploadQueue = new Queue<string>({ concurrency: 3 });

const taskId = uploadQueue.enqueue({
  id: "upload-123",
  fn: () => uploadFile(file),
  priority: 1,
});

uploadQueue.on("complete", ({ id, result }) => console.log(result));
uploadQueue.on("error", ({ id, error }) => console.error(error));

await uploadQueue.drain(); // wait for all tasks
```

### Key Methods

| Method                 | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `enqueue(task)`        | Add task to queue, returns task id               |
| `cancel(taskId)`       | Remove pending task                              |
| `drain()`              | Promise resolves when queue empties              |
| `pause()` / `resume()` | Pause/resume processing                          |
| `size`                 | Number of pending tasks                          |
| `running`              | Number of currently executing tasks              |
| `on(event, handler)`   | Subscribe to `complete`, `error`, `drain` events |

---

## StorageManager

**File:** `packages/core/src/StorageManager.ts`

Unified interface over `localStorage` and `sessionStorage` with JSON serialization, namespacing, and TTL support.

### Types

```ts
type StorageType = "local" | "session";

interface StorageOptions {
  type?: StorageType; // default: "local"
  namespace?: string; // key prefix (default: "lir")
  ttl?: number; // TTL in seconds (default: none)
}
```

### Usage

```ts
import { storageManager } from "@lir/core"; // singleton

storageManager.set("cart", cartData, { ttl: 3600 });
const cart = storageManager.get<CartData>("cart");
storageManager.remove("cart");

// Custom instance
import { StorageManager } from "@lir/core";
const ss = new StorageManager({ type: "session", namespace: "checkout" });
ss.set("step", 2);
```

### Key Methods

| Method                      | Description                                              |
| --------------------------- | -------------------------------------------------------- |
| `set(key, value, options?)` | Persist serialized value                                 |
| `get<T>(key)`               | Read and deserialize (returns `null` if missing/expired) |
| `remove(key)`               | Delete entry                                             |
| `clear(namespace?)`         | Clear all entries (optionally scoped to namespace)       |
| `has(key)`                  | Boolean existence check (respects TTL)                   |
| `keys(namespace?)`          | List all keys                                            |

---

## EventBus

**File:** `packages/core/src/EventBus.ts`

Type-safe pub/sub event bus for decoupling modules without prop drilling or context.

### Types

```ts
interface EventSubscription {
  unsubscribe: () => void;
}
```

### Usage

```ts
import { eventBus } from "@lir/core"; // singleton

// Subscribe
const sub = eventBus.on("cart:updated", (cart) => {
  updateCartCount(cart.itemCount);
});

// Publish
eventBus.emit("cart:updated", { itemCount: 3 });

// One-time subscription
eventBus.once("checkout:complete", (order) => showConfirmation(order));

// Clean up
sub.unsubscribe();
// or
eventBus.off("cart:updated", handler);
```

### Key Methods

| Method                 | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `on(event, handler)`   | Subscribe, returns `EventSubscription`              |
| `once(event, handler)` | Subscribe for a single emission                     |
| `off(event, handler)`  | Remove specific subscription                        |
| `emit(event, data)`    | Publish event to all subscribers                    |
| `clear(event?)`        | Remove all subscriptions (optionally for one event) |

---

## CacheManager

**File:** `packages/core/src/CacheManager.ts`

In-memory TTL + LRU cache for client-side request deduplication and expensive computation results.

### Types

```ts
interface CacheOptions {
  ttl?: number; // entry TTL in seconds (default: 300)
  maxSize?: number; // max entries (LRU eviction, default: 100)
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}
```

### Usage

```ts
import { cacheManager } from "@lir/core"; // singleton

// Set with default TTL
cacheManager.set("product:123", productData);

// Set with custom TTL
cacheManager.set("search:query", results, { ttl: 30 });

// Get (returns null if missing/expired)
const product = cacheManager.get<Product>("product:123");

// Get or fetch
const data = await cacheManager.getOrSet("key", () => fetchData(), { ttl: 60 });
```

### Key Methods

| Method                           | Description                              |
| -------------------------------- | ---------------------------------------- |
| `set(key, value, options?)`      | Add/replace cache entry                  |
| `get<T>(key)`                    | Retrieve value (null if expired/missing) |
| `getOrSet<T>(key, fn, options?)` | Fetch and cache if missing               |
| `delete(key)`                    | Remove entry                             |
| `clear()`                        | Flush all entries                        |
| `has(key)`                       | Check existence (respects TTL)           |
| `size`                           | Current entry count                      |
| `stats()`                        | Hit rate and memory usage stats          |
