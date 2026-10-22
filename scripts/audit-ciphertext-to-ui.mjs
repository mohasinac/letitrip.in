#!/usr/bin/env node
/**
 * audit-ciphertext-to-ui — a list route must not hand a UI stored ciphertext.
 *
 * ## The bug this exists for
 *
 * `OrderRepository.mapDoc` is deliberately NOT overridden (ciphertext-by-
 * default, CLAUDE.md § "Ciphertext-by-default"), so a sieve/list read returns
 * the PII fields as stored `enc:v1:…` blobs. Plaintext requires one of the
 * named accessors — `revealOrders` / `maskedOrders`. A route that returns
 * `sieveResult.items` without calling one renders ciphertext into the UI.
 *
 * Measured live in the seller's order list:
 *
 *     enc:v1:8plr3ZzKBqejPPti:MCZsrfOidLkSL6EogbxlCzU=:pCTLN9/N4A/54O4AiOYa3g==
 *
 * where the buyer's name belongs.
 *
 * 🛑 THIS IS A RECURRING CLASS, WHICH IS THE ARGUMENT FOR A RULE RATHER THAN
 * AN EIGHTH FIX. Eight files in appkit already carry a comment recording the
 * same leak — reviews, store reviews, address actions, cart, catalogue,
 * lottery, bids, offers — and the offer one had already baked `enc:v1:…` into
 * 383 notification bodies before anyone noticed. `/api/admin/orders` fixed it
 * at the route and `/api/store/orders`, its sibling, did not get the
 * back-port (Root Cause #59's shape on the PII axis).
 *
 * ## 🛑 Why neither `tsc` nor a grep already catches it
 *
 * `OrderDocument.userName` is `Encrypted<string>` — a BRANDED type, so an
 * appkit-internal reader that skips the accessors is a compile error naming
 * file and line. That protection **stops at the serialisation boundary**: the
 * client receives JSON typed `string`, so every view downstream of
 * `successResponse` is outside the brand's reach. A route is the last place
 * the brand exists, and therefore the only place this can be enforced.
 *
 * And a grep for the accessor names finds the routes that are CORRECT. The
 * defect is an absence, which is why this keys on the repository read instead.
 *
 * ## The rule
 *
 * R1 PII_LIST_WITHOUT_ACCESSOR — a route file that reads a PII-bearing
 * repository in list form and reaches `successResponse` without calling that
 * repository's reveal/mask accessor.
 *
 * Deliberately narrow: it keys on a REGISTRY of repositories whose `mapDoc`
 * is known not to decrypt, rather than guessing from field names. A rule that
 * guessed would fire on every route touching a `name` field, and an audit
 * with mostly-false findings gets its true ones dismissed with the rest
 * (Root Cause #84, the `text-as-label` lesson: 53 of 72 were never
 * violations).
 *
 * Suppression: `// audit-ciphertext-to-ui-ok: <reason>` on the line or the one
 * directly above — for a route that genuinely returns no PII field (e.g. it
 * projects to ids and totals only).
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/**
 * Repositories whose `mapDoc` does NOT decrypt, with the accessors that are
 * the only legitimate way to plaintext.
 *
 * 🛑 Add a repository here when you make its `mapDoc` stop decrypting — that
 * is the moment its routes become able to leak, and the migration's own
 * instruction is "one repository per change" so the list grows one entry at a
 * time, reviewably.
 */
const CIPHERTEXT_BY_DEFAULT = [
  {
    repo: "orderRepository",
    accessors: ["revealOrder", "revealOrders", "maskedOrder", "maskedOrders"],
  },
];

const MARKER = "audit-ciphertext-to-ui-ok";

/**
 * 🛑 A NAMED RATCHET, not a predicate — and the reason is measured, not
 * stylistic.
 *
 * Deciding "do the rows actually reach the response" is a dataflow question.
 * A route can read 500 orders and emit a revenue total, a count, or an
 * explicit six-field projection, and no regex can tell that from one that
 * emits the rows. Run as a plain predicate on this tree, the rule fires on
 * FIVE routes of which exactly ONE was a real leak — a 4-in-5 false-positive
 * rate, and CLAUDE.md is blunt about what that is worth: *"an audit with nine
 * false positives out of eleven is worse than none, because the two real ones
 * get dismissed with the rest."*
 *
 * So the known-safe routes are NAMED, each with the reason it is safe,
 * verified by opening it. A ratchet's list may only shrink; a NEW list-reading
 * route that is not on it fails, which is the thing actually worth blocking —
 * `/api/store/orders` was exactly that, a sibling added without the accessor
 * its neighbours already had.
 *
 * Each entry below was checked by reading the response literal, not inferred
 * from the route's name.
 */
const AGGREGATE_ONLY = new Map([
  [
    "src/app/api/store/payouts/route.ts",
    "Reduces orders to grossAmount/platformFee/netAmount and eligibleOrders.length. No document is serialised.",
  ],
  [
    "src/app/api/admin/dashboard/route.ts",
    "`findPending().then((r) => r.length)` — a count. No document is serialised.",
  ],
  [
    "src/app/api/store/analytics/route.ts",
    "`findBy('storeId', …)` reduced to analytics aggregates. No document is serialised.",
  ],
  [
    "src/app/api/store/dashboard/route.ts",
    "Two `listForSeller` reads reduced to counts and revenue totals. No document is serialised.",
  ],
  [
    "src/app/api/user/purchases/[productId]/route.ts",
    "Projects one matching order to an explicit six-field literal (id, shortRef, status, orderDate, two hrefs) — none of them a PII field.",
  ],
]);

