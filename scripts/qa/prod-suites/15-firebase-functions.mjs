/**
 * Firebase Functions smoke — hits the deployed HTTPS Cloud Functions
 * directly (asia-south1), bypassing the Vercel proxy routes. Verifies the
 * functions are reachable, auth-gated, and return the documented shape.
 *
 * Covers (env-driven URLs):
 *   listingProcessor         FIREBASE_FUNCTION_LISTING_URL
 *   adminAnalytics           FIREBASE_FUNCTION_ADMIN_ANALYTICS_URL
 *   storeAnalytics           FIREBASE_FUNCTION_STORE_ANALYTICS_URL
 *   promotionsApi            FIREBASE_FUNCTION_PROMOTIONS_URL
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
  if (!SECRET) {
    rec(
      "LETITRIP_INTERNAL_SECRET present",
      false,
      "missing — every secret-gated check below will be skipped or fail",
    );
  } else {
    rec("LETITRIP_INTERNAL_SECRET present", true, "ok");
  }

  // ── listingProcessor ─────────────────────────────────────────────────────
  const lpFn = FIREBASE_FUNCTIONS.LISTING_PROCESSOR;
  const listingUrl = process.env[lpFn.envVar];
  if (!listingUrl) {
    skip(`${lpFn.name}: smoke`, `${lpFn.envVar} not set`);
  } else {
    // GET → 405 (POST-only).
    const g = await getFn(listingUrl);
    rec(
      `${lpFn.name} GET → ${HTTP_STATUS.METHOD_NOT_ALLOWED}`,
      g.status === HTTP_STATUS.METHOD_NOT_ALLOWED,
      `status=${g.status}${g.error ? ` err=${g.error}` : ""}`,
    );

    // Missing secret → 401.
    const noAuth = await postFn(
      listingUrl,
      { [K.COLLECTION]: LISTING_COLLECTIONS.PRODUCTS, [K.PAGE_SIZE]: 1 },
      { secret: null },
    );
    rec(
      `${lpFn.name} no secret → ${HTTP_STATUS.UNAUTHORIZED}`,
      noAuth.status === HTTP_STATUS.UNAUTHORIZED,
      `status=${noAuth.status}`,
    );

    // Bad secret → 401.
    const badAuth = await postFn(
      listingUrl,
      { [K.COLLECTION]: LISTING_COLLECTIONS.PRODUCTS, [K.PAGE_SIZE]: 1 },
      { secret: "not-the-secret" },
    );
    rec(
      `${lpFn.name} bad secret → ${HTTP_STATUS.UNAUTHORIZED}`,
      badAuth.status === HTTP_STATUS.UNAUTHORIZED,
      `status=${badAuth.status}`,
    );

    // Missing collection → 400.
    const noColl = await postFn(listingUrl, {});
    rec(
      `${lpFn.name} missing collection → ${HTTP_STATUS.BAD_REQUEST}`,
      noColl.status === HTTP_STATUS.BAD_REQUEST,
      `status=${noColl.status} err=${noColl.body?.error ?? ""}`,
    );

    // Unknown collection → 400.
    const badColl = await postFn(listingUrl, {
      [K.COLLECTION]: "definitelyNotAThing",
      [K.PAGE_SIZE]: 1,
    });
    rec(
      `${lpFn.name} unknown collection → ${HTTP_STATUS.BAD_REQUEST}`,
      badColl.status === HTTP_STATUS.BAD_REQUEST,
      `status=${badColl.status} err=${(badColl.body?.error ?? "").slice(0, 80)}`,
    );

    // Happy path: products listing returns the documented shape.
    const ok = await postFn(listingUrl, {
      [K.COLLECTION]: LISTING_COLLECTIONS.PRODUCTS,
      [K.PAGE_SIZE]: 3,
    });
    rec(
      `${lpFn.name} ${LISTING_COLLECTIONS.PRODUCTS} → ${HTTP_STATUS.OK} + items[]`,
      ok.status === HTTP_STATUS.OK && Array.isArray(ok.body?.items),
      `status=${ok.status} n=${ok.body?.items?.length ?? "n/a"} total=${ok.body?.total ?? "n/a"} ${ok.elapsedMs}ms`,
    );

    // Filter regression guards (LISTING_TYPES.* tokens must reach Firestore).
    for (const lt of [LISTING_TYPES.AUCTION, LISTING_TYPES.STANDARD, LISTING_TYPES.PRE_ORDER]) {
      const r = await postFn(listingUrl, {
        [K.COLLECTION]: LISTING_COLLECTIONS.PRODUCTS,
        [K.FILTERS]: `listingType==${lt}`,
        [K.PAGE_SIZE]: 5,
      });
      const items = Array.isArray(r.body?.items) ? r.body.items : [];
      const allMatch = items.length > 0 && items.every((it) => it?.listingType === lt);
      rec(
        `${lpFn.name} listingType==${lt} filter applied`,
        r.status === HTTP_STATUS.OK && allMatch,
        `status=${r.status} n=${items.length} firstType=${items[0]?.listingType ?? "-"}`,
      );
    }

    // Cursor pagination — page 1 vs cursor advances should not overlap.
    const p1 = await postFn(listingUrl, {
      [K.COLLECTION]: LISTING_COLLECTIONS.PRODUCTS,
      [K.PAGE_SIZE]: 3,
      [K.PAGE]: 1,
    });
    const cursor = p1.body?.cursor;
    if (cursor) {
      const p2 = await postFn(listingUrl, {
        [K.COLLECTION]: LISTING_COLLECTIONS.PRODUCTS,
        [K.PAGE_SIZE]: 3,
        [K.CURSOR]: cursor,
      });
      const aIds = new Set((p1.body?.items ?? []).map((i) => i?.id));
      const overlap = (p2.body?.items ?? []).filter((i) => aIds.has(i?.id));
      rec(
        `${lpFn.name} cursor pagination disjoint`,
        p2.status === HTTP_STATUS.OK && overlap.length === 0,
        `status=${p2.status} overlap=${overlap.length}`,
      );
    } else {
      rec(
        `${lpFn.name} cursor pagination disjoint`,
        false,
        "no cursor returned on page 1",
      );
    }
  }

  // ── adminAnalytics ───────────────────────────────────────────────────────
  const aaFn = FIREBASE_FUNCTIONS.ADMIN_ANALYTICS;
  const adminUrl = process.env[aaFn.envVar];
  if (!adminUrl) {
    skip(`${aaFn.name}: smoke`, `${aaFn.envVar} not set`);
  } else {
    const noAuth = await postFn(adminUrl, {}, { secret: null });
    rec(
      `${aaFn.name} no secret → ${HTTP_STATUS.UNAUTHORIZED}`,
      noAuth.status === HTTP_STATUS.UNAUTHORIZED,
      `status=${noAuth.status}`,
    );

    const ok = await postFn(adminUrl, {}, { timeoutMs: 25000 });
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
  const storeUrl = process.env[saFn.envVar];
  if (!storeUrl) {
    skip(`${saFn.name}: smoke`, `${saFn.envVar} not set`);
  } else {
    const noAuth = await postFn(storeUrl, { sellerId: "anything" }, { secret: null });
    rec(
      `${saFn.name} no secret → ${HTTP_STATUS.UNAUTHORIZED}`,
      noAuth.status === HTTP_STATUS.UNAUTHORIZED,
      `status=${noAuth.status}`,
    );

    const noBody = await postFn(storeUrl, {});
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
      rec(`${saFn.name} happy path`, false, "could not resolve seller UID from /api/auth/login");
    } else {
      const ok = await postFn(storeUrl, { sellerId: sellerUid }, { timeoutMs: 25000 });
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
  const promoUrl = process.env[pFn.envVar];
  if (!promoUrl) {
    skip(`${pFn.name}: smoke`, `${pFn.envVar} not set`);
  } else {
    const noAuth = await postFn(promoUrl, {}, { secret: null });
    rec(
      `${pFn.name} no secret → ${HTTP_STATUS.UNAUTHORIZED}`,
      noAuth.status === HTTP_STATUS.UNAUTHORIZED,
      `status=${noAuth.status}`,
    );

    const ok = await postFn(promoUrl, {});
    const arr = Array.isArray(ok.body)
      ? ok.body
      : Array.isArray(ok.body?.coupons)
        ? ok.body.coupons
        : null;
    rec(
      `${pFn.name} → ${HTTP_STATUS.OK} + coupons[]`,
      ok.status === HTTP_STATUS.OK && Array.isArray(arr),
      `status=${ok.status} n=${arr?.length ?? "n/a"} ${ok.elapsedMs}ms`,
    );
  }

  return results;
}
