/**
 * Firebase Functions smoke — hits the deployed HTTPS Cloud Functions.
 *
 * Prefers the single **gateway** URL (FIREBASE_FUNCTION_GATEWAY_URL) which
 * dispatches via `{ action: "<name>", ...params }`. Falls back to the
 * per-function URLs if the gateway env var is not set.
 *
 * Auth: shared x-internal-secret header (LETITRIP_INTERNAL_SECRET).
 * If the env var for a function is missing, that block is skipped (PASS
 * with detail "skipped: <var> not set") so the suite stays green on
 * machines that only have a subset of secrets.
 */

import { login } from "./_http.mjs";
import {
  FIREBASE_FUNCTIONS,
  HTTP_STATUS,
  LISTING_COLLECTIONS,
  LISTING_REQUEST_KEYS,
  LISTING_TYPES,
} from "../_constants.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });
const skip = (name, reason) => results.push({ name, ok: true, detail: `skipped: ${reason}` });

const SECRET = process.env.LETITRIP_INTERNAL_SECRET;
const K = LISTING_REQUEST_KEYS;

const GATEWAY_URL = process.env[FIREBASE_FUNCTIONS.GATEWAY.envVar];

function resolveUrl(fnDef) {
  if (GATEWAY_URL) return { url: GATEWAY_URL, viaGateway: true };
  const direct = process.env[fnDef.envVar];
  return direct ? { url: direct, viaGateway: false } : null;
}

function buildBody(fnDef, params, resolved) {
  return resolved.viaGateway
    ? { action: fnDef.name, ...params }
    : params;
}

async function postFn(url, body, { secret = SECRET, timeoutMs = 15000 } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (secret) headers["x-internal-secret"] = secret;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body ?? {}),
      signal: ctrl.signal,
    });
    const text = await res.text();
    let parsed = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }
    return { status: res.status, body: parsed, elapsedMs: Date.now() - started };
  } catch (err) {
    return { status: 0, body: null, error: err?.message ?? String(err), elapsedMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

async function getFn(url, { timeoutMs = 10000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: "GET", signal: ctrl.signal });
    return { status: res.status };
  } catch (err) {
    return { status: 0, error: err?.message ?? String(err) };
  } finally {
    clearTimeout(timer);
  }
}

