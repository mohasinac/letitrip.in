#!/usr/bin/env node
/**
 * audit-legacy-search-pii — keeps two deleted footguns deleted, and blocks the
 * SHAPE of the bug each one caused.
 *
 * ## Why this exists
 *
 * Both symbols this guards were deleted because they *looked* correct at every
 * call site and did the opposite. Neither `tsc` nor a grep-for-a-symbol check
 * can see the difference, so the audit asserts the bug's shape rather than the
 * fix's presence.
 *
 * ### R1 ADD_PII_INDICES — the helper that un-encrypted your data
 *
 * `addPiiIndices(obj, map)` returned `{...obj, ...indices}`. Spread over an
 * already-encrypted object it restored the plaintext:
 *
 *     { ...encryptPiiFields(data, FIELDS), ...addPiiIndices(data, MAP) }
 *       // ciphertext ────────────────────┘         └──── plaintext, wins
 *
 * That is how `payouts.sellerEmail`, `payouts.upiId` and `reviews.userName`
 * shipped in cleartext beside a valid index. Worse, both token repositories
 * wrote `encrypted = addPiiIndices(data, MAP)` — assigning OVER the ciphertext
 * — so every email-verification and password-reset address was stored in
 * cleartext, invisibly, because `mapDoc` decrypts on read and
 * `decryptPiiFields` passes plaintext straight through.
 *
 * `piiIndicesFor` returns indices ONLY and cannot express the bug.
 *
 * ### R2 NEWSLETTER_SHADOW — the constant that lied about its own subject
 *
 * An exported `NEWSLETTER_PII_FIELDS = []` sat in `pii-schemas.ts` with no
 * reader anywhere — while `NewsletterRepository` held its OWN module-local
 * `["email"]` and encrypted correctly through that. The empty export did
 * nothing except read as proof that newsletter email was unencrypted. It cost a
 * planning session a wrong diagnosis (Root Cause #53: the symbol a grep finds
 * is not the one doing the work).
 *
 * ### R3 CI_SIEVE_OPERATOR — silently returning the whole table
 *
 * The Firebase adapter throws on any case-insensitive operator, and the
 * processor runs `throwExceptions: false`, so the throw became SILENCE.
 * Measured before the fix:
 *
 *     "title@=*dranzer,status==published" → NOTHING APPLIED (bare collection)
 *     "status==published,title@=*dranzer" → where(status) only, sort discarded
 *
 * `buildFilteredSieveQuery` now throws a `ValidationError`. R3 keeps new
 * emitters from reintroducing the operators; the remaining legacy call sites
 * are removed in Phase 2 and are listed in KNOWN_LEGACY below so the count can
 * only go DOWN.
 *
 * Suppression: `// audit-legacy-search-pii-ok: <reason>` on the line or the one
 * above. There is no legitimate reason to resurrect R1 or R2.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const SCAN_ROOTS = [join(REPO_ROOT, "appkit", "src"), join(REPO_ROOT, "src")];
const EXCLUDED_DIRS = new Set([
  "node_modules", "dist", ".next", "out", "coverage",
]);

const OK_RE = /\/\/\s*audit-legacy-search-pii-ok\s*:/i;

/**
 * Legacy `@=*` / `_=` emitters awaiting Phase 2. Listed so the audit fails on a
 * NEW one while the known set is burned down — a ratchet, not an allowlist:
 * removing an entry is expected, adding one is the thing being blocked.
 */
const KNOWN_LEGACY = new Set([
  "src/app/api/admin/stores/route.ts",
  "src/app/api/events/route.ts",
  "src/app/api/reviews/route.ts",
  "src/app/api/stores/route.ts",
  "appkit/src/features/blog/api/route.ts",
  "appkit/src/features/reviews/components/ReviewsIndexPageView.tsx",
  "appkit/src/features/search/actions/search-actions.ts",
  "appkit/src/features/search/repository/search.repository.ts",
  "appkit/src/features/stores/actions/store-query-actions.ts",
  // list-public.ts came OFF this list in Phase 2 — it was the highest-value
  // entry, covering /products, /auctions, /api/admin/products and
  // /api/store/products. The ratchet tightening is the intended direction.
  // The operator definitions themselves; deleted last (they are what the
  // call sites above still reference).
  "appkit/src/utils/sieve-builder.ts",
  "appkit/src/providers/db-firebase/base.ts",
  "appkit/src/providers/db-firebase/filter-aliases.ts",
]);

function* walk(root) {
  let entries;
  try { entries = readdirSync(root, { withFileTypes: true }); }
  catch { return; }
  for (const e of entries) {
    if (EXCLUDED_DIRS.has(e.name)) continue;
    const full = join(root, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx|mjs)$/.test(e.name) && !e.name.endsWith(".d.ts")) yield full;
  }
}

/** Strip line and block comments so prose about a bug never trips its own rule. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

/**
 * Deleted in step 8. Absence is the assertion.
 *
 * `useSellerListingData` names the HOOK only. The four row-shaping helpers in
 * the same file (toRecordArray/toStringValue/toCurrency/toRelativeDate) are
 * imported by six seller views and must stay — which is precisely why this
 * lists a symbol rather than a file.
 */
