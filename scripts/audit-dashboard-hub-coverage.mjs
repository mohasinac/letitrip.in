#!/usr/bin/env node
/**
 * audit-dashboard-hub-coverage — the dashboard hubs stay DERIVED from the nav,
 * and every attention count stays attached to a nav item that exists.
 *
 * The hubs (`/admin`, `/{portal}/sections/[section]`) have no content of their
 * own: a section is a nav group, a card is a nav item, and the sentence on the
 * card is that item's `description`. Three things can break that silently, and
 * each is a rule here.
 *
 * ## R1 SLUG_COLLISION — an unreachable hub
 *
 * `hubSectionSlug` is lossy ("Trust & Safety" → `trust-safety`), so two titles
 * in one portal CAN produce one slug. The second hub then answers nothing and
 * the first answers for both, with no error anywhere. Checked statically
 * because the alternative is a runtime throw on a live dashboard, and a silent
 * de-dupe would hide exactly this.
 *
 * ## R2 MISSING_HUB_ROUTE — sections with nowhere to go
 *
 * A portal whose nav has groups must have a `sections/[section]/page.tsx`, or
 * every section card on its landing page 404s.
 *
 * ## R3 DEAD_ATTENTION_KEY — a count nothing can display
 *
 * `ATTENTION_SOURCES` is keyed by nav item id. A key matching no nav item runs
 * a Firestore query whose result is then dropped on the floor — a billed read
 * producing a number no card can show. This is the silent half of Root Cause
 * #62: a filter emitted on a field the allowlist omits simply vanishes, and the
 * only tell is that nothing happens.
 *
 * ## R4 MIRRORED_ID_RULE — this audit's own duplication, tripwired
 *
 * 🛑 R3 needs a nav item's id, which is `navItemId(portal, href)` — a TypeScript
 * function this `.mjs` audit cannot import (and `appkit/dist` does not exist in
 * a worktree, so the compiled form is not available either). So the
 * normalisation is MIRRORED below, which is the duplication this codebase keeps
 * paying for (Root Cause #75).
 *
 * The mitigation is the same one `GATED_PRICE_CLASS` / `GATED_PRICE_SELECTOR`
 * use for their cross-file literal: R4 asserts that `navItemId`'s source still
 * contains the exact replace chain mirrored here. Edit either side and this
 * audit fails naming itself, rather than quietly computing ids by a rule the
 * app no longer uses.
 *
 * Strict zero. No suppression marker — each rule is a statement about whether
 * two derived things agree, and there is no case where they legitimately do
 * not.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const NAV_FILE = "src/constants/navigation.tsx";
const ROUTE_MAP = "appkit/src/next/routing/route-map.ts";
const ID_HELPER = "appkit/src/_internal/shared/features/layout/types.ts";
const ATTENTION = "appkit/src/_internal/server/features/dashboard/attention.ts";
const HUB_SECTIONS = "appkit/src/_internal/shared/features/dashboard/hub-sections.ts";

const PORTALS = [
  { portal: "admin", groupsConst: "ADMIN_NAV_GROUPS", itemFn: "adminItem", page: "src/app/[locale]/admin/sections/[section]/page.tsx" },
  { portal: "store", groupsConst: "STORE_NAV_GROUPS", itemFn: "storeItem", page: "src/app/[locale]/store/sections/[section]/page.tsx" },
  { portal: "user", groupsConst: "USER_NAV_GROUPS", itemFn: "userItem", page: "src/app/[locale]/user/sections/[section]/page.tsx" },
];

/**
 * The replace chain `navItemId` applies, mirrored. R4 is what keeps it true.
 *
 * Kept as separate literals rather than one regex so R4 can look for each in
 * the helper's source — a single fused pattern would match nothing there and
 * the tripwire would fire on day one.
 */
const ID_RULE_FRAGMENTS = [
  String.raw`replace(/^https?:\/\/[^/]+/, "")`,
  String.raw`replace(/^\/[a-z]{2}(-[A-Z]{2})?(?=\/)/, "")`,
  String.raw`replace(/[?#].*$/, "")`,
  String.raw`replace(/^\/+|\/+$/g, "")`,
  String.raw`replace(/[^a-zA-Z0-9/-]+/g, "-")`,
  String.raw`replace(/\//g, "-")`,
];

