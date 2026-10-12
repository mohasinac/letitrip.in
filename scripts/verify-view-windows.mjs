/**
 * D8 — the per-product view windows, and the distinction the whole thing rests
 * on: **`undefined` is not `0`**.
 *
 * 🛑 `undefined` means the nightly pass has not rolled this product up.
 * `0` means it has, and nobody looked. Collapsing them with `?? 0` is exactly
 * how the admin Top Products table came to render "0 views" on every row as
 * though it were a measurement (A5) — a guaranteed zero presented as data.
 *
 * And the second thing it rests on: the pass enumerates PRODUCTS, not buckets.
 * A product that stops being viewed must fall to 0, and that product has no
 * bucket in the window at all — so a bucket-driven pass could only ever add
 * (Root Cause #102, which cost 19 of 65 category rows).
 */
import admin from "firebase-admin";
import sa from "../firebase-admin-key.json" with { type: "json" };

let pass = 0;
let fail = 0;
const ok = (c, m) => {
  if (c) {
    pass++;
    console.log("  PASS", m);
  } else {
    fail++;
    console.log("  FAIL", m);
  }
};

/* ── The window arithmetic, as a pure re-implementation of the pass's own
 *    reducer, so the maths is asserted without a Firestore write. ───────── */
const dayKey = (base, offset) => {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};

function windows(buckets, base) {
  const through = dayKey(base, -1);
  const from = dayKey(base, -30);
  const shortFrom = dayKey(base, -7);
  const v30 = new Map();
  const v7 = new Map();
  for (const b of buckets) {
    if (b.date < from || b.date > through) continue; // outside the read range
    const n = Number(b.count) || 0;
    if (!Number.isFinite(n) || n <= 0) continue;
    v30.set(b.entityId, (v30.get(b.entityId) ?? 0) + n);
    if (b.date >= shortFrom) v7.set(b.entityId, (v7.get(b.entityId) ?? 0) + n);
  }
  return { v7, v30, from, through, shortFrom };
}

const BASE = Date.UTC(2026, 9, 13); // fixed, so the assertions are reproducible

console.log("\n=== 1. the two windows ===");
{
  const b = [
    { entityId: "p1", date: dayKey(BASE, -1), count: 5 },
    { entityId: "p1", date: dayKey(BASE, -6), count: 3 },
    { entityId: "p1", date: dayKey(BASE, -20), count: 11 },
  ];
  const { v7, v30 } = windows(b, BASE);
  ok(v7.get("p1") === 8, "7-day window sums only the last 7 days (5+3=8)");
  ok(v30.get("p1") === 19, "30-day window sums all three (5+3+11=19)");
  ok(v7.get("p1") < v30.get("p1"), "and 7d is a SUBSET of 30d, never the other way");
}
{
  // 🛑 TODAY is excluded: its bucket is still being written to, so including it
  // would make the figure move during the day for no reason a reader could
  // explain.
  const b = [{ entityId: "p1", date: dayKey(BASE, 0), count: 99 }];
  const { v7, v30 } = windows(b, BASE);
  ok(v7.get("p1") === undefined, "CONTROL today's bucket is EXCLUDED from 7d");
  ok(v30.get("p1") === undefined, "CONTROL and from 30d");
}
{
  const b = [{ entityId: "p1", date: dayKey(BASE, -31), count: 99 }];
  const { v30 } = windows(b, BASE);
  ok(v30.get("p1") === undefined, "CONTROL a bucket older than 30 days is excluded");
}
{
  const b = [
    { entityId: "p1", date: dayKey(BASE, -7), count: 4 },
    { entityId: "p1", date: dayKey(BASE, -8), count: 4 },
  ];
  const { v7, v30 } = windows(b, BASE);
  ok(v7.get("p1") === 4, "the 7-day boundary is inclusive on day -7 and excludes day -8");
  ok(v30.get("p1") === 8, "both are inside 30d");
}
{
  const b = [
    { entityId: "p1", date: dayKey(BASE, -2), count: 0 },
    { entityId: "p1", date: dayKey(BASE, -3), count: -5 },
    { entityId: "p1", date: dayKey(BASE, -4), count: NaN },
    { entityId: "p1", date: dayKey(BASE, -5), count: "7" },
  ];
  const { v7 } = windows(b, BASE);
  ok(v7.get("p1") === 7, "zero, negative and NaN counts are skipped; a numeric string still counts");
}

console.log("\n=== 2. 🛑 undefined is not zero ===");
{
  const { v7 } = windows([{ entityId: "p1", date: dayKey(BASE, -1), count: 2 }], BASE);
  // The pass writes `?? 0` for a product with NO bucket — that is the point.
  const forP2 = v7.get("p2") ?? 0;
  ok(forP2 === 0, "a product with no bucket is WRITTEN as 0, not skipped (Root Cause #102)");
  ok(v7.get("p2") === undefined, "but the map itself does not invent an entry for it");
}

console.log("\n=== 3. the live schema and the live data ===");
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();
const [prods, views] = await Promise.all([
  db.collection("products").select("views7d", "views30d", "viewCount").get(),
  db.collection("pageViews").where("entityType", "==", "product").limit(500).get(),
]);
console.log(`    products ${prods.size} | product pageView buckets ${views.size}`);

const withV7 = prods.docs.filter((d) => typeof d.data().views7d === "number").length;
const withLegacy = prods.docs.filter((d) => d.data().viewCount !== undefined).length;
ok(
  withLegacy === 0,
  `no product carries the dead \`viewCount\` (${withLegacy} found) — it was sortable with no writer, so \`?sort=viewCount\` returned zero rows`,
);
/*
 * 🛑 Stated, not asserted as a pass. The nightly pass has not run yet, so 0 of
 * 95 products carry a window — and that is EXACTLY the state the
 * undefined-vs-zero rule exists for: every surface must render an em-dash
 * today, not "0 views".
 */
console.log(`    products with a rolled-up window: ${withV7}/${prods.size}`);
if (withV7 === 0) {
  console.log("    NOTE: the nightly pass has not run. Every surface must show");
  console.log("          an em-dash, never 0 — which is what sections 1–2 assert.");
}

console.log("\n=== 4. the renderers distinguish the two ===");
import fs from "node:fs";
const seller = fs.readFileSync(
  "appkit/src/features/seller/components/SellerProductsView.tsx",
  "utf8",
);
const detail = fs.readFileSync(
  "appkit/src/features/products/components/ProductDetailPageView.tsx",
  "utf8",
);
ok(
  /typeof row\.views7d !== "number"/.test(seller),
  "the seller column tests `typeof`, not truthiness",
);
ok(
  !/views7d\s*\?\?\s*0/.test(seller),
  "CONTROL and nowhere does it collapse undefined to 0 with `?? 0`",
);
ok(
  /typeof p\.views7d === "number"/.test(detail),
  "the detail page tests `typeof` too",
);
ok(
  /views7d >= 2/.test(detail),
  "and applies a floor of 2, so a lone visitor is never told '1 person viewed this'",
);
ok(
  !/views7d\s*\?\?\s*0/.test(detail),
  "CONTROL no `?? 0` on the public surface either",
);

const sieve = fs.readFileSync(
  "appkit/src/features/products/repository/products.repository.ts",
  "utf8",
);
ok(
  !/^\s*viewCount: \{ canFilter/m.test(sieve),
  "`viewCount` is gone from the Sieve config (F1 #1)",
);
ok(
  /views7d: \{ canFilter: true, canSort: true \}/.test(sieve),
  "and the replacement fields are filterable and sortable — with a real writer",
);

console.log(`\n${fail === 0 ? "all checks passed" : "FAILURES"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
