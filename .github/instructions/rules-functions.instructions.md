---
applyTo: "functions/**"
description: "Scheduled jobs, Firestore triggers, Functions repository layer, boundary rules. Rule 35."
---

# Firebase Functions Rules

## RULE 35: Scheduled Jobs & Triggers → `functions/src/`

Scheduled jobs, Firestore triggers, long-running privileged tasks MUST live in `functions/src/`. NEVER in Next.js API routes.

### What Goes Where

| Use-case                                        | Location                                              |
| ----------------------------------------------- | ----------------------------------------------------- |
| Scheduled / cron jobs                           | `functions/src/jobs/<name>.ts`                        |
| Firestore onCreate/onUpdate/onDelete            | `functions/src/triggers/<name>.ts`                    |
| Realtime DB triggers                            | `functions/src/triggers/<name>.ts`                    |
| Long-running batch (>30s)                       | `functions/src/jobs/<name>.ts`                        |
| Privileged backend work (payouts, audit sweeps) | `functions/src/jobs/<name>.ts`                        |
| Cloud Pub/Sub consumers                         | `functions/src/jobs/<name>.ts` (`onMessagePublished`) |
| Cloud Tasks handlers                            | `functions/src/jobs/<name>.ts` (`onTaskDispatched`)   |

Next.js API routes are for **user-initiated, request-driven** operations only.

### Scheduled Job Pattern

```typescript
// functions/src/jobs/myJob.ts
import { onSchedule } from "firebase-functions/v2/scheduler";
import { SCHEDULES, REGION } from "../config/constants";

export const myJob = onSchedule(
  {
    schedule: SCHEDULES.MY_JOB,
    region: REGION,
    memory: "256MiB",
    maxInstances: 1,
    timeoutSeconds: 540,
  },
  async () => {
    // use ../repositories — NEVER call Next.js API routes
  },
);
```

Export from `functions/src/index.ts` and update the dispatch table comment at the top of that file.

### Firestore Trigger Pattern

```typescript
// functions/src/triggers/onOrderStatusChange.ts
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { REGION, COLLECTIONS } from "../config/constants";

export const onOrderStatusChange = onDocumentUpdated(
  { document: `${COLLECTIONS.ORDERS}/{orderId}`, region: REGION },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (before?.status === after?.status) return;
    // side-effects: notifications, counters, payouts...
  },
);
```

### Boundary Rules

NEVER import from `functions/src/` into Next.js app or vice versa.  
NEVER call a Next.js API route from inside a Function — use `../repositories` directly.  
Shared types only: `src/types/` imported by Functions as dev dependencies.

### Scheduling Constants

NEVER hardcode cron expressions. Use `SCHEDULES` in `functions/src/config/constants.ts`.

```typescript
// ❌  onSchedule({ schedule: 'every 15 minutes' })
// ✅
import { SCHEDULES } from "../config/constants";
onSchedule({ schedule: SCHEDULES.AUCTION_SETTLEMENT });
```

### Deployment

```powershell
.\scripts\deploy-functions.ps1          # all functions
firebase deploy --only functions        # CLI alternative
firebase deploy --only functions:myJob  # single function
```
