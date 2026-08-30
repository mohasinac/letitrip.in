#!/usr/bin/env node
/**
 * audit-action-index — strict-zero.
 *
 * ## Why a deep link needs its own audit
 *
 * An action-index entry promises "click this and you land on the control".
 * Nothing else checks that promise: `?tab=` is a string, `#anchor` is a
 * string, and both resolve to *something* — the wrong tab, or the top of the
 * page — rather than to an error. So a broken deep link does not fail, it
 * quietly under-delivers, and reads to the user as the search having missed.
 * That is the same shape as Root Cause #32's dead tester `href`s.
 *
 * **R1 · AIX_DEAD_TAB** — a `deepLink`'s `?tab=` is not in `SiteSettingsTabId`.
 * **R2 · AIX_DEAD_ANCHOR** — its `#anchor` matches no `id=` literal in the view.
 * **R3 · AIX_DUPLICATE_ID** — two entries share an id. The id is the overlay's
 *   React key and the `navConfig`/control-plane key, so a duplicate means one
 *   entry silently shadows the other and an admin's override lands on whichever
 *   happens to be first.
 *
 * 🛑 **This runs on CI, which is not enough on its own.** An admin-authored
 * entry (D7) is written at runtime and would 404 until the next audit run —
 * the write route has to perform these same three checks server-side and
 * return a 400. This audit covers the STATIC base; the route covers the rest.
 *
 * Suppression: `// audit-action-index-ok: <reason>`.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const ENTRIES_FILE = "appkit/src/features/search/action-index/settings-entries.ts";
const TABS_FILE = "appkit/src/features/admin/constants/site-settings-tabs.ts";
const VIEW_FILE = "appkit/src/features/admin/components/AdminSiteSettingsView.tsx";

const entriesRaw = readFileSync(join(ROOT, ENTRIES_FILE), "utf8");
const entriesSrc = stripComments(entriesRaw);
const entryLines = entriesRaw.split("\n");

/** Every declared tab id. */
const tabIds = new Set(
  [...stripComments(readFileSync(join(ROOT, TABS_FILE), "utf8")).matchAll(/^\s{4}id:\s*"([^"]+)"/gm)].map(
    (m) => m[1],
  ),
);

/** Every `id="..."` literal the settings view renders. */
const anchors = new Set(
  [...readFileSync(join(ROOT, VIEW_FILE), "utf8").matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]),
);

const violations = [];
const seenSlugs = new Map();

/*
 * Parse each `{ slug, ..., tab, kind }` object out of SITE_SETTINGS_ENTRIES.
 * Textual rather than imported: the module is TypeScript and this audit runs
 * under bare node.
 */
const listStart = entriesSrc.indexOf("export const SITE_SETTINGS_ENTRIES");
const listEnd = entriesSrc.indexOf("\n];", listStart);
const list = entriesSrc.slice(listStart, listEnd);

for (const m of list.matchAll(/\{\s*slug:\s*"([^"]+)"([\s\S]*?)tab:\s*"([^"]+)"[\s\S]*?kind:\s*"([^"]+)"/g)) {
  const [, slug, between, tab, kind] = m;
  const claimsAnchor = /anchored:\s*true/.test(between) || /anchored:\s*true/.test(m[0]);
  const line = entriesSrc.slice(0, listStart + m.index).split("\n").length;
  const suppressed =
    /audit-action-index-ok:/.test(entryLines[line - 1] ?? "") ||
    /audit-action-index-ok:/.test(entryLines[line - 2] ?? "");
  if (suppressed) continue;

  if (seenSlugs.has(slug)) {
    violations.push({
      file: ENTRIES_FILE,
      line,
      rule: "AIX_DUPLICATE_ID",
      detail: `slug "${slug}" is already used at line ${seenSlugs.get(slug)} — one entry would silently shadow the other`,
    });
  }
  seenSlugs.set(slug, line);

  if (!tabIds.has(tab)) {
    violations.push({
      file: ENTRIES_FILE,
      line,
      rule: "AIX_DEAD_TAB",
      detail: `"${slug}" deep-links to ?tab=${tab}, which is not a SiteSettingsTabId — the page would open on its default tab and look like the search missed`,
    });
  }

  /*
   * Only entries that CLAIM an anchor are checked for one. An entry without
   * `anchored: true` deep-links to its tab, which is a smaller promise and one
   * the page can keep — see the field's own comment.
   */
  const anchor = `setting-${slug}`;
  if (claimsAnchor && !anchors.has(anchor)) {
    violations.push({
      file: ENTRIES_FILE,
      line,
      rule: "AIX_DEAD_ANCHOR",
      detail: `"${slug}" deep-links to #${anchor}, and no id="${anchor}" exists in AdminSiteSettingsView — the link scrolls nowhere`,
    });
  }
  void kind;
}

if (violations.length === 0) {
  console.log(
    `audit-action-index: clean ✓ (${seenSlugs.size} settings entr(y|ies), every tab and anchor resolves)`,
  );
  process.exit(0);
}

console.error(`[audit-action-index] ${violations.length} violation(s):\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
  console.error(`      ${v.detail}\n`);
}
console.error("  Suppression: // audit-action-index-ok: <reason>");
process.exit(1);
