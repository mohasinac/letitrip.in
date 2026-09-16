#!/usr/bin/env node
/*
 * Admin FAQ search returned 409 on every sort.
 *
 * Every existing `searchTxt` index on `faqs` also carries `isActive` — which
 * the PUBLIC query filters on and the ADMIN query does not, because an admin
 * must see drafts. So the admin query is `searchTxt array-contains + orderBy`,
 * a shape no index served, and Firestore answered FAILED_PRECONDITION for all
 * three of the view's sorts.
 *
 * Root Cause #59's family again: the fix went to the path I was looking at
 * (public, sorted by createdAt) and its sibling, which differs only by a
 * filter and a sort, kept failing.
 *
 * Firestore named the first one itself, decoded from the console URL:
 *   faqs / searchTxt CONTAINS, priority, __name__
 *
 * A composite index also serves its complete inverse, so one entry per sort
 * FIELD covers both directions.
 */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "appkit/firebase/base/firestore.indexes.json";
const json = JSON.parse(readFileSync(PATH, "utf8"));

const WANTED = [
  // search + each of the admin view's three sorts, with NO isActive
  [
    { fieldPath: "searchTxt", arrayConfig: "CONTAINS" },
    { fieldPath: "priority", order: "ASCENDING" },
  ],
  [
    { fieldPath: "searchTxt", arrayConfig: "CONTAINS" },
    { fieldPath: "createdAt", order: "DESCENDING" },
  ],
  [
    { fieldPath: "searchTxt", arrayConfig: "CONTAINS" },
    { fieldPath: "question", order: "ASCENDING" },
  ],
  // search + the isActive filter chip + the one sort that had no pairing
  [
    { fieldPath: "searchTxt", arrayConfig: "CONTAINS" },
    { fieldPath: "isActive", order: "ASCENDING" },
    { fieldPath: "question", order: "ASCENDING" },
  ],
];

const sig = (fields) =>
  fields.map((f) => `${f.fieldPath}:${f.order ?? f.arrayConfig}`).join(",");

const existing = new Set(
  json.indexes.filter((i) => i.collectionGroup === "faqs").map((i) => sig(i.fields)),
);

let added = 0;
for (const fields of WANTED) {
  if (existing.has(sig(fields))) {
    console.log(`  = already present: ${sig(fields)}`);
    continue;
  }
  json.indexes.push({ collectionGroup: "faqs", queryScope: "COLLECTION", fields });
  existing.add(sig(fields));
  console.log(`  + added: ${sig(fields)}`);
  added++;
}

if (added > 0) writeFileSync(PATH, JSON.stringify(json, null, 2) + "\n");
console.log(`\n${added} index(es) added to ${PATH}`);

// Negative control: every wanted index must now be present, or the write failed.
const after = new Set(
  JSON.parse(readFileSync(PATH, "utf8"))
    .indexes.filter((i) => i.collectionGroup === "faqs")
    .map((i) => sig(i.fields)),
);
const missing = WANTED.filter((f) => !after.has(sig(f)));
if (missing.length) {
  console.error(`✗ ${missing.length} wanted index(es) are STILL absent after writing.`);
  process.exit(1);
}
console.log("✓ all four verified present on re-read");
