# Plan: Fix all hard-fatal RTDB failures + missing Firestore index

## Context

Firebase Realtime Database (RTDB) is unavailable — the instance at `https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app` is likely not provisioned or unreachable. Three API routes depend on RTDB without try/catch guards and fail hard (500/503) when RTDB is unavailable, blocking **seed data**, **Google OAuth login**, and **Razorpay payments**. A fourth Firestore composite index is missing and will throw `FAILED_PRECONDITION` when a buyer tries to make a second offer on the same product.

This plan makes all three hard-fatal RTDB routes gracefully degrade, updates the SeedPanel to proceed without RTDB, and adds the missing offers index.

---

## What is already non-fatal (no fix needed)

| Route / Feature | How RTDB failure is already handled |
|---|---|
| `POST /api/auth/event/init` | try/catch, returns `rtdbEnabled: false` |
| `GET /api/auth/google/callback` | inner try/catch on both read and write, proceeds |
| `POST /api/payment/webhook` | fire-and-forget `.catch()`, webhook always ACKs Razorpay |
| `verifyAndPlaceRazorpayOrderAction` | explicit `.catch()` on RTDB signal |
| `POST /api/chat` | try/catch, chat room created regardless |
| `placeBid` (auction) | try/catch on RTDB push, bid committed to Firestore |
| `pingConversationRtdb` | fully wrapped, swallowed |
| `GET /api/realtime/bids/[id]` | RTDB `.on()` error callback sends "error" SSE event — stream degrades cleanly |
| Cloud Function jobs | per-step try/catch, Firestore writes are primary |

---

## Changes — 5 files

---

### 1. `src/app/api/demo/seed/event/init/route.ts`

**Lines 54–63** — replace the catch block:

**Before:**
```ts
} catch (rtdbErr) {
  void normalizeError(rtdbErr);
  serverLogger.error("RTDB unavailable — seed event node not created", { runId, rtdbErr });
  return NextResponse.json(
    { success: false, message: "Realtime channel unavailable." },
    { status: 503 },
  );
}
```

**After:**
```ts
} catch (rtdbErr) {
  void normalizeError(rtdbErr);
  serverLogger.warn("RTDB unavailable — seed will run without live progress updates", { runId, rtdbErr });
  return NextResponse.json({
    success: true,
    data: { runId: null, customToken: null, expiresAt: null },
  });
}
```

Returns degraded success with `runId: null` — the SeedPanel uses `runId: null` to skip RTDB and still run the seed.

---

### 2. `src/components/dev/SeedPanel.tsx` — `run()` function (lines 2249–2291)

Replace the current steps 1–3 of the non-dryRun branch with:

