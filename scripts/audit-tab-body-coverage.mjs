#!/usr/bin/env node
/**
 * audit-tab-body-coverage.mjs — a tab you can click that renders nothing.
 *
 * WHY THIS EXISTS
 *
 * `CategoryDetailTabs.tsx` rendered a tab bar from `CATEGORY_PAGE_TABS` (10
 * tabs) but only had render branches for six of them. Clicking Classifieds,
 * Digital Codes, Live Items or Art gave you a highlighted tab and an empty
 * page — no error, no empty-state, nothing. Its brand-page twin had the same
 * root gap with the opposite symptom: an `if (!mapping) return false` filter
 * that silently DROPPED those four tabs from the bar entirely, so the types
 * were unreachable rather than blank.
 *
 * Both are the same defect as Root Cause #8 (a slot shell rendered with no
 * render-props) and Root Cause #56 (a row you can see but never open): a
 * surface that exists in the UI but was never wired to content.
 *
 * WHAT IT CHECKS
 *
 * For each registered tab-rendering component, every listing type must have a
 * reachable render path — satisfied by EITHER:
 *
 *   a) a dedicated branch keyed on the type's tab slug, written as
 *      `pluginFor("<type>").tabSlug` (auctions/pre-orders/prize-draws each
 *      have their own listing component), OR
 *   b) membership in the file's generic listing-type map, which routes the
 *      remaining types through one shared listing component.
 *
 * Comparing against the plugin registry rather than a hardcoded list means a
 * NEW listing type fails here the moment it's added to the union, which is the
 * whole point — that is exactly how art and stickers slipped through before.
 *
 * Plain Node + regex over raw source, no TS compiler — matching this project's
 * audit convention (see audit-filter-tab-enums.mjs / audit-listing-type-tab-
 * coverage.mjs, whose union extractor this shares).
 *
 * Strict zero — any violation blocks.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UNION_FILE = "appkit/src/features/products/types/index.ts";
const UNION_NAME = "ListingType";

/**
 * Components that render a listing-type tab bar and must have a body for
 * every tab in it.
 *
 * `genericMapName` — the in-file map whose keys route types through a shared
 *                    listing component (the `b)` path above).
 * `omit`           — listing types this component legitimately never shows,
 *                    each with a written reason.
 *
 * @type {{file: string, genericMapName: string, omit?: Record<string,string>}[]}
 */
const REGISTRY = [
  {
    file: "appkit/src/features/categories/components/CategoryDetailTabs.tsx",
    genericMapName: "GENERIC_TAB_LISTING_TYPES",
  },
  {
    file: "appkit/src/features/categories/components/BrandDetailTabs.tsx",
    genericMapName: "GENERIC_TAB_LISTING_TYPES",
  },
];

function read(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

function extractUnion(src, name) {
  const re = new RegExp(`export type ${name}\\s*=([^;]+);`, "s");
  const m = re.exec(src);
  if (!m) return null;
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

/** Balanced-brace slice of `const NAME ... = { … }`. */
function sliceRecordBody(src, name) {
  const declRe = new RegExp(`(?:export\\s+)?const\\s+${name}\\b`);
  const m = declRe.exec(src);
  if (!m) return null;
  const eq = /=\s*\{/.exec(src.slice(m.index));
  if (!eq) return null;
  const start = src.indexOf("{", m.index + eq.index);
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) return src.slice(start + 1, i);
    }
  }
  return null;
}

function main() {
  const types = extractUnion(read(UNION_FILE), UNION_NAME);
  if (!types) {
    console.error(
      `audit-tab-body-coverage: could not read the ${UNION_NAME} union from ` +
        `${UNION_FILE} — this audit's extractor is stale.`,
    );
    process.exit(1);
  }

  /** @type {string[]} */
  const violations = [];
  let checked = 0;

  for (const entry of REGISTRY) {
    const path = join(ROOT, entry.file);
    if (!existsSync(path)) {
      violations.push(
        `MISSING_FILE — ${entry.file} is registered here but does not exist. ` +
          `Update this audit's REGISTRY if the component moved or was deleted.`,
      );
      continue;
    }
    const src = stripComments(readFileSync(path, "utf8"));
    checked++;

    const genericBody = sliceRecordBody(src, entry.genericMapName);
    if (genericBody === null) {
      violations.push(
        `UNPARSEABLE — could not locate \`${entry.genericMapName}\` in ${entry.file}. ` +
          `The audit registry is stale, or the map's declaration shape changed.`,
      );
      continue;
    }

    // Types routed through the shared listing component. Keys are written as
    // `[pluginFor("<type>").tabSlug]:` so the slug itself stays derived.
    const genericTypes = new Set(
      [...genericBody.matchAll(/pluginFor\("([^"]+)"\)\.tabSlug/g)].map((m) => m[1]),
    );
    // ART_STICKERS_LISTING_TYPES is a shared constant covering exactly these
    // two; a file referencing it routes both even though only `art` names a slug.
    if (/ART_STICKERS_LISTING_TYPES/.test(genericBody)) {
      genericTypes.add("art");
      genericTypes.add("stickers");
    }

    // Types with their own dedicated branch outside the generic map.
    const dedicatedTypes = new Set(
      [...src.matchAll(/activeTab\s*===\s*pluginFor\("([^"]+)"\)\.tabSlug/g)].map(
        (m) => m[1],
      ),
    );

    const omit = entry.omit ?? {};
    for (const type of types) {
      if (omit[type]) continue;
      if (genericTypes.has(type) || dedicatedTypes.has(type)) continue;
      violations.push(
        `NO_BODY — ${entry.file} renders a tab for listing type "${type}" but has ` +
          `no render branch for it.\n    Add it to \`${entry.genericMapName}\` (shared ` +
          `listing component) or give it a dedicated \`activeTab === pluginFor("${type}").tabSlug\` ` +
          `branch. A tab with no body renders a blank panel.`,
      );
    }
  }

  if (violations.length === 0) {
    console.log(
      `audit-tab-body-coverage: clean ✓ (${checked} component(s), all ${types.length} ` +
        `listing types have a render path)`,
    );
    process.exit(0);
  }

  console.error(`audit-tab-body-coverage: ${violations.length} violation(s) found.\n`);
  console.error("A tab the user can click that renders nothing — see this script's header.\n");
  for (const v of violations) console.error(`  ${v}\n`);
  process.exit(1);
}

main();