/** Mirror of `navItemId`. See R4. */
function navItemId(portal, href) {
  const path = href
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/[a-z]{2}(-[A-Z]{2})?(?=\/)/, "")
    .replace(/[?#].*$/, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9/-]+/g, "-")
    .replace(/\//g, "-")
    .toLowerCase();
  return `nav-${portal}-${path || "root"}`;
}

/** Mirror of `hubSectionSlug`. Three lines, and R1 is about its output. */
function hubSectionSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function read(rel) {
  const abs = join(ROOT, rel);
  return existsSync(abs) ? readFileSync(abs, "utf8") : null;
}

/**
 * Strip comments so a documented example cannot be mistaken for real code.
 *
 * ## 🛑 A character SCANNER, not two regexes — and this is not fastidiousness
 *
 * The first version was the usual pair: block comments, then line comments.
 * `navigation.tsx:390` is
 *
 *     // SB5-A — DX34 will swap these for external docs.letitrip.in/sellers/* URLs.
 *
 * — a LINE comment containing `/*`. Running the block pass first, that `/*`
 * opened a comment which closed at the next real `*​/` seven hundred lines
 * later, swallowing the `STORE_NAV_GROUPS` declaration whole. The audit then
 * reported `MISSING_NAV_CONST` for store, silently widened admin's slice over
 * store's groups (so R1 "found" two `Guides` sections that are in different
 * portals), and failed all six attention keys because no href parsed at all.
 *
 * Six findings, every one of them fiction, from one apostrophe-shaped
 * character sequence inside a comment. Same class as the brace-in-a-CSS-comment
 * trap `audit-theme-drift` documents, and the reason an audit's parser is worth
 * more care than the rule it feeds.
 *
 * Swapping the order is not a fix either: a block comment whose closing `*​/`
 * shares a line with a `//` would then be truncated instead. Tracking state is
 * the only version that is right for both.
 */
function stripComments(src) {
  let out = "";
  let i = 0;
  let state = "code"; // code | line | block | sq | dq | tpl
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (state === "code") {
      if (c === "/" && next === "/") { state = "line"; out += " "; i += 2; continue; }
      if (c === "/" && next === "*") { state = "block"; out += " "; i += 2; continue; }
      if (c === "'") state = "sq";
      else if (c === '"') state = "dq";
      else if (c === "`") state = "tpl";
      out += c; i += 1; continue;
    }
    if (state === "line") {
      if (c === "\n") { state = "code"; out += c; }
      i += 1; continue;
    }
    if (state === "block") {
      if (c === "*" && next === "/") { state = "code"; i += 2; continue; }
      /* Newlines are preserved so reported line numbers stay truthful. */
      if (c === "\n") out += c;
      i += 1; continue;
    }
    /*
     * Inside a string: copy verbatim, honour escapes, close on the matching
     * quote. The opener was consumed by the `code` branch, so the first
     * character this branch sees is already the string's content — and if that
     * character IS the quote, the string was empty and closing here is right.
     *
     * 🛑 Known limit: a regex LITERAL containing a quote character
     * (`/['"]/`) would be read as opening a string. Telling a regex from a
     * division needs a real parser, and `navigation.tsx` contains no such
     * literal — but a future one would make this scanner wrong, so prefer
     * named constants over inline regexes in that file.
     */
    out += c;
    if (c === "\\") { out += src[i + 1] ?? ""; i += 2; continue; }
    if ((state === "sq" && c === "'") || (state === "dq" && c === '"') || (state === "tpl" && c === "`")) {
      state = "code";
    }
    i += 1;
  }
  return out;
}

const violations = [];
const push = (rule, where, detail, hint) =>
  violations.push({ rule, where, detail, hint });

/* ── Required files ────────────────────────────────────────────────────────
 *
 * A missing file FAILS rather than being skipped. A stale registration that
 * silently stops checking the thing it names is Root Cause #56/#84, and this
 * audit's whole value is in the cross-checks below.
 */
for (const rel of [NAV_FILE, ROUTE_MAP, ID_HELPER, ATTENTION, HUB_SECTIONS]) {
  if (!read(rel)) {
    push(
      "MISSING_SUBJECT",
      rel,
      "(file this audit checks does not exist)",
      "Point the constant at the file's new home, or remove the rule that needs it.\n" +
        "      An audit that skips a missing subject reports the same OK as one that checked it.",
    );
  }
}
if (violations.length > 0) {
  report();
}

/* ── R4: the mirrored id rule still matches the helper ─────────────────── */
const idHelperSrc = read(ID_HELPER) ?? "";
for (const fragment of ID_RULE_FRAGMENTS) {
  if (!idHelperSrc.includes(fragment)) {
    push(
      "MIRRORED_ID_RULE",
      ID_HELPER,
      fragment,
      "`navItemId` no longer applies this transform, so the mirror in this audit\n" +
        "      computes ids the app does not use — and R3 would then pass or fail on\n" +
        "      fiction. Update ID_RULE_FRAGMENTS and the `navItemId` mirror together.",
    );
  }
}

/* ── Resolve ROUTES.<PORTAL>.<KEY> → path, for static string values ────── */
const routeMapSrc = read(ROUTE_MAP) ?? "";
const routePaths = new Map(); // "ADMIN.ORDERS" -> "/admin/orders"
{
  let portalKey = null;
  for (const line of routeMapSrc.split(/\r?\n/)) {
    const portalMatch = /^\s{2}([A-Z_]+):\s*\{/.exec(line);
    if (portalMatch) {
      portalKey = portalMatch[1];
      continue;
    }
    const entry = /^\s{4}([A-Z_0-9]+):\s*"([^"]+)"/.exec(line);
    if (entry && portalKey) routePaths.set(`${portalKey}.${entry[1]}`, entry[2]);
  }
}

