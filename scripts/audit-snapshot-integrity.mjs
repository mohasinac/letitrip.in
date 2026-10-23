#!/usr/bin/env node
/**
 * Snapshot integrity — Part 14.
 *
 * A snapshot exists to answer "what did we agree, then". Three things break
 * that, and none of them raises at runtime:
 *
 *   R1  A PII-named key nested inside a snapshot that NO DECLARATION COVERS.
 *
 *       🛑 CORRECTED 2026-10-23, and the correction IS the rule. This was
 *       first written as "`encryptPiiFields` cannot reach it", quoting
 *       CLAUDE.md's "flat top-level loop that never descends into arrays".
 *       **That is false.** The function handles dotted paths and
 *       `array[].key` through `encryptInArray`, in both directions, and
 *       `CONVERSATION_PII_FIELDS` has shipped `lastMessage.body` for a long
 *       time.
 *
 *       What it does not do is INFER. A field is covered only when it is
 *       named in the right NOTATION — and `"fullName"` does not cover
 *       `deliveryAmendments[].fullName`. That near-miss is the realistic
 *       mistake: it reads as covered in review, and it is silent, because an
 *       unencrypted field is indistinguishable from an encrypted one — both
 *       are `string`, and `Encrypted<string>` is erased at runtime.
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
 * Is this nested key declared, IN THE NOTATION THE ENCRYPTOR READS?
 *
 * 🛑 The notation has to match, not merely the key name. A bare `"fullName"`
 * in `ORDER_PII_FIELDS` encrypts a top-level `order.fullName` — a field that
 * does not exist — and leaves `deliveryAmendments[].fullName` untouched.
 * Accepting the bare name would make this rule pass on exactly the mistake it
 * exists to catch, which is how a check becomes decoration.
 *
 * `owner` arrives as `deliveryAmendments:DeliveryAmendment` for a named type,
 * so the array path is the part before the colon.
 */
function coveredByExplicitList(owner, key) {
  const arrayPath = owner.split(":")[0];
  const wanted = [`"${arrayPath}[].${key}"`, `"${arrayPath}.${key}"`];
  for (const rel of [
    "appkit/src/security/pii-schemas.ts",
    "appkit/src/features/orders/schemas/firestore.ts",
  ]) {
    const src = read(rel);
    if (src && wanted.some((w) => src.includes(w))) return true;
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
          "PII nested inside a snapshot, and no PII list NAMES that path. The encryptor\n" +
            "      CAN reach a nested key (`a.b`, `a[].b`) but never INFERS one, so this is\n" +
            "      stored in PLAINTEXT — and an unencrypted field looks identical to an\n" +
            "      encrypted one (both `string`). Declare the exact path, or flatten it to a\n" +
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
