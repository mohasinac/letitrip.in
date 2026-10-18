#!/usr/bin/env node
/**
 * audit-pii-read-sites — strict-zero. Guards the PII READ side.
 *
 * ## Why this exists
 *
 * Fourteen repositories are ciphertext-by-default: `mapDoc` does not decrypt,
 * and plaintext requires a named `reveal*` / `masked*` accessor. The forcing
 * function for that is the nominal `Encrypted<T>` brand, which turns a field
 * read into a compile error — so `tsc`, not this audit, is the primary gate.
 *
 * This file covers the four things the compiler structurally CANNOT see.
 *
 * ## R1 RAW_DOC_ESCAPES
 *
 * `successResponse<T>(data?: T)` is fully generic, so handing it a whole
 * ciphertext document type-checks forever — no field is ever named, so the
 * brand is never touched. Measured 2026-10-18: 57 consumer routes read a
 * converted repository and call `successResponse` with no accessor anywhere in
 * the file. `GET /api/user/addresses` was the clearest: it returned whole
 * address documents, so the user's own address book rendered `enc:v1:…`.
 *
 * ## R2 MASK_FED_CIPHERTEXT
 *
 * `maskName` / `maskEmail` / `maskPhone` all begin with a `hasEncPrefix` guard
 * and answer "Anonymous" / "***@***.***" / "***" for ciphertext. That is a
 * deliberate fail-safe, and it is why the failure is INVISIBLE: no error, no
 * leak, and a masked column that is uniformly useless instead of showing
 * "R*** K***". Seven live sites did this, including the review OG image, which
 * takes the first character as an initial and so rendered "E" — from `enc:`.
 *
 * Feed those helpers only a value that came from a `reveal*`, or use `maskPii`,
 * which decrypts first.
 *
 * ## R3 BRAND_DEFEATING_CAST
 *
 * `as string` / `as unknown as X` / `as any` on a PII field compiles even with
 * the nominal brand, so it is the one way to reopen the hole the brand closed.
 * `doc as Review` is exactly what hid the `/reviews/[id]` "Anonymous" bug for
 * as long as it existed.
 *
 * ## R4 BRAND_INTEGRITY
 *
 * `Encrypted<T>` must stay NOMINAL. It was `T & { brand }` — an intersection,
 * therefore a subtype of `string` — which blocked every write and not one
 * read, while its own docstring claimed the opposite. Reverting it would
 * silently disable the compiler gate AND R1-R3's premise, with no other
 * symptom. Precedent for asserting a declaration's shape:
 * `audit-primitive-child-wrappers.mjs` "Check 1: the CSS contract".
 *
 * ## No suppression marker
 *
 * `scripts/audit-no-suppression-comments.mjs` is strict-zero and forbids new
 * ones. R1's escape hatch is "call the accessor"; R2's is "use `maskPii`";
 * R3's is "do not cast". Genuine exceptions are listed in the registries below
 * with a per-entry reason — reviewable source, not a silencing comment.
 *
 * Like the projection audit this models, every gap here is a false NEGATIVE,
 * which is safe. Proper taint analysis needs the compiler, and this repo's
 * audits deliberately do not run it.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = process.cwd();

/** The fourteen ciphertext-by-default repositories, by singleton name. */
const CONVERTED_REPOS = [
  "addressesRepository",
  "orderRepository",
  "payoutRepository",
  "savedPaymentMethodsRepository",
  "offerRepository",
  "supportRepository",
  "reviewRepository",
  "bidRepository",
  "eventEntryRepository",
  "lotteryEntryRepository",
  "userRepository",
  "sessionRepository",
  "emailVerificationTokenRepository",
  "passwordResetTokenRepository",
];

/** A read that returns documents (not a count, not a boolean). */
const READ_CALL = new RegExp(
  `\\b(${CONVERTED_REPOS.join("|")})\\s*\\.\\s*(?:findById|findBy\\w*|findOneBy|findAll|findFeatured|list\\w*|getTicketById|get\\w+ById)\\s*\\(`,
);

/** Any named accessor, or the shared helpers they delegate to. */
const ACCESSOR = /\b(?:reveal|masked)[A-Z]\w*\s*\(|\b(?:revealPii|maskPii|revealPiiAll|maskPiiAll)\s*\(/;

/** The UI mask helpers that refuse ciphertext by design (R2). */
const UI_MASKS = [
  "maskName",
  "maskEmail",
  "maskPhone",
  "maskPublicReview",
  "maskPublicBid",
  "maskPublicEventEntry",
  "maskOfferForSeller",
];
const UI_MASK_CALL = new RegExp(`\\b(${UI_MASKS.join("|")})\\s*\\(`, "g");

/** PII field names across the fourteen, for R3. */
const PII_FIELDS = [
  "email", "phoneNumber", "googleLinkedEmail",
  "fullName", "phone", "addressLine1", "addressLine2",
  "userName", "userEmail", "sellerEmail",
  "upiId", "buyerName", "buyerEmail",
  "userDisplayName", "assignedToName", "userPhone",
  "identifier", "ipAddress",
];
const BRAND_CAST = new RegExp(
  `\\.(?:${PII_FIELDS.join("|")})\\b\\s+as\\s+(?:unknown\\s+as\\s+)?(?:string|any|\\w+)`,
);

/*
 * R1 exceptions, each with a reason. A route here reads a converted repository
 * and legitimately needs no accessor.
 *
 * 🛑 Add an entry only when the route touches NO PII field — e.g. it counts
 * rows, checks existence, or reads an id. "It is admin-only" is not a reason:
 * an admin surface still has to choose reveal or mask.
 */
const R1_EXCEPT = [
  // (empty — populated only with a stated reason)
];

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (["node_modules", "dist", ".next", ".git", "__tests__"].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(e.name)) yield p;
  }
}