/* ── Parse nav groups: title → item hrefs ──────────────────────────────── */
const navSrc = stripComments(read(NAV_FILE) ?? "");
const navByPortal = new Map(); // portal -> [{ title, hrefs: [] }]

for (const { portal, groupsConst, itemFn } of PORTALS) {
  const start = navSrc.indexOf(`${groupsConst}:`);
  if (start < 0) {
    push(
      "MISSING_NAV_CONST",
      NAV_FILE,
      groupsConst,
      "The hubs derive their sections from this constant. If it was renamed, this\n" +
        "      audit stops checking that portal entirely while still reporting clean.",
    );
    continue;
  }
  /*
   * The slice runs to the NEXT portal constant (or end of file), which is
   * sufficient because the three arrays are declared in order and no other
   * construct in this file calls `adminItem` / `storeItem` / `userItem`.
   */
  const nextStarts = PORTALS.map((p) => navSrc.indexOf(`${p.groupsConst}:`))
    .filter((i) => i > start);
  const end = nextStarts.length > 0 ? Math.min(...nextStarts) : navSrc.length;
  const slice = navSrc.slice(start, end);

  const groups = [];
  let current = null;
  for (const line of slice.split(/\r?\n/)) {
    const title = /^\s+title:\s*(?:"([^"]+)"|([A-Z_]+))/.exec(line);
    if (title) {
      /*
       * A title given as a CONSTANT (`STORE_LISTINGS_GROUP_TITLE`) is resolved
       * from its own declaration — a group whose title this audit could not
       * read would be silently exempt from R1, which is the collision rule.
       */
      let resolved = title[1];
      if (!resolved && title[2]) {
        const decl = new RegExp(`${title[2]}\\s*=\\s*"([^"]+)"`).exec(navSrc);
        resolved = decl ? decl[1] : null;
        if (!resolved) {
          push(
            "UNRESOLVED_GROUP_TITLE",
            NAV_FILE,
            title[2],
            "This audit cannot read the group's title, so its slug cannot be checked\n" +
              "      for collisions. Declare it as a plain string literal in this file.",
          );
        }
      }
      if (resolved) {
        current = { title: resolved, hrefs: [] };
        groups.push(current);
      }
      continue;
    }
    const item = new RegExp(`${itemFn}\\(\\s*(?:String\\()?ROUTES\\.([A-Z_]+)\\.([A-Z_0-9]+)`).exec(line);
    if (item && current) {
      const path = routePaths.get(`${item[1]}.${item[2]}`);
      if (path) current.hrefs.push(path);
      continue;
    }
    const literal = new RegExp(`${itemFn}\\(\\s*"([^"]+)"`).exec(line);
    if (literal && current) current.hrefs.push(literal[1]);
  }
  navByPortal.set(portal, groups);
}