```ts
// 1. Mint a per-run RTDB token (may return runId:null when RTDB is unavailable).
const initRes = await fetch(API_ROUTES.DEMO.SEED_EVENT_INIT, { method: "POST" });
const initData = await initRes.json().catch(() => ({ success: false }));
if (!initRes.ok || !initData?.success) {
  const msg = initData?.message ?? "Failed to initialise seed channel";
  setColRunStates(Object.fromEntries(queue.map((c) => [c, "error" as ColRunState])));
  setColErrors(Object.fromEntries(queue.map((c) => [c, msg])));
  return;
}
const { runId, customToken } = initData.data as { runId: string | null; customToken: string | null };

// 2. Authenticate the realtime provider and subscribe for live updates.
//    Skipped when RTDB is unavailable (runId === null).
if (runId && customToken) {
  const provider = getClientRealtimeProvider();
  try {
    await provider.signInWithToken(customToken);
  } catch (signInErr) {
    void normalizeError(signInErr);
    const msg = signInErr instanceof Error ? signInErr.message : "Realtime sign-in failed";
    setColRunStates(Object.fromEntries(queue.map((c) => [c, "error" as ColRunState])));
    setColErrors(Object.fromEntries(queue.map((c) => [c, msg])));
    return;
  }
  unsubscribeRef.current?.();
  unsubscribeRef.current = subscribeToSeedRun(runId, setColRunStates, setColErrors, setCompletedCount);
}

// 3. Kick off the seed. Omit runId when RTDB is unavailable.
const res = await fetch(API_ROUTES.DEMO.SEED, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action, collections: queue, dryRun: false, ...(runId ? { runId } : {}) }),
});

if (!res.ok) {
  const err = await res.json().catch(() => ({ message: res.statusText }));
  setColRunStates(Object.fromEntries(queue.map((c) => [c, "error" as ColRunState])));
  setColErrors(Object.fromEntries(queue.map((c) => [c, err.message ?? "Request failed"])));
  return;
}

const body = await res.json().catch(() => null);

// When RTDB is unavailable (no runId), process the events array from the final
// JSON response to update per-collection states synchronously after the run.
if (!runId && body?.data?.events) {
  const events = body.data.events as Array<Record<string, unknown>>;
  const newStates: Record<string, ColRunState> = {};
  const newErrors: Record<string, string> = {};
  let doneCount = 0;
  for (const ev of events) {
    if (ev.type === "progress" && typeof ev.collection === "string") {
      if (ev.status === "done") {
        newStates[ev.collection] = "done";
        if (typeof ev.done === "number") doneCount = ev.done;
      } else if (ev.status === "error") {
        newStates[ev.collection] = "error";
        if (typeof ev.error === "string") newErrors[ev.collection] = ev.error;
        if (typeof ev.done === "number") doneCount = ev.done;
      }
    }
  }
  setColRunStates((prev) => ({ ...prev, ...newStates }));
  if (Object.keys(newErrors).length > 0) {
    setColErrors((prev) => ({ ...prev, ...newErrors }));
  }
  setCompletedCount(doneCount);
}
```

The seed route already emits `{ type: "progress", collection, status, done, total }` events into `data.events` (route.ts line 1181), so the final response has everything needed to reconstruct per-collection state.

**UX in degraded mode:** Collections stay "queued" while the seed runs, then all flip to done/error at once when the POST completes. Progress bar jumps to 100% at the end. No per-collection live ticker.

---

### 3. `src/app/api/auth/google/start/route.ts`

**Lines 52–62** — wrap the RTDB read in an inner try/catch:

**Before:**
```ts
// Verify the event node exists and is still pending
const db = getAdminRealtimeDb();
const snap = await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).get();
if (!snap.exists() || snap.val()?.status !== RTDBPayloadStatus.PENDING) {
  serverLogger.warn("Google OAuth start: event not found or expired", { eventId });
  return NextResponse.redirect(
    new URL(`/auth/close?error=event_expired`, request.nextUrl.origin),
  );
}
```

**After:**
```ts
// Verify the event node exists and is still pending (anti-replay).
// If RTDB is unavailable, skip the check — the callback validates state independently.
try {
  const db = getAdminRealtimeDb();
  const snap = await db.ref(`${RTDB_PATHS.AUTH_EVENTS}/${eventId}`).get();
  if (!snap.exists() || snap.val()?.status !== RTDBPayloadStatus.PENDING) {
    serverLogger.warn("Google OAuth start: event not found or expired", { eventId });
    return NextResponse.redirect(
      new URL(`/auth/close?error=event_expired`, request.nextUrl.origin),
    );
  }
} catch (rtdbErr) {
  void normalizeError(rtdbErr);
  serverLogger.warn("Google OAuth start: RTDB unavailable, skipping anti-replay check", { eventId });
}
```

**Security note:** Skipping the anti-replay check during RTDB downtime means a stale `eventId` can be reused within the downtime window. Acceptable degradation — OAuth `state` still ties the callback to the original popup, and the callback route handles its own RTDB failures gracefully.

---

### 4. `src/app/api/payment/event/init/route.ts`

**Lines 58–75** — wrap the RTDB write in a try/catch inside the handler:

**Before:**
```ts
const db = getAdminRealtimeDb();
await db
  .ref(`${RTDB_PATHS.PAYMENT_EVENTS}/${razorpayOrderId}`)
  .set({ status: "pending", uid: user!.uid, createdAt: Date.now() });
const syntheticUid = `payment_event_${razorpayOrderId}`;
const customToken = await getAdminAuth().createCustomToken(syntheticUid, {
  paymentEventId: razorpayOrderId,
});
const expiresAt = Date.now() + EVENT_TTL_MS;
serverLogger.info("Payment event initialised", { razorpayOrderId, uid: user!.uid });
return successResponse({ eventId: razorpayOrderId, customToken, expiresAt });
```