const DELETED_SYMBOLS = [
  ["addPiiIndices", "returned {...source, ...indices} — spread plaintext back over ciphertext"],
  ["buildSieveFilters", "utils/filter.helper.ts — a second filter builder, zero consumers"],
  ["encryptShippingAddress", "zero callers; orders encrypt via ORDER_PII_FIELDS"],
  ["decryptShippingAddress", "zero callers; orders decrypt via ORDER_PII_FIELDS"],
  ["CONTAINS_CI", "case-insensitive Sieve operator — the adapter throws, and the throw was silent"],
  ["STARTS_CI", "same"],
  ["ENDS_CI", "same"],
  ["EQ_CI", "same"],
  ["NEQ_CI", "same"],
  ["useSellerListingData", "a second listing-fetch engine beside DataListingView, zero call sites"],
  ["useFAQs", "superseded by useFaqList; /faqs reads Firestore directly"],
  ["faqGET", "dead route module, zero consumers"],
  ["storesGET", "dead route module, zero consumers"],
  ["eventsGET", "dead route module, zero consumers"],
  ["reviewsGET", "dead route module, zero consumers"],
  ["buildSearchTokens", "the pre-searchTxt tokeniser"],
  ["tokenizeQuery", "the pre-searchTxt query splitter"],
];

const violations = [];
function report(file, line, rule, message) {
  violations.push({ file, line, rule, message });
}

