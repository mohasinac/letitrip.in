# Plan: Local Stress Test with Vercel Hobby Limits

## Context

We want to empirically discover where the local dev server (running with Vercel Hobby parity caps) breaks under concurrent load — before anything hits prod. The script doubles concurrency each level (1→2→4→8→16→32) and reports latency percentiles, error rate, timeouts, and heap memory so we can see exactly which Hobby ceiling we hit first (10 s sync timeout vs 2048 MB heap vs Firestore connection saturation).

## Approach

**Target server**: `npm run dev` → `scripts/dev-light.mjs` → `next build + next start`
- Production server, ~500 MB heap (vs ~3.5 GB hot-reload)
- Pre-compiled routes — no webpack overhead per request
- Closest local analog to Vercel prod runtime behavior
- Stress-test process runs alongside it comfortably within the 2048 MB Hobby cap

The Hobby timeout limit (10 s) is NOT injected into `next start` by `dev-light.mjs` — so the stress-test script hardcodes the `AbortController` timer at `STRESS_TIMEOUT_MS` (default 10 000 ms, overridable via `--timeout`) independent of any server env var.

**New file**: `scripts/stress-test.mjs`

Pattern follows `scripts/probe-dev-heap-cap.mjs` and `scripts/prewarm.mjs` — zero new dependencies, native Node 22 `fetch` + `AbortController`.

### Concurrency model

At each level `c`, spawn `c` async worker coroutines that each fire requests back-to-back (no idle gap) for `DURATION_S` seconds. `Promise.all` the workers. This gives true concurrent in-flight requests without needing a library.

```
Level 1x:  [worker]
Level 2x:  [worker][worker]
Level 4x:  [worker][worker][worker][worker]
...
```

### Endpoints tested (safe read-only, no side effects, no third-party calls)

| Endpoint | Why safe |
|---|---|
| `/api/products?pageSize=20` | Firestore list, no writes |
| `/api/categories` | Firestore list, cached-friendly |
| `/api/brands` | Firestore list |
| `/api/faqs?pageSize=20` | Firestore list |

Endpoints rotate round-robin across workers so no single route is the bottleneck by accident.

### Per-level metrics collected

- **req/s** — total requests / duration
- **p50 / p95 / p99 latency** (ms)
- **errors** — non-2xx responses
- **timeouts** — requests aborted after `VERCEL_FUNCTION_TIMEOUT_S` (10 s default)
- **peak heap** — `process.memoryUsage().heapUsed` sampled every 500 ms

### Ceiling detection (auto-stop)

Stop and report ceiling reached when **any** of:
- `p99 > 9000 ms` (90% of the 10 s Hobby sync limit)
- `timeouts > 0`
- `errorRate > 5%`

### CLI flags

```
node scripts/stress-test.mjs [options]
  --url=http://localhost:3000    base URL (default: localhost:3000)
  --endpoints=/api/a,/api/b     override endpoint list
  --start=1                     starting concurrency (default: 1)
  --max=32                      max concurrency (default: 32)
  --duration=10                 seconds per level (default: 10)
  --json                        emit machine-readable JSON summary
```

The timeout ceiling is read from `VERCEL_FUNCTION_TIMEOUT_S` env var (already injected by `dev-next.mjs` when `VERCEL_HOBBY_TIER=1`) so it automatically matches the active parity config.

### Output (ASCII table)

```
Concurrency  Req/s   p50    p95    p99    Errors  Timeouts  Heap (MB)
1x           42.3    210ms  380ms  490ms  0       0         187
2x           78.1    230ms  420ms  610ms  0       0         203
4x           120.4   290ms  590ms  880ms  0       0         241
8x           134.2   510ms  3200ms 9100ms 0       0         389  ⚠ p99 > 9s — ceiling hit
```

### npm script wiring

Add to `package.json`:
```json
"stress-test": "node scripts/stress-test.mjs"
```

Usage:
```
npm run dev             # (in one terminal — build+serve with Hobby parity)
npm run stress-test     # (in another terminal)
npm run stress-test -- --url=https://letitrip.in --json   # against prod
```

## Files to create / modify

| File | Action |
|---|---|
| `scripts/stress-test.mjs` | **Create** — main script |
| `package.json` | **Edit** — add `"stress-test"` script alias |

No appkit changes. No new npm dependencies.

## Reused patterns

- `scripts/probe-dev-heap-cap.mjs` — heap sampling + fetch loop structure
- `scripts/prewarm.mjs` — port-ready polling, console status output style
- `VERCEL_FUNCTION_TIMEOUT_S` env var (already set by `dev-next.mjs`)

## Verification

1. Start prod build server: `npm run dev` (waits for "Ready" — first run ~60–120 s, subsequent ~15–45 s)
2. In a second terminal: `npm run stress-test`
3. Confirm output table appears with increasing concurrency rows
4. Confirm script auto-stops when ceiling is detected and prints which limit was hit
5. Quick smoke-check (no full server needed): `npm run stress-test -- --max=1 --duration=3`
6. Against prod (careful — burns invocation quota): `npm run stress-test -- --url=https://letitrip.in --max=8`
