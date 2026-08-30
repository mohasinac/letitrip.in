#!/usr/bin/env node
/**
 * audit-address-shape — strict-zero.
 *
 * ## What it blocks, and why each rule exists
 *
 * W5 collapsed **eleven** address field shapes and **fifteen** postal rules
 * into one of each. Every one of those fifteen was written by someone who
 * needed a postal rule and did not know the others existed — so the only thing
 * that keeps this collapsed is a check that notices the sixteenth.
 *
 * **R1 · POSTAL_RULE_OUTSIDE_GEO** — a postal/PIN/ZIP field validated by a
 * literal pattern or length bound anywhere but `constants/geo/countries.ts`.
 * The rules found in the sweep disagreed in every possible way: `.min(4).max(10)`
 * against `/^\d{6}$/` on the SAME entity, one accepting 5-or-6 digits, and
 * `.min(6).max(6)` — a length check with no character class, so `"abcdef"` was
 * a valid Indian PIN code.
 *
 * **R2 · SECOND_ADDRESS_SHAPE** — a Zod object declaring three or more of the
 * address field names. There is one address shape (`addressFormSchema`) and
 * everything else extends it; a fresh object listing `city`/`state`/
 * `postalCode` is the twelfth shape starting to form.
 *
 * **R3 · ADDRESS_TYPE_RESURRECTED** — `addressType` in any form. It was a
 * filter facet, a hook param and a route filter for a field `AddressDocument`
 * has never had, reached through `as any` so the comparison was always against
 * `""`. It rendered, it counted toward the filter badge, and it could not
 * match a row.
 *
 * **R4 · SUBDIVISION_PARITY** — `COUNTRIES[x].hasStates` and `SUBDIVISIONS[x]`
 * must agree. `hasStates` with no list renders an empty picker and no way to
 * type a state, which is worse than the free-text box this replaced.
 *
 * Suppression: `// audit-address-shape-ok: <reason>`.
 *
 * Exit 0 — clean.  Exit 1 — a violation.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git", "__tests__"]);

/** The one place a postal rule may be written. */
const GEO_HOME = "appkit/src/constants/geo/countries.ts";
/** The one place the address shape may be declared. */
const SHAPE_HOME = "appkit/src/features/addresses/schemas/address-form.ts";

const SUPPRESS = /audit-address-shape-ok:/;

/**
 * A postal-ish field carrying its own FORMAT rule.
 *
 * `.min(1)` is deliberately not a match: that is a presence check, and a
 * schema is entitled to say the field is required while leaving the format to
 * `isValidPostalCode`. What this catches is a rule that decides what a postal
 * code LOOKS like — a regex, a fixed length, or a length band, which is how
 * the fifteen came to disagree. `.min(6).max(6)` is exactly such a band, and
 * accepted `"abcdef"`.
 */