for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    const rel = relative(REPO_ROOT, file).replace(/\\/g, "/");
    const raw = readFileSync(file, "utf8");
    const code = stripComments(raw);
    const rawLines = raw.split(/\r?\n/);
    const lines = code.split(/\r?\n/);

    // R4 — a deleted symbol must be absent from the tree, not merely uncalled.
    // The scan runs on comment-stripped source, so the tombstones explaining
    // why each one is gone survive.
    // A module SPECIFIER is not a symbol. `useSellerListingData` is still a
    // real file — the hook was deleted, the four row-shaping helpers beside it
    // were kept — so `from "../hooks/useSellerListingData"` is correct code and
    // must not be flagged. Blanking specifiers is what separates "this file is
    // imported" from "this symbol is used".
    const scan = code.replace(/(from\s*|require\(\s*)(["'])[^"']*\2/g, (m) =>
      " ".repeat(m.length),
    );

    for (const [sym, why] of DELETED_SYMBOLS) {
      const re = new RegExp(`\\b${sym}\\b`, "g");
      let m;
      while ((m = re.exec(scan)) !== null) {
        const line = scan.slice(0, m.index).split(/\r?\n/).length;
        const ctx = `${rawLines[line - 2] ?? ""}\n${rawLines[line - 1] ?? ""}`;
        if (OK_RE.test(ctx)) continue;
        report(
          rel,
          line,
          "DELETED_SYMBOL",
          `\`${sym}\` was deleted in step 8 (${why}). It must be ABSENT from the ` +
            `tree, not merely uncalled — "nothing calls it" was already true of ` +
            `every one of these on the day it got copied into something new.`,
        );
      }
    }

    const suppressed = (i) =>
      OK_RE.test(rawLines[i] ?? "") || OK_RE.test(rawLines[i - 1] ?? "");

    // A test may reproduce a deleted helper locally to document the footgun —
    // that is the point of the regression test and must not resurrect the export.
    const isTest = /(__tests__|\.test\.(ts|tsx|mjs)$)/.test(rel);

    // A file that DECLARES its own module-local NEWSLETTER_PII_FIELDS owns it,
    // and its uses are the correct ones — NewsletterRepository is exactly that
    // case. R2 targets a second, EXPORTED copy, not the working local one.
    const declaresLocalNewsletterPii =
      /^\s*const\s+NEWSLETTER_PII_FIELDS\b/m.test(code);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim() || suppressed(i)) continue;

      // R1 — the deleted helper, in any form that reaches real code.
      if (/\baddPiiIndices\b/.test(line) && !isTest) {
        report(rel, i + 1, "ADD_PII_INDICES",
          "addPiiIndices was deleted — it returned {...source, ...indices}, so " +
          "spreading it over ciphertext restored the plaintext. Use piiIndicesFor().");
      }
      // R1b — the exact assignment/spread shape, even under another name.
      if (/=\s*\w*[Aa]ddPiiIndices\s*\(|\.\.\.\s*\w*[Aa]ddPiiIndices\s*\(/.test(line) && isTest) {
        // allowed in tests only when locally defined (documented reproduction)
        if (!/deleted/i.test(rawLines[Math.max(0, i - 12)] ?? "") &&
            !/deletedAddPiiIndices/.test(line)) {
          report(rel, i + 1, "ADD_PII_INDICES",
            "A test may reproduce the footgun locally (name it deletedAddPiiIndices) " +
            "but must not import or re-export it.");
        }
      }

      // R2 — the shadow constant, exported or re-exported.
      if (/\bNEWSLETTER_PII_(FIELDS|INDEX_MAP)\b/.test(line)) {
        if (!declaresLocalNewsletterPii) {
          report(rel, i + 1, "NEWSLETTER_SHADOW",
            "The exported NEWSLETTER_PII_* pair was deleted — it was empty, had no " +
            "reader, and contradicted the module-local constant that does the work. " +
            "NewsletterRepository owns its own; do not re-export a second one.");
        }
      }

      // R3 — new emitters of a case-insensitive Sieve operator.
      const emitsCi =
        /@=\*/.test(line) ||
        /\bSIEVE_OP\.(CONTAINS_CI|STARTS_CI|ENDS_CI|EQ_CI|NEQ_CI)\b/.test(line);
      if (emitsCi && !isTest && !KNOWN_LEGACY.has(rel)) {
        report(rel, i + 1, "CI_SIEVE_OPERATOR",
          "Case-insensitive Sieve operators are not supported by Firestore and now " +
          "throw. Use searchTxt token search (appkit/src/utils/search-txt.ts).");
      }
    }
  }
}

// ---------------------------------------------------------------------------
// R4 USER_SLUG_PII — a public profile slug must never be derived from PII.
//
// `generateUserId` built `user-{first}-{last}-{emailPrefix8}` from
// `email.split("@")[0].substring(0, 8)`, putting the local-part of a real email
// address into a document id and therefore into a public URL. It is deleted.
//
// Deleting it was NOT sufficient, which is the whole reason this rule exists:
// two of the three signup paths set `displayName` to that same local-part as a
// fallback, so a slug derived from displayName republishes it one hop further
// along. `userSlugBase` takes the email purely to detect and reject that.
//
// R5 SLUG_DERIVATION_DRIFT — `backfill-user-slugs.mjs` MIRRORS `user-slug.ts`
// (it must survive a stale appkit/dist, same as the searchTxt backfill). If the
// two drift, a backfilled user and an app-created user get different slugs from
// the same name, silently — the exact class `audit-search-parity` catches for
// searchTxt, which had no equivalent here.
// ---------------------------------------------------------------------------
{
  const slugSrc = join(REPO_ROOT, "appkit", "src", "features", "auth", "actions", "user-slug.ts");
  const slugBackfill = join(REPO_ROOT, "appkit", "scripts", "backfill-user-slugs.mjs");

  let src = "";
  try { src = stripComments(readFileSync(slugSrc, "utf8")); } catch { /* absent */ }

  if (src) {
    // The stem may read displayName; email is permitted ONLY inside the guard
    // that rejects an email-derived display name.
    const base = src.slice(src.indexOf("export function userSlugBase"));
    const body = base.slice(0, base.indexOf("\n}"));
    if (/slugify\(\s*(email|localPart)\b/.test(body) && !/===\s*base|base\s*===/.test(body)) {
      report("appkit/src/features/auth/actions/user-slug.ts", 1, "USER_SLUG_PII",
        "userSlugBase appears to derive the stem from email rather than only comparing " +
        "against it. A profile slug is public; the email local-part must never reach a URL.");
    }
    if (/\bphone/i.test(body)) {
      report("appkit/src/features/auth/actions/user-slug.ts", 1, "USER_SLUG_PII",
        "userSlugBase references a phone field. Slugs derive from displayName only.");
    }
  }

  // R5 — the two derivations must agree on the values that decide a slug.
  let bf = "";
  try { bf = readFileSync(slugBackfill, "utf8"); } catch { /* absent */ }
  if (src && bf) {
    for (const konst of ["MAX_BASE_LENGTH"]) {
      const re = new RegExp(`${konst}\\s*=\\s*(\\d+)`);
      const a = src.match(re)?.[1];
      const b = bf.match(re)?.[1];
      if (a !== b) {
        report("appkit/scripts/backfill-user-slugs.mjs", 1, "SLUG_DERIVATION_DRIFT",
          `${konst}: user-slug.ts has ${a}, backfill-user-slugs.mjs has ${b}. A backfilled ` +
          `user and an app-created user would get different slugs from the same name.`);
      }
    }
    // Reserved words are what a slug may NOT be; a word guarded on one side and
    // not the other means the backfill can mint something signup would refuse.
    const words = (s) => {
      const i = s.indexOf("RESERVED");
      if (i === -1) return null;
      const open = s.indexOf("[", i), close = s.indexOf("]", open);
      return new Set([...s.slice(open, close).matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]));
    };
    const a = words(src), b = words(bf);
    if (a && b) {
      for (const w of a) if (!b.has(w)) {
        report("appkit/scripts/backfill-user-slugs.mjs", 1, "SLUG_DERIVATION_DRIFT",
          `RESERVED word "${w}" is guarded in user-slug.ts but not in the backfill — the ` +
          `backfill could mint a slug that signup would refuse.`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`[audit-legacy-search-pii] ${violations.length} violation(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
    console.error(`    ${v.message}\n`);
  }
  console.error("Suppression: // audit-legacy-search-pii-ok: <reason>");
  process.exit(1);
}

console.log(
  `[audit-legacy-search-pii] OK — 0 violations ` +
  `(${KNOWN_LEGACY.size} legacy @=* site(s) still pending Phase 2)`,
);
