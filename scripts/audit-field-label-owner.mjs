#!/usr/bin/env node
/**
 * ── audit-field-label-owner ──────────────────────────────────────────────────
 *
 * WHY: `FieldInput`, `FieldSelect` and `FieldTextarea` each carried a
 *      BYTE-IDENTICAL copy of the same five lines of label markup, and
 *      `FormField` carried a fourth that had already DRIFTED — its required
 *      marker was `>*<` where the other three were `> *<`, so the asterisk sat
 *      flush against the label text on every screen using `FormField` and
 *      spaced on every screen using the wrappers.
 *
 *      Nobody chose that. It is what four copies of five lines become, and it
 *      is the smallest possible demonstration of why one owner is worth
 *      having. `FieldLabel` is now that owner.
 *
 * 🛑 THE DRIFT IS THE ARGUMENT, NOT THE DUPLICATION. Four identical copies
 * cost nothing until the day one of them is edited — and that day had already
 * happened here, invisibly, over a single space character. An audit is the
 * only thing that notices the fifth copy, because a fifth copy looks exactly
 * like correct code.
 *
 * ── RULES ───────────────────────────────────────────────────────────────────
 *
 * R1  No field wrapper may hand-roll `<Label className="appkit-form-field__label">`.
 *     That class belongs to `FieldLabel`. Scoped to `appkit/src/ui/forms/**`
 *     and `FormField.tsx` — the wrappers — plus any consumer form.
 * R2  No one but `FieldLabel` may emit `appkit-form-field__required`. A
 *     required marker rendered anywhere else is the drift, by definition.
 *
 * ── WHAT IS DELIBERATELY NOT A VIOLATION ────────────────────────────────────
 *
 * The BARE primitives — `Input`, `Select`, `Textarea`, `Toggle`, `Radio`,
 * `Slider`, `TagInput`, `DateInput`, `OtpInput` — keep their own `label` prop
 * and their own `<Label>`. That looks like the same duplication and is not:
 * they are used OUTSIDE a form entirely (a toolbar, a filter row, a table
 * cell) where there is no field wrapper, no error slot and no placement
 * context. Collapsing them would force every such call site to mount a wrapper
 * just to get a label, which is a worse trade than one `<Label>`.
 *
 * They are exempted BY PATH rather than by a count, so a count drifting cannot
 * silently widen the exemption.
 *
 * ── NEGATIVE CONTROLS (--self-test) ─────────────────────────────────────────
 *
 * @tag domain:forms
 * @tag layer:audit
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();

/** The one owner. */
const OWNER = join("appkit", "src", "ui", "forms", "FieldLabel.tsx");

/**
 * Bare primitives that legitimately render their own label. By PATH — see the
 * header on why a count would be the wrong mechanism.
 */
const BARE_PRIMITIVES = new Set(
  [
    "Input.tsx",
    "Select.tsx",
    "Textarea.tsx",
    "Toggle.tsx",
    "Radio.tsx",
    "Slider.tsx",
    "TagInput.tsx",
    "DateInput.tsx",
    "OtpInput.tsx",
    "Checkbox.tsx",
    "ColorPickerField.tsx",
  ].map((f) =>
    f === "ColorPickerField.tsx"
      ? join("appkit", "src", "ui", "forms", f)
      : join("appkit", "src", "ui", "components", f),
  ),
);

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

export function checkFile(rel, raw, emit) {
  if (rel === OWNER) return;
  const src = stripComments(raw);

  // R1 — a hand-rolled field label.
  if (/<Label[^>]*className=\{?["'`][^"'`]*appkit-form-field__label/.test(src)) {
    if (!BARE_PRIMITIVES.has(rel)) {
      emit(
        "R1",
        rel,
        "hand-rolls `<Label className=\"appkit-form-field__label\">`. That class belongs to `FieldLabel`, which is the one owner — four copies of this markup already drifted over a single space in the required marker. Use `<FieldLabel htmlFor required>`.",
      );
    }
  }

  // R2 — a required marker outside the owner.
  if (/appkit-form-field__required/.test(src)) {
    if (!BARE_PRIMITIVES.has(rel)) {
      emit(
        "R2",
        rel,
        "emits `appkit-form-field__required`. The required marker — including the leading space before the asterisk — is `FieldLabel`'s, and a second copy of it is the drift this audit exists to catch.",
      );
    }
  }
}

// ── Self-test ───────────────────────────────────────────────────────────────

function selfTest() {
  let failures = 0;
  const fire = (name, rel, src, rule) => {
    const got = [];
    checkFile(rel, src, (r, f, m) => got.push({ r, m }));
    if (got.some((g) => g.r === rule)) console.log(`  pass  ${name} — ${rule} fired`);
    else {
      console.log(`  FAIL  ${name} — ${rule} did NOT fire`);
      failures += 1;
    }
  };
  const silent = (name, rel, src) => {
    const got = [];
    checkFile(rel, src, (r, f, m) => got.push({ r, m }));
    if (got.length === 0) console.log(`  pass  ${name} (negative control)`);
    else {
      console.log(`  FAIL  ${name} — fired ${got[0].r} when it should be silent`);
      failures += 1;
    }
  };

  const W = join("appkit", "src", "ui", "forms", "FieldFoo.tsx");

  fire(
    "R1 a fifth hand-rolled copy",
    W,
    `<Label htmlFor={id} className="appkit-form-field__label">{label}</Label>`,
    "R1",
  );
  fire(
    "R2 a second required marker",
    W,
    `{required && <Span className="appkit-form-field__required"> *</Span>}`,
    "R2",
  );
  silent("the migrated shape", W, `<FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>`);
  silent(
    "a bare primitive keeps its own label",
    join("appkit", "src", "ui", "components", "Input.tsx"),
    `<Label htmlFor={inputId} className="appkit-form-field__label">{label}</Label>`,
  );
  silent(
    "a COMMENT quoting the class is not a copy",
    W,
    `/* was <Label className="appkit-form-field__label"> */\nconst a = 1;`,
  );

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
    console.log(`  FAIL  the real tree has ${live.length} finding(s):`);
    for (const l of live.slice(0, 6)) console.log(`          [${l.r}] ${l.f}`);
    failures += 1;
  }

  console.log(
    failures === 0
      ? "\naudit-field-label-owner self-test: all controls behaved"
      : `\naudit-field-label-owner self-test: ${failures} control(s) misbehaved`,
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
  console.log(`audit-field-label-owner: clean ✓ (${files.length} files scanned)`);
  process.exit(0);
}

console.error(`audit-field-label-owner: ${findings.length} violation(s)\n`);
for (const f of findings) {
  console.error(`  [${f.rule}] ${f.file}\n        ${f.msg}`);
}
process.exit(1);
