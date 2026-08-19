#!/usr/bin/env node
/**
 * audit-function-trigger-shadow-types.mjs — Firestore-trigger field-name
 * drift guard.
 *
 * A `FirestoreTriggerHandler<Before, After>` handler receives the RAW
 * Firestore snapshot for its collection. Several handlers hand-declare a
 * local "shadow" interface/type for that snapshot instead of importing the
 * real "Document" type from the feature's schemas/firestore.ts — and nothing
 * ties that shadow type's field names to the real document's field names.
 *
 * This is exactly how the 2026-08-19 onOrderCreate bug shipped:
 * `jobs/core/onOrderCreate.ts` declared `interface NewOrder { buyerDisplayName?;
 * buyerId?; totalAmount?; ... }` — none of those names exist on the real
 * `OrderDocument` (`userName`, `userId`, `totalPrice`), so `event.after` cast
 * to that shape read `undefined` for every field. Every WhatsApp purchase
 * announcement silently sent "A customer" / "₹0" regardless of the real
 * order. TypeScript could not catch this — the shadow type was self-
 * consistent, it just didn't match reality.
 *
 * This script does NOT run the TypeScript compiler — it's a plain regex/
 * text-scan over the handler + core files, matching this project's existing
 * audit convention (see audit-filter-tab-enums.mjs for precedent). For each
 * `FirestoreTriggerHandler<Before, After>` declaration in
 * appkit/src/_internal/server/jobs/handlers/*.ts:
 *
 *   1. Resolve each type param to its declaration — either declared locally
 *      in the same handler file, or imported from the paired core file
 *      (`../core/<sameBasename>`).
 *   2. `Record<string, JsonValue>` / `null` aliases are generic passthroughs
 *      that don't claim any field list — out of scope for this check (a
 *      different bug class: raw-field reads bypassing repository
 *      normalization, e.g. the onProductWrite `category` vs `categorySlugs`
 *      fix — not something a field-name diff can catch).
 *   3. A type imported directly from a feature's schemas/firestore.ts module
 *      (the real Document type, e.g. onJobCreated's `JobDocument`) is always
 *      safe — nothing to compare against itself.
 *   4. A hand-typed local interface/type-literal's field names are extracted
 *      and diffed against REGISTRY[name]'s real document field list (+ the
 *      three BaseDocument fields every document has). Any field name with no
 *      match is a violation.
 *
 * Only registered shadow-type names are checked — an unregistered hand-typed
 * shadow type is reported separately as "needs a REGISTRY entry" rather than
 * silently skipped, so a newly-added shadow type can't slip through
 * unnoticed. Strict zero — any violation blocks.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HANDLERS_DIR = "appkit/src/_internal/server/jobs/handlers";

/** Every primary Firestore document extends this — always allowed. */
const BASE_DOCUMENT_FIELDS = new Set(["id", "createdAt", "updatedAt"]);

/**
 * @typedef {{ realSchemaFile: string, realTypeName: string }} RealDocSource
 */

/** @type {Record<string, RealDocSource>} */
const REGISTRY = {
  NewBid: {
    realSchemaFile: "appkit/src/features/auctions/schemas/firestore.ts",
    realTypeName: "BidDocument",
  },
  NewOrder: {
    realSchemaFile: "appkit/src/features/orders/schemas/firestore.ts",
    realTypeName: "OrderDocument",
  },
  OrderBefore: {
    realSchemaFile: "appkit/src/features/orders/schemas/firestore.ts",
    realTypeName: "OrderDocument",
  },
  OrderAfter: {
    realSchemaFile: "appkit/src/features/orders/schemas/firestore.ts",
    realTypeName: "OrderDocument",
  },
  PrizeDrawOrderSnapshot: {
    realSchemaFile: "appkit/src/features/orders/schemas/firestore.ts",
    realTypeName: "OrderDocument",
  },
  PrizeDrawStockSnapshot: {
    realSchemaFile: "appkit/src/features/products/schemas/firestore.ts",
    realTypeName: "ProductDocument",
  },
};