**After:**
```ts
const db = getAdminRealtimeDb();
let rtdbEnabled = true;
try {
  await db
    .ref(`${RTDB_PATHS.PAYMENT_EVENTS}/${razorpayOrderId}`)
    .set({ status: "pending", uid: user!.uid, createdAt: Date.now() });
} catch (rtdbErr) {
  void normalizeError(rtdbErr);
  serverLogger.warn("Payment event RTDB write failed — live status updates unavailable", {
    razorpayOrderId, rtdbErr,
  });
  rtdbEnabled = false;
}
const syntheticUid = `payment_event_${razorpayOrderId}`;
const customToken = await getAdminAuth().createCustomToken(syntheticUid, {
  paymentEventId: razorpayOrderId,
});
const expiresAt = Date.now() + EVENT_TTL_MS;
serverLogger.info("Payment event initialised", { razorpayOrderId, uid: user!.uid, rtdbEnabled });
return successResponse({ eventId: razorpayOrderId, customToken, expiresAt, rtdbEnabled });
```

**Behaviour when RTDB is down:** The Razorpay modal opens normally. Orders are created by `verifyAndPlaceRazorpayOrderAction` which returns `{ ok: true, orderIds }` regardless — the client navigates to confirmation from that direct response, not solely from the RTDB signal.

---

### 5. `appkit/firebase/base/firestore.indexes.json` — missing `offers` composite index

`offerRepository.hasActiveOffer()` queries:
```
.where("buyerUid", "==", X).where("productId", "==", Y).where("status", "in", ["pending", "countered"])
```

No supporting index exists (`buyerUid + productId + status`). This will throw `FAILED_PRECONDITION` when a buyer tries to make a second offer on the same product.

Add after the existing `buyerUid + productId + createdAt` block (around line 2513):
```json
{
  "collectionGroup": "offers",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "buyerUid", "order": "ASCENDING" },
    { "fieldPath": "productId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
},
```

After adding, run `npm run firebase deploy --only indexes` to deploy the index.

---

## Files changed summary

| File | Change |
|---|---|
| `src/app/api/demo/seed/event/init/route.ts` | RTDB write failure → graceful degraded success (`runId: null`) |
| `src/components/dev/SeedPanel.tsx` | Handle `runId: null` — skip RTDB, process `events` array post-run |
| `src/app/api/auth/google/start/route.ts` | RTDB read → inner try/catch, skip anti-replay when RTDB is down |
| `src/app/api/payment/event/init/route.ts` | RTDB write → try/catch, return `rtdbEnabled: false` on failure |
| `appkit/firebase/base/firestore.indexes.json` | Add `offers (buyerUid, productId, status)` composite index |

---

## Other findings (not blocking this session)

- **`GET /api/promotions`** and **`GET /api/admin/analytics`** return 503 when `FIREBASE_FUNCTION_GATEWAY_URL` is not configured. This is a config issue, not a code bug — routes already return meaningful 503 messages.
- **`GET /api/realtime/bids/[id]`** (auction live bid SSE) — RTDB `.on()` error callback already handles RTDB unavailability by sending an "error" SSE event. Client sees degraded (no live updates) but server doesn't crash.

---

## Verification

1. `npm run dev` (build+serve)
2. **Seed panel** — `/demo/seed` → "Add Seed" → should complete, collections flip to done/error at the end
3. **Google OAuth** — "Sign in with Google" → popup opens and redirects to Google (not a 500)
4. **Payment** — add to cart, checkout → Razorpay modal opens
5. `npm run firebase deploy --only indexes` — deploy the new offers index
6. `npm run check` — zero violations expected

---

## Root cause note

All RTDB failures share the same root: the Firebase Realtime Database instance has not been provisioned at `https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app`. Once provisioned in the Firebase console (project: `letitrip-in-app`, region: `asia-southeast1`), all routes will use the full RTDB-backed flow automatically. These code changes make the system resilient to RTDB downtime.
