#!/usr/bin/env node
/**
 * ── audit-no-physical-location-input ────────────────────────────────────────
 *
 * WHY: `product.physicalLocation` was three free-text inputs — Zone, Shelf,
 *      Bin — with no registry behind them. So "shelf 3", "Shelf-3" and
 *      "AC60 3" all meant one place, no list could group them, no query could
 *      find everything on a shelf, and the Print Center printed whichever
 *      spelling that one product happened to carry. Three boxes a human types
 *      into cannot be made consistent by validation.
 *
 *      `storageBoxes` + `inventoryPlacements` replace it with real boxes
 *      carrying real codes. Where something lives is recorded by PLACING it,
 *      which also carries a quantity and permits one product in two boxes —
 *      neither of which a single location string can express.
 *
 * 🛑 THIS IS A RATCHET, NOT A SWEEP, AND THAT IS DELIBERATE. The field is NOT
 * deleted: ~91 references still read it, and whatever live listings carry a
 * value still need it shown until a human has re-placed them. The strings
 * CANNOT be mechanically mapped to box codes — that impossibility is the
 * reason the registry exists — so an automatic migration would either invent
 * boxes from free text or lose the data. Closing the INPUTS is the half that
 * can be done without guessing; this audit keeps it closed.
 *
 * ── RULES ───────────────────────────────────────────────────────────────────
 *
 * R1  No WRITE of `physicalLocation` from a form or a client component: no
 *     `<FormField name="physicalLocation…">`, no `update({ physicalLocation`,
 *     no `setX({ physicalLocation`. Reads are fine and expected.
 * R2  No NEW bulk-location endpoint. Two already exist and are grandfathered
 *     by name; a third would be a new way to write the field at scale.
 *
 * ── NEGATIVE CONTROLS (--self-test) ─────────────────────────────────────────
 *
 * Both rules are exercised against fixtures built to break them, plus a
 * control asserting the real tree passes. An audit nobody has watched fail is
 * decoration (Root Cause #87/#92).
 *
 * @tag domain:inventory
 * @tag layer:audit
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();

/**
 * The two bulk routes that existed before the registry. Grandfathered by NAME
 * rather than by a count, so a third one is a violation while these two keep
 * working for whoever still has legacy values to clear.
 */
const GRANDFATHERED = new Set([
  join("src", "app", "api", "store", "products", "bulk-location", "route.ts"),
  join("src", "app", "api", "store", "orders", "bulk-location", "route.ts"),
]);

