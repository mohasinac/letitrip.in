#!/usr/bin/env node
/**
 * ── audit-add-another-honoured ───────────────────────────────────────────────
 *
 * WHY: "Create & add another" is a promise about what happens AFTER a save,
 *      and `FormShell` cannot keep it. It does not own the draft, so it cannot
 *      know what a fresh one looks like or which fields are sticky — only the
 *      caller's submit handler can. A form that OFFERS the toggle and does not
 *      READ it ships a checkbox that does nothing.
 *
 * 🛑 THAT IS THE MOST COMMON DEFECT IN THIS CODEBASE, not a hypothetical. This
 * session alone found `config.title` declared on 86 listing configs with no
 * reader, `--appkit-color-focus-ring` in four themes plus an admin colour
 * picker with no consumer, `display.coverImage` with 504 Storage covers behind
 * it and no renderer, `physicalLocation` with three live inputs the repository
 * silently dropped, `initialProducts` on `PrintCenterView`, and a search box
 * promising SKUs for a field that did not exist. Every one of them looked
 * finished.
 *
 * So the feature is OPT-IN, and this audit makes the opt-in an obligation
 * rather than a flag.
 *
 * ── RULES ───────────────────────────────────────────────────────────────────
 *
 * R1  A file that OFFERS the toggle must READ the intent. Offering is
 *     `allowAddAnother` (the `<Form>` prop or the `useFormShellState` option)
 *     or rendering `<AddAnotherToggle`. Reading is a mention of `addAnother`
 *     that is not one of those two things — i.e. the handler branching on it.
 * R2  A file that READS `addAnother` must OFFER it. The mirror: a handler
 *     branching on a value no control can change is a dead branch that reads
 *     as a live feature, and it is the half a reviewer is least likely to
 *     notice because the code looks correct.
 *
 * Both directions matter. R1 catches the checkbox that does nothing; R2
 * catches the handler that can never fire.
 *
 * ── NEGATIVE CONTROLS (--self-test) ─────────────────────────────────────────
 *
 * @tag domain:forms
 * @tag layer:audit
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();

/**
 * The primitives themselves define and plumb the concept, so they necessarily
 * mention it without being a form. Listed by path — a count would drift.
 */
const PRIMITIVES = new Set([
  join("appkit", "src", "ui", "forms", "FormShell.tsx"),
  join("appkit", "src", "ui", "forms", "AddAnotherToggle.tsx"),
  join("appkit", "src", "ui", "forms", "index.ts"),
  join("appkit", "src", "ui", "components", "Form.tsx"),
  join("appkit", "src", "features", "shell", "QuickFormDrawer.tsx"),
]);

const findings = [];

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
    else if (/\.(ts|tsx)$/.test(e)) acc.push(abs);
  }
  return acc;
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/**
 * Does this file participate in the form shell at all?
 *
 * 🛑 THIS GATE EXISTS BECAUSE `addAnother` IS ALSO AN ORDINARY ENGLISH PHRASE,
 * and the first version of this audit reported a false positive to prove it:
 * `CompareOverlay` carries `labels.addAnother = "Add another to compare"`, a
 * translated string for a product-comparison tray with no form anywhere near
 * it. Matching the bare identifier matched that.
 *
 * 🛑 AND NARROWING A RULE IS HOW A FALSE NEGATIVE GETS INTRODUCED — Root Cause
 * #93's R2 refinement did exactly that while removing a false positive. So the
 * marker set is the shell's own vocabulary rather than a filename pattern, and
 * the self-test carries a control asserting a shell-participating file still
 * fires. A file branching on `addAnother` for real has a shell in it; one
 * naming a comparison tray's button does not.
 */
