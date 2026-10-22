#!/usr/bin/env node
/*
 * List the seeded order ids.
 *
 * Exists because a checklist case may now legitimately NAME an order by id.
 * Before the SEED_EPOCH fix it could not: `generateOrderId` embedded a yyyymmdd
 * derived from NOW at module import, so every id changed daily and any case
 * naming one was authored against a single day's catalogue.
 *
 * Use this when re-pointing a case's `inputs.orderId` at a real fixture.
 */
import { connect, loadEnvLocal } from "./lib/firestore.mjs";

loadEnvLocal();
const { db } = connect();

const total = (await db.collection("orders").count().get()).data().count;
const snap = await db.collection("orders").orderBy("createdAt", "desc").limit(12).get();

console.log(`orders in db: ${total}\n`);
for (const d of snap.docs) {
  const items = d.get("items") || [];
  console.log(
    [
      d.id.padEnd(34),
      String(d.get("status") ?? "?").padEnd(12),
      `items:${String(items.length).padEnd(2)}`,
      items[0]?.productTitle ? `"${items[0].productTitle.slice(0, 38)}"` : "(no title)",
    ].join(" "),
  );
}
