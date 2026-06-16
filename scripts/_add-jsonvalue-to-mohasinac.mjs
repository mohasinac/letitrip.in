#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const FILES = `
src/app/api/admin/admin-notifications/route.ts
src/app/api/admin/admin-notifications/[id]/route.ts
src/app/api/admin/item-requests/[id]/route.ts
src/app/api/admin/moderation/[id]/route.ts
src/app/api/admin/reports/[id]/route.ts
src/app/api/admin/roles/route.ts
src/app/api/admin/roles/[id]/route.ts
src/app/api/item-requests/route.ts
src/app/api/reports/route.ts
src/app/api/store/analytics/alerts/route.ts
src/app/api/store/analytics/alerts/[id]/route.ts
src/app/api/store/analytics/cards/route.ts
src/app/api/store/analytics/cards/[id]/route.ts
src/app/api/store/categories/route.ts
src/app/api/store/google-reviews/route.ts
src/app/api/store/grouped-listings/route.ts
src/app/api/store/grouped-listings/[id]/route.ts
src/app/api/store/listing-templates/route.ts
src/app/api/store/payout-methods/route.ts
src/app/api/store/payout-methods/[id]/route.ts
`.split("\n").map((s) => s.trim()).filter(Boolean);

for (const rel of FILES) {
  const abs = "d:/proj/letitrip.in/" + rel;
  if (!existsSync(abs)) {
    console.log(`MISSING: ${rel}`);
    continue;
  }
  let src = readFileSync(abs, "utf8");
  if (src.includes("type JsonValue") || src.includes("JsonValue }")) {
    console.log(`SKIP (already has): ${rel}`);
    continue;
  }
  // Match: `parseJsonBody,` standalone on a line OR end of multi-line import
  // Insert `type JsonValue,` right after `parseJsonBody,`
  const newSrc = src.replace(/(\n\s*parseJsonBody,)(\n)/, "$1\n  type JsonValue,$2");
  if (newSrc === src) {
    console.log(`NO MATCH: ${rel}`);
    continue;
  }
  writeFileSync(abs, newSrc);
  console.log(`ADDED: ${rel}`);
}
