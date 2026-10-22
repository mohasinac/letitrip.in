#!/usr/bin/env node
/**
 * ── audit-owner-toolbar-placement ────────────────────────────────────────────
 *
 * WHY: `OwnerQuickActions` is the pencil/clone/bin strip an admin or seller
 *      sees on a public page. Nothing enforced where it went, so every caller
 *      picked somewhere — and they picked differently.
 *
 * 🛑 THE NUMBERS THAT MADE THIS NECESSARY, measured 2026-10-21 after a bug
 * report that read "the edit icons appear at random places". It was literal:
 *
 *   ProductGrid               absolute right-2 top-14   on the product PHOTO
 *   MarketplaceBundleCard     absolute right-2 top-2    on the badges
 *   MarketplacePrizeDrawCard  absolute right-2 top-2    on the badges
 *   MarketplacePreorderCard   absolute right-2 bottom-2 on its own CTA button
 *   MarketplaceAuctionCard    absolute right-2 bottom-2 on its own CTA button
 *   CategoryDetailPageView    rendered BEFORE the <h1>  on top of the title
 *
 * Five card types, four corners, each chosen by elimination against that one
 * card's own overlays — so each was locally reasonable and collectively
 * incoherent. Six DETAIL views had the same shape, rendering the strip above
 * the heading it belongs to.
 *
 * The cards were fixed by moving the toolbar into normal flow at the card
 * foot, and the component now carries its own box. This audit exists so that
 * surface number twenty cannot invent a seventh position.
 *
 * ## R1 — TOOLBAR_BEFORE_HEADING
 *
 * The strip must come AFTER the page's `<h1>` in source order. Above a
 * heading there is nothing for a control strip to belong to, and on a cover
 * hero it renders directly on top of the title.
 *
 * ## R2 — TOOLBAR_CRAMPED_IN_TITLE_ROW
 *
 * It must not share a `<Row>` with the heading UNLESS that Row is
 * `justify="between"`.
 *
 * 🛑 THAT EXEMPTION IS NOT A LOOPHOLE, and leaving it out would have made
 * this audit demand three wrong changes. `justify="between"` is the deliberate
 * title-left / actions-right header — a standard, legible pattern, used by
 * EventHeader, BlogPostView and FranchiseDetailPageView. What was actually
 * broken was `StoreHeader`, whose Row had NO justify, so the strip sat
 * crammed mid-row between the store name, its rating and a trust badge.
 * "Shares a row with the heading" describes both; only one of them is a
 * defect.
 *
 * ## What it does NOT check
 *
 * Whether the thing renders correctly. This is source order and nesting; the
 * pixels need a browser. Said plainly because an audit that passes is often
 * mistaken for a surface that was looked at.
 *
 * @tag domain:admin
 * @tag layer:audit
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN = ["appkit/src", "src"];
const SKIP = new Set(["node_modules", ".next", "dist", ".git", "__tests__"]);

/** The toolbar, by any of its three spellings. Not an import line. */
const TOOLBAR = /<(?:Record|Product)?OwnerQuickActions\b/;
const HEADING = /level=\{1\}|<h1[\s>]/;

/*
 * The component's own source and its two wrappers define the thing; they do
 * not place it. Excluded by path rather than by a marker, because a marker
 * here would be indistinguishable from the suppression comments this repo
 * bans.
 */
const DEFINERS =
  /(OwnerQuickActions|RecordOwnerQuickActions|ProductOwnerQuickActions)\.tsx$/;

function* walk(dir) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.name.endsWith(".tsx")) yield full;
  }
}

/** Blank-fill comments so line numbers stay true (the other audits do this). */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, " "));
}

const findings = [];

/*
 * ## R3 — TOOLBAR_CAN_SHRINK
 *
 * 🛑 R1 and R2 are about DOM ORDER. Neither can see a WIDTH problem, and that
 * blind spot shipped a real bug: the toolbar was `inline-flex` with no shrink
 * constraint, so in the `<Row justify="between">` header it lives in — the
 * layout R2 explicitly EXEMPTS — it compressed below its own content at ~390px.
 * Icons slid under each other and the 44px tap targets stopped being 44px.
 *
 * So the surfaces that SATISFIED this audit were precisely the ones most likely
 * to be wrong on a phone, which is the worst property a rule can have.
 *
 * The fix was one word in the primitive (`shrink-0`), so the rule guards the
 * primitive's contract rather than policing ~20 call sites — the same shape
 * `audit-primitive-child-wrappers` uses for `.appkit-button__content`. A
 * call-site rule would also be wrong here: no caller can fix this, because no
 * caller owns the box.
 */
const TOOLBAR_SRC = "appkit/src/features/admin/components/OwnerQuickActions.tsx";
try {
  const src = readFileSync(join(ROOT, TOOLBAR_SRC), "utf8");
  // Both branches of `boxClass` — the on-media scrim and the themed surface.
  const boxes = src.match(/"inline-flex[^"]*"/g) ?? [];
  if (boxes.length === 0) {
    findings.push({
      rel: TOOLBAR_SRC,
      line: 1,
      rule: "TOOLBAR_CAN_SHRINK",
      why:
        "could not find the `inline-flex` box class at all. If it was renamed " +
        "or restructured, update this rule — a check that silently stops " +
        "looking is worse than no check.",
    });
  }
  for (const box of boxes) {
    if (/\bshrink-0\b/.test(box)) continue;
    findings.push({
      rel: TOOLBAR_SRC,
      line: src.slice(0, src.indexOf(box)).split("\n").length,
      rule: "TOOLBAR_CAN_SHRINK",
      why:
        "the toolbar box lacks `shrink-0`. A flex item defaults to " +
        "flex-shrink: 1, so in the title row it competes with the <h1> for " +
        "width and LOSES at phone widths — compressing below its own content " +
        "and shrinking the 44px tap targets. Keep `shrink-0` so the heading " +
        "wraps instead; a heading wraps gracefully, a row of hit targets does not.",
    });
  }
} catch {
  findings.push({
    rel: TOOLBAR_SRC,
    line: 1,
    rule: "TOOLBAR_CAN_SHRINK",
    why: "file not found — if the primitive moved, repoint TOOLBAR_SRC.",
  });
}

