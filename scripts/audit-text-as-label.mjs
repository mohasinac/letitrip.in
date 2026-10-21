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

/*
 * 🛑 THE SHAPE ALONE WAS WRONG ABOUT 53 OF ITS OWN 72 FINDINGS.
 *
 * "A <Text> immediately above a control" describes a label standing in for a
 * real one — and it equally describes a GROUP HEADING above a properly
 * labelled field, which is most of what it was matching. `AdminSectionsView`
 * accounted for 27 of the 72 and every single one was
 *
 *     <Text …>FAQ Section Builder</Text>
 *     <Input label="Section title" … />
 *
 * i.e. a panel title above a field that already has a label. Acting on that
 * list would have converted 27 section headings into duplicate field labels.
 *
 * Two shapes are therefore excluded, both verified against real call sites:
 *
 *   1. THE CONTROL ALREADY CARRIES A NAME — `label`, `aria-label`,
 *      `aria-labelledby`, or the camelCase `ariaLabel` / `ariaLabelledBy` that
 *      `PaginatedSelect` and `RichTextEditor` take. Omitting the camelCase
 *      spellings reported `AdminSectionsView:1682` as unlabelled while it
 *      passes `ariaLabel={`Icon for indicator ${i}`}`.
 *
 *   2. BOTH ARE WRAPPED IN A REAL `<Label>` — an input nested inside its
 *      label is associated implicitly by HTML and needs no `htmlFor`.
 *      `SellerAnalyticsView:36` is a `<Text>` and a `<DateInput>` inside
 *      `<Label layout="flex">`.
 *
 * Neither was found by reading the count. Both came from opening the files the
 * count pointed at — Root Cause #84, and the reason this rule now reports 19.
 */
const NAMED_CONTROL =
  /\blabel\s*=|\baria-label\s*=|\baria-labelledby\s*=|\bariaLabel\s*=|\bariaLabelledBy\s*=/;

/**
 * The control's opening tag, brace- and quote-aware.
 *
 * 🛑 NOT `<Tag[^>]*>`: that stops at the `>` inside `onChange={() => f()}` and
 * never reaches a later `label=`, which is the false-negative Root Cause #29
 * records in `audit-select-wrapper-classname`.
 */
function openingTag(src, start) {
  let depth = 0;
  let quote = null;
  let out = "";
  for (let i = src.indexOf("<", start); i < src.length; i++) {
    const c = src[i];
    out += c;
    if (quote) {
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) break;
  }
  return out;
}

/** Is the hit wrapped in a `<Label>` that associates the control implicitly? */
function insideLabel(src, index) {
  const before = src.slice(Math.max(0, index - 400), index);
  return (
    /<Label\b[^>]*>\s*$/.test(before) ||
    /<Label\b/.test(before.split("\n").slice(-3).join("\n"))
  );
}

/**
 * Known offenders, keyed `path::control`, counted.
 *
 * 🛑 GENERATED — see the header. Regenerate with `EMIT_SEED=1` after fixing
 * some, and the count for that file must go DOWN. A count going up is the
 * thing being blocked.
 */
const STAGED = new Map(Object.entries({
  "appkit/src/features/addresses/components/AddressLocationFields.tsx": 1,
  "appkit/src/features/admin/components/AdminBlogEditorView.tsx": 1,
  "appkit/src/features/admin/components/AdminCarouselEditorView.tsx": 1,
  "appkit/src/features/admin/components/AdminCategoryEditorView.tsx": 4,
  "appkit/src/features/admin/components/AdminEmployeeEditorView.tsx": 1,
  "appkit/src/features/admin/components/AdminFaqEditorView.tsx": 1,
  "appkit/src/features/admin/components/AdminSiteSettingsView.tsx": 3,
  "appkit/src/features/catalogue/components/AdminCatalogueApprovalsView.tsx": 1,
  "appkit/src/features/filters/SwitchFilter.tsx": 1,
  "appkit/src/features/products/components/PrizeDrawItemsEditor.tsx": 1,
  "appkit/src/features/products/components/ProductForm.tsx": 1,
  "appkit/src/features/seller/components/SellerPayoutRequestView.tsx": 1,
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
      // The control's tag starts at the last `<` of the match.
      const tag = openingTag(src, m.index + m[0].lastIndexOf("<"));
      if (NAMED_CONTROL.test(tag)) continue;
      if (insideLabel(src, m.index)) continue;
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
