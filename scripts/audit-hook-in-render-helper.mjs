#!/usr/bin/env node
/*
 * WHY: a React hook inside a `renderXxx()` helper is a production crash.
 *
 * A function named `renderSomething` is NOT a component — it is called as a
 * plain function from a render prop or from another component's body. Any hook
 * it calls is therefore appended to the CALLER's hook list, and only on the
 * renders where that helper happens to run. The moment a different branch runs,
 * React sees a different hook count and throws:
 *
 *     Minified React error #310 — "Rendered more hooks than during the
 *     previous render."
 *
 * This is not hypothetical. `CheckoutRouteClient`'s `renderValueOtpStep` and
 * `renderPaymentStep` each called `React.useMemo`, so the address and extras
 * steps rendered N hooks and the payment step rendered N+1. Checkout was
 * unreachable past step 2 for every buyer, on desktop and mobile, and 9
 * occurrences were recorded in `serverErrors` before it was found.
 *
 * 🛑 THE REGEX IS GENERIC-AWARE ON PURPOSE.
 *
 * The first scan written for this missed both call sites, because it looked for
 * `useMemo(` while the source reads `useMemo<SectionDef<{…}>>(` — the
 * TypeScript type argument sits between the name and the paren. That false
 * negative is why the bug survived a hand search. Match `use[A-Z]\w*\s*[<(]`,
 * never `use[A-Z]\w*\s*\(`.
 *
 * THE FIX IS NEVER TO SUPPRESS. Either hoist the value to module scope (if its
 * deps are `[]` it was always a constant), or promote the helper to a real
 * component so the hook is legal.
 *
 * Usage: node scripts/audit-hook-in-render-helper.mjs [--probe]
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOTS = ["src", "appkit/src"];
const SUPPRESS = "audit-hook-in-render-helper-ok";
/** Generic-aware: `useMemo<T>(` must match as surely as `useMemo(`. */
const HOOK = /\buse[A-Z][A-Za-z0-9_]*\s*[<(]/;
/** Lowercase `render` prefix = a helper, not a component. */
const HELPER = /^\s*(?:export\s+)?(?:async\s+)?function\s+(render[A-Z][A-Za-z0-9_]*)\s*\(/;
const ARROW_HELPER = /^\s*(?:export\s+)?const\s+(render[A-Z][A-Za-z0-9_]*)\s*(?::[^=]+)?=\s*(?:async\s*)?\(/;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e === "node_modules" || e === ".next" || e === "dist") continue;
    const p = join(dir, e);
    let s;
    try {
      s = statSync(p);
    } catch {
      continue;
    }
    if (s.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

/** Strip line/block comments so a hook named in prose is not a violation. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n]*/g, "");
}

function scan(files) {
  const violations = [];
  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    if (!/\brender[A-Z]/.test(raw)) continue;
    const lines = stripComments(raw).split("\n");
    const rawLines = raw.split("\n");

    let helper = null;
    let depth = 0;
    let opened = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!helper) {
        const m = line.match(HELPER) ?? line.match(ARROW_HELPER);
        if (m) {
          helper = m[1];
          depth = 0;
          opened = false;
        }
      }
      if (!helper) continue;

      depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
      if (depth > 0) opened = true;

      /*
       * Close on depth alone, NEVER on a `}` at column 0.
       *
       * These helpers are frequently NESTED inside a component, so their closing
       * brace is indented. Requiring `/^\}/` left the helper "open" for the rest
       * of the file and reported the enclosing component's own perfectly legal
       * hooks - 5 false positives in AdminSectionsView.tsx on the first run.
       */
      if (opened && depth <= 0) {
        helper = null;
        continue;
      }

      if (HOOK.test(line)) {
        const near = [rawLines[i] ?? "", rawLines[i - 1] ?? ""].join(" ");
        if (!near.includes(SUPPRESS)) {
          violations.push({
            file: relative(process.cwd(), file).replace(/\\/g, "/"),
            line: i + 1,
            helper,
            text: (rawLines[i] ?? "").trim().slice(0, 100),
          });
        }
      }
      if (depth <= 0 && /^\}/.test(line)) helper = null;
    }
  }
  return violations;
}

const files = ROOTS.flatMap((r) => walk(r));

if (process.argv.includes("--probe")) {
  // Never trust an audit you have not seen fail. Feed it the exact shape of the
  // bug this exists to catch - including the generic form that hid it.
  const probeSrc = `
function renderPaymentStep({ a }) {
  const x = React.useMemo<SectionDef<{ q: string }>[]>(() => [], []);
  return null;
}
`;
  const lines = stripComments(probeSrc).split("\n");
  const hit = lines.some((l) => HOOK.test(l));
  console.log(hit ? "PROBE OK - generic hook form is detected" : "PROBE FAILED - the rule sees nothing");
  process.exit(hit ? 0 : 1);
}

const violations = scan(files);
if (violations.length) {
  console.error(`\n✗ hook-in-render-helper: ${violations.length} violation(s)\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  in ${v.helper}()`);
    console.error(`    ${v.text}`);
  }
  console.error(
    `\n  A renderXxx() helper is not a component. Its hooks join the CALLER's hook`,
  );
  console.error(`  list and only on the branches where it runs -> React #310.`);
  console.error(`  Fix: hoist to module scope (deps [] means it was always a constant),`);
  console.error(`  or promote the helper to a real component.\n`);
  process.exit(1);
}
console.log(`✓ hook-in-render-helper: 0 violations (${files.length} files)`);
