#!/usr/bin/env node
/*
 * How many seeded orders carry an `items[]`?
 *
 * Every orders LIST surface reads `items[0].productTitle` for the row label
 * (Root Cause #52 — the row must say what was bought, not repeat the id), and
 * the receipt/invoice paths read the array outright. An order with no items
 * renders as a bare id and prices nothing.
 *
 * This measures rather than assumes, because the last fix to this was applied
 * to the GENERATOR and the hand-written provenance fixtures do not go through
 * it — exactly the shape of Root Cause #84, a fix narrower than the defect.
 */
import { connect, loadEnvLocal } from "./lib/firestore.mjs";

loadEnvLocal();
const { db } = connect();

const snap = await db.collection("orders").get();
const without = [];
for (const d of snap.docs) {
  const items = d.get("items");
  if (!Array.isArray(items) || items.length === 0) without.push(d.id);
}

console.log(`orders: ${snap.size}`);
console.log(`with items[]   : ${snap.size - without.length}`);
console.log(`WITHOUT items[]: ${without.length}`);
if (without.length) {
  console.log("\nmissing:");
  for (const id of without) console.log("  " + id);
}
process.exit(without.length === 0 ? 0 : 1);