const SHELL_MARKERS = [
  /useFormShellState\s*\(/,
  /FormShellContext/,
  /\bshellCtx\b/,
  /<Form\b/,
  /<SectionForm\b/,
  /useFormShell\s*\(/,
];

export function checkFile(rel, raw, emit) {
  if (PRIMITIVES.has(rel)) return;
  const src = stripComments(raw);
  if (!src.includes("addAnother") && !src.includes("AddAnotherToggle")) return;
  if (!SHELL_MARKERS.some((re) => re.test(src))) return;

  const offersProp = /allowAddAnother/.test(src);
  const offersToggle = /<AddAnotherToggle\b/.test(src);
  const offers = offersProp || offersToggle;

  /*
   * "Reads" means a mention of `addAnother` that is NOT the offer itself.
   * `allowAddAnother` contains `AddAnother` with a capital A, and the toggle
   * tag contains `AddAnother` too — so both are removed before looking, or
   * every offering file would trivially count as reading.
   */
  const withoutOffers = src
    .replace(/allowAddAnother/g, "")
    .replace(/<AddAnotherToggle[\s\S]*?\/>/g, "")
    .replace(/AddAnotherToggle/g, "");
  const reads = /\baddAnother\b/.test(withoutOffers);

  if (offers && !reads) {
    emit(
      "R1",
      rel,
      "offers \"Create & add another\" but never reads `addAnother`. The toggle would render and change nothing — `FormShell` does not own the draft, so only this file's submit handler can keep the promise. Read it and branch: stay on the form with a fresh draft, or navigate as usual.",
    );
  }
  if (reads && !offers) {
    emit(
      "R2",
      rel,
      "reads `addAnother` but never offers it (`allowAddAnother`, or an `<AddAnotherToggle>`). `useFormShellState` forces the value to false when the feature is not enabled, so that branch can never run — a dead branch that reads as a live feature.",
    );
  }
}

// ── Self-test ───────────────────────────────────────────────────────────────

function selfTest() {
  let failures = 0;
  const expectFire = (name, rel, src, rule) => {
    const got = [];
    checkFile(rel, src, (r, f, m) => got.push({ r, m }));
    const hit = got.find((g) => g.r === rule);
    if (hit) console.log(`  pass  ${name} — ${rule} fired`);
    else {
      console.log(`  FAIL  ${name} — ${rule} did NOT fire`);
      failures += 1;
    }
  };
  const expectSilent = (name, rel, src) => {
    const got = [];
    checkFile(rel, src, (r, f, m) => got.push({ r, m }));
    if (got.length === 0) console.log(`  pass  ${name} (negative control)`);
    else {
      console.log(`  FAIL  ${name} — fired ${got[0].r} when it should be silent`);
      failures += 1;
    }
  };

  const F = join("appkit", "src", "features", "x", "XEditor.tsx");

  expectFire(
    "R1 prop offered, never read",
    F,
    `<Form allowAddAnother onSubmit={save}><AddAnotherToggle noun="listing" /></Form>`,
    "R1",
  );
  expectFire(
    "R1 toggle rendered, never read",
    F,
    `<Form onSubmit={save}><AddAnotherToggle /></Form>`,
    "R1",
  );
  expectFire(
    "R2 read but never offered",
    F,
    `if (shellCtx.addAnother) { setDraft(fresh()); } else { router.push(href); }`,
    "R2",
  );
  /*
   * 🛑 The control that guards the SHELL_MARKERS narrowing. Removing the
   * `CompareOverlay` false positive could just as easily have silenced the
   * rule entirely — this asserts a file whose only shell marker is
   * `useFormShellState(` still gets checked.
   */
  expectFire(
    "R2 still fires behind the shell gate",
    F,
    `const { shellCtx } = useFormShellState(schema);
     const go = shellCtx.addAnother ? "stay" : "leave";`,
    "R2",
  );
  /*
   * And the false positive itself, as a permanent control: an unrelated
   * `addAnother` label in a file with NO shell must stay silent.
   */
  expectSilent(
    "an unrelated addAnother label with no form (the CompareOverlay case)",
    join("appkit", "src", "features", "products", "components", "Tray.tsx"),
    `const labels = { addAnother: "Add another to compare" };
     return <Button label={labels.addAnother} />;`,
  );
  expectSilent(
    "offered AND read",
    F,
    `<Form allowAddAnother onSubmit={() => { if (ctx.addAnother) setDraft(fresh()); else push(href); }}>
       <AddAnotherToggle noun="listing" />
     </Form>`,
  );
  expectSilent("a form mentioning neither", F, `<Form onSubmit={save} />`);
  expectSilent(
    "a COMMENT naming it is not an offer",
    F,
    `/* allowAddAnother would go here */\nconst a = 1;`,
  );

  // The real tree.
  const files = [join(ROOT, "appkit", "src"), join(ROOT, "src")].flatMap((d) =>
    walk(d, []),
  );
  const live = [];
  for (const abs of files) {
    checkFile(
      relative(ROOT, abs).split(sep).join(sep),
      readFileSync(abs, "utf8"),
      (r, f, m) => live.push({ r, f, m }),
    );
  }
  if (live.length === 0) {
    console.log(`  pass  the real tree is clean (${files.length} files)`);
  } else {
    console.log(
      `  FAIL  the real tree has ${live.length} finding(s): [${live[0].r}] ${live[0].f}`,
    );
    failures += 1;
  }

  console.log(
    failures === 0
      ? "\naudit-add-another-honoured self-test: all controls behaved"
      : `\naudit-add-another-honoured self-test: ${failures} control(s) misbehaved`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

if (process.argv.includes("--self-test")) selfTest();

// ── Main ────────────────────────────────────────────────────────────────────

const files = [join(ROOT, "appkit", "src"), join(ROOT, "src")].flatMap((d) =>
  walk(d, []),
);

for (const abs of files) {
  const rel = relative(ROOT, abs).split(sep).join(sep);
  checkFile(rel, readFileSync(abs, "utf8"), (rule, f, msg) =>
    findings.push({ rule, file: f, msg }),
  );
}

if (findings.length === 0) {
  console.log(
    `audit-add-another-honoured: clean ✓ (${files.length} files scanned)`,
  );
  process.exit(0);
}

console.error(`audit-add-another-honoured: ${findings.length} violation(s)\n`);
for (const f of findings) {
  console.error(`  [${f.rule}] ${f.file}\n        ${f.msg}`);
}
process.exit(1);
