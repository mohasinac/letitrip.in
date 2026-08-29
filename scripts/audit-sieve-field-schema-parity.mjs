#!/usr/bin/env node
/**
 * audit-sieve-field-schema-parity.mjs — a filter that can never match, and a
 * filter that is silently thrown away.
 *
 * WHY THIS EXISTS
 *
 * A repository's `SIEVE_FIELDS` map is the allowlist of what callers may
 * filter and sort on. `sieve.ts` sets `throwExceptions: false`, so a clause
 * naming a field that ISN'T in the map is not an error — `findField()` returns
 * undefined and the clause simply vanishes. Two opposite mistakes both end in
 * silence:
 *
 *   SIEVE_ORPHAN — the map lists a field the document doesn't have.
 *     `freeShipping` sat in the products map for years. There is no such field
 *     on ProductDocument; free shipping is derived from
 *     `shippingPaidBy === "seller"`. Any filter on it matched zero rows.
 *
 *   EMITTED_BUT_UNFILTERABLE — code emits a filter on a real document field
 *     that the map doesn't list.
 *     The public "Free shipping" toggle emitted `shippingPaidBy==seller`
 *     correctly, all the way through `buildFirestoreSafeFilters` and the route
 *     safelist — and Sieve dropped it, because `shippingPaidBy` wasn't in the
 *     map. The toggle appeared to work and changed nothing. Same for
 *     `pricePerEntry` (the prize-draw price filter) and `availableQuantity`.
 *
 * Both were live on 2026-08-21. Neither is visible to tsc, to a type test, or
 * to any existing audit.
 *
 * METHOD
 *
 * Plain Node + regex over raw source — no TS compiler, matching this project's
 * audit convention. For each registered repository:
 *   1. read its `SIEVE_FIELDS` keys;
 *   2. read the paired `*Document` interface's field names (including fields
 *      inherited from `BaseDocument`, and nested object fields for dotted
 *      sieve keys like `classified.negotiable`);
 *   3. read every `sieveFilter(X, …)` / `.where(X, …)` call site and route
 *      safelist that targets this collection, resolving `PRODUCT_FIELDS.FOO`
 *      constants to their literal values.
 *
 * Strict zero — any violation blocks.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * @type {{
 *   name: string,
 *   sieveFile: string,
 *   sieveExport: string,
 *   schemaFile: string,
 *   schemaInterface: string,
 *   emitFiles: string[],
 *   fieldConstant?: string,
 *   allowOrphan?: Record<string,string>,
 *   allowUnfilterable?: Record<string,string>,
 * }[]}
 */
const REGISTRY = [
  {
    name: "products",
    sieveFile: "appkit/src/features/products/repository/products.repository.ts",
    sieveExport: "SIEVE_FIELDS",
    schemaFile: "appkit/src/features/products/schemas/firestore.ts",
    schemaInterface: "ProductDocument",
    // Files that build product filter clauses or safelist product filter fields.
    emitFiles: [
      "appkit/src/_internal/server/features/products/list-public.ts",
      "appkit/src/features/products/components/PrizeDrawsListingView.tsx",
      "src/app/api/products/route.ts",
      "src/app/api/classified/route.ts",
      "src/app/api/digital-codes/route.ts",
      "src/app/api/live/route.ts",
      "src/app/api/pre-orders/route.ts",
    ],
    fieldConstant: "PRODUCT_FIELDS",
    allowOrphan: {
      // Read-only denormalised alias kept for legacy consumers; the canonical
      // field is `categorySlugs`. Declared @deprecated on the document.
      category:
        "@deprecated read-only alias of categorySlugs, still present on real documents",
    },
  },
  {
    // Registered 2026-08-24 alongside /admin/offers, which widened
    // OfferRepository.SIEVE_FIELDS from 5 keys to 13. Without an entry here a
    // Sieve field naming a property `OfferDocument` does not have would be
    // silently dropped by sievejs (`throwExceptions: false`) and the filter
    // would match zero rows with no error anywhere — Root Cause #62.
    name: "offers",
    sieveFile: "appkit/src/features/seller/repository/offer.repository.ts",
    sieveExport: "SIEVE_FIELDS",
    schemaFile: "appkit/src/features/seller/schemas/firestore.ts",
    schemaInterface: "OfferDocument",
    emitFiles: [
      "src/app/api/admin/offers/route.ts",
      "src/app/api/store/offers/route.ts",
      "src/app/api/user/offers/route.ts",
    ],
    fieldConstant: "OFFER_FIELDS",
  },
];

