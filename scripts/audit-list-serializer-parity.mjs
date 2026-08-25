#!/usr/bin/env node
/**
 * audit-list-serializer-parity.mjs — catches the "hand-rolled admin list DTO
 * drifts from the sibling PATCH schema it's supposed to mirror" bug class.
 *
 * Root-caused 2026-08-19: `src/app/api/admin/users/route.ts`'s
 * `serializeUser()` (the admin users LIST endpoint) hand-picks fields off
 * each Firestore doc and was never updated when `isTester`/`canTestAdmin`
 * were added to the sibling PATCH endpoint's `updateUserSchema`. The write
 * succeeded and persisted correctly; the list read silently dropped the
 * fields. Traced into the consumer (`AdminUsersView.tsx` → `AdminUserEditorView.tsx`):
 * the editor seeds its "current value" state from the (always-undefined)
 * list row, then unconditionally re-sends that wrong default on every save —
 * so editing ANY other field on a tester silently stripped their tester
 * flags. A near-identical, more severe instance (destructively un-verifying
 * stores and wiping their custom capabilities) was found in
 * `src/app/api/admin/stores/route.ts` in the same sweep. See CLAUDE.md's
 * Recurrent Root Cause Patterns for the full writeup.
 *
 * Method: no TypeScript compiler in the loop — matches this project's
 * existing regex-based audit convention (see audit-filter-tab-enums.mjs for
 * precedent). Because these object literals are multi-line and nested
 * (e.g. `metadata: u.metadata ? { loginCount: ... } : undefined`), a plain
 * non-greedy regex can't reliably find the matching close-brace, so this
 * script does its own lightweight brace-depth walk (string/template-literal
 * aware) to extract each object literal's TOP-LEVEL keys only. Handles both
 * plain keys (`role:`) and single-level computed keys
 * (`[USER_FIELDS.IS_TESTER]:`), resolving the latter against the field-name
 * constant object named in the registry entry.
 *
 * Not a fully generic tool — each REGISTRY entry names an explicit
 * "returnMarker" string locating the object literal to check, matching this
 * codebase's existing pattern of small, explicit per-entry registries
 * (audit-filter-tab-enums.mjs) over an attempt at a fully generic AST-driven
 * solution.
 *
 * Strict zero — any write-schema field missing from its paired list
 * serializer blocks. Fields that are genuinely fine to omit (never
 * destructively overwritten, nothing reads them back from a list row) go in
 * that registry entry's `allow` array with the reasoning left in this file's
 * REGISTRY comments, not a silent skip.
 *
 * ## Why the registry is THREE pairs and not twelve
 *
 * A plan carried an item to "extend this from 3 to 12", naming address
 * clusters, payment-method clusters, history, wishlists, media, store
 * addresses, sessions, ads and payouts-CSV. Every one was checked on
 * 2026-08-24 and NONE of them is a pair:
 *
 *   · payment-methods, sessions, newsletter — their PATCH takes an ACTION
 *     (`ban`, `approve_unban`, `revoke`), not a field set. Nothing round-trips
 *     from a list row into an editor and back, so a narrower list response
 *     cannot clobber anything.
 *   · addresses — the list returns the repository documents whole. There is no
 *     hand-picked field set to drift from.
 *   · history, media, store-addresses, wishlists — these DO hand-pick list
 *     fields, but have no detail route at all, so there is no PATCH schema to
 *     pair them with.
 *   · ads — masks its credentials and MERGES on write.
 *
 * The bug class needs all three of: a hand-picked list serializer, a
 * field-update PATCH, and an editor seeded from the list row. Three pairs meet
 * that today. The `NEW_PAIR` check below is what stops a fourth appearing
 * unregistered — which is the real risk, not the nine that do not exist.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");


// ---------------------------------------------------------------------------
// NEW_PAIR — a route that grows both halves of the bug class must register.
//
// The registry is hand-maintained, so the failure mode it cannot see is a
// FOURTH pair appearing later: someone adds a `.map(x => ({...}))` list
// serializer beside an existing field-update PATCH, and this audit stays green
// because it was never told to look there.
//
// A pair needs BOTH halves. A route with only one is not a risk, which is why
// the nine candidates the plan named do not appear here.
// ---------------------------------------------------------------------------

/** `.map((x) => ({` — a list response built from hand-picked fields. */
const HANDPICK_RE = /\.map\(\s*\(?\w+(?::\s*\w+)?\)?\s*=>\s*\(\{/;

/**
 * A FIELD-update schema, as opposed to an action schema.
 *
 * `z.object({ action: z.enum([...]) })` is a command, not a field set — it
 * cannot participate in the round-trip this audit guards, so a route whose
 * only schema is action-shaped is correctly ignored.
 */
function hasFieldUpdateSchema(source) {
  const m = source.match(/const \w*[Uu]pdate\w*Schema = z\.object\(\{([\s\S]*?)\}\);/);
  if (!m) return false;
  const body = m[1];
  const keys = [...body.matchAll(/^\s*(\w+)\s*:/gm)].map((x) => x[1]);
  const fieldKeys = keys.filter((k) => k !== "action" && k !== "banReason");
  return fieldKeys.length > 0;
}

function checkForUnregisteredPairs(registeredListFiles) {
  const found = [];
  const adminApi = join(ROOT, "src", "app", "api", "admin");
  let dirs = [];
  try {
    dirs = readdirSync(adminApi, { withFileTypes: true }).filter((d) => d.isDirectory());
  } catch {
    return found;
  }
  for (const d of dirs) {
    const listPath = join(adminApi, d.name, "route.ts");
    let listSrc;
    try {
      listSrc = readFileSync(listPath, "utf8");
    } catch {
      continue;
    }
    if (!HANDPICK_RE.test(listSrc)) continue;

    // Find a sibling detail route carrying a field-update schema.
    let detailSrc = null;
    try {
      for (const sub of readdirSync(join(adminApi, d.name), { withFileTypes: true })) {
        if (!sub.isDirectory() || !sub.name.startsWith("[")) continue;
        try {
          detailSrc = readFileSync(join(adminApi, d.name, sub.name, "route.ts"), "utf8");
        } catch {
          /* no route in that segment */
        }
      }
    } catch {
      /* no subdirectories */
    }
    const bothHalves = detailSrc
      ? hasFieldUpdateSchema(detailSrc)
      : hasFieldUpdateSchema(listSrc);
    if (!bothHalves) continue;

    const rel = `src/app/api/admin/${d.name}/route.ts`;
    if (!registeredListFiles.has(rel)) found.push(rel);
  }
  return found;
}

const REGISTRY = [
  {
    name: "users",
    writeFile: "src/app/api/admin/users/[uid]/route.ts",
    writeMarker: "const updateUserSchema = z.object(",
    listFile: "src/app/api/admin/users/route.ts",
    listMarker: "const serializeUser = (",
    fieldsConstant: { file: "appkit/src/features/auth/schemas/firestore.ts", exportName: "USER_FIELDS" },
    // phoneNumber/publicProfile/adminNotes are only sent when non-empty
    // (never unconditionally), and nothing currently reads them back from a
    // list row — latent-only, not the destructive-overwrite bug class this
    // audit targets. isDisabled is never sent at all by AdminUserEditorView's
    // save payload, and both readers of it (AdminUsersView.tsx:176,307)
    // already defensively fall back to the present `disabled` field via
    // `??`, so there's no silent-false / destructive-overwrite path either.
    // Re-check if a consumer starts reading any of these back from `_raw`.
    allow: ["phoneNumber", "publicProfile", "adminNotes", "isDisabled"],
  },
  {
    name: "stores",
    writeFile: "src/app/api/admin/stores/[uid]/route.ts",
    writeMarker: "const updateStoreSchema = z.object(",
    listFile: "src/app/api/admin/stores/route.ts",
    listMarker: "const stores = result.items.map((store: StoreDocument) => (",
    fieldsConstant: { file: "appkit/src/features/stores/schemas/firestore.ts", exportName: "STORE_FIELDS" },
    // storeStatus is the PATCH body's input name; the route handler maps it
    // onto the actual stored field STORE_FIELDS.STATUS ("status"), which the
    // list serializer already returns as `status:` — not a missing field,
    // just a deliberate write-side rename.
    allow: ["storeStatus"],
  },
  {
    name: "team",
    writeFile: "src/app/api/admin/team/[id]/route.ts",
    writeMarker: "const updateSchema = z.object(",
    listFile: "src/app/api/admin/team/route.ts",
    listMarker: "const serialize = (u: RawUser) => (",
    fieldsConstant: { file: "appkit/src/features/auth/schemas/firestore.ts", exportName: "USER_FIELDS" },
    allow: [],
  },
];

function readSource(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

/** Walks from an opening `{` at `openBraceIndex`, string/template-aware, returning the balanced body. */
function findBalancedBody(src, openBraceIndex) {
  let depth = 0;
  let inStr = null;
  for (let i = openBraceIndex; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === "\\") { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    // Skip line/block comments so an apostrophe inside prose (e.g. "aren't")
    // can't be misread as opening a string literal and desyncing the walk.
    if (c === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i);
      if (i === -1) break;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? src.length : end + 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return src.slice(openBraceIndex + 1, i);
    }
  }
  return null;
}

/** Extracts { computed, obj?, key } entries for keys at nesting depth 0 within an object literal body. */
function extractTopLevelKeys(body) {
  const keys = [];
  let depth = 0;
  let inStr = null;
  let i = 0;
  while (i < body.length) {
    const c = body[i];
    if (inStr) {
      if (c === "\\") { i += 2; continue; }
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (c === "/" && body[i + 1] === "/") {
      const nl = body.indexOf("\n", i);
      i = nl === -1 ? body.length : nl + 1;
      continue;
    }
    if (c === "/" && body[i + 1] === "*") {
      const end = body.indexOf("*/", i + 2);
      i = end === -1 ? body.length : end + 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; i++; continue; }
    if (c === "[" && depth === 0) {
      const m = /^\[(\w+)\.(\w+)\]\s*:/.exec(body.slice(i));
      if (m) {
        keys.push({ computed: true, obj: m[1], key: m[2] });
        i += m[0].length;
        continue;
      }
    }
    if (c === "{" || c === "(" || c === "[") { depth++; i++; continue; }
    if (c === "}" || c === ")" || c === "]") { depth--; i++; continue; }
    if (depth === 0) {
      const m = /^([A-Za-z_$][\w$]*)\s*:/.exec(body.slice(i));
      if (m) {
        keys.push({ computed: false, key: m[1] });
        i += m[0].length;
        continue;
      }
    }
    i++;
  }
  return keys;
}

/** Parses `export const NAME = { KEY: "value", ... } as const` into a Map<KEY, value>. */
function parseFieldsConstant(src, exportName) {
  const re = new RegExp(`export const ${exportName}\\s*=\\s*\\{`);
  const m = re.exec(src);
  if (!m) return null;
  const openBrace = m.index + m[0].length - 1;
  const body = findBalancedBody(src, openBrace);
  if (body == null) return null;
  const map = new Map();
  const entryRe = /(\w+):\s*"([^"]*)"/g;
  let em;
  while ((em = entryRe.exec(body))) {
    // Skip once we hit a nested object (e.g. STATUS_VALUES: { ... }) — its
    // own KEY: "value" pairs would otherwise get misattributed to the
    // top-level map. Cheap guard: only accept matches before the first
    // nested "{" following this key, which entryRe's flat scan can't see,
    // so intentionally keep this simple and over-inclusive — extra entries
    // in the map are harmless (unused lookups), the map is never iterated.
    map.set(em[1], em[2]);
  }
  return map;
}

/** Locates the object literal after `marker` in `src` and returns its top-level resolved field names. */
function extractFieldNames(src, marker, fieldsMap) {
  const idx = src.indexOf(marker);
  if (idx === -1) return null;
  // The returned/schema object opens either right after `z.object(` or after
  // an arrow function's `=> ({`/`) => ({` — find the first `{` from there.
  const rest = src.slice(idx + marker.length);
  const braceMatch = /\{/.exec(rest);
  if (!braceMatch) return null;
  const openBrace = idx + marker.length + braceMatch.index;
  const body = findBalancedBody(src, openBrace);
  if (body == null) return null;

  const names = new Set();
  for (const k of extractTopLevelKeys(body)) {
    if (!k.computed) {
      names.add(k.key);
      continue;
    }
    const resolved = fieldsMap?.get(k.key);
    if (resolved) names.add(resolved);
    // else: computed key referencing an unknown constant — extractTopLevelKeys
    // already recorded it; silently unresolved keys just won't be checkable,
    // which is a safe false-negative, not a false-positive.
  }
  return names;
}

function main() {
  const violations = [];
  const fieldsConstCache = new Map();

  for (const entry of REGISTRY) {
    const writeSrc = readSource(entry.writeFile);
    const listSrc = readSource(entry.listFile);

    const constKey = `${entry.fieldsConstant.file}::${entry.fieldsConstant.exportName}`;
    let fieldsMap = fieldsConstCache.get(constKey);
    if (!fieldsMap) {
      fieldsMap = parseFieldsConstant(readSource(entry.fieldsConstant.file), entry.fieldsConstant.exportName);
      fieldsConstCache.set(constKey, fieldsMap);
    }
    if (!fieldsMap) {
      violations.push({
        pair: entry.name,
        field: "(n/a)",
        reason: `could not locate export "${entry.fieldsConstant.exportName}" in ${entry.fieldsConstant.file} — audit registry entry is stale`,
      });
      continue;
    }

    const writeFields = extractFieldNames(writeSrc, entry.writeMarker, fieldsMap);
    if (!writeFields) {
      violations.push({
        pair: entry.name,
        field: "(n/a)",
        reason: `could not locate "${entry.writeMarker}" in ${entry.writeFile} — audit registry entry is stale`,
      });
      continue;
    }

    const listFields = extractFieldNames(listSrc, entry.listMarker, fieldsMap);
    if (!listFields) {
      violations.push({
        pair: entry.name,
        field: "(n/a)",
        reason: `could not locate "${entry.listMarker}" in ${entry.listFile} — audit registry entry is stale`,
      });
      continue;
    }

    const allow = new Set(entry.allow ?? []);
    for (const field of writeFields) {
      if (allow.has(field)) continue;
      if (!listFields.has(field)) {
        violations.push({
          pair: entry.name,
          field,
          reason: `writable via ${entry.writeFile} but missing from the list serializer in ${entry.listFile}`,
        });
      }
    }
  }

  // A route that has grown BOTH halves of the bug class but is not registered.
  const unregistered = checkForUnregisteredPairs(
    new Set(REGISTRY.map((e) => e.listFile)),
  );
  for (const file of unregistered) {
    violations.push({
      pair: "(unregistered)",
      field: "—",
      reason:
        `${file} now hand-picks its list fields AND has a field-update PATCH, ` +
        `but no REGISTRY entry. Add one so the two are checked against each other.`,
    });
  }

  if (violations.length === 0) {
    console.log(
      `audit-list-serializer-parity: clean ✓ (${REGISTRY.length} pair(s) checked, no unregistered pairs)`,
    );
    process.exit(0);
  }

  console.error(`audit-list-serializer-parity: ${violations.length} violation(s) found.\n`);
  console.error("A field accepted by an admin PATCH schema is missing from the paired list");
  console.error("endpoint's serializer. The write succeeds but list-backed editors silently");
  console.error("re-seed their state from a stale/default value and overwrite the real data");
  console.error("on the next save. Add the field to the list serializer (see CLAUDE.md's");
  console.error("Recurrent Root Cause Patterns for the users/stores incident this guards).\n");
  for (const v of violations) {
    console.error(`  [${v.pair}] "${v.field}" — ${v.reason}`);
  }
  process.exit(1);
}

main();
