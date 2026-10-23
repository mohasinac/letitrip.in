#!/usr/bin/env node
/**
 * Snapshot integrity — Part 14.
 *
 * A snapshot exists to answer "what did we agree, then". Three things break
 * that, and none of them raises at runtime:
 *
 *   R1  A PII-named key NESTED inside a snapshot, where `encryptPiiFields`
 *       cannot reach it. It is written in plaintext and never decrypted, and
 *       an unencrypted field is INDISTINGUISHABLE from an encrypted one in
 *       every inspection — both are `string`, and `Encrypted<string>` is
 *       erased at runtime.
 *
 *   R2  A snapshot field that is also UPDATABLE. A value that can be
 *       overwritten records nothing; `shippingAddress` was in
 *       `ORDER_UPDATABLE_FIELDS` for the whole time it was the only delivery
 *       address an order had.
 *
 *   R3  A creation snapshot living in a CAPPED log. `statusHistory` evicts
 *       FIFO at 50, so on a chatty record the creation entry — the one value
 *       reconstruction depends on — is the first thing to go, and
 *       `statusHistoryTruncated` says how many went but not what they were.
 *
 * 🛑 Verified by negative control before being trusted. Three rules this
 * codebase shipped passed their first control while blind, and
 * `audit-case-corpus`' R11 had been blind since the corpus moved.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const violations = [];
const add = (rule, where, detail) => violations.push({ rule, where, detail });

/**
 * Words that mean a human being.
 *
 * Deliberately short. A long list drifts toward matching every string field,
 * and a rule that cries wolf is one people learn to skip (the argument
 * `audit-conflict-markers` makes for not reporting the bare `=======`).
 */
const PII_WORDS =
  /^(fullName|(?:buyer|seller|customer|contact|recipient|user)Name|phone|mobile|email|addressLine1|addressLine2|landmark|street)$/i;
/*
 * 🛑 Bare `name` is NOT here, and its absence is the rule working.
 *
 * The first draft included it and immediately reported `specifications.name`
 * ("Weight") and `parts.name` ("Attack Ring") as leaked personal data. Two
 * false positives out of two findings is worse than no rule — the real one,
 * when it arrives, gets dismissed with them. A person's name in a snapshot is
 * `fullName` or `<role>Name`; a bare `name` is overwhelmingly a label.
 */

/** Comment- and string-stripped, via a state scanner rather than two regexes. */
function stripNonCode(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "/" && d === "*") {
      const e = src.indexOf("*/", i + 2);
      i = e < 0 ? n : e + 2;
      continue;
    }
    if (c === "/" && d === "/") {
      const e = src.indexOf("\n", i);
      i = e < 0 ? n : e;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const q = c;
      out += q;
      i += 1;
      while (i < n && src[i] !== q) {
        if (src[i] === "\\") i += 1;
        i += 1;
      }
      out += q;
      i += 1;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

/**
 * Does a named `<THING>_PII_FIELDS` list declare this nested key?
 *
 * Matches on the key alone rather than binding list-to-interface: the lists
 * are plain `as const` arrays with no type link to the shape they cover, so
 * pretending to verify the binding would be a check a name satisfies.
 */
function coveredByExplicitList(owner, key) {
  const schema = read("appkit/src/features/orders/schemas/firestore.ts");
  if (!schema) return false;
  for (const m of schema.matchAll(/_PII_FIELDS\s*=\s*\[([^\]]*)\]/g)) {
    if (new RegExp(`"${key}"`).test(m[1])) return true;
  }
  return false;
}