const WRITE_PATTERNS = [
  {
    re: /name=\{?["'`]physicalLocation/,
    why: 'a form field writing `physicalLocation`',
  },
  {
    re: /update\(\s*\{\s*physicalLocation/,
    why: "a form `update({ physicalLocation … })` call",
  },
  {
    re: /set[A-Z]\w*\(\s*\{\s*physicalLocation/,
    why: "a `setState({ physicalLocation … })` call",
  },
];

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

/** Strip comments, so an explanation naming the pattern is not a violation. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function checkFile(rel, raw, emit) {
  const src = stripComments(raw);

  /*
   * 🛑 R2 RUNS BEFORE THE CONTENT GATE, and its own control is why.
   *
   * R2 is about the PATH — a route under `bulk-location/` is a bulk writer of
   * this field whatever its body says. Gating it behind
   * `src.includes("physicalLocation")` (which it was) means a route that
   * spreads its request body, or names the field through a constant, is
   * silently exempt. The negative control caught it: the fixture's only
   * mention was in a comment, the comment was stripped, and the rule never
   * ran — which is precisely the "a rule that has gone quiet may have stopped
   * looking" failure (Root Cause #84).
   */
  if (
    /bulk-location/.test(rel) &&
    !GRANDFATHERED.has(rel) &&
    /route\.(ts|tsx)$/.test(rel)
  ) {
    emit(
      "R2",
      rel,
      1,
      "a new bulk-location endpoint. Two are grandfathered by name for clearing legacy values; a third is a new way to write the field at scale.",
    );
  }

  if (!src.includes("physicalLocation")) return;

  // R1 — writes.
  for (const { re, why } of WRITE_PATTERNS) {
    const lines = src.split("\n");
    lines.forEach((line, i) => {
      if (re.test(line)) {
        emit(
          "R1",
          rel,
          i + 1,
          `${why}. Where a product lives is recorded by placing it in a storage box — a placement carries a quantity and permits one product in two boxes, neither of which this field can express. Reading it is fine; writing a new one is not.`,
        );
      }
    });
  }

}

// ── Self-test ───────────────────────────────────────────────────────────────

function selfTest() {
  let failures = 0;
  const run = (name, rel, src, expectRule) => {
    const got = [];
    checkFile(rel, src, (rule, f, line, msg) => got.push({ rule, line, msg }));
    const hit = got.find((g) => g.rule === expectRule);
    if (hit) {
      console.log(`  pass  ${name} — ${hit.rule} fired`);
    } else {
      console.log(`  FAIL  ${name} — ${expectRule} did NOT fire`);
      failures += 1;
    }
  };

  run(
    "R1 form field",
    join("appkit", "src", "x.tsx"),
    `<FormField name="physicalLocation.zone" label="Zone" />`,
    "R1",
  );
  run(
    "R1 update call",
    join("appkit", "src", "x.tsx"),
    `onChange={() => update({ physicalLocation: { zone: v } })}`,
    "R1",
  );
  run(
    "R1 setState call",
    join("appkit", "src", "x.tsx"),
    `setDraft({ physicalLocation: parts });`,
    "R1",
  );
  run(
    "R2 new bulk route",
    join("src", "app", "api", "admin", "bulk-location", "route.ts"),
    `export const POST = handler; // physicalLocation`,
    "R2",
  );

  // Controls that must NOT fire.
  const quiet = [
    [
      "a READ is allowed",
      join("appkit", "src", "x.tsx"),
      `const loc = formatPhysicalLocation(product.physicalLocation);`,
    ],
    [
      "a COMMENT naming the pattern is allowed",
      join("appkit", "src", "x.tsx"),
      `/* name="physicalLocation.zone" used to live here */\nconst a = 1;`,
    ],
    [
      "a grandfathered route is allowed",
      join("src", "app", "api", "store", "products", "bulk-location", "route.ts"),
      `const { physicalLocation } = body;`,
    ],
  ];
  for (const [name, rel, src] of quiet) {
    const got = [];
    checkFile(rel, src, (rule, f, line, msg) => got.push({ rule, msg }));
    if (got.length === 0) {
      console.log(`  pass  ${name} (negative control)`);
    } else {
      console.log(`  FAIL  ${name} — fired ${got[0].rule} when it should be silent`);
      failures += 1;
    }
  }

  // And the real tree.
  const files = [join(ROOT, "appkit", "src"), join(ROOT, "src")].flatMap((d) =>
    walk(d, []),
  );
  const live = [];
  for (const abs of files) {
    checkFile(
      relative(ROOT, abs).split(sep).join(sep),
      readFileSync(abs, "utf8"),
      (rule, f, line, msg) => live.push({ rule, f, line, msg }),
    );
  }
  if (live.length === 0) {
    console.log(`  pass  the real tree is clean (${files.length} files)`);
  } else {
    console.log(`  FAIL  the real tree has ${live.length} finding(s): [${live[0].rule}] ${live[0].f}:${live[0].line}`);
    failures += 1;
  }

  console.log(
    failures === 0
      ? "\naudit-no-physical-location-input self-test: all controls behaved"
      : `\naudit-no-physical-location-input self-test: ${failures} control(s) misbehaved`,
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
  checkFile(rel, readFileSync(abs, "utf8"), (rule, f, line, msg) =>
    findings.push({ rule, file: f, line, msg }),
  );
}

if (findings.length === 0) {
  console.log(
    `audit-no-physical-location-input: clean ✓ (${files.length} files scanned)`,
  );
  process.exit(0);
}

console.error(
  `audit-no-physical-location-input: ${findings.length} violation(s)\n`,
);
for (const f of findings) {
  console.error(`  [${f.rule}] ${f.file}:${f.line}\n        ${f.msg}`);
}
process.exit(1);
