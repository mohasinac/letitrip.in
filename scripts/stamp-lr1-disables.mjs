#!/usr/bin/env node
// One-shot helper: stamps an eslint-disable header on each file in the
// LR1 backlog so the `npm run check` gate stays at 0 errors while the
// raw-HTML migration plays out file-by-file. Each disable comment cites
// the **exact** `crud-tracker.md` Tier LR row id (`LR1-NN`) so closing
// a row gives the reviewer a one-step pointer back to this file.
//
// The disable must sit AFTER any `"use client"` / `"use server"` directive
// — directives have to be the first statement.
//
// Usage:
//   node scripts/stamp-lr1-disables.mjs <list-file>
//
// The list file is a 1-line-per-path workspace-relative manifest produced
// by `scripts/extract-lint-raw-html.mjs`. The mapping from file → tracker
// row is hardcoded below; new rows must be added here AND to the tracker.
import fs from "fs";
import path from "path";

// Single source of truth: list order must match `crud-tracker.md` Tier LR
// table order so file ↔ row alignment never drifts.
const FILE_TO_LR_ROW = {
  "src/components/dev/SeedPanel.tsx": "LR1-01",
  "src/app/[locale]/scams/report/page.tsx": "LR1-02",
  "src/components/user/ProfilePageClient.tsx": "LR1-03",
  "src/app/[locale]/store/sublisting-categories/new/page.tsx": "LR1-04",
  "src/app/[locale]/store/sublisting-categories/[id]/edit/page.tsx": "LR1-05",
  "src/app/[locale]/events/[id]/PollInlineClient.tsx": "LR1-06",
  "src/app/[locale]/sublisting-categories/[slug]/page.tsx": "LR1-07",
  "src/app/[locale]/user/orders/[id]/cancel/page.tsx": "LR1-08",
  "src/app/[locale]/store/sublisting-categories/page.tsx": "LR1-09",
  "src/components/dev/DevToolbar.tsx": "LR1-10",
  "src/components/user/UserAddressesClient.tsx": "LR1-11",
  "src/components/admin/AdminAnalyticsClient.tsx": "LR1-12",
  "src/app/[locale]/user/messages/page.tsx": "LR1-13",
  "src/app/[locale]/stores/[storeSlug]/about/StoreAboutClient.tsx": "LR1-14",
  "src/app/[locale]/auth/close/page.tsx": "LR1-15",
  "src/components/user/FontToggleClient.tsx": "LR1-16",
  "src/components/routing/CartRouteClient.tsx": "LR1-17",
  "src/components/layout/FooterNewsletterSlot.tsx": "LR1-18",
  "src/components/homepage/HomepageNewsletterForm.tsx": "LR1-19",
  "src/app/[locale]/user/notifications/page.tsx": "LR1-20",
  "src/app/[locale]/admin/dashboard/page.tsx": "LR1-21",
  "src/components/user/EditAddressClient.tsx": "LR1-22",
  "src/app/[locale]/user/history/page.tsx": "LR1-23",
  "src/app/[locale]/events/[id]/participate/EventParticipateClient.tsx": "LR1-24",
  "src/app/[locale]/store/coupons/[id]/edit/page.tsx": "LR1-25",
  "src/app/[locale]/user/bids/page.tsx": "LR1-26",
  "src/app/[locale]/user/page.tsx": "LR1-27",
  "src/app/[locale]/user/reviews/page.tsx": "LR1-28",
  "src/app/[locale]/user/settings/page.tsx": "LR1-29",
  "src/app/[locale]/wishlist/page.tsx": "LR1-30",
  "src/app/[locale]/blog/[slug]/ShareButtons.tsx": "LR1-31",
  "src/app/[locale]/events/[id]/EventDetailClient.tsx": "LR1-32",
  "src/app/[locale]/events/[id]/ShareEventButton.tsx": "LR1-33",
  "src/app/[locale]/admin/sublisting-categories/page.tsx": "LR1-34",
  "src/app/[locale]/store/templates/page.tsx": "LR1-35",
  "src/components/user/AddAddressClient.tsx": "LR1-36",
};

const SENTINEL = "lir/no-raw-html-elements";

function disableLine(rowId) {
  return `/* eslint-disable lir/no-raw-html-elements, lir/no-raw-media-elements -- ${rowId}: legacy raw HTML — migration tracked in crud-tracker.md Tier LR (row ${rowId}) */`;
}

const listPath = process.argv[2];
if (!listPath) {
  console.error("usage: stamp-lr1-disables.mjs <list-file>");
  process.exit(1);
}
const files = fs
  .readFileSync(listPath, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

let stamped = 0;
let updated = 0;
let skipped = 0;
const missing = [];
for (const rel of files) {
  const rowId = FILE_TO_LR_ROW[rel];
  if (!rowId) {
    missing.push(rel);
    continue;
  }
  const abs = path.resolve(rel);
  const src = fs.readFileSync(abs, "utf8");
  const expected = disableLine(rowId);
  if (src.includes(expected)) {
    skipped++;
    continue;
  }

  const lines = src.split("\n");
  // Remove any pre-existing LR1 disable line so we re-stamp the canonical text
  // (handles older runs that omitted the row id).
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    if (lines[i].includes(SENTINEL)) {
      lines.splice(i, 1);
      updated++;
      break;
    }
  }
  let insertAt = 0;
  const directiveRe = /^\s*['"`]use (client|server)['"`]\s*;?\s*$/;
  for (let i = 0; i < Math.min(lines.length, 4); i++) {
    if (directiveRe.test(lines[i])) insertAt = i + 1;
    else if (lines[i].trim() === "") continue;
    else break;
  }
  lines.splice(insertAt, 0, expected);
  fs.writeFileSync(abs, lines.join("\n"));
  stamped++;
}
console.log(
  `[stamp-lr1] stamped ${stamped} (updated ${updated}), skipped ${skipped} unchanged.`,
);
if (missing.length) {
  console.error(
    `[stamp-lr1] WARNING — ${missing.length} file(s) not in FILE_TO_LR_ROW map. Add them to crud-tracker.md Tier LR + this script before re-running:`,
  );
  missing.forEach((m) => console.error(`  · ${m}`));
  process.exit(2);
}
