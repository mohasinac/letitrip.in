#!/usr/bin/env node
/**
 * audit-sieve-field-coverage — EVERY repository's `SIEVE_FIELDS` must name
 * properties its document actually has.
 *
 * Strict zero. Suppression: an entry in `ALLOWANCES` with a stated reason.
 *
 * ── Why this exists when audit-sieve-field-schema-parity already does ──────
 * That audit is better than this one — it also checks emitted-but-unfilterable
 * fields, orphans and sort flags. But it runs off a HAND-WRITTEN `REGISTRY`,
 * and the registry has two entries: `products` and `offers`. There are 29
 * repositories defining `SIEVE_FIELDS`. So it reported
 *
 *     audit-sieve-field-schema-parity: clean ✓ (2 repository/schema pair(s))
 *
 * while 27 repositories — orders, reviews, payouts, carts, events, coupons,
 * support, shipments and the rest — had never been looked at. That is Root
 * Cause #84 exactly: a measurement narrower than the rule it feeds, reporting
 * clean because of what it does not examine.
 *
 * This audit therefore DERIVES its targets. Every `*.repository.ts` under
 * `appkit/src` that defines a `SIEVE_FIELDS` object is checked, so a repository
 * added next year is covered the day it lands, with nobody remembering to
 * register it.
 *
 * ── Why a wrong field name is the worst case, not a cosmetic one ───────────
 * `providers/db-firebase/sieve.ts` sets `throwExceptions: false`. An
 * unrecognised field does not raise — `findField()` returns undefined and the
 * clause is DISCARDED. The query then runs without that filter and answers 200
 * with the whole collection, or with an unrelated subset. A misspelling is
 * indistinguishable from a working filter until somebody counts rows.
 * Root Cause #62.
 *
 * ── What counts as "the document has it" ───────────────────────────────────
 * The property set is every name declared in the feature's schema file PLUS
 * `BaseDocument` (`id`, `createdAt`, `updatedAt`, the seed fields), which every
 * document extends and which no feature schema repeats. Nested paths like
 * `stats.helpful` are checked SEGMENT-WISE against that set rather than by
 * resolving the type graph: the goal is catching a typo or a deleted field, and
 * segment-wise matching does that without a TypeScript compiler in the loop —
 * the same trade every other audit here makes.
 *
 * 🛑 Comments are stripped FIRST. Without that, `canSort`, `measured` and even
 * `SILENTLY` were extracted as field names out of the prose inside the object
 * literal — 8 phantom findings on `products` alone, which is how a real
 * finding gets lost in noise.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");
const APPKIT = path.join(ROOT, "appkit/src");
const BASE_DOC = path.join(APPKIT, "_internal/shared/types/base-document.ts");

/**
 * Genuine exceptions — a Sieve field that is real on the stored document but
 * is not declared in the feature's schema file. Each needs a reason; "it was
 * failing" is not one.
 */
const ALLOWANCES = {
  // PII blind indices. Written by the encryption layer on save (see
  // `security/pii-schemas.ts`), queried as equality-only lookups, and
  // deliberately absent from the public document interface so nothing reads
  // them as data.
  "user.repository.ts:emailIndex": "PII blind index, written by the encryption layer",
  "user.repository.ts:phoneIndex": "PII blind index, written by the encryption layer",
  "reviews.repository.ts:userNameIndex": "PII blind index, written by the encryption layer",
  "payout.repository.ts:sellerEmailIndex": "PII blind index, written by the encryption layer",
  /*
   * The TOKEN blind index — same class as the four above and allowed for the
   * same reason, with two differences worth stating rather than leaving to be
   * rediscovered:
   *
   *  - it is an ARRAY (`string[]`) queried with `array-contains`, not an
   *    equality on a scalar, because it holds one HMAC per whole word;
   *  - it is written by `BaseRepository.buildTokensIndexFor` in the write-hook
   *    chain, not by `encryptPiiFields` — a parallel hook, so searching
   *    `pii-schemas.ts` for it finds nothing.
   *
   * Deliberately NOT declared on `UserDocument`: the comment above is the
   * reason, and it applies harder here. A declared `nameTokensIndex?: string[]`
   * invites a reader to treat it as data, and it is a list of deterministic
   * per-person digests — the one field on the user row that must never reach a
   * projection (audit-blind-index-tokens R3 exists to block exactly that).
   */
  "user.repository.ts:nameTokensIndex": "token blind index, written by buildTokensIndexFor; array-contains only",
};

function stripComments(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    if (src[i] === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      for (let k = i; k < stop; k++) out += src[k] === "\n" ? "\n" : " ";
      i = stop;
    } else if (src[i] === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") { out += " "; i++; }
    } else {
      out += src[i];
      i++;
    }
  }
  return out;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === "dist") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".ts")) out.push(p);
  }
  return out;
}

/** Top-level keys of the object literal assigned to `name`. */
function sieveKeys(src, name) {
  const re = new RegExp(`\\b${name}\\s*(?::[^=]*?)?=\\s*\\{`);
  const m = re.exec(src);
  if (!m) return null;
  let i = m.index + m[0].length - 1;
  let depth = 0;
  const start = i;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") { depth--; if (depth === 0) break; }
  }
  const body = src.slice(start + 1, i);
  const keys = [];
  let d = 0;
  let buf = "";
  const flush = () => {
    const mm = /(?:^|\s)["']?([A-Za-z_][\w.]*)["']?\s*:/.exec(buf);
    if (mm) keys.push(mm[1]);
    buf = "";
  };
  for (let k = 0; k < body.length; k++) {
    const c = body[k];
    if (c === "{" || c === "[" || c === "(") d++;
    else if (c === "}" || c === "]" || c === ")") d--;
    if (d === 0 && c === ",") flush();
    else buf += c;
  }
  flush();
  return keys;
}

