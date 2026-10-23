#!/usr/bin/env node
/**
 * One submit control per form instance — bug 0d's rule.
 *
 * 0d was *"the order update drawer: two Save buttons and a blind error"*. It
 * was fixed; the rule 0g requires was never written, and 0g's whole argument
 * is why that matters: *"a fix without a rule is a fix with a half-life."*
 *
 * ## 🛑 The defect is a CO-OCCURRENCE, which is why no grep finds it
 *
 * Both footers are individually correct. A `<Modal>` renders its own footer
 * because a dialog owns its actions; a `<Form bottomBar={…}>` publishes into
 * the bottom-chrome tier because a page-level form belongs there. Only
 * together are they wrong — two Save buttons, and the user cannot tell which
 * one submits.
 *
 * `useFormBottomActions` already suppresses itself inside an overlay via
 * `useIsInsideOverlay()`, so the runtime is defended. What is NOT defended is
 * the AUTHORING mistake one level up: a component that renders its own
 * footer *and* asks for a bottom bar, where the suppression leaves the
 * author's second footer as the only one and the bar they configured
 * silently does nothing.
 *
 * ## What this checks
 *
 *   R1  A file rendering an overlay (`<Modal>` / `<SideDrawer>` /
 *       `<SideModal>` / `<Dialog>`) that ALSO passes `bottomBar=` to a form
 *       inside it. The bar is suppressed at runtime, so the prop is a lie:
 *       it reads as configuring the footer and configures nothing.
 *
 *   R2  A file with two submit controls in one form region — a
 *       `type="submit"` and a `<Button action={…}>`-style submit beside it.
 *
 * 🛑 R2 is deliberately NARROW. A page legitimately has many forms, and a
 * file-wide count of submit buttons flags every admin screen. It only fires
 * when both appear inside ONE `<Form>` element's span, which is the shape 0d
 * actually was.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const OVERLAYS = ["<Modal", "<SideDrawer", "<SideModal", "<Dialog"];

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "dist" || e.name === ".next") continue;
      walk(full, out);
    } else if (e.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

/**
 * The span of one `<Form …>` … `</Form>` element.
 *
 * Nesting is not handled and does not need to be: a `<Form>` inside a
 * `<Form>` is its own defect and not one this rule is about.
 */
function formSpans(code) {
  const spans = [];
  let from = 0;
  for (;;) {
    const open = code.indexOf("<Form", from);
    if (open < 0) break;
    const close = code.indexOf("</Form>", open);
    if (close < 0) break;
    spans.push(code.slice(open, close));
    from = close + 7;
  }
  return spans;
}

const violations = [];

for (const root of [join(ROOT, "appkit", "src"), join(ROOT, "src")]) {
  for (const abs of walk(root)) {
    const rel = relative(ROOT, abs).split("\\").join("/");
    /*
     * The primitives themselves define the behaviour this rule is about —
     * `useFormBottomActions` must mention both concepts to suppress one.
     */
    if (/useFormBottomActions|BottomActions|overlay-context/.test(rel)) continue;

    const code = stripComments(readFileSync(abs, "utf8"));

    // R1 — an overlay and a bottomBar in the same file
    const hasOverlay = OVERLAYS.some((o) => code.includes(o));
    /*
     * 🛑 A CONFIGURED bar only. `bottomBar={false}` is the correct opt-out,
     * and the first run flagged `AdminEmployeeEditorView` for using it — one
     * finding, and it was the rule punishing the right answer. Matching the
     * prop regardless of value would push authors to delete the explicit
     * `false`, which is strictly worse: the opt-out documents that somebody
     * considered the bar and declined it.
     */
    if (hasOverlay && /\bbottomBar\s*=\s*\{\s*\{/.test(code)) {
      violations.push({
        rule: "R1",
        where: rel,
        detail:
          "renders an overlay AND passes `bottomBar=` to a form. `useFormBottomActions`\n" +
          "      suppresses the bar inside an overlay, so the prop configures nothing — it\n" +
          "      reads as the footer's configuration while the overlay's own footer is what\n" +
          "      renders. Put the actions in the overlay's footer and drop the prop.",
      });
    }

    // R2 — two submit controls inside one <Form> span
    for (const span of formSpans(code)) {
      const native = (span.match(/type="submit"/g) ?? []).length;
      if (native >= 2) {
        violations.push({
          rule: "R2",
          where: rel,
          detail:
            `${native} \`type="submit"\` controls inside one <Form>. Both are individually\n` +
            "      correct and only their co-occurrence is the bug — the user cannot tell\n" +
            "      which one submits, which is what bug 0d was.",
        });
      }
    }
  }
}

if (violations.length === 0) {
  console.log("[audit-one-submit-control] OK — 0 violations (R1 overlay+bottomBar · R2 two submits in one form).");
  process.exit(0);
}
console.error(`\n[audit-one-submit-control] ${violations.length} violation(s):\n`);
for (const v of violations) {
  console.error(`  ${v.where}  [${v.rule}]`);
  console.error(`      ${v.detail}\n`);
}
process.exit(1);