/** Route files only — a route is where the brand still exists. */
function collectRoutes(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".next" || entry === "dist") continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) collectRoutes(full, out);
    else if (entry === "route.ts" || entry === "route.tsx") out.push(full);
  }
  return out;
}

/**
 * Strip comments before matching.
 *
 * 🛑 Not cosmetic. Every one of the eight files above EXPLAINS this bug in
 * prose, quoting `enc:v1:` and the accessor names. Without stripping, a file
 * that merely documents the hazard reads as a file that handles it — and the
 * audit would report OK for precisely the state it exists to catch. That
 * exact mistake was made once before, in `audit-observability-registration`,
 * where a commented-out registration counted as a registration.
 */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, p1) => p1);
}

/**
 * The marker may sit on the hit's line, or anywhere in the CONTIGUOUS comment
 * block directly above it.
 *
 * 🛑 Not the usual `lines[i - 1]` check, and the difference is load-bearing.
 * CLAUDE.md records that *"a legal marker must sit on the SAME line or EXACTLY
 * ONE line above the hit… so a tidy multi-line explanation with the marker on
 * its FIRST line does not suppress anything — the audit reads the last comment
 * line, finds no marker, and reports the violation while the file looks
 * suppressed to a human reader."*
 *
 * This audit walked into exactly that on its first real suppression: a 14-line
 * block comment explaining precisely why `/api/store/payouts` is safe, with the
 * marker at the top, suppressed nothing.
 *
 * A one-line-only rule forces a choice between an unreadable 300-character
 * comment and a marker divorced from its reasoning — and the reasoning is the
 * only part worth having. `audit-dead-underscore-prop` already scans the block
 * for this reason; this follows it.
 */
function hasMarker(lines, idx) {
  if ((lines[idx] ?? "").includes(MARKER)) return true;
  for (let i = idx - 1; i >= 0; i--) {
    const line = (lines[i] ?? "").trim();
    // Walk up only while still inside a comment block (or its blank padding).
    const isComment =
      line.startsWith("//") ||
      line.startsWith("/*") ||
      line.startsWith("*") ||
      line.endsWith("*/") ||
      line === "";
    if (!isComment) return false;
    if (line.includes(MARKER)) return true;
  }
  return false;
}

const findings = [];

for (const file of collectRoutes(join(ROOT, "src", "app", "api"))) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  // Named-safe: reads a list but emits only aggregates or an explicit
  // non-PII projection. Verified by reading each one; see AGGREGATE_ONLY.
  if (AGGREGATE_ONLY.has(rel)) continue;

  const raw = readFileSync(file, "utf8");
  const code = stripComments(raw);
  const rawLines = raw.split("\n");

  for (const { repo, accessors } of CIPHERTEXT_BY_DEFAULT) {
    /*
     * Any plural read, matched by PREFIX rather than by an enumerated list of
     * method names.
     *
     * 🛑 THE ENUMERATED VERSION OF THIS RULE WAS DECORATION, and it took a
     * negative control to find out. It listed
     * `(list|listAll|listBy\w*|findMany|findAllBy\w*)`, and the route carrying
     * the actual bug calls **`listForSeller(`** — which none of those match
     * (`list` alone then demands `\s*\(`, and "ForSeller(" follows). So the
     * audit reported `clean ✓` on a tree where the leak was live, while ALSO
     * reporting a false positive on `/api/store/payouts`. Worst of both: it
     * missed the real one and cried wolf about a safe one.
     *
     * It was only caught by deleting the fix and watching the audit stay
     * green — the check CLAUDE.md demands and the reason "never trust an audit
     * you have not seen fail" (Root Cause #87) is written down at all. A rule
     * keyed on a hand-typed list of method names is a rule keyed on what its
     * author happened to remember (Root Cause #84).
     *
     * `findById` is excluded because a single-document read is the detail
     * path's business, not this rule's.
     */
    const listRead = new RegExp(
      `${repo}\\s*\\.\\s*(?!findById\\b)(list\\w*|find\\w*)\\s*\\(`,
    );
    if (!listRead.test(code)) continue;

    const usesAccessor = accessors.some((a) =>
      new RegExp(`${repo}\\s*\\.\\s*${a}\\s*\\(`).test(code),
    );
    if (usesAccessor) continue;

    // Only a route that actually RETURNS something can leak it.
    if (!/successResponse\s*\(/.test(code)) continue;

    const idx = rawLines.findIndex((l) => listRead.test(l));
    if (idx >= 0 && hasMarker(rawLines, idx)) continue;

    findings.push({
      file: relative(ROOT, file).replace(/\\/g, "/"),
      line: idx >= 0 ? idx + 1 : 1,
      repo,
      accessors,
    });
  }
}

if (findings.length === 0) {
  console.log(
    `audit-ciphertext-to-ui: clean ✓ (${CIPHERTEXT_BY_DEFAULT.length} ciphertext-by-default repository/ies checked)`,
  );
  process.exit(0);
}

console.error(
  `audit-ciphertext-to-ui: ${findings.length} violation(s) — a list route returns stored ciphertext\n`,
);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  [PII_LIST_WITHOUT_ACCESSOR]`);
  console.error(
    `    Reads \`${f.repo}\` in list form and returns it without decrypting. ` +
      `Its \`mapDoc\` does not decrypt, so the PII fields are stored \`enc:v1:…\` ` +
      `blobs and the UI renders them verbatim.`,
  );
  console.error(
    `    Call one of: ${f.accessors.join(", ")}. REVEAL for a caller who owns ` +
      `the records (their own orders, a seller packing their own parcel); MASK ` +
      `for a browsing list whose detail view reveals on demand.\n`,
  );
}
console.error(`Suppression: // ${MARKER}: <reason>`);
process.exit(1);
