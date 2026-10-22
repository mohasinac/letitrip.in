#!/usr/bin/env node
/*
 * Map a checklist case's stale order id to the real one, by SUFFIX.
 *
 * `generateOrderId` used to embed a yyyymmdd derived from NOW, so every id
 * moved daily and 17 checklist references across two files pointed at orders
 * that had not existed since the day they were authored. The suffix is a
 * deterministic hash of the fixture's natural key and never moved — so it is
 * the join key between the old reference and the current document.
 *
 * Ids are stable from here on (SEED_EPOCH), so this is a one-time repair.
 */
import { connect, loadEnvLocal } from "./lib/firestore.mjs";

loadEnvLocal();
const { db } = connect();

const wanted = process.argv.slice(2);
if (wanted.length === 0) {
  console.error("usage: remap-order-ids.mjs <staleId> [<staleId>…]");
  process.exit(2);
}

const snap = await db.collection("orders").get();
const bySuffix = new Map();
for (const d of snap.docs) {
  const suffix = d.id.split("-").pop();
  bySuffix.set(suffix, d);
}

let missing = 0;
for (const stale of wanted) {
  const suffix = stale.split("-").pop();
  const hit = bySuffix.get(suffix);
  if (!hit) {
    console.log(`${stale}  ->  (NO MATCH — suffix "${suffix}" not in the catalogue)`);
    missing++;
    continue;
  }
  const items = hit.get("items") || [];
  console.log(
    `${stale}  ->  ${hit.id}   status=${hit.get("status")} buyer=${hit.get("userId")} items=${items.length}`,
  );
}
process.exit(missing === 0 ? 0 : 1);