/** Fields every document inherits from BaseDocument. */
const BASE_DOCUMENT_FIELDS = ["id", "createdAt", "updatedAt"];

function read(rel) {
  /*
   * CRLF normalised at read time. `core.autocrlf=true` on this machine, so
   * git stores LF and checks out CRLF — the WORKING TREE is CRLF for ~592
   * source files, and every audit reads the working tree.
   *
   * `ownFields` splits on a newline and matches a per-line field regex, so a
   * trailing carriage return rides along in the captured TYPE text and the
   * field-name comparison against SIEVE_FIELDS stops matching. The symptom is
   * spectacular and completely misleading: 61 SIEVE_ORPHANs claiming `title`,
   * `slug` and `status` are not fields on ProductDocument.
   *
   * Same family as the Python-write CRLF trap already recorded in the plan —
   * an audit regression on lines nobody edited is a line-ending suspicion
   * first. Fixed at the READER so every parser downstream is immune, rather
   * than normalising 592 files against git own configured behaviour.
   */
  return readFileSync(join(ROOT, rel), "utf8").replace(/\r\n/g, "\n");
}

/** Balanced slice of the initialiser for `const NAME ... = { … }`. */
function sliceInitializer(src, name, open = "{", close = "}") {
  const declRe = new RegExp(`(?:static\\s+readonly\\s+|export\\s+)?(?:const\\s+)?${name}\\b`);
  const m = declRe.exec(src);
  if (!m) return null;
  const eq = new RegExp(`=\\s*\\${open}`).exec(src.slice(m.index));
  if (!eq) return null;
  const start = src.indexOf(open, m.index + eq.index);
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === open) depth++;
    else if (src[i] === close) {
      depth--;
      if (depth === 0) return src.slice(start + 1, i);
    }
  }
  return null;
}

/** Top-level keys of an object literal (quoted or bare). */
function topLevelKeys(body) {
  const keys = [];
  let depth = 0;
  for (const line of body.split("\n")) {
    if (depth === 0) {
      const m = /^\s*(?:"([^"]+)"|([A-Za-z_][\w-]*))\s*:/.exec(line);
      if (m) keys.push(m[1] ?? m[2]);
    }
    for (const ch of line) {
      if (ch === "{" || ch === "[") depth++;
      else if (ch === "}" || ch === "]") depth--;
    }
  }
  return keys;
}

/**
 * Contents of the object literal that STARTS at `src[from]` (which must be the
 * `{`, or whitespace before it).
 *
 * The inline-object branch used to call `declarationBody(slice, "")` for this.
 * That builds the regex `(?:interface\s+\b[^{]*|type\s+\s*=\s*)\{`, which still
 * demands a literal `interface `/`type ` prefix — so a bare `{` never matched
 * and the branch returned null EVERY time. Inline nested objects were never
 * walked at all, in any version of this audit; the dotted paths that did
 * resolve all came from the named-type branch beside it. That is why
 * `classified.meetupArea` was known (it is a field ON a named type) while
 * `classified.meetupArea.city` was not (it is a field on an INLINE one).
 */
function inlineObjectBody(src, from) {
  const start = src.indexOf("{", from);
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) return src.slice(start + 1, i);
    }
  }
  return null;
}

/** Body of `interface Name { … }` or `type Name = { … }` in `src`. */
function declarationBody(src, name) {
  const re = new RegExp(`(?:interface\\s+${name}\\b[^{]*|type\\s+${name}\\s*=\\s*)\\{`);
  const m = re.exec(src);
  if (!m) return null;
  const start = src.indexOf("{", m.index);
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) return src.slice(start + 1, i);
    }
  }
  return null;
}

/**
 * Own field declarations of a body, as `[name, typeText]`, at brace depth 0 —
 * so children of an inline nested object aren't mistaken for own fields.
 */
