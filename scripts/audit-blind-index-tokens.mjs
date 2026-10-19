#!/usr/bin/env node
/*
 * audit-blind-index-tokens — strict-zero. A5.
 *
 * The blind index is the one place in this codebase where getting the
 * TOKENISATION wrong is a disclosure rather than a bug. `searchTxt`'s edge
 * n-grams are what make it good; the same expansion applied to an HMAC
 * column is what makes it readable by frequency analysis — a 1-character
 * prefix has 36 possible digests, a 2-character one ~1,300, so the most
 * common hash in the column is `a` and the rest unpicks from there.
 *
 * R1  NO PREFIX EXPANSION. A `*TokensIndex` must not be built from
 *     `buildSearchTxt`, from a `for` loop slicing a string, or from
 *     anything that emits substrings.
 * R2  ONE NORMALISER. The write side and the query side must both come from
 *     `security/blind-index-tokens` — never a local lowercase pipeline.
 *     If they diverge, a backfill does NOT fix it, because you have to
 *     discover the divergence first and the symptom is "no such user".
 * R3  NO LEAK TO THE CLIENT. A `*TokensIndex` must not appear in the public
 *     search artifact's sources, in a public projection, or in a client
 *     component's props. A deterministic per-person identifier is
 *     cross-referenceable even unbroken.
 *
 * Negative controls, all three run by hand before this was registered:
 *   · add `buildSearchTxt(name)` into a `*TokensIndex` assignment  -> R1 fails
 *   · hash a `.toLowerCase()` term at a query site                 -> R2 fails
 *   · add `nameTokensIndex` to PUBLIC_INDEX_SOURCES' select        -> R3 fails
 *
 * Suppression: none. There is no legitimate reason to prefix-expand a blind
 * index, and a marker here would be the one that matters most to not have.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", "dist", ".next", ".git"]);
const EXTS = new Set([".ts", ".tsx"]);

/** The module that owns the scheme. Exempt from R1/R2 — it IS the rule. */
const OWNER = join("appkit", "src", "security", "blind-index-tokens.ts");

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if ([...EXTS].some((x) => e.name.endsWith(x))) out.push(full);
  }
  return out;
}

/**
 * Blank out comments while PRESERVING line structure, so a rule's own
 * documentation cannot trip it and reported line numbers stay true.
 * (`audit-listing-search-intact` learned this the same way.)
 */
function maskComments(src) {
  let out = "";
  let i = 0;
  let mode = "code";
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (mode === "code") {
      if (c === "/" && n === "/") mode = "line";
      else if (c === "/" && n === "*") mode = "block";
      else if (c === '"' || c === "'" || c === "`") mode = c;
    } else if (mode === "line") {
      if (c === "\n") mode = "code";
    } else if (mode === "block") {
      if (c === "*" && n === "/") {
        out += "  ";
        i += 2;
        mode = "code";
        continue;
      }
    } else if (c === mode && src[i - 1] !== "\\") {
      mode = "code";
    }
    out += mode === "line" || mode === "block" ? (c === "\n" ? "\n" : " ") : c;
    i++;
  }
  return out;
}

const violations = [];
const TOKENS_FIELD = /\b\w*TokensIndex\b/;

let filesWithField = 0;

for (const root of SCAN) {
  try {
    statSync(root);
  } catch {
    continue;
  }
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    const raw = readFileSync(file, "utf8");
    const src = maskComments(raw);
    const lines = src.split("\n");

    const mentionsField = TOKENS_FIELD.test(src);
    if (mentionsField) filesWithField++;

    // ── R1 — no prefix expansion anywhere near a tokens index ──────────
    if (mentionsField && rel !== OWNER) {
      lines.forEach((line, n) => {
        if (!TOKENS_FIELD.test(line)) return;
        if (/buildSearchTxt|SEARCH_TXT|edgeNgram|\.slice\(0,\s*\w+\)/.test(line)) {
          violations.push(
            `${rel}:${n + 1} :: R1 a *TokensIndex built from prefix-expanded tokens — ` +
              `whole words only (see security/blind-index-tokens.ts).`,
          );
        }
      });
    }

    /*
     * ── R2 — one normaliser, scoped to the TOKENS scheme ───────────────
     *
     * 🛑 Deliberately NOT "any `hmacBlindIndex` call with a local
     * `.toLowerCase()`". The first draft was exactly that, and it fired on
     * `newsletter.repository.ts` — which uses the OLDER whole-value
     * `emailIndex` convention, lower-cases on both the write (:165) and the
     * query (:139), thirty lines apart in one file, and is therefore
     * correct. Verified before changing anything (Rule #4): it is not
     * broken, so it is not this audit's business, and a rule that flags a
     * working call site is one people learn to suppress.
     *
     * The real property is narrower and fully checkable: a file that deals
     * in `*TokensIndex` must go through the module that owns the scheme,
     * never hash a term itself. That is what keeps the write side and the
     * query side inseparable.
     */
    if (mentionsField && rel !== OWNER) {
      const importsOwner = /from\s+["'][^"']*security\/blind-index-tokens["']/.test(src);
      lines.forEach((line, n) => {
        if (!/hmacBlindIndex\s*\(/.test(line)) return;
        violations.push(
          `${rel}:${n + 1} :: R2 a *TokensIndex file calls hmacBlindIndex() directly — ` +
            `use buildTokensIndex()/tokensIndexQueryValue(), or the write and query ` +
            `normalisers drift and a backfill cannot repair it.`,
        );
      });
      if (!importsOwner) {
        violations.push(
          `${rel} :: R2 references a *TokensIndex without importing ` +
            `security/blind-index-tokens — the scheme has one owner.`,
        );
      }
    }

    // ── R3 — never reaches a client ────────────────────────────────────
    const isPublicSurface =
      rel.includes(join("search", "index-build") + sep) ||
      rel.includes(join("features", "site-settings") + sep) ||
      /adapters\.ts$/.test(rel) ||
      rel.endsWith(".tsx");
    if (mentionsField && isPublicSurface && rel !== OWNER) {
      violations.push(
        `${rel} :: R3 a *TokensIndex is referenced on a client/public surface — ` +
          `a deterministic per-person digest is cross-referenceable even unbroken.`,
      );
    }
  }
}

/*
 * 🛑 Report the denominator. A rule that silently stopped matching anything
 * reports "0 violations" and looks identical to a rule that is satisfied —
 * which is how `audit-listing-search-capability` went quiet on exactly the
 * files that had just changed (Root Cause #84).
 */
if (violations.length === 0) {
  console.log(
    `[audit-blind-index-tokens] OK: 0 violations ` +
      `(${filesWithField} file(s) reference a *TokensIndex).`,
  );
  process.exit(0);
}

console.error("\n[audit-blind-index-tokens] STRICT-ZERO violation(s):\n");
for (const v of violations) console.error(`  - ${v}`);
console.error(`\nTotal: ${violations.length}\n`);
process.exit(1);