function read(rel) {
  const p = join(ROOT, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

/* ── R1: a PII key nested inside a snapshot the flat encryptor cannot reach ── */
{
  const schema = read("appkit/src/features/orders/schemas/firestore.ts");
  const pii = read("appkit/src/security/pii-schemas.ts");
  if (!schema || !pii) {
    add("R1", "orders/schemas or pii-schemas", "file missing — cannot run");
  } else {
    const declared = new Set(
      [...pii.matchAll(/^\s*"(\w+)",/gm)].map((m) => m[1]),
    );
    const code = stripNonCode(schema);

    /*
     * The snapshot objects: a property whose type is an inline object or an
     * array of one, declared on OrderDocument or OrderDocumentItem. We only
     * look INSIDE those braces — a top-level `userName: Encrypted<string>` is
     * reachable by the flat loop and is not this rule's business.
     */
    /*
     * 🛑 Inline objects AND named type references.
     *
     * The first draft matched only inline `{ … }` literals, which skipped
     * `deliveryAmendments?: DeliveryAmendment[]` — a named interface carrying
     * `fullName`, `phone` and `addressLine1`, i.e. the one case this rule
     * exists for. A rule that cannot see the shape it was written about
     * reports the same "clean" as one that checked it.
     */
    const bodies = [];
    for (const m of code.matchAll(/^\s{2}(\w+)\??:\s*(?:Array<)?\{([^}]*)\}/gm)) {
      bodies.push([m[1], m[2]]);
    }
    for (const m of code.matchAll(/^\s{2}(\w+)\??:\s*(\w+)\[\]/gm)) {
      const [, owner, typeName] = m;
      /*
       * 🛑 Built from an indexOf, not `new RegExp("interface\\s+…")`.
       *
       * The template-literal version of this lookup silently matched NOTHING
       * — every backslash had to be doubled to survive the string, and with
       * single ones the pattern reads as the literal text `interfaces+Name`.
       * The audit then printed "OK — 0 violations", which is the silent-zero
       * failure its own header warns about, in the rule written to close a
       * blind spot.
       */
      const at = code.indexOf(`interface ${typeName} {`);
      if (at < 0) continue;
      const close = code.indexOf("\n}", at);
      if (close < 0) continue;
      bodies.push([`${owner}:${typeName}`, code.slice(at, close)]);
    }

    for (const [owner, body] of bodies) {
      for (const f of body.matchAll(/(\w+)\??:/g)) {
        const key = f[1];
        if (!PII_WORDS.test(key)) continue;
        /*
         * An array's PII cannot be covered by the flat loop at all, so the
         * only honest handling is an EXPLICIT named list plus a scrub — the
         * shape `withHistory` uses. A declared `<TYPE>_PII_FIELDS` naming
         * this key is that declaration; absence is the violation.
         *
         * 🛑 This checks the DECLARATION, not that a scrub is called. The
         * call site is R4's job once the writer exists; a rule that claims
         * more than it tests is the decoration this file exists to avoid.
         */
        if (coveredByExplicitList(owner, key)) continue;
        add(
          "R1",
          `appkit/src/features/orders/schemas/firestore.ts :: ${owner}.${key}`,
          "PII nested inside a snapshot. `encryptPiiFields` is a flat top-level loop and\n" +
            "      cannot reach it, so it is stored in PLAINTEXT and never decrypted — and an\n" +
            "      unencrypted field looks identical to an encrypted one. Flatten it to a\n" +
            `      top-level key (e.g. \`${owner}${key[0].toUpperCase()}${key.slice(1)}\`) and name it in ORDER_PII_FIELDS.`,
        );
      }
    }

    /* Every flat delivery* PII key must actually be declared. */
    for (const m of code.matchAll(/^\s{2}(delivery\w+)\??:\s*Encrypted</gm)) {
      if (!declared.has(m[1])) {
        add(
          "R1",
          `ORDER_PII_FIELDS :: ${m[1]}`,
          "typed `Encrypted<string>` but not listed in ORDER_PII_FIELDS, so nothing\n" +
            "      encrypts it. The brand is erased at runtime — the type is an assertion\n" +
            "      with no mechanism behind it unless the list names the field.",
        );
      }
    }
  }
}

/* ── R2: a frozen field that is also updatable ─────────────────────────── */
{
  const schema = read("appkit/src/features/orders/schemas/firestore.ts");
  if (schema) {
    const code = stripNonCode(schema);
    const m = code.match(/ORDER_UPDATABLE_FIELDS\s*=\s*\[([^\]]*)\]/);
    const updatable = new Set(
      m ? [...m[1].matchAll(/"(\w+)"/g)].map((x) => x[1]) : [],
    );
    const frozen = [...code.matchAll(/^\s{2}(delivery\w+)\??:/gm)].map((x) => x[1]);
    for (const f of frozen) {
      if (updatable.has(f)) {
        add(
          "R2",
          `ORDER_UPDATABLE_FIELDS :: ${f}`,
          "a snapshot field that can be overwritten records nothing. Corrections go in\n" +
            "      `deliveryAmendments`; the snapshot is what the invoice reads.",
        );
      }
    }
  }
}

/* ── R3: a creation snapshot inside a capped log ───────────────────────── */
{
  const schema = read("appkit/src/features/orders/schemas/firestore.ts");
  if (schema) {
    const code = stripNonCode(schema);
    /*
     * The amendment array must be its OWN field. If it is ever folded into
     * `statusHistory`, the 50-entry FIFO cap applies to it and the creation
     * entry is evicted first on a busy order.
     */
    if (!/^\s{2}deliveryAmendments\??:/m.test(code)) {
      add(
        "R3",
        "OrderDocument.deliveryAmendments",
        "missing. Address corrections must not ride `statusHistory`, which evicts FIFO\n" +
          "      at 50 — the creation entry goes first, and that is the value reconstruction\n" +
          "      depends on.",
      );
    }
    if (/STATUS_HISTORY_MAX[\s\S]{0,200}delivery/.test(code)) {
      add(
        "R3",
        "OrderDocument",
        "a delivery field appears inside the capped-history block. A capped log cannot\n" +
          "      hold a creation snapshot.",
      );
    }
  }
}

/* ── report ────────────────────────────────────────────────────────────── */
if (violations.length === 0) {
  console.log("[audit-snapshot-integrity] OK — 0 violations (R1 nested PII · R2 frozen-but-updatable · R3 capped creation entry).");
  process.exit(0);
}
console.error(`\n[audit-snapshot-integrity] ${violations.length} violation(s):\n`);
for (const v of violations) {
  console.error(`  ${v.where}  [${v.rule}]`);
  console.error(`      ${v.detail}\n`);
}
process.exit(1);