function readSource(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

/** Depth-aware split on top-level commas, tracking {, (, [, < as nesting. */
function splitTopLevelCommas(text) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if ("{([<".includes(ch)) depth++;
    else if ("})]>".includes(ch)) depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts.map((p) => p.trim());
}

/** Extracts the substring between the balanced `<...>` following `marker`. */
function extractAngleBracketArgs(text, marker) {
  const start = text.indexOf(marker);
  if (start === -1) return null;
  const openIdx = start + marker.length - 1; // marker ends with "<"
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    if (text[i] === "<") depth++;
    else if (text[i] === ">") {
      depth--;
      if (depth === 0) return text.slice(openIdx + 1, i);
    }
  }
  return null;
}

/** Depth-aware split on top-level `;`, tracking {, (, [ as nesting (not < — no raw `;` ever appears inside a generic's type args). */
function splitTopLevelStatements(text) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if ("{([".includes(ch)) depth++;
    else if ("})]".includes(ch)) depth--;
    if (ch === ";" && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

/** Extracts field names from an interface body / object-type-literal body text (one nesting level of statement splitting; also picks up any `Pick<Real, "a" | "b">` field names anywhere in the text, compiler-verified already). */
function extractFieldNames(bodyText) {
  const names = new Set();

  for (const m of bodyText.matchAll(/Pick<\s*\w+\s*,\s*((?:"[^"]+"\s*\|?\s*)+)>/g)) {
    for (const fm of m[1].matchAll(/"([^"]+)"/g)) names.add(fm[1]);
  }

  for (const statement of splitTopLevelStatements(bodyText)) {
    // Strip any mix of leading `// line comments` and `/** block comments */`
    // (real schema files commonly precede a JSDoc block with a `// ── section
    // header` line) before looking for the field name.
    let stripped = statement;
    let prevLength;
    do {
      prevLength = stripped.length;
      stripped = stripped.replace(/^\s*\/\/[^\n]*\n?/, "").replace(/^\s*\/\*\*[\s\S]*?\*\/\s*/, "");
    } while (stripped.length !== prevLength);
    const m = /^\s*(\w+)\s*\??\s*:/.exec(stripped);
    if (m) names.add(m[1]);
  }
  return names;
}

/**
 * Finds `export (interface|type) <name> ...` in `source` and returns its
 * RHS/body text, or `{ recordPassthrough: true }` if it's a bare
 * `Record<string, ...>` alias, or `null` if not found.
 */
function findTypeDeclaration(source, name) {
  const ifaceRe = new RegExp(`export\\s+interface\\s+${name}\\b[^{]*\\{`);
  const ifaceMatch = ifaceRe.exec(source);
  if (ifaceMatch) {
    const openIdx = ifaceMatch.index + ifaceMatch[0].length - 1;
    let depth = 0;
    for (let i = openIdx; i < source.length; i++) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}") {
        depth--;
        if (depth === 0) return { body: source.slice(openIdx + 1, i) };
      }
    }
    return null;
  }

  const typeRe = new RegExp(`export\\s+type\\s+${name}\\s*=\\s*`);
  const typeMatch = typeRe.exec(source);
  if (typeMatch) {
    const rhsStart = typeMatch.index + typeMatch[0].length;
    const rest = source.slice(rhsStart);
    if (/^Record\s*</.test(rest.trim())) return { recordPassthrough: true };
    const statements = splitTopLevelStatements(rest);
    return { body: statements[0] ?? "" };
  }

  return null;
}

/** Resolves a relative import specifier (no extension) against `fromFile`, returns repo-relative path with .ts. */
function resolveImportPath(fromFile, spec) {
  const abs = resolvePath(dirname(join(ROOT, fromFile)), spec);
  const relFromRoot = abs.replace(/\\/g, "/").split("/appkit/").pop();
  return `appkit/${relFromRoot}.ts`;
}

/** Finds which module a named import comes from within `source`, or null. */
function findImportSource(source, name) {
  const importRe = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+"([^"]+)"/g;
  let m;
  while ((m = importRe.exec(source))) {
    const names = m[1].split(",").map((s) => s.replace(/^\s*type\s+/, "").trim());
    if (names.includes(name)) return m[2];
  }
  return null;
}

