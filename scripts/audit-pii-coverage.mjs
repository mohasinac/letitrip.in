#!/usr/bin/env node
/**
 * audit-pii-coverage — the PII invariants that are provable from source.
 *
 * ## Why this exists
 *
 * Every PII defect this migration found was silent. `decryptValue` returns any
 * non-`enc:v1:` string unchanged, so a collection that is half-encrypted, or
 * not encrypted at all, READS PERFECTLY. There is no error, no log line, and no
 * visibly wrong page — only a field that happens to be plaintext at rest.
 *
 * Concretely, in this codebase: `bids` encrypted on create but declared no
 * `piiFields`, so `adminUpdateBid` wrote plaintext back over the ciphertext;
 * `catalogue.create` bypassed the write hook entirely; five repositories
 * encrypted in a private method that only their own create/update call sites
 * remembered to call, leaving `createWithId` and the whole `*InTx`/`*InBatch`
 * family unhooked; and `cart.mapDoc` decrypted a field nothing encrypts, which
 * answered "is this handled?" wrongly for years.
 *
 * ## R1 EMPTY_PII_LIST
 *
 * An exported `*_PII_FIELDS` that is an empty array. It reads as "this document
 * has no PII" while doing nothing, and it cost one planning session a wrong
 * diagnosis: `NEWSLETTER_PII_FIELDS = []` sat beside a repository that held its
 * own module-local `["email"]` and encrypted correctly through that
 * (Root Cause #53 — the symbol a grep finds is not the one doing the work).
 *
 * ## R2 UNDECLARED_PII_FIELD
 *
 * A repository whose schema has a PII-shaped field (email / phone / upi /
 * account number / ifsc) that its `piiFields` does not name. Shape-matching is
 * deliberately crude and reports rather than fails — the point is to surface a
 * candidate for triage, not to guess at policy. Decision D1 explicitly keeps
 * some identity fields plaintext (`displayName`, `bids.userName`, and the whole
 * scam registry, where SEO is the feature), so a match is a question, not a
 * verdict.
 *
 * ## R3 UNCONDITIONAL_MAPDOC_DECRYPT — STAGED
 *
 * A repository whose `mapDoc` decrypts on every read, so ciphertext never
 * leaves the database and every caller silently handles plaintext.
 *
 * `SiteSettingsRepository` is the shape to copy: `mapDoc` is NOT overridden, so
 * reads return ciphertext and plaintext requires a NAMED
 * `getDecryptedCredentials()`, with `getCredentialsMasked()` for UI. Masked is
 * the default; plaintext is opt-in and named.
 *
 * 16 repositories decrypt unconditionally today, and their read methods are
 * consumed by 147+ files — measured, across only 10 of the 16. Converting them
 * blind, with no test suite, would mean triaging every one of those call sites
 * into plaintext / masked / neither in a single pass. So this rule is STAGED:
 * the known 16 are listed and do not fail, a SEVENTEENTH does. The gap is
 * measured and cannot grow while the conversion is done deliberately.
 *
 * Suppression: `// audit-pii-coverage-ok: <reason>`.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, basename } from "node:path";

const REPO_ROOT = process.cwd();
const APPKIT = join(REPO_ROOT, "appkit", "src");
const OK_RE = /\/\/\s*audit-pii-coverage-ok\s*:/i;
const STRICT_ALL = process.env.MIGRATE === "strict";

/**
 * Repositories whose `mapDoc` decrypts unconditionally today.
 *
 * A ratchet, not an allowlist: removing an entry is the goal, adding one is the
 * thing being blocked. Each conversion needs its read call sites triaged, which
 * is why they are burned down rather than flipped at once.
 */
const KNOWN_UNCONDITIONAL = new Set([
  "addresses.repository.ts",
  "bid.repository.ts",
  "catalogue.repository.ts",
  "chat.repository.ts",
  "event-entry.repository.ts",
  "lottery-entry.repository.ts",
  "offer.repository.ts",
  "orders.repository.ts",
  "payout.repository.ts",
  "reviews.repository.ts",
  "saved-payment-methods.repository.ts",
  "session.repository.ts",
  "support.repository.ts",
  "token.repository.ts",
  "user.repository.ts",
]);