for (const root of SCAN) {
  let base;
  try { base = statSync(join(ROOT, root)) && join(ROOT, root); } catch { continue; }

  for (const file of walk(base)) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    if (DEFINERS.test(rel)) continue;

    const raw = readFileSync(file, "utf8");
    if (!TOOLBAR.test(raw)) continue;

    const lines = stripComments(raw).split("\n");

    const toolbar = lines.findIndex(
      (l) => TOOLBAR.test(l) && !/^\s*import\b/.test(l),
    );
    if (toolbar === -1) continue;

    const heading = lines.findIndex((l) => HEADING.test(l));
    /*
     * No `<h1>` in the file is not a violation — a section renderer or a card
     * legitimately has none, and demanding one would be a different audit
     * about heading structure.
     */
    if (heading === -1) continue;

    /*
     * 🛑 LINE ORDER ONLY MEANS RENDER ORDER WITHIN ONE FUNCTION.
     *
     * `PublicProfileView` calls `renderProfileHero(...)` at L157 and DEFINES
     * it at L230-odd, so its `<h1>` sits at L247 — below a toolbar that
     * actually renders after it. The first version of this rule reported that
     * as a violation, and "move the toolbar below L247" would have moved it
     * out of the component entirely.
     *
     * So: if the two are in different top-level declarations, this rule
     * cannot order them and says nothing. Reporting what it cannot prove is
     * how an audit earns the reputation that gets it ignored.
     */
    const topLevel = [];
    lines.forEach((l, i) => {
      if (/^(export\s+)?(async\s+)?function\s+\w+|^(export\s+)?const\s+\w+\s*[:=].*=>\s*\{?$/.test(l)) {
        topLevel.push(i);
      }
    });
    const declOf = (idx) => {
      let owner = -1;
      for (const start of topLevel) {
        if (start <= idx) owner = start;
        else break;
      }
      return owner;
    };
    if (topLevel.length > 1 && declOf(toolbar) !== declOf(heading)) continue;

    // R1 — order.
    if (toolbar < heading) {
      findings.push({
        rel,
        line: toolbar + 1,
        rule: "TOOLBAR_BEFORE_HEADING",
        why:
          `the owner toolbar renders at L${toolbar + 1}, above the <h1> at ` +
          `L${heading + 1}. Move it below the heading — on a cover hero it ` +
          `draws directly on top of the title.`,
      });
      continue;
    }

    // R2 — cramped inside the title row.
    let openIdx = -1;
    for (let i = heading - 1; i >= 0 && i > heading - 12; i--) {
      if (/^\s*<Row\b/.test(lines[i])) { openIdx = i; break; }
    }
    if (openIdx === -1) continue;

    /*
     * `<Stack>` is vertical, so a toolbar inside one is already below the
     * title — only a `<Row>` puts them side by side. Checking the tag rather
     * than "shares a container" is what keeps BeyDetailPageView and
     * PartDetailPageView out of this, both of which a looser first version
     * reported.
     */
    const indent = (lines[openIdx].match(/^\s*/) || [""])[0].length;
    let closeIdx = lines.length;
    for (let i = openIdx + 1; i < lines.length; i++) {
      const m = lines[i].match(/^(\s*)<\/Row>/);
      if (m && m[1].length === indent) { closeIdx = i; break; }
    }

    const sharesRow = toolbar > openIdx && toolbar < closeIdx;
    if (!sharesRow) continue;

    // Read the opener across its own lines — it may wrap.
    const opener = lines.slice(openIdx, Math.min(openIdx + 4, lines.length)).join(" ");
    if (/justify="between"/.test(opener)) continue;

    findings.push({
      rel,
      line: toolbar + 1,
      rule: "TOOLBAR_CRAMPED_IN_TITLE_ROW",
      why:
        `the owner toolbar shares the <h1>'s <Row> (opened L${openIdx + 1}) ` +
        `and that Row is not justify="between", so the strip sits crammed ` +
        `against the title rather than at the far end of the header. Put it ` +
        `on its own line beneath, or make the Row justify="between".`,
    });
  }
}

if (findings.length > 0) {
  console.error(
    `audit-owner-toolbar-placement: ${findings.length} violation(s)\n`,
  );
  for (const f of findings) {
    console.error(`  ${f.rel}:${f.line}  [${f.rule}]`);
    console.error(`    ${f.why}\n`);
  }
  console.error(
    "There is ONE position for this strip: below the heading, and not wedged\n" +
    "into the title row. It carries its own box — callers supply placement,\n" +
    "not styling.",
  );
  process.exit(1);
}

console.log("audit-owner-toolbar-placement: clean ✓");
