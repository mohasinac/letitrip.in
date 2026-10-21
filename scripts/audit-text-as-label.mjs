#!/usr/bin/env node
/**
 * ── audit-text-as-label ──────────────────────────────────────────────────────
 *
 * WHY: A `<Text>` sitting immediately above a form control, acting as its
 *      label. Visually indistinguishable from a real label; programmatically
 *      nothing — `<Text>` renders a `<p>`, so there is no `<label>`, no
 *      `htmlFor` and no `aria-labelledby`.
 *
 * 🛑 THIS IS THE DECEPTIVE HALF OF THE UNLABELLED-FIELD PROBLEM, and the
 * reason it gets its own audit rather than being folded into a count. A bare
 * `<Input placeholder="Search…">` is obviously unlabelled to anyone reading
 * the code. THIS shape reads as finished: there is a visible label, it is
 * styled like a label, it sits where a label goes. A developer reviewing it
 * sees a labelled field, an accessibility pass reports an unlabelled one, and
 * both are correct about what they are looking at.
 *
 * ── THE NUMBER, MEASURED ────────────────────────────────────────────────────
 *
 * The plan said "392 unlabelled fields, worth +3 grade points". That figure
 * came from a browser pass counting RENDERED instances. Measured in source:
 *
 *   1,050 form controls
 *     131 with no label, aria-label or aria-labelledby
 *      72 of those are this shape — a Text/Span/Heading immediately above
 *
 * The first source measurement said 163, and was wrong: it did not strip
 * comments, so its top-ranked finding was an `<Input>` inside a DOCSTRING
 * explaining a bug. Root Cause #84, in miniature, on the first attempt.
 *
 * ── A RATCHET, NOT STRICT-ZERO ──────────────────────────────────────────────
 *
 * 72 is too many to fix in one pass without a browser to check each against,
 * and a half-migrated form is worse than none — a section where some fields
 * label properly and some do not is harder to reason about than one that is
 * uniformly wrong. So the known set is STAGED and a NEW one fails.
 *
 * 🛑 THE STAGED LIST IS MACHINE-GENERATED FROM A RUN OF THIS RULE
 * (`EMIT_SEED=1 node scripts/audit-text-as-label.mjs`), never hand-typed.
 * CLAUDE.md records why: `listing-delegation` was seeded from a hand-written
 * grep that found 45 routes when the audit found 61, so a quarter of the
 * backlog was invisible to the measurement that defined it.
 *
 * The list may only SHRINK. `MIGRATE=strict` fails everything.
 *
 * ── THE FIX, WHEN YOU GET TO ONE ────────────────────────────────────────────
 *
 *   <Text size="sm" weight="medium">Category page body</Text>
 *   <Textarea value={…} onChange={…} />
 *
 * becomes
 *
 *   <FieldTextarea name="contentBody" label="Category page body" … />
 *
 * — the wrapper owns the label, the id wiring, the hint and the error slot.
 * Where a wrapper will not fit (a `RichTextEditor`, a contenteditable), give
 * the label an `id` and the control `aria-labelledby`; `htmlFor` cannot
 * associate with a non-labelable element.
 *
 * @tag domain:forms
 * @tag layer:audit
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const STRICT = process.env.MIGRATE === "strict";
const EMIT_SEED = process.env.EMIT_SEED === "1";

const CONTROLS =
  "(Input|Textarea|Select|Checkbox|Toggle|Slider|TagInput|DateInput|PaginatedSelect|RichTextEditor)";

const SHAPE = new RegExp(
  `<(?:Text|Span|Heading)\\b[^>]*>[^<]{2,60}</(?:Text|Span|Heading)>\\s*(?:\\{[^}]*\\}\\s*)?<${CONTROLS}\\b`,
  "g",
);

/**
 * Known offenders, keyed `path::control`, counted.
 *
 * 🛑 GENERATED — see the header. Regenerate with `EMIT_SEED=1` after fixing
 * some, and the count for that file must go DOWN. A count going up is the
 * thing being blocked.
 */
