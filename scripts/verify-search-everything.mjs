#!/usr/bin/env node
/**
 * D2 Fix 4 — cross-resource search, against PRODUCTION data.
 *
 * `/search` was a pure redirect, so there was no cross-resource search at all.
 * These assertions are the claim: one query, many groups, and nonsense
 * controls that distinguish filtering from matching everything.
 *
 * Run: node scripts/verify-search-everything.mjs
 */
import { readFileSync } from "node:fs";
import admin from "firebase-admin";
import { searchEverything } from "../appkit/dist/_internal/server/features/search/search-everything.js";
import { SEARCH_SOURCES } from "../appkit/dist/_internal/server/features/search/search-sources.js";

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log(`  PASS  ${m}`); } else { fail++; console.log(`  FAIL  ${m}`); } };

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(readFileSync("firebase-admin-key.json", "utf8"))) });
const db = admin.firestore();
const run = (q) => searchEverything(db, q, SEARCH_SOURCES);

console.log("\n--- the sources ---");
ok(SEARCH_SOURCES.length === 6, `6 sources, not 15 — nine of the redirect's types are listing types INSIDE products (got ${SEARCH_SOURCES.length})`);
ok(new Set(SEARCH_SOURCES.map((s) => s.key)).size === 6, "keys are unique");
ok(SEARCH_SOURCES.every((s) => s.select.length > 0),
   "every source PROJECTS — a search page needs a title and a link, not a document");

console.log("\n--- 🛑 THE CLAIM: one query, MANY groups ---");
const burst = await run("burst");
ok(burst.groups.length >= 5, `"burst" spans ${burst.groups.length} groups: ${burst.groups.map((g) => g.label).join(", ")}`);
ok(burst.totalHits > 0, `${burst.totalHits} hits`);
const dranzer = await run("dranzer");
ok(dranzer.groups.length >= 2,
   `"dranzer" spans ${dranzer.groups.length} groups — the redirect could only ever show ONE`);

console.log("\n--- 🛑 NONSENSE CONTROLS, without which a pass means nothing ---");
const nope = await run("zzzznope");
ok(nope.totalHits === 0, "'zzzznope' returns 0 — it is filtering, not returning everything");
const punct = await run("!!!");
ok(punct.totalHits === 0 && punct.groups.length === 0,
   "'!!!' returns 0 — A2's bug was the inverse: a punctuation query returned the WHOLE catalogue as results");
ok(punct.terms.length === 0, "and it reports ZERO terms, so the page can say 'no searchable words' rather than 'no results'");
const empty = await run("");
ok(empty.totalHits === 0 && empty.terms.length === 0, "an empty query returns nothing");

console.log("\n--- the alias bridge reaches this page too (Fix 3) ---");
const rf = await run("rubber flat");
ok(rf.totalHits > 0, `"rubber flat" finds ${rf.totalHits} — through the part code bridge`);

console.log("\n--- every hit is usable ---");
for (const g of burst.groups) {
  ok(g.hits.every((h) => h.title && h.href && h.id),
     `${g.label}: every hit carries a title, an href and an id`);
  ok(g.hits.length <= 6, `${g.label}: capped at 6 per group (got ${g.hits.length})`);
  ok(typeof g.moreHref === "string" && g.moreHref.includes("q="),
     `${g.label}: its "see all" link carries the query`);
}

console.log("\n--- 🛑 BRANDS AND CATEGORIES DO NOT OVERLAP ---");
/*
 * They share one collection and a plain listing category OMITS `categoryType`,
 * so this cannot be a query clause. Exactly the trap that made the /products
 * facet offer "Takara-Tomy" as a browsable category (A1 item 4).
 */
const cats = burst.groups.find((g) => g.key === "categories")?.hits ?? [];
const brands = burst.groups.find((g) => g.key === "brands")?.hits ?? [];
const overlap = cats.filter((c) => brands.some((b) => b.id === c.id));
ok(overlap.length === 0, `no row appears in both groups${overlap.length ? ` — ${overlap.map((o) => o.id)}` : ""}`);
ok(cats.every((c) => c.href.startsWith("/categories/")), "category hits link to /categories/");
ok(brands.every((b) => b.href.startsWith("/brands/")), "brand hits link to /brands/");

console.log("\n--- 🛑 NO PRICES ANYWHERE — nothing to leak to a signed-out visitor ---");
const allHits = burst.groups.flatMap((g) => g.hits);
const moneyish = allHits.filter((h) => /₹|\bprice\b|\d{3,}\.\d{2}/i.test(`${h.title} ${h.detail ?? ""}`));
ok(moneyish.length === 0, `no hit carries an amount${moneyish.length ? ` — ${moneyish.map((h) => h.title)}` : ""}`);
ok(allHits.every((h) => !("price" in h)), "and no hit object even has a price field");

console.log("\n--- FAQ hits link to the CATEGORY, not a question slug ---");
const faqs = burst.groups.find((g) => g.key === "faqs")?.hits ?? [];
ok(faqs.length === 0 || faqs.every((h) => /^\/faqs(\/[a-z_]+)?$/.test(h.href)),
   `the route is /faqs/[category] and matches on CATEGORY_KEYS — a seo.slug would fall back to "all"`);

console.log(`\n${fail === 0 ? "all checks passed" : `${fail} FAILED`}  (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);