export async function run() {
  const mode = GATEWAY_URL ? "gateway" : "direct";
  rec("mode", true, mode);

  if (!SECRET) {
    rec(
      "LETITRIP_INTERNAL_SECRET present",
      false,
      "missing — every secret-gated check below will be skipped or fail",
    );
  } else {
    rec("LETITRIP_INTERNAL_SECRET present", true, "ok");
  }

  // ── gateway-level auth checks (only when using gateway) ─────────────────
  if (GATEWAY_URL) {
    const noAuth = await postFn(GATEWAY_URL, { action: "listingProcessor" }, { secret: null });
    rec(
      `gateway no secret → ${HTTP_STATUS.UNAUTHORIZED}`,
      noAuth.status === HTTP_STATUS.UNAUTHORIZED,
      `status=${noAuth.status}`,
    );

    const badAuth = await postFn(GATEWAY_URL, { action: "listingProcessor" }, { secret: "wrong" });
    rec(
      `gateway bad secret → ${HTTP_STATUS.UNAUTHORIZED}`,
      badAuth.status === HTTP_STATUS.UNAUTHORIZED,
      `status=${badAuth.status}`,
    );

    const noAction = await postFn(GATEWAY_URL, {});
    rec(
      `gateway missing action → ${HTTP_STATUS.BAD_REQUEST}`,
      noAction.status === HTTP_STATUS.BAD_REQUEST,
      `status=${noAction.status} err=${(noAction.body?.error ?? "").slice(0, 80)}`,
    );

    const badAction = await postFn(GATEWAY_URL, { action: "doesNotExist" });
    rec(
      `gateway unknown action → ${HTTP_STATUS.BAD_REQUEST}`,
      badAction.status === HTTP_STATUS.BAD_REQUEST,
      `status=${badAction.status} err=${(badAction.body?.error ?? "").slice(0, 80)}`,
    );
  }

  // ── listingProcessor ─────────────────────────────────────────────────────
  const lpFn = FIREBASE_FUNCTIONS.LISTING_PROCESSOR;
  const lpResolved = resolveUrl(lpFn);
  if (!lpResolved) {
    skip(`${lpFn.name}: smoke`, `${lpFn.envVar} not set`);
  } else {
    // Auth checks (only for direct mode — gateway auth tested above).
    if (!lpResolved.viaGateway) {
      const noAuth = await postFn(
        lpResolved.url,
        { [K.COLLECTION]: LISTING_COLLECTIONS.PRODUCTS, [K.PAGE_SIZE]: 1 },
        { secret: null },
      );
      rec(
        `${lpFn.name} no secret → ${HTTP_STATUS.UNAUTHORIZED}`,
        noAuth.status === HTTP_STATUS.UNAUTHORIZED,
        `status=${noAuth.status}`,
      );
    }

    // Missing collection → 400.
    const noColl = await postFn(lpResolved.url, buildBody(lpFn, {}, lpResolved));
    rec(
      `${lpFn.name} missing collection → ${HTTP_STATUS.BAD_REQUEST}`,
      noColl.status === HTTP_STATUS.BAD_REQUEST,
      `status=${noColl.status} err=${noColl.body?.error ?? ""}`,
    );

    // Unknown collection → 400.
    const badColl = await postFn(lpResolved.url, buildBody(lpFn, {
      [K.COLLECTION]: "definitelyNotAThing",
      [K.PAGE_SIZE]: 1,
    }, lpResolved));
    rec(
      `${lpFn.name} unknown collection → ${HTTP_STATUS.BAD_REQUEST}`,
      badColl.status === HTTP_STATUS.BAD_REQUEST,
      `status=${badColl.status} err=${(badColl.body?.error ?? "").slice(0, 80)}`,
    );

    // Happy path: products listing returns the documented shape.
    const ok = await postFn(lpResolved.url, buildBody(lpFn, {
      [K.COLLECTION]: LISTING_COLLECTIONS.PRODUCTS,
      [K.PAGE_SIZE]: 3,
    }, lpResolved));
    rec(
      `${lpFn.name} products → ${HTTP_STATUS.OK} + items[]`,
      ok.status === HTTP_STATUS.OK && Array.isArray(ok.body?.items),
      `status=${ok.status} n=${ok.body?.items?.length ?? "n/a"} total=${ok.body?.total ?? "n/a"} ${ok.elapsedMs}ms`,
    );

    // Filter regression guards.
    for (const lt of [LISTING_TYPES.AUCTION, LISTING_TYPES.STANDARD, LISTING_TYPES.PRE_ORDER]) {
      const r = await postFn(lpResolved.url, buildBody(lpFn, {
        [K.COLLECTION]: LISTING_COLLECTIONS.PRODUCTS,
        [K.FILTERS]: `listingType==${lt}`,
        [K.PAGE_SIZE]: 5,
      }, lpResolved));
      const items = Array.isArray(r.body?.items) ? r.body.items : [];
      const matchOk = r.status === HTTP_STATUS.OK && (items.length === 0 || items.every((it) => it?.listingType === lt));
      rec(
        `${lpFn.name} listingType==${lt} filter applied`,
        matchOk,
        `status=${r.status} n=${items.length} firstType=${items[0]?.listingType ?? "-"}`,
      );
    }

    // Cursor pagination.
    const p1 = await postFn(lpResolved.url, buildBody(lpFn, {
      [K.COLLECTION]: LISTING_COLLECTIONS.PRODUCTS,
      [K.PAGE_SIZE]: 3,
      [K.PAGE]: 1,
    }, lpResolved));
    const cursor = p1.body?.cursor;
    if (cursor) {
      const p2 = await postFn(lpResolved.url, buildBody(lpFn, {
        [K.COLLECTION]: LISTING_COLLECTIONS.PRODUCTS,
        [K.PAGE_SIZE]: 3,
        [K.CURSOR]: cursor,
      }, lpResolved));
      const aIds = new Set((p1.body?.items ?? []).map((i) => i?.id));
      const overlap = (p2.body?.items ?? []).filter((i) => aIds.has(i?.id));
      rec(
        `${lpFn.name} cursor pagination disjoint`,
        p2.status === HTTP_STATUS.OK && overlap.length === 0,
        `status=${p2.status} overlap=${overlap.length}`,
      );
    } else {
      const hasItems = (p1.body?.items?.length ?? 0) > 0;
      rec(
        `${lpFn.name} cursor pagination disjoint`,
        !hasItems,
        hasItems ? "no cursor returned on page 1" : "skipped — 0 items, no cursor expected",
      );
    }
  }

  // ── adminAnalytics ───────────────────────────────────────────────────────
  const aaFn = FIREBASE_FUNCTIONS.ADMIN_ANALYTICS;
  const aaResolved = resolveUrl(aaFn);
  if (!aaResolved) {
    skip(`${aaFn.name}: smoke`, `${aaFn.envVar} not set`);
  } else {
    const ok = await postFn(aaResolved.url, buildBody(aaFn, {}, aaResolved), { timeoutMs: 25000 });
    const hasShape =
      ok.status === HTTP_STATUS.OK &&
      ok.body &&
      typeof ok.body === "object" &&
      "summary" in ok.body &&
      "ordersByMonth" in ok.body &&
      "topProducts" in ok.body;
    rec(
      `${aaFn.name} → ${HTTP_STATUS.OK} + {summary,ordersByMonth,topProducts}`,
      Boolean(hasShape),
      `status=${ok.status} ${ok.elapsedMs}ms`,
    );
  }

  // ── storeAnalytics ───────────────────────────────────────────────────────
  const saFn = FIREBASE_FUNCTIONS.STORE_ANALYTICS;
  const saResolved = resolveUrl(saFn);
  if (!saResolved) {
    skip(`${saFn.name}: smoke`, `${saFn.envVar} not set`);
  } else {
    const noBody = await postFn(saResolved.url, buildBody(saFn, {}, saResolved));
    rec(
      `${saFn.name} missing sellerId → ${HTTP_STATUS.BAD_REQUEST}`,
      noBody.status === HTTP_STATUS.BAD_REQUEST,
      `status=${noBody.status} err=${(noBody.body?.error ?? "").slice(0, 80)}`,
    );

    let sellerUid = null;
    try {
      const sess = await login("seller");
      sellerUid = sess?.user?.uid ?? sess?.user?.id ?? sess?.user?.userId ?? null;
    } catch {
      /* recorded below */
    }
    if (!sellerUid) {
      skip(`${saFn.name} happy path`, "could not resolve seller UID from /api/auth/login (dev server not running?)");
    } else {
      const ok = await postFn(saResolved.url, buildBody(saFn, { sellerId: sellerUid }, saResolved), { timeoutMs: 25000 });
      const shapeOk =
        ok.status === HTTP_STATUS.OK &&
        ok.body &&
        typeof ok.body === "object" &&
        "summary" in ok.body;
      rec(
        `${saFn.name} sellerId=<live> → ${HTTP_STATUS.OK} + summary`,
        Boolean(shapeOk),
        `status=${ok.status} uid=${sellerUid.slice(0, 12)}… ${ok.elapsedMs}ms`,
      );
    }
  }

  // ── promotionsApi ────────────────────────────────────────────────────────
  const pFn = FIREBASE_FUNCTIONS.PROMOTIONS_API;
  const pResolved = resolveUrl(pFn);
  if (!pResolved) {
    skip(`${pFn.name}: smoke`, `${pFn.envVar} not set`);
  } else {
    const ok = await postFn(pResolved.url, buildBody(pFn, {}, pResolved));
    const hasShape =
      ok.status === HTTP_STATUS.OK &&
      ok.body &&
      typeof ok.body === "object" &&
      ("promotedProducts" in ok.body || "activeCoupons" in ok.body || Array.isArray(ok.body));
    rec(
      `${pFn.name} → ${HTTP_STATUS.OK} + promotions shape`,
      Boolean(hasShape),
      `status=${ok.status} keys=${ok.body ? Object.keys(ok.body).join(",") : "n/a"} ${ok.elapsedMs}ms`,
    );
  }

  return results;
}