const STAGED = new Map(Object.entries({
  "appkit/src/features/addresses/components/AddressLocationFields.tsx": 1,
  "appkit/src/features/admin/components/AdminBlogEditorView.tsx": 2,
  "appkit/src/features/admin/components/AdminCarouselEditorView.tsx": 4,
  "appkit/src/features/admin/components/AdminCategoryEditorView.tsx": 6,
  "appkit/src/features/admin/components/AdminEmployeeEditorView.tsx": 1,
  "appkit/src/features/admin/components/AdminFaqEditorView.tsx": 1,
  "appkit/src/features/admin/components/AdminProductEditorView.tsx": 3,
  "appkit/src/features/admin/components/AdminSectionsView.tsx": 27,
  "appkit/src/features/admin/components/AdminSiteSettingsView.tsx": 6,
  "appkit/src/features/catalogue/components/AdminCatalogueApprovalsView.tsx": 1,
  "appkit/src/features/categories/components/CategoryBundlesListing.tsx": 1,
  "appkit/src/features/events/components/AdminEventEditorView.tsx": 2,
  "appkit/src/features/filters/SwitchFilter.tsx": 1,
  "appkit/src/features/products/components/PrizeDrawItemsEditor.tsx": 1,
  "appkit/src/features/products/components/ProductForm.tsx": 5,
  "appkit/src/features/seller/components/SellerAnalyticsView.tsx": 2,
  "appkit/src/features/seller/components/SellerPayoutRequestView.tsx": 1,
  "appkit/src/features/seller/components/SellerPayoutSettingsView.tsx": 1,
  "appkit/src/features/seller/components/SellerProductsView.tsx": 1,
  "appkit/src/features/seller/components/SellerStorefrontView.tsx": 2,
  "appkit/src/features/shipments/components/AdminShipmentProjectionsView.tsx": 1,
  "src/app/[locale]/user/settings/page.tsx": 1,
  "src/app/[locale]/user/support/[id]/page.tsx": 1,
}));

/*
 * 🛑 Comments MUST be blanked, and the first measurement proved it: its
 * top-ranked finding was an `<Input>` inside a docstring. Blank-filled rather
 * than deleted so reported line numbers still point at the real line.
 */
function stripComments(src) {
  const blank = (m) => m.replace(/[^\n]/g, " ");
  return src
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + blank(m.slice(p.length)));
}

function walk(dir, acc) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (e === "node_modules" || e === "dist" || e === ".next") continue;
    const abs = join(dir, e);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(abs, acc);
    else if (/\.tsx$/.test(e)) acc.push(abs);
  }
  return acc;
}

function scan() {
  const perFile = new Map();
  const details = [];
  for (const abs of walk(join(ROOT, "appkit", "src"), []).concat(
    walk(join(ROOT, "src"), []),
  )) {
    const rel = relative(ROOT, abs).split(sep).join("/");
    const src = stripComments(readFileSync(abs, "utf8"));
    let m;
    SHAPE.lastIndex = 0;
    while ((m = SHAPE.exec(src)) !== null) {
      perFile.set(rel, (perFile.get(rel) ?? 0) + 1);
      details.push({
        file: rel,
        line: src.slice(0, m.index).split("\n").length,
        control: m[1],
      });
    }
  }
  return { perFile, details };
}

const { perFile, details } = scan();

if (EMIT_SEED) {
  console.log("const STAGED = new Map(Object.entries({");
  for (const [f, n] of [...perFile.entries()].sort()) {
    console.log(`  ${JSON.stringify(f)}: ${n},`);
  }
  console.log("}));");
  process.exit(0);
}

const violations = [];
for (const [file, count] of perFile) {
  const allowed = STRICT ? 0 : (STAGED.get(file) ?? 0);
  if (count > allowed) {
    violations.push({
      file,
      count,
      allowed,
      lines: details.filter((d) => d.file === file).map((d) => d.line),
    });
  }
}

/*
 * 🛑 A SHRINKING COUNT IS REPORTED, NOT IGNORED. A ratchet whose entries are
 * never trimmed becomes a baseline, which is the drift mode CLAUDE.md says was
 * removed from every other audit here. Saying so is what makes the next person
 * delete the entry instead of leaving it.
 */
const shrunk = [];
for (const [file, allowed] of STAGED) {
  const actual = perFile.get(file) ?? 0;
  if (actual < allowed) shrunk.push({ file, allowed, actual });
}

const total = [...perFile.values()].reduce((a, b) => a + b, 0);
const staged = [...STAGED.values()].reduce((a, b) => a + b, 0);

if (violations.length === 0) {
  console.log(
    `audit-text-as-label: clean ✓ (${total} staged occurrence(s) across ${perFile.size} file(s); ${staged} allowed)`,
  );
  if (shrunk.length > 0) {
    console.log(
      "\n  ✅ fixed since the list was seeded — TRIM these entries so the ratchet keeps ratcheting:",
    );
    for (const s of shrunk) {
      console.log(`     ${s.file}: ${s.allowed} → ${s.actual}`);
    }
  }
  process.exit(0);
}

console.error(
  `audit-text-as-label: ${violations.length} file(s) over their staged count\n`,
);
for (const v of violations) {
  console.error(
    `  ${v.file}\n        ${v.count} <Text>-as-label occurrence(s), ${v.allowed} allowed — lines ${v.lines.join(", ")}`,
  );
  console.error(
    "        A <Text> above a control is not a label: it renders a <p>, so the field has no accessible name while looking perfectly labelled. Use the Field* wrapper, or give the label an `id` and the control `aria-labelledby`.",
  );
}
process.exit(1);
