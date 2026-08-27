#!/usr/bin/env node
/**
 * audit-pii-crypto.mjs — PII/settings crypto hygiene. Strict-zero, no markers.
 *
 * Every rule is written against a defect found on 2026-08-27:
 *
 *  1 ENC_PREFIX_REDECLARED       two independent `"enc:v1:"` literals, so two
 *                                different formats with two different keys
 *                                looked identical to every "is this
 *                                encrypted" check in the codebase.
 *  2 PREFIX_CHECK_WITHOUT_KIND   a bare `.startsWith(ENC_PREFIX)` outside the
 *                                one function allowed to discriminate.
 *  3 SETTINGS_KEY_IN_PII_REGISTRY a settings-key constant living in the PII
 *                                field registry, one assignment away from
 *                                encrypting store OAuth tokens with the wrong
 *                                key — unrecoverably.
 *  4 UNNORMALISED_HEX_KEY        `Buffer.from(x, "hex")` without
 *                                normalisation. `Buffer.from` truncates
 *                                silently at the first non-hex byte, so a BOM
 *                                or CR in the env var yields a DIFFERENT key
 *                                from its sibling that does normalise — and
 *                                every blind index written after that point
 *                                is unmatchable. Silent, total, and it looks
 *                                exactly like "no such user".
 *  5 CIPHERTEXT_IN_MESSAGE       the value interpolated into a thrown error or
 *                                a log line, putting encrypted PII in the logs.
 *  6 PII_MAP_WHOLESALE_UPDATE    a Firestore `.update()` replacing a whole map
 *                                that holds PII. Firestore replaces a map
 *                                field entirely, so a partial write destroys
 *                                the siblings it does not mention.
 *
 * There is no suppression marker: every rule has a real code-level escape
 * hatch (call encEnvelopeKind, call normalizePiiSecretValue, use a dot-path,
 * construct the map fully).
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SECURITY_DIR = join(ROOT, "appkit", "src", "security");
const PII_MASK = "appkit/src/security/pii-mask.ts";
const PII_SCHEMAS = join(SECURITY_DIR, "pii-schemas.ts");

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (p.includes("node_modules") || p.includes(".next")) continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if ((p.endsWith(".ts") || p.endsWith(".tsx")) && !p.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

/** Blank comments, preserving offsets — so prose cannot match a rule. */
function stripComments(src) {
  let out = "";
  let str = null, inLine = false, inBlock = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (inLine) { if (c === "\n") { inLine = false; out += c; } else out += " "; continue; }
    if (inBlock) { if (c === "*" && n === "/") { inBlock = false; out += "  "; i++; } else out += c === "\n" ? c : " "; continue; }
    if (str) { out += c; if (c === "\\") { out += src[++i] ?? ""; continue; } if (c === str) str = null; continue; }
    if (c === "/" && n === "/") { inLine = true; out += "  "; i++; continue; }
    if (c === "/" && n === "*") { inBlock = true; out += "  "; i++; continue; }
    if (c === '"' || c === "'" || c === "`") { str = c; out += c; continue; }
    out += c;
  }
  return out;
}

const files = [
  ...walk(join(ROOT, "src")),
  ...walk(join(ROOT, "appkit", "src")),
].filter((f) => !f.includes("__tests__"));

const violations = [];
const rel = (f) => f.slice(ROOT.length + 1).replace(/\\/g, "/");
const lineAt = (src, idx) => src.slice(0, idx).split("\n").length;