/** Field-name shapes that are PII in this codebase's own vocabulary. */
const PII_SHAPE = /^(.*[Ee]mail|.*[Pp]hone|.*upiVpa|.*upiId|accountNumber|ifscCode|.*[Pp]assword)$/;

/**
 * Plaintext ON PURPOSE — decision D1. Search wins on names, and the scam
 * registry's identity fields are plaintext because a victim googles a UPI id
 * before paying, so SEO is the feature rather than an oversight.
 */
const D1_PLAINTEXT = new Set([
  "displayName", "userName", "sellerName", "buyerName", "storeName",
  "ownerName", "productTitle",
  "emails", "phones", "upiIds",   // scammerProfiles — plural, arrays, public
]);

function* walk(root) {
  let entries;
  try { entries = readdirSync(root, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (["node_modules", "dist", ".next"].includes(e.name)) continue;
    const full = join(root, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.name.endsWith(".ts")) yield full;
  }
}

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));
}

const findings = [];
const report = (file, line, rule, msg) => findings.push({ file, line, rule, msg });

/** Every appkit source file, read once — the constant lookup below needs them all. */
const ALL_TS = [...walk(APPKIT)];

/**
 * Find a `*_PII_FIELDS` constant's members wherever it is declared.
 *
 * Not every one lives in pii-schemas.ts — SUPPORT_TICKET_PII_FIELDS is declared
 * in its own feature. Looking only in the central file resolved it to the empty
 * set, which made the audit report a correctly-configured repository as
 * undeclared.
 */
function resolveConst(name) {
  for (const f of ALL_TS) {
    const src = stripComments(readFileSync(f, "utf8"));
    const m = src.match(new RegExp(`export const ${name}\\s*(?::[^=]+)?=\\s*\\[([^\\]]*)\\]`));
    if (m) return [...m[1].matchAll(/"([^"]+)"/g)].map((q) => q[1]);
  }
  return [];
}

// ── R1 ──────────────────────────────────────────────────────────────────────
const schemasPath = join(APPKIT, "security", "pii-schemas.ts");
const schemasRaw = readFileSync(schemasPath, "utf8");
const schemasRel = relative(REPO_ROOT, schemasPath).replace(/\\/g, "/");
for (const m of stripComments(schemasRaw).matchAll(
  /export const ([A-Z_]+_PII_FIELDS)\s*=\s*\[\s*\]/g,
)) {
  const line = schemasRaw.slice(0, m.index).split(/\r?\n/).length;
  report(schemasRel, line, "EMPTY_PII_LIST",
    `\`${m[1]}\` is an empty array. It reads as "this document has no PII" while ` +
    `doing nothing — the exact shape that made NEWSLETTER_PII_FIELDS look like ` +
    `proof newsletter email was unencrypted when the repository was in fact ` +
    `encrypting it through a module-local list (Root Cause #53). Populate it or ` +
    `delete it.`);
}

