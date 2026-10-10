/**
 * B3 verification against production.
 *
 *  1. The 5 tax codes loaded and carry the right rates.
 *  2. `productDefaults.taxCodeId` equality works with NO composite index —
 *     the referential delete-guard depends on it. If Firestore needs an index
 *     for a nested-field equality, the guard would throw FAILED_PRECONDITION
 *     and the route would 500 instead of refusing, so this is worth proving
 *     rather than assuming.
 *  3. The 18% row exists — it is the only one that can prove the rate is
 *     applied rather than hardcoded.
 */
import admin from "firebase-admin";
import { readFileSync } from "node:fs";

const env = readFileSync(".env.local", "utf8");
const pick = (k) =>
  env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: pick("FIREBASE_ADMIN_PROJECT_ID"),
    clientEmail: pick("FIREBASE_ADMIN_CLIENT_EMAIL"),
    privateKey: pick("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n"),
  }),
});
const db = admin.firestore();

console.log("── 1. taxCodes ──");
const codes = (await db.collection("taxCodes").get()).docs;
console.log(`${codes.length} documents`);
for (const d of codes.sort((a, b) => a.id.localeCompare(b.id))) {
  const t = d.data();
  console.log(
    `  ${d.id.padEnd(22)} ${String(t.gstRate).padStart(2)}%  hsn=${(t.hsnCode || "(none)").padEnd(10)} chapter=${t.chapter ?? "-"}  active=${t.isActive}`,
  );
}
const rates = new Set(codes.map((d) => d.data().gstRate));
console.log(`distinct rates: ${[...rates].sort((a, b) => a - b).join(", ")}`);
console.log(
  rates.has(18)
    ? "  OK — an 18% row exists, so the non-default branch is provable"
    : "  🛑 NO 18% row — a 5%-only catalogue cannot distinguish applied from hardcoded",
);
console.log(
  rates.has(0)
    ? "  OK — a 0% exemption row exists, distinct from gstRate undefined"
    : "  🛑 no exemption row",
);

console.log("\n── 2. the delete-guard query, with no composite index ──");
try {
  const t0 = Date.now();
  const snap = await db
    .collection("categories")
    .where("productDefaults.taxCodeId", "==", "tax-hsn-95030020")
    .limit(200)
    .get();
  console.log(
    `  SERVED in ${Date.now() - t0}ms — ${snap.size} categor${snap.size === 1 ? "y" : "ies"} reference tax-hsn-95030020`,
  );
  console.log("  => nested-field equality needs no composite index. Guard is safe.");
} catch (err) {
  console.log(`  🛑 FAILED: ${err.code ?? ""} ${err.message.slice(0, 160)}`);
  console.log("  => the delete guard would 500 rather than refuse. Declare an index.");
}

console.log("\n── 3. a NEGATIVE control on the same query shape ──");
const none = await db
  .collection("categories")
  .where("productDefaults.taxCodeId", "==", "tax-does-not-exist")
  .limit(5)
  .get();
console.log(
  `  tax-does-not-exist -> ${none.size} rows ${none.size === 0 ? "(correct — the query filters rather than returning everything)" : "🛑 non-zero, the clause is being dropped"}`,
);

console.log("\n── 4. products carrying a GST rate (B6's starting point) ──");
const prods = (await db.collection("products").get()).docs;
const withRate = prods.filter((d) => d.data().gstRate != null);
const withHsn = prods.filter((d) => d.data().hsnCode);
console.log(`  ${prods.length} products: ${withRate.length} with gstRate, ${withHsn.length} with hsnCode`);
console.log("  (both are expected to be 0 until B6 — recorded as the baseline)");
process.exit(0);