const findings = [];
const add = (file, line, rule, why) =>
  findings.push({ file: relative(ROOT, file).replace(/\\/g, "/"), line, rule, why });

const lineOf = (src, index) => src.slice(0, index).split(/\r?\n/).length;

// ── R4 first: if the brand is not nominal, R1-R3 rest on nothing ───────────
const ENCRYPTED_FILE = join(ROOT, "appkit", "src", "security", "encrypted.ts");
let brandOk = false;
try {
  const src = stripComments(readFileSync(ENCRYPTED_FILE, "utf8"));
  const m = src.match(/export type Encrypted<[^>]*>\s*=\s*([\s\S]*?);/);
  if (!m) {
    add(ENCRYPTED_FILE, 0, "BRAND_INTEGRITY",
      "cannot find `export type Encrypted<…> =` — R1-R3 assume the nominal brand exists");
  } else {
    const body = m[1];
    const isIntersection = /^\s*T\s*&/.test(body) || /\bstring\s*&/.test(body);
    if (isIntersection) {
      add(ENCRYPTED_FILE, lineOf(src, m.index), "BRAND_INTEGRITY",
        "`Encrypted<T>` is an INTERSECTION again. An intersection is a SUBTYPE of " +
        "`string`, so it flows into anything accepting one: it blocks writes and " +
        "NOT ONE read. That is the exact state that let 95 reader sites handle " +
        "ciphertext silently. It must stay a nominal object type.");
    } else {
      brandOk = true;
    }
  }
} catch (err) {
  add(ENCRYPTED_FILE, 0, "BRAND_INTEGRITY", `unreadable: ${err?.message ?? err}`);
}

// ── R1 / R2 / R3 ──────────────────────────────────────────────────────────
for (const root of ["src", join("appkit", "src")]) {
  for (const file of walk(join(ROOT, root))) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    const raw = readFileSync(file, "utf8");
    const code = stripComments(raw);

    const hasRead = READ_CALL.test(code);
    const hasAccessor = ACCESSOR.test(code);

    // R1 — a whole document reaching a response or a client prop.
    if (hasRead && !hasAccessor && !R1_EXCEPT.includes(rel)) {
      const m = /\bsuccessResponse\s*\(/.exec(code);
      if (m) {
        add(file, lineOf(code, m.index), "RAW_DOC_ESCAPES",
          "reads a ciphertext-by-default repository and calls `successResponse` with " +
          "no `reveal*`/`masked*` anywhere in the file. `successResponse<T>` is " +
          "generic, so a whole ciphertext document type-checks and no field is ever " +
          "named — the brand cannot see this. Call the accessor for the surface: " +
          "reveal for the owner/an admin acting on the record/outbound mail, mask " +
          "for anything public.");
      }
    }

    // R2 — a UI mask fed something that did not come from a reveal.
    if (!hasAccessor) {
      for (const m of code.matchAll(UI_MASK_CALL)) {
        // Only flag when the file also READS a converted repository: a mask
        // applied to a value already in hand (a form field, a prop) is fine.
        if (!hasRead) break;
        add(file, lineOf(code, m.index), "MASK_FED_CIPHERTEXT",
          `\`${m[1]}\` is called in a file that reads a ciphertext-by-default ` +
          "repository without any `reveal*`. These helpers guard on `hasEncPrefix` " +
          'and answer "Anonymous" / "***@***.***" / "***" for ciphertext — so the ' +
          "column is uniformly useless and nothing errors. Use the repository's " +
          "`masked*` accessor, which decrypts first.");
      }
    }

    // R3 — a cast that erases the brand on a PII field.
    const c = BRAND_CAST.exec(code);
    if (c) {
      add(file, lineOf(code, c.index), "BRAND_DEFEATING_CAST",
        `\`${c[0].trim()}\` casts a PII field, which compiles even with the nominal ` +
        "brand and is the one way to reopen the hole it closed. `doc as Review` is " +
        "what hid the /reviews/[id] \"Anonymous\" bug. Reveal or mask instead.");
    }
  }
}

if (findings.length > 0) {
  console.error(`[audit-pii-read-sites] ${findings.length} finding(s):\n`);
  const byRule = new Map();
  for (const f of findings) byRule.set(f.rule, (byRule.get(f.rule) ?? 0) + 1);
  for (const f of findings.slice(0, 60)) {
    console.error(`  ${f.file}:${f.line}  [${f.rule}]`);
    console.error(`      → ${f.why}\n`);
  }
  if (findings.length > 60) console.error(`  … and ${findings.length - 60} more\n`);
  console.error(
    "  " + [...byRule].map(([r, n]) => `${r}=${n}`).join(" · ") + "\n",
  );
  process.exit(1);
}

console.log(
  `[audit-pii-read-sites] OK — 0 findings (brand is ${brandOk ? "nominal" : "UNVERIFIED"})`,
);