/* ── R1: no two sections in a portal share a slug ──────────────────────── */
for (const [portal, groups] of navByPortal) {
  const seen = new Map();
  for (const group of groups) {
    const slug = hubSectionSlug(group.title);
    if (!slug) {
      push(
        "SLUG_COLLISION",
        NAV_FILE,
        `${portal}: "${group.title}" slugs to the empty string`,
        "Its hub would answer on `/<portal>/sections/` and never resolve.",
      );
      continue;
    }
    if (seen.has(slug)) {
      push(
        "SLUG_COLLISION",
        NAV_FILE,
        `${portal}: "${seen.get(slug)}" and "${group.title}" both slug to "${slug}"`,
        "One of the two hubs is unreachable — the first match answers for both, and\n" +
          "      nothing errors. Rename one group so the slugs differ.",
      );
      continue;
    }
    seen.set(slug, group.title);
  }
}

/* ── R2: every portal with sections has a hub route ────────────────────── */
for (const { portal, page } of PORTALS) {
  const groups = navByPortal.get(portal) ?? [];
  if (groups.length === 0) continue;
  if (!read(page)) {
    push(
      "MISSING_HUB_ROUTE",
      page,
      `${portal} has ${groups.length} nav group(s) and no hub route`,
      "Every section card on the landing page links to this route. Without it they\n" +
        "      all 404 — and the landing page itself still renders, so nothing says so.",
    );
  }
}

/* ── R3: every attention key names a real nav item ──────────────────────── */
{
  const attentionSrc = stripComments(read(ATTENTION) ?? "");
  const block = /ATTENTION_SOURCES[^=]*=\s*\{([\s\S]*?)\n\};/.exec(attentionSrc);
  if (!block) {
    push(
      "MISSING_ATTENTION_REGISTRY",
      ATTENTION,
      "ATTENTION_SOURCES not found",
      "R3 cross-checks its keys against the nav. If the registry moved or was\n" +
        "      renamed, this rule stops checking anything while reporting clean.",
    );
  } else {
    const keys = [...block[1].matchAll(/^\s{2}"([^"]+)":/gm)].map((m) => m[1]);
    if (keys.length === 0) {
      push(
        "MISSING_ATTENTION_REGISTRY",
        ATTENTION,
        "ATTENTION_SOURCES parsed to zero keys",
        "Either the registry is empty (then delete it rather than shipping an empty\n" +
          "      one) or the key shape changed and this rule now checks nothing.",
      );
    }

    const allIds = new Set();
    for (const [portal, groups] of navByPortal) {
      for (const group of groups) {
        for (const href of group.hrefs) allIds.add(navItemId(portal, href));
      }
    }

    for (const key of keys) {
      if (!allIds.has(key)) {
        push(
          "DEAD_ATTENTION_KEY",
          ATTENTION,
          key,
          "No nav item has this id, so the count it guards is computed from Firestore\n" +
            "      and then dropped — a billed read producing a number no card can render.\n" +
            "      Fix the key, or delete the source if its screen is gone.",
        );
      }
    }
  }
}

function report() {
  if (violations.length > 0) {
    console.error(`[audit-dashboard-hub-coverage] FAIL: ${violations.length} violation(s).\n`);
    for (const v of violations) {
      console.error(`  ${v.where}  [${v.rule}]`);
      console.error(`      ${v.detail}`);
      console.error(`      ${v.hint}\n`);
    }
    process.exit(1);
  }
}

report();

const sectionCount = [...navByPortal.values()].reduce((n, g) => n + g.length, 0);
console.log(
  `[audit-dashboard-hub-coverage] OK: 0 violations (${sectionCount} sections across ${navByPortal.size} portals).`,
);