function ownFields(body) {
  /**
   * `[name, typeText, offset]` — offset is where `typeText` starts in `body`.
   *
   * The offset is not a convenience. A multi-line nested object declares as
   * `meetupArea: {`, so `typeText` is the single character `"{"`, and locating
   * it with `body.indexOf(typeText)` finds the FIRST brace in the whole body
   * instead of this one — which silently walked the wrong sub-object and made
   * `classified.meetupArea.city` look absent.
   *
   * @type {[string,string,number][]}
   */
  const out = [];
  let depth = 0;
  let offset = 0;
  for (const line of body.split("\n")) {
    if (depth === 0) {
      const m = /^(\s*(?:readonly\s+)?[A-Za-z_]\w*\??\s*:\s*)(.*)$/.exec(line);
      if (m) {
        const name = /([A-Za-z_]\w*)\??\s*:\s*$/.exec(m[1])?.[1];
        if (name) out.push([name, m[2], offset + m[1].length]);
      }
    }
    for (const ch of line) {
      if (ch === "{" || ch === "[") depth++;
      else if (ch === "}" || ch === "]") depth--;
    }
    offset += line.length + 1;
  }
  return out;
}

/**
 * How many dots a sieve key may carry. `classified.meetupArea.city` is two
 * levels of nesting, so a one-level walk called it an orphan while the field
 * was right there on the document — which is exactly the false-positive class
 * this function's own history is made of (see below).
 *
 * Bounded rather than unbounded because a self-referential type (a category
 * with a `parent` of its own type) would otherwise not terminate, and because
 * a sieve key deeper than this is not a filter anyone should be writing.
 */
const MAX_NEST_DEPTH = 3;

/**
 * Field names declared by a TS interface, plus nested-object fields exposed as
 * dotted paths (`classified.negotiable`, `classified.meetupArea.city`).
 *
 * Nested objects reach the schema two ways and BOTH must be followed: written
 * inline (`shipping?: { allowedProviderIds?: string[] }`) or behind a named
 * type (`classified?: ProductClassifiedMeta`). Only handling the inline form
 * made this audit report nine false SIEVE_ORPHANs for the perfectly valid
 * `classified.*` / `digitalCode.*` / `liveItem.*` sieve keys — and only
 * handling ONE level then did the same for `classified.meetupArea.city` and
 * `liveItem.transport.method`.
 *
 * The pattern worth noticing: every version of this resolver has under-walked
 * the type graph, and each time the audit blamed a correct field rather than
 * admitting it could not see. A resolver that cannot follow a path should say
 * so, not accuse.
 */
function interfaceFields(src, name) {
  const body = declarationBody(src, name);
  if (body === null) return null;

  /** @type {Set<string>} */
  const fields = new Set(BASE_DOCUMENT_FIELDS);

  /** Walk one interface body, emitting dotted paths under `prefix`. */
  const walk = (declBody, prefix, depth, seen) => {
    for (const [field, typeText, at] of ownFields(declBody)) {
      const path = prefix ? `${prefix}.${field}` : field;
      fields.add(path);
      if (depth >= MAX_NEST_DEPTH) continue;

      // Inline object literal — children are in this same body, one depth down.
      // Sliced from the field's OWN offset, not the first `{` in the body.
      if (typeText.trimStart().startsWith("{")) {
        const inline = inlineObjectBody(declBody, at);
        if (inline) walk(inline, path, depth + 1, seen);
        continue;
      }
      // Named type reference — resolve it in the same file. Strip array/union
      // decoration so `ProductGrading[]` and `A | undefined` both resolve.
      const refName = /^([A-Za-z_]\w*)/.exec(typeText.trim())?.[1];
      if (!refName || seen.has(refName)) continue;
      const refBody = declarationBody(src, refName);
      if (!refBody) continue;
      walk(refBody, path, depth + 1, new Set([...seen, refName]));
    }
  };

  walk(body, "", 0, new Set([name]));
  return fields;
}

/** Resolve `PRODUCT_FIELDS.FOO` → "foo" from the shared field-name map. */
function buildConstantMap(constantName) {
  const src = stripComments(read("appkit/src/constants/field-names.ts"));
  const body = sliceInitializer(src, constantName);
  if (!body) return {};
  /** @type {Record<string,string>} */
  const map = {};
  for (const m of body.matchAll(/^\s*([A-Z0-9_]+):\s*"([^"]+)"/gm)) map[m[1]] = m[2];
  return map;
}