const POSTAL_RULE =
  /\b(postalCode|pincode|pinCode|zip|zipCode)\b\s*:\s*z[\s\S]{0,80}?(\.regex\(|\.length\(|\.min\([2-9]|\.min\(\d\d|\.max\(\d)/g;

/** The address field names. Three or more in one object literal is a shape. */
const ADDRESS_FIELDS = [
  "addressLine1",
  "addressLine2",
  "postalCode",
  "fullName",
  "landmark",
  "city",
  "state",
  "country",
];

/**
 * The text of the object literal whose opening `{` is at `openIndex`.
 *
 * Depth-counted, and only over comment-stripped source, so a brace inside a
 * comment cannot end it early. Strings are not tracked because a Zod object
 * literal's string values are error messages — a `{` inside one would have to
 * be unbalanced to matter, and that is a syntax error the file would not
 * survive anyway.
 */
function objectLiteral(src, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < src.length; i += 1) {
    if (src[i] === "{") depth += 1;
    else if (src[i] === "}") {
      depth -= 1;
      if (depth === 0) return src.slice(openIndex, i + 1);
    }
  }
  return src.slice(openIndex);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|mjs)$/.test(entry)) out.push(full);
  }
  return out;
}

const violations = [];

function report(file, line, rule, detail) {
  violations.push({ file, line, rule, detail });
}

for (const root of SCAN) {
  for (const full of walk(root)) {
    const rel = relative(ROOT, full).replace(/\\/g, "/");
    if (rel === GEO_HOME || rel === SHAPE_HOME) continue;
    if (rel.startsWith("scripts/")) continue;

    const raw = readFileSync(full, "utf8");
    const src = stripComments(raw);
    const rawLines = raw.split("\n");
    const lineOf = (index) => src.slice(0, index).split("\n").length;
    const suppressed = (line) =>
      SUPPRESS.test(rawLines[line - 1] ?? "") || SUPPRESS.test(rawLines[line - 2] ?? "");

    // R1 — a postal rule outside the geo module.
    for (const m of src.matchAll(POSTAL_RULE)) {
      const line = lineOf(m.index);
      if (suppressed(line)) continue;
      report(
        rel,
        line,
        "POSTAL_RULE_OUTSIDE_GEO",
        `\`${m[1]}\` carries its own ${m[2].replace(/[(\d]/g, "")} rule — use isValidPostalCode(country, code)`,
      );
    }

    // R2 — a second address shape.
    for (const m of src.matchAll(/z\s*\n?\s*\.object\(\{/g)) {
      const start = m.index;
      /*
       * 🛑 Brace-matched, not a fixed window. A 2000-character slice from one
       * `z.object({` runs straight into the NEXT schema in the file — which is
       * how the first run of this rule accused `categoryBaseSchema` of being
       * an address shape, on the strength of an address schema forty lines
       * below it. Same failure as the `<Tag[^>]*>` regex in Root Cause #29.
       */
      const slice = objectLiteral(src, start + m[0].length - 1);
      const present = ADDRESS_FIELDS.filter((f) =>
        new RegExp(`(^|[\\s{,])${f}\\s*:`, "m").test(slice),
      );
      if (present.length < 3) continue;
      const line = lineOf(start);
      if (suppressed(line)) continue;
      report(
        rel,
        line,
        "SECOND_ADDRESS_SHAPE",
        `declares ${present.length} address fields (${present.slice(0, 4).join(", ")}…) — extend addressFormSchema instead`,
      );
    }

    // R3 — addressType, in any form.
    for (const m of src.matchAll(/\baddressType\b/g)) {
      const line = lineOf(m.index);
      if (suppressed(line)) continue;
      report(
        rel,
        line,
        "ADDRESS_TYPE_RESURRECTED",
        "`addressType` is not a field on AddressDocument — it was a facet that could never match",
      );
    }
  }
}

// R4 — hasStates and SUBDIVISIONS must agree.
{
  const countries = readFileSync(join(ROOT, GEO_HOME), "utf8");
  const subs = readFileSync(
    join(ROOT, "appkit/src/constants/geo/subdivisions.ts"),
    "utf8",
  );
  const withStates = [...countries.matchAll(/code:\s*"([A-Z]{2})"[\s\S]{0,200}?hasStates:\s*(true|false)/g)]
    .filter((m) => m[2] === "true")
    .map((m) => m[1]);
  const listed = new Set(
    [...subs.matchAll(/^\s{2}([A-Z]{2}),?\s*$|^\s{2}([A-Z]{2}):/gm)].map((m) => m[1] ?? m[2]),
  );
  for (const code of withStates) {
    if (!listed.has(code)) {
      report(
        "appkit/src/constants/geo/subdivisions.ts",
        1,
        "SUBDIVISION_PARITY",
        `COUNTRIES.${code}.hasStates is true but SUBDIVISIONS has no list — the picker would render empty`,
      );
    }
  }
}

if (violations.length === 0) {
  console.log("audit-address-shape: clean ✓ (one address shape, one postal rule)");
  process.exit(0);
}

console.error(`[audit-address-shape] ${violations.length} violation(s):\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
  console.error(`      ${v.detail}\n`);
}
console.error("  Suppression: // audit-address-shape-ok: <reason>");
process.exit(1);