function main() {
  const handlerFiles = readdirSync(join(ROOT, HANDLERS_DIR))
    .filter((f) => f.endsWith(".ts") && !f.includes("__tests__"));

  /** @type {{ handler: string, type: string, field: string, reason: string }[]} */
  const violations = [];
  /** @type {string[]} */
  const unregistered = [];
  let checked = 0;

  for (const file of handlerFiles) {
    const relPath = `${HANDLERS_DIR}/${file}`;
    const source = readSource(relPath);

    const genericArgs = extractAngleBracketArgs(source, "FirestoreTriggerHandler<");
    if (!genericArgs) continue;
    const [beforeType, afterType] = splitTopLevelCommas(genericArgs);

    for (const typeExpr of [beforeType, afterType]) {
      if (!typeExpr) continue;
      const name = typeExpr.trim();
      if (name === "null" || /^Record\s*</.test(name)) continue; // passthrough — out of scope
      if (!/^\w+$/.test(name)) continue; // not a bare identifier — skip (e.g. an inline literal)

      // 1. Declared locally in the handler file itself?
      let decl = findTypeDeclaration(source, name);
      let declSourceFile = relPath;

      // 2. Otherwise resolve via import — either the paired core file (hand-
      //    typed shadow) or a real schemas/firestore module (always safe).
      if (!decl) {
        const importSpec = findImportSource(source, name);
        if (!importSpec) continue; // can't resolve — not this audit's problem
        if (importSpec.includes("/schemas/firestore") || importSpec.includes("/schemas/")) {
          continue; // importing the real document type directly — safe
        }
        declSourceFile = resolveImportPath(relPath, importSpec);
        const coreSource = readSource(declSourceFile);
        decl = findTypeDeclaration(coreSource, name);
        if (!decl) continue; // declared elsewhere — out of reach for this audit
      }

      if (decl.recordPassthrough) continue; // Record<string, ...> alias — out of scope

      checked++;
      const registryEntry = REGISTRY[name];
      if (!registryEntry) {
        unregistered.push(`${relPath} (${declSourceFile}): "${name}" is a hand-typed shadow type with no REGISTRY entry — add one so its field names get verified against the real document type.`);
        continue;
      }

      const realSource = readSource(registryEntry.realSchemaFile);
      const realDecl = findTypeDeclaration(realSource, registryEntry.realTypeName);
      if (!realDecl || !realDecl.body) {
        violations.push({
          handler: relPath,
          type: name,
          field: "(n/a)",
          reason: `could not locate "${registryEntry.realTypeName}" in ${registryEntry.realSchemaFile} — REGISTRY entry is stale, fix REGISTRY in this script`,
        });
        continue;
      }
      const realFields = extractFieldNames(realDecl.body);
      const shadowFields = extractFieldNames(decl.body);

      for (const field of shadowFields) {
        if (BASE_DOCUMENT_FIELDS.has(field)) continue;
        if (!realFields.has(field)) {
          violations.push({
            handler: relPath,
            type: name,
            field,
            reason: `not a field on ${registryEntry.realTypeName} (${registryEntry.realSchemaFile})`,
          });
        }
      }
    }
  }

  if (violations.length === 0 && unregistered.length === 0) {
    console.log(`audit-function-trigger-shadow-types: clean ✓ (${checked} shadow type(s) checked across ${handlerFiles.length} handler file(s))`);
    process.exit(0);
  }

  if (violations.length > 0) {
    console.error(`audit-function-trigger-shadow-types: ${violations.length} violation(s) found.\n`);
    console.error("A Firestore-trigger shadow type has a field name that doesn't exist on the");
    console.error("real document — every read of that field is `undefined` at runtime.\n");
    for (const v of violations) {
      console.error(`  [${v.handler}] type "${v.type}", field "${v.field}" — ${v.reason}`);
    }
  }
  if (unregistered.length > 0) {
    console.error(`\n${unregistered.length} unregistered shadow type(s) — add a REGISTRY entry in this script:\n`);
    for (const u of unregistered) console.error(`  ${u}`);
  }
  process.exit(1);
}

main();