/** Field names this file emits as Firestore filter targets. */
function emittedFields(src, constantName, constMap) {
  /** @type {Set<string>} */
  const out = new Set();
  const add = (raw) => {
    if (!raw) return;
    // Dotted access on the constant map, e.g. PRODUCT_FIELDS.PRICE
    if (constantName && raw.startsWith(`${constantName}.`)) {
      const key = raw.slice(constantName.length + 1);
      // Skip *_VALUES lookups — those are filter VALUES, not field names.
      if (key.includes("_VALUES")) return;
      const resolved = constMap[key];
      if (resolved) out.add(resolved);
      return;
    }
    const quoted = /^"([^"]+)"$/.exec(raw);
    if (quoted) out.add(quoted[1]);
  };

  // sieveFilter(FIELD, SIEVE_OP.X, value) / expandSieveParam(FIELD, …)
  for (const m of src.matchAll(/(?:sieveFilter|expandSieveParam)\(\s*([^,]+?)\s*,/g)) {
    add(m[1].trim());
  }
  // Route safelists: SAFE_*_FILTER_FIELDS = new Set([...])
  for (const m of src.matchAll(/SAFE_\w*FILTER_FIELDS\s*=\s*new Set\(\[([\s\S]*?)\]\)/g)) {
    for (const item of m[1].split(",")) add(item.trim());
  }
  return out;
}

function main() {
  /** @type {string[]} */
  const violations = [];
  let checked = 0;

  for (const entry of REGISTRY) {
    const sieveSrc = stripComments(read(entry.sieveFile));
    const sieveBody = sliceInitializer(sieveSrc, entry.sieveExport);
    if (!sieveBody) {
      violations.push(
        `UNPARSEABLE — could not locate \`${entry.sieveExport}\` in ${entry.sieveFile}.`,
      );
      continue;
    }
    const sieveKeys = topLevelKeys(sieveBody);
    const sieveSet = new Set(sieveKeys);

    const schemaSrc = stripComments(read(entry.schemaFile));
    const docFields = interfaceFields(schemaSrc, entry.schemaInterface);
    if (!docFields) {
      violations.push(
        `UNPARSEABLE — could not locate \`interface ${entry.schemaInterface}\` in ${entry.schemaFile}.`,
      );
      continue;
    }
    checked++;

    const allowOrphan = entry.allowOrphan ?? {};
    const allowUnfilterable = entry.allowUnfilterable ?? {};

    // 1. SIEVE_ORPHAN — allowlisted field that isn't on the document.
    for (const key of sieveKeys) {
      if (docFields.has(key) || allowOrphan[key]) continue;
      violations.push(
        `SIEVE_ORPHAN — ${entry.sieveFile} → ${entry.sieveExport} allows filtering on ` +
          `"${key}", which is not a field on ${entry.schemaInterface}.\n    ` +
          `Any filter on it matches zero documents, silently. Remove it, or point ` +
          `it at the real field name.`,
      );
    }

    // 2. EMITTED_BUT_UNFILTERABLE — real field filtered on but not allowlisted.
    const constMap = entry.fieldConstant ? buildConstantMap(entry.fieldConstant) : {};
    for (const rel of entry.emitFiles) {
      const path = join(ROOT, rel);
      if (!existsSync(path)) {
        violations.push(
          `MISSING_FILE — ${rel} is registered as a filter-emitting file for ` +
            `"${entry.name}" but does not exist. Update this audit's REGISTRY.`,
        );
        continue;
      }
      const src = stripComments(readFileSync(path, "utf8"));
      for (const field of emittedFields(src, entry.fieldConstant, constMap)) {
        if (sieveSet.has(field) || allowUnfilterable[field]) continue;
        const onDoc = docFields.has(field);
        violations.push(
          `EMITTED_BUT_UNFILTERABLE — ${rel} filters on "${field}", but ` +
            `${entry.sieveExport} does not allow it, so Sieve drops the clause ` +
            `silently (throwExceptions is false).\n    ` +
            (onDoc
              ? `"${field}" IS a real ${entry.schemaInterface} field — add it to ` +
                `${entry.sieveExport}.`
              : `"${field}" is ALSO not a field on ${entry.schemaInterface} — the ` +
                `filter is wrong at both ends. Check the real field name.`),
        );
      }
    }
  }

  if (violations.length === 0) {
    console.log(
      `audit-sieve-field-schema-parity: clean ✓ (${checked} repository/schema pair(s))`,
    );
    process.exit(0);
  }

  console.error(
    `audit-sieve-field-schema-parity: ${violations.length} violation(s) found.\n`,
  );
  console.error("A filter that can never match, or one that is silently discarded.\n");
  for (const v of violations) console.error(`  ${v}\n`);
  process.exit(1);
}

main();