for (const file of files) {
  const raw = readFileSync(file, "utf8");
  const src = stripComments(raw);
  const r = rel(file);

  // 1 — the prefix literal may exist in exactly one place.
  if (r !== PII_MASK) {
    for (const m of src.matchAll(/["'`]enc:v1:["'`]/g)) {
      violations.push({
        rule: "ENC_PREFIX_REDECLARED",
        detail: `${r}:${lineAt(src, m.index)} — import ENC_PREFIX from security/pii-mask instead of re-declaring "enc:v1:". Two literals is how two incompatible formats came to share one prefix.`,
      });
    }
  }

  // 2 — bare prefix checks outside the crypto implementation itself.
  //     pii-encrypt/settings-encryption ARE the two systems; their internal
  //     "is this already encrypted / may I decrypt this" guards are the
  //     primitives encEnvelopeKind is built out of. Everything else — scrubbers,
  //     redactors, seeds, views — must ask which kind it has.
  const IMPL = [
    PII_MASK,
    "appkit/src/security/pii-encrypt.ts",
    "appkit/src/security/settings-encryption.ts",
  ];
  if (!IMPL.includes(r)) {
    for (const m of src.matchAll(/\.startsWith\(\s*(?:ENC_PREFIX|PREFIX)\s*\)/g)) {
      // `encryptPiiFields`' "already encrypted, skip" guard is legitimately
      // prefix-wide: it must skip BOTH kinds so a settings value is never
      // double-wrapped. It is the one shape that wants no discrimination.
      const before = src.slice(Math.max(0, m.index - 300), m.index);
      if (/continue;?\s*$|already encrypted/i.test(before)) continue;
      violations.push({
        rule: "PREFIX_CHECK_WITHOUT_KIND",
        detail: `${r}:${lineAt(src, m.index)} — use encEnvelopeKind(v) === "pii"/"settings" (or hasEncPrefix for display masking). A bare prefix test cannot tell the two crypto systems apart.`,
      });
    }
  }

  // 4 — unnormalised hex key material, anywhere under security/.
  if (file.startsWith(SECURITY_DIR)) {
    for (const m of src.matchAll(/Buffer\.from\(\s*([A-Za-z_$][\w$.]*)\s*,\s*["']hex["']\s*\)/g)) {
      const arg = m[1];
      // Wide enough to reach the declaration past an intervening validation
      // block. Comments are blanked (not removed) above, so they still consume
      // window space — a short window missed a normaliser three lines up.
      const window = src.slice(Math.max(0, m.index - 1500), m.index);
      // Either normaliser name counts. settings-encryption.ts defines its own
      // four-line copy rather than importing pii-encrypt's — that module is the
      // Node-crypto half of the PII system and the settings crypto must not
      // depend on it. This rule is what keeps the two copies honest.
      const NORMALISER = /normalize\w*(?:Secret|Pii)\w*Value/;
      const normalised =
        new RegExp(`(?:const|let)\\s+${arg}\\s*=\\s*normalize\\w*Value`).test(window) ||
        NORMALISER.test(window.slice(-300));
      if (normalised) continue;
      violations.push({
        rule: "UNNORMALISED_HEX_KEY",
        detail: `${r}:${lineAt(src, m.index)} — \`${arg}\` reaches Buffer.from(…,"hex") without normalizePiiSecretValue. A BOM or CR truncates the key silently, desyncing every blind index from its sibling reader.`,
      });
    }
  }

  // 5 — the value in an error message or a log line.
  const SINKS = /(?:new Error\(|throw |console\.(?:log|warn|error)\(|serverLogger\.(?:info|warn|error)\()/g;
  for (const m of src.matchAll(SINKS)) {
    const seg = src.slice(m.index, m.index + 400);
    const endsAt = seg.indexOf(";");
    const body = endsAt > 0 ? seg.slice(0, endsAt) : seg;
    // Interpolating the VALUE, not a length / count / field name.
    const bad = /\$\{\s*(cipher\w*|ciphertext|encrypted|token|secret|plaintext|value)\s*\}/.exec(body);
    if (!bad) continue;
    if (!/cipher|encrypt|decrypt|pii|secret|token/i.test(body)) continue;
    violations.push({
      rule: "CIPHERTEXT_IN_MESSAGE",
      detail: `${r}:${lineAt(src, m.index)} — \`\${${bad[1]}}\` interpolated into an error/log. Emit shape only (prefix, part count, length); the value is encrypted PII or a live credential.`,
    });
  }
}

// 3 — a settings-key constant sitting in the PII registry, or assigned to
//     a repository's piiFields.
if (existsSync(PII_SCHEMAS)) {
  const raw = readFileSync(PII_SCHEMAS, "utf8");
  const src = stripComments(raw);
  for (const m of src.matchAll(/export const ([A-Z_]*(?:SECRET|TOKEN)[A-Z_]*)\s*=/g)) {
    // `TOKEN_PII_FIELDS` is an auth token's EMAIL address — genuine PII, and
    // correctly declared here. The hazard is a `*_SECRET_FIELDS`-shaped name:
    // fields belonging to the OTHER crypto system, sitting in this registry.
    if (/_PII_/.test(m[1])) continue;
    violations.push({
      rule: "SETTINGS_KEY_IN_PII_REGISTRY",
      detail: `${rel(PII_SCHEMAS)}:${lineAt(src, m.index)} — \`${m[1]}\` names secret/token fields but lives in the PII field registry, formatted exactly like the lists that ARE fed to encryptPiiFields. Feeding it there encrypts with the wrong key, unrecoverably. Keep secret handling in the repository that owns it.`,
    });
  }
}
for (const file of files) {
  const src = stripComments(readFileSync(file, "utf8"));
  for (const m of src.matchAll(/piiFields\s*(?::[^=]*)?=\s*([A-Z_]+)/g)) {
    if (!/SECRET|TOKEN/.test(m[1])) continue;
    // Same carve-out as the registry scan above, which this half was missing:
    // a `*_PII_*` name is genuine PII encrypted with the PII key, and
    // `TOKEN_PII_FIELDS` is an auth token's EMAIL address. The hazard this rule
    // exists for is a `*_SECRET_FIELDS`-shaped name — fields belonging to the
    // settings-key system — reaching a repository's `piiFields`.
    //
    // Without this the rule fired the moment the token repositories were
    // migrated OFF their hand-rolled `create` overrides (which wrote email in
    // cleartext) and ONTO the declarative `piiFields` hook — i.e. it flagged
    // the fix for the bug, not the bug.
    if (/_PII_/.test(m[1])) continue;
    violations.push({
      rule: "SETTINGS_KEY_IN_PII_REGISTRY",
      detail: `${rel(file)}:${lineAt(src, m.index)} — piiFields = ${m[1]}: this encrypts a settings-key field with the PII key. The two decryptors are different functions; the round-trip cannot close.`,
    });
  }
}

// 6 — a Firestore .update() replacing a whole map that holds PII.
//     Roots are DERIVED from the declared dotted PII paths, so the rule tracks
//     the schema rather than a hand-kept list.
const piiRoots = new Set();
if (existsSync(PII_SCHEMAS)) {
  const src = readFileSync(PII_SCHEMAS, "utf8");
  for (const m of src.matchAll(/["']([A-Za-z_$][\w$]*)\.[\w$.[\]]+["']/g)) piiRoots.add(m[1]);
}
// Not every PII field list lives in pii-schemas.ts. `SessionRepository`
// declares `piiFields = ["deviceInfo.ip", "location.city", …]` INLINE, so
// deriving roots from the schema file alone missed `location` entirely — and
// missing it is what let the `location` map-replace go unflagged on the first
// run of this rule.
for (const file of files) {
  const src = stripComments(readFileSync(file, "utf8"));
  for (const decl of src.matchAll(/piiFields\s*(?::[^=]*)?=\s*\[([^\]]*)\]/g)) {
    for (const m of decl[1].matchAll(/["']([A-Za-z_$][\w$]*)\.[\w$.[\]]+["']/g)) {
      piiRoots.add(m[1]);
    }
  }
}
for (const file of files) {
  const src = stripComments(readFileSync(file, "utf8"));
  if (!/\.update\s*\(/.test(src)) continue;
  for (const root of piiRoots) {
    // `...(data?.X && { X: data.X })` / `X: data.X` — a partial passthrough of
    // a caller-supplied map. A locally-constructed complete object, an
    // explicit `{ ...existing, ... }` merge, or dot-path notation are fine.
    const re = new RegExp(`\\b${root}\\s*:\\s*(?:data|input|body|payload)[?.]`, "g");
    for (const m of src.matchAll(re)) {
      const window = src.slice(Math.max(0, m.index - 500), m.index + 200);
      if (/\.\.\.\s*(?:existing|current|prev|doc)/.test(window)) continue;
      if (new RegExp(`["']${root}\\.`).test(window)) continue;

      // Only an UPDATE replaces a map. A create/set writes the whole document,
      // so assembling the full map there is correct — `createSession` does
      // exactly that and was the rule's first false positive.
      const ahead = src.slice(m.index, m.index + 900);
      const upd = ahead.search(/\.update\s*\(/);
      const whole = ahead.search(/\b(?:createWithId|set|create)\s*\(/);
      if (upd < 0) continue;
      if (whole >= 0 && whole < upd) continue;
      violations.push({
        rule: "PII_MAP_WHOLESALE_UPDATE",
        detail: `${rel(file)}:${lineAt(src, m.index)} — \`${root}\` is written from a caller-supplied partial. Firestore REPLACES a map field, so any sibling key the caller omitted is destroyed — and \`${root}\` holds encrypted PII. Read-merge-write, or use dot-paths.`,
      });
    }
  }
}

if (violations.length === 0) {
  console.log(`[audit-pii-crypto] OK — 0 violations across ${files.length} files.`);
  process.exit(0);
}

console.error("[audit-pii-crypto] FAIL — PII/settings crypto hygiene:\n");
const byRule = {};
for (const v of violations) (byRule[v.rule] ||= []).push(v.detail);
for (const [rule, items] of Object.entries(byRule)) {
  console.error(`  ${rule} (${items.length})`);
  for (const d of items.slice(0, 30)) console.error(`    • ${d}`);
  if (items.length > 30) console.error(`    ... and ${items.length - 30} more`);
  console.error("");
}
console.error("  No suppression marker — each rule has a real code-level fix.\n");
process.exit(1);