/**
 * Every property name declared in a TS file (comments already stripped).
 *
 * Two shapes, both needed. The line-anchored one catches interface members and
 * Zod object keys, which is the bulk. The unanchored one catches keys written
 * several-to-a-line in an object literal — `stats: { views: 0, helpful: 0 }` —
 * where only `stats` and `views` would otherwise be seen, and `helpful` would
 * be reported as a field the document does not have.
 */
function declaredProps(src) {
  const props = new Set();
  for (const m of src.matchAll(/^\s*(?:readonly\s+)?["']?([A-Za-z_]\w*)["']?\??\s*:/gm)) {
    props.add(m[1]);
  }
  for (const m of src.matchAll(/[{,]\s*["']?([A-Za-z_]\w*)["']?\s*:/g)) {
    props.add(m[1]);
  }
  // Union-of-string-literal field lists, e.g. `"title" | "price" | "condition"`.
  for (const m of src.matchAll(/"([a-z][\w.]*)"\s*\|/g)) props.add(m[1]);
  return props;
}

/**
 * Every file that can legitimately declare a property of this feature's
 * document.
 *
 * 🛑 NOT just `schemas/firestore.ts`. A first version read only that, and all
 * three findings it produced were false — `cart.sessionId` is declared in
 * `cart/schemas/index.ts`, `shipment-items.price` in
 * `shipments/schemas/validation.ts`, and `faqs.stats.helpful` via `FAQStats`.
 * Narrowing the evidence to one file by convention manufactures findings about
 * fields that exist, which is the fastest way to get an audit disabled.
 *
 * So the whole `schemas/` and `types/` surface of the feature is read. The
 * trade is the opposite error — a field declared on some unrelated interface in
 * those directories would be accepted — and that is the right way round here:
 * this audit exists to catch a TYPO or a DELETED field, and both of those are
 * absent from every file in the feature, not merely from one of them.
 */
function schemaFor(repoFile) {
  const featureDir = path.dirname(path.dirname(repoFile));
  const out = [];
  for (const sub of ["schemas", "types"]) {
    const dir = path.join(featureDir, sub);
    if (!fs.existsSync(dir)) continue;
    for (const f of walk(dir)) out.push(f);
  }
  return out;
}

function main() {
  if (!fs.existsSync(BASE_DOC)) {
    console.error(`[audit-sieve-field-coverage] SKIPPED — ${path.relative(ROOT, BASE_DOC)} not found.`);
    return 0;
  }
  const baseProps = declaredProps(stripComments(fs.readFileSync(BASE_DOC, "utf8")));

  const repos = walk(APPKIT).filter((f) => f.endsWith(".repository.ts"));
  const violations = [];
  let checked = 0;
  let fieldCount = 0;
  const unresolved = [];

  for (const repoFile of repos) {
    const src = stripComments(fs.readFileSync(repoFile, "utf8"));
    const names = [...new Set((src.match(/\b[A-Z][A-Z_]*SIEVE_FIELDS\b|\bSIEVE_FIELDS\b/g) ?? []))];
    if (!names.length) continue;

    const schemaFiles = schemaFor(repoFile);
    if (!schemaFiles.length) {
      unresolved.push(path.relative(ROOT, repoFile).replace(/\\/g, "/"));
      continue;
    }
    const props = new Set(baseProps);
    for (const sf of schemaFiles) {
      for (const p of declaredProps(stripComments(fs.readFileSync(sf, "utf8")))) props.add(p);
    }

    for (const name of names) {
      const keys = sieveKeys(src, name);
      if (!keys || !keys.length) continue;
      checked++;
      fieldCount += keys.length;
      const base = path.basename(repoFile);
      for (const key of keys) {
        if (ALLOWANCES[`${base}:${key}`]) continue;
        if (key.split(".").every((seg) => props.has(seg))) continue;
        violations.push({
          file: path.relative(ROOT, repoFile).replace(/\\/g, "/"),
          constant: name,
          key,
        });
      }
    }
  }

  if (unresolved.length) {
    console.error(
      `[audit-sieve-field-coverage] could not locate a schema for ${unresolved.length} repository(ies):\n` +
        unresolved.map((u) => `    ${u}`).join("\n") +
        `\n  These are NOT checked. Add a schemas/ file or extend schemaFor().\n`,
    );
  }

  if (violations.length === 0) {
    console.log(
      `[audit-sieve-field-coverage] clean ✓ (${fieldCount} field(s) across ${checked} SIEVE_FIELDS object(s))`,
    );
    return unresolved.length ? 1 : 0;
  }

  console.error(
    `[audit-sieve-field-coverage] ${violations.length} Sieve field(s) name a property the document does not declare:\n`,
  );
  const byFile = new Map();
  for (const v of violations) {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file).push(v);
  }
  for (const [file, list] of byFile) {
    console.error(`  ${file}`);
    for (const v of list) console.error(`      ${v.constant}.${v.key}`);
  }
  console.error(
    `\n  sieve.ts sets \`throwExceptions: false\`, so an unrecognised field does\n` +
      `  NOT raise — the clause is silently DISCARDED and the query answers 200\n` +
      `  with the filter missing. A typo is indistinguishable from a working\n` +
      `  filter until someone counts rows (Root Cause #62).\n` +
      `  Fix the name, or add an ALLOWANCES entry with a real reason.`,
  );
  return 1;
}

process.exit(main());