// ── R2 + R3 ─────────────────────────────────────────────────────────────────
let staged = 0;
for (const file of walk(APPKIT)) {
  if (!file.endsWith(".repository.ts")) continue;
  const name = basename(file);
  const rel = relative(REPO_ROOT, file).replace(/\\/g, "/");
  const raw = readFileSync(file, "utf8");
  const code = stripComments(raw);
  const lineAt = (i) => code.slice(0, i).split(/\r?\n/).length;
  const suppressed = (line) => {
    const lines = raw.split(/\r?\n/);
    return OK_RE.test(`${lines[line - 2] ?? ""}\n${lines[line - 1] ?? ""}`);
  };

  // R3 — mapDoc that decrypts on every read.
  //
  // Detected as "the file overrides mapDoc AND calls a decrypt helper", not by
  // proximity. A first version required `decryptPii` within 600 characters of
  // the override and therefore saw 9 of the 16 repositories that actually do
  // this — a rule silently missing half its subjects, which is the same defect
  // shape this whole audit exists to catch.
  const mdIdx = code.search(/override mapDoc/);
  const decrypts = /\bdecryptPiiFields?\s*\(|\bdecryptPii\s*\(/.test(code);
  if (mdIdx !== -1 && decrypts) {
    const line = lineAt(mdIdx);
    if (!suppressed(line)) {
      if (KNOWN_UNCONDITIONAL.has(name) && !STRICT_ALL) {
        staged++;
      } else {
        report(rel, line, "UNCONDITIONAL_MAPDOC_DECRYPT",
          `\`mapDoc\` decrypts on every read, so ciphertext never leaves the ` +
          `database and every caller silently handles plaintext. Copy ` +
          `SiteSettingsRepository: leave \`mapDoc\` alone, and expose plaintext ` +
          `through a NAMED getter with a masked variant for UI. Masked is the ` +
          `default; plaintext is opt-in and named.`);
      }
    }
  }

  // R2 — a PII-shaped schema field the repo does not declare.
  const decl = code.match(/override piiFields\s*=\s*([A-Z_]+)|override piiFields\s*=\s*\[([^\]]*)\]/);
  if (!decl) continue;
  const declared = new Set();
  if (decl[1]) {
    // Resolve the constant wherever it is DEFINED, not only in pii-schemas.ts.
    // SUPPORT_TICKET_PII_FIELDS lives in its own feature, so a pii-schemas-only
    // lookup resolved it to the empty set and reported every one of its fields
    // as undeclared — the audit accusing correct code.
    const found = resolveConst(decl[1]);
    for (const q of found) declared.add(q);
  } else if (decl[2]) {
    for (const q of decl[2].matchAll(/"([^"]+)"/g)) declared.add(q[1]);
  }

  const schemaFile = file
    .replace(/repository[\\/][^\\/]+\.repository\.ts$/, "schemas/firestore.ts");
  let schemaSrc;
  try { schemaSrc = stripComments(readFileSync(schemaFile, "utf8")); } catch { continue; }

  // Only the MAIN document interface. A schema file also declares nested
  // shapes, and a flat 2-space-indent scan cannot tell them apart: it flagged
  // `PayoutBankAccount.ifscCode`, which IS encrypted — by
  // `encryptPayoutBankAccount`, because a flat `piiFields` list cannot name a
  // nested field. Reporting that is reporting a guess.
  const docName = basename(file).replace(".repository.ts", "");
  const iface = schemaSrc.match(
    new RegExp(`export interface \\w*${docName.replace(/s$/, "")}\\w*Document\\s*(?:extends [^{]+)?\\{([\\s\\S]*?)\\n\\}`, "i"),
  );
  const scanBody = iface ? iface[1] : null;
  if (!scanBody) continue;   // cannot identify the document interface — say nothing

  for (const f of scanBody.matchAll(/^\s{2}(\w+)\??:\s*(?:string|string\[\])/gm)) {
    const field = f[1];
    if (!PII_SHAPE.test(field)) continue;
    if (declared.has(field) || D1_PLAINTEXT.has(field)) continue;
    report(rel, lineAt(decl.index), "UNDECLARED_PII_FIELD",
      `schema declares \`${field}\`, which is PII-shaped, but \`piiFields\` does ` +
      `not name it. Either add it, or record here why it is plaintext by ` +
      `decision (D1 keeps names searchable on purpose).`);
    break; // one finding per repo is enough to prompt a triage
  }
}

const byRule = findings.reduce((a, f) => ((a[f.rule] = (a[f.rule] ?? 0) + 1), a), {});
const summary = Object.entries(byRule).map(([r, n]) => `${r}=${n}`).join(" · ") || "none";

if (findings.length > 0) {
  console.error(`[audit-pii-coverage] ${findings.length} finding(s) — ${summary}\n`);
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  [${f.rule}]`);
    console.error(`    ${f.msg}\n`);
  }
  console.error("Suppression: // audit-pii-coverage-ok: <reason>");
  process.exit(1);
}

console.log(
  `[audit-pii-coverage] OK — 0 findings ` +
  `(${staged} repo(s) staged on R3 UNCONDITIONAL_MAPDOC_DECRYPT; MIGRATE=strict includes them)`,
);
