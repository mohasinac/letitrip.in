#!/usr/bin/env node
/**
 * audit-public-projection-parity — strict-zero.
 *
 * Guards the two ways a private field reaches the public internet.
 *
 * RULE 1 — PROJECTION_TRIAGE (the primary control).
 *   Every field of a registered *Document interface must appear in exactly one
 *   of the adapter's PUBLIC_* / PRIVATE_* lists, and the PUBLIC_* list must
 *   agree with the keys the builder function actually returns. A field added
 *   to the schema and triaged into neither fails — new fields are PRIVATE by
 *   default, which is the whole point of an allow-list.
 *
 *   Why (2026-08-24): GET /api/site-settings built its response as a spread of
 *   the document minus three keys, edge-cached for 300s. Everything else was
 *   public by default: gst.gstin plus the registered legal name and address,
 *   all 25 commissions.* fields, laborRate.hourlyRate,
 *   emi.surchargeSellerSharePercent, featureFlags.adminCheckoutBypass, and —
 *   because they were never declared on the interface at all —
 *   adSettings.providerCredentials (which the ADMIN ads endpoint masks) plus
 *   every draft/paused ad. That last part is exactly why the allow-list, not
 *   this audit, is the real defence: a triage keyed on a TypeScript interface
 *   cannot see fields the interface never declared. This rule keeps the two
 *   lists honest; the adapter keeps the response honest.
 *
 * RULE 2 — RAW_DOC_TO_CLIENT (deliberately narrow).
 *   A raw repository document bound in a Server Component and passed as a JSX
 *   prop to a confirmed Client Component gets serialised into the RSC flight
 *   payload — i.e. into the page's public HTML.
 *
 *   Why: /stores/[storeSlug]/about did exactly this with a StoreDocument,
 *   behind an `as unknown as StoreDetail` cast that has no runtime effect. The
 *   store's decrypted Meta WhatsApp accessToken, adminNotes, suspensionReason
 *   and customCommissionRate were in the HTML of every store's About page. The
 *   same shape was live in three more places, including the homepage.
 *
 *   This rule matches one specific shape rather than attempting general taint
 *   analysis: doing that properly needs the TypeScript compiler (against this
 *   repo's audit conventions) and would emit false positives, which are worse
 *   than nothing in a strict-zero gate. Every gap here is a false NEGATIVE,
 *   which is safe. Known blind spots: taint through a helper function, through
 *   .map() into an array prop, or through destructure-and-respread.
 *
 * No suppression marker. scripts/audit-no-suppression-comments.mjs is
 * strict-zero and forbids adding new ones. Triage lives in the PRIVATE_*
 * constant with a per-entry reason comment — reviewable source, not a
 * silencing comment — and Rule 2's only escape hatch is "call the adapter".
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();

// ---------------------------------------------------------------------------
// Rule 1 registry
// ---------------------------------------------------------------------------
const REGISTRY = [
  {
    name: "site-settings",
    schemaFile: "appkit/src/features/admin/schemas/firestore.ts",
    schemaInterface: "SiteSettingsDocument",
    adapterFile: "appkit/src/_internal/server/features/site-settings/adapters.ts",
    publicConst: "PUBLIC_SITE_SETTINGS_FIELDS",
    privateConst: "PRIVATE_SITE_SETTINGS_FIELDS",
    builders: ["toPublicSiteSettings"],
    // Response keys that are computed, not document fields.
    derived: ["effectiveWatermark"],
    // Public fields published under a different key (see `derived`).
    sourceFields: [],
  },
  {
    name: "stores",
    schemaFile: "appkit/src/features/stores/schemas/firestore.ts",
    schemaInterface: "StoreDocument",
    adapterFile: "appkit/src/_internal/server/features/stores/adapters.ts",
    publicConst: "PUBLIC_STORE_FIELDS",
    privateConst: "PRIVATE_STORE_FIELDS",
    // Two builders share one allow-list: the list projection and the detail
    // projection that extends it. The union of what they emit is checked.
    builders: ["toStoreListItem", "toStoreDetail"],
    // Flattened off `stats` (or the legacy top-level counters).
    derived: ["totalProducts", "itemsSold", "totalReviews", "averageRating"],
    // `stats` is public, but its values ship under the flattened names above
    // rather than as a nested object — so it is never emitted under its own key.
    sourceFields: ["stats"],
  },
];

// ---------------------------------------------------------------------------
// Rule 2 registry — repositories whose documents carry secrets.
// ---------------------------------------------------------------------------
const SECRET_DOC_SOURCES = [
  {
    repo: "storeRepository",
    methods: ["findBySlug", "findById", "findByOwnerId"],
    adapter: "toStoreDetail() / toStoreListItem()",
  },
  {
    repo: "siteSettingsRepository",
    methods: ["getSingleton"],
    adapter: "toPublicSiteSettings()",
  },
];

const SCAN_DIRS = ["src", join("appkit", "src")];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "__tests__", ".git"]);

// ---------------------------------------------------------------------------
// Shared helpers (same technique as audit-list-serializer-parity /
// audit-sieve-field-schema-parity — regex + brace walk, no TS compiler).
// ---------------------------------------------------------------------------

/** Strips comments so prose can't desync the scanners. */
function stripComments(src) {
  let out = "";
  let inStr = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      out += c;
      if (c === "\\") { out += src[++i] ?? ""; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      const nl = src.indexOf("\n", i);
      i = nl === -1 ? src.length : nl - 1;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? src.length : end + 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inStr = c; out += c; continue; }
    out += c;
  }
  return out;
}

/** Walks from an opening `{`, string-aware, returning the balanced body. */
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
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return src.slice(openBraceIndex + 1, i);
    }
  }
  return null;
}

/** Top-level `key:` names inside an object-literal / interface body. */
function topLevelKeys(body) {
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
    if (c === '"' || c === "'" || c === "`") { inStr = c; i++; continue; }
    if (c === "{" || c === "(" || c === "[") { depth++; i++; continue; }
    if (c === "}" || c === ")" || c === "]") { depth--; i++; continue; }
    if (depth === 0) {
      const m = /^([A-Za-z_$][\w$]*)\s*\??\s*:/.exec(body.slice(i));
      if (m) { keys.push(m[1]); i += m[0].length; continue; }
    }
    i++;
  }
  return keys;
}

/** Fields of `interface Name extends ... { ... }`, following `extends BaseDocument`. */
function interfaceFields(src, name, seen = new Set()) {
  if (seen.has(name)) return [];
  seen.add(name);
  const re = new RegExp(`interface\\s+${name}\\b([^{]*)\\{`);
  const m = re.exec(src);
  if (!m) return null;
  const body = findBalancedBody(src, m.index + m[0].length - 1);
  if (body === null) return null;
  const fields = topLevelKeys(body);
  const ext = /extends\s+([A-Za-z_$][\w$,\s]*)/.exec(m[1]);
  if (ext) {
    for (const parent of ext[1].split(",").map((s) => s.trim()).filter(Boolean)) {
      const inherited = interfaceFields(src, parent, seen);
      if (inherited) fields.push(...inherited);
    }
  }
  return fields;
}

/** String entries of `export const NAME = [ "a", "b" ] as const`. */
function stringArrayConst(src, name) {
  const re = new RegExp(`export const ${name}\\s*=\\s*\\[`);
  const m = re.exec(src);
  if (!m) return null;
  const start = m.index + m[0].length - 1;
  let depth = 0;
  let end = -1;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) return null;
  return [...src.slice(start + 1, end).matchAll(/["']([^"']+)["']/g)].map((x) => x[1]);
}

/** Top-level keys of the object literal a `function NAME(...)` returns. */
function builderReturnKeys(src, fnName) {
  const re = new RegExp(`function\\s+${fnName}\\b`);
  const m = re.exec(src);
  if (!m) return null;
  const ret = src.indexOf("return {", m.index);
  if (ret === -1) return null;
  const body = findBalancedBody(src, src.indexOf("{", ret));
  if (body === null) return null;
  // `...spread` entries carry keys we can't resolve statically — surface them
  // so a spread can never quietly reintroduce the deny-list shape.
  const spreads = [...body.matchAll(/\.\.\.([A-Za-z_$][\w$]*)/g)].map((x) => x[1]);
  return { keys: topLevelKeys(body), spreads };
}

function read(rel) {
  try { return readFileSync(join(ROOT, rel), "utf8"); } catch { return null; }
}

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e)) continue;
    const p = join(dir, e);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (e.endsWith(".tsx")) out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Rule 1
// ---------------------------------------------------------------------------
function checkTriage(violations) {
  for (const entry of REGISTRY) {
    const schemaSrc = read(entry.schemaFile);
    const adapterSrc = read(entry.adapterFile);
    if (!schemaSrc) {
      violations.push({ rule: "REGISTRY_STALE", where: entry.name, msg: `schemaFile not found: ${entry.schemaFile}` });
      continue;
    }
    if (!adapterSrc) {
      violations.push({ rule: "REGISTRY_STALE", where: entry.name, msg: `adapterFile not found: ${entry.adapterFile}` });
      continue;
    }

    const clean = stripComments(schemaSrc);
    const fields = interfaceFields(clean, entry.schemaInterface);
    if (!fields) {
      violations.push({ rule: "REGISTRY_STALE", where: entry.name, msg: `interface ${entry.schemaInterface} not found in ${entry.schemaFile}` });
      continue;
    }

    const adapterClean = stripComments(adapterSrc);
    const pub = stringArrayConst(adapterClean, entry.publicConst);
    const priv = stringArrayConst(adapterClean, entry.privateConst);
    if (!pub || !priv) {
      violations.push({ rule: "REGISTRY_STALE", where: entry.name, msg: `${!pub ? entry.publicConst : entry.privateConst} not found in ${entry.adapterFile}` });
      continue;
    }

    const pubSet = new Set(pub);
    const privSet = new Set(priv);

    for (const f of new Set(fields)) {
      const inPub = pubSet.has(f);
      const inPriv = privSet.has(f);
      if (inPub && inPriv) {
        violations.push({ rule: "TRIAGE_CONFLICT", where: entry.name, msg: `"${f}" is in BOTH ${entry.publicConst} and ${entry.privateConst}` });
      } else if (!inPub && !inPriv) {
        violations.push({
          rule: "UNTRIAGED_FIELD",
          where: entry.name,
          msg: `${entry.schemaInterface}.${f} is triaged into neither list. Add it to ${entry.privateConst} with a one-line reason (the default), or to ${entry.publicConst} AND the literal in ${entry.builders[0]}() — after confirming a real client reader exists.`,
        });
      }
    }

    const builtSet = new Set();
    let anyBuilderRead = false;
    for (const fnName of entry.builders) {
      const built = builderReturnKeys(adapterClean, fnName);
      if (!built) {
        violations.push({ rule: "REGISTRY_STALE", where: entry.name, msg: `could not read the object literal returned by ${fnName}() in ${entry.adapterFile}` });
        continue;
      }
      anyBuilderRead = true;
      for (const k of built.keys) builtSet.add(k);
      // A spread of ANOTHER builder is the sanctioned composition
      // (toStoreDetail spreads toStoreListItem). A spread of the source
      // document is the deny-list shape this audit exists to prevent.
      const badSpreads = built.spreads.filter(
        (s) => !entry.builders.some((b) => s === b || s.startsWith(b)),
      );
      if (badSpreads.length > 0) {
        violations.push({
          rule: "SPREAD_IN_PROJECTION",
          where: entry.name,
          msg: `${fnName}() spreads ${badSpreads.map((s) => `...${s}`).join(", ")}. An allow-list projection must name every key it emits — a spread of the source document is exactly how the deny-list leaked.`,
        });
      }
    }
    if (!anyBuilderRead) continue;

    const derived = new Set(entry.derived ?? []);
    const sourceOnly = new Set(entry.sourceFields ?? []);
    for (const f of pub) {
      if (!builtSet.has(f) && !sourceOnly.has(f)) {
        violations.push({ rule: "PUBLIC_NOT_MAPPED", where: entry.name, msg: `"${f}" is in ${entry.publicConst} but no builder (${entry.builders.join(", ")}) emits it.` });
      }
    }
    for (const k of builtSet) {
      if (!pubSet.has(k) && !derived.has(k)) {
        violations.push({ rule: "EMITTED_NOT_TRIAGED", where: entry.name, msg: `a builder emits "${k}", which is in neither ${entry.publicConst} nor the registry's \`derived\` list.` });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Rule 2
// ---------------------------------------------------------------------------
function buildClientComponentNames() {
  const names = new Set();
  for (const d of SCAN_DIRS) {
    for (const file of walk(join(ROOT, d))) {
      const src = readFileSync(file, "utf8");
      if (!/^\s*["']use client["']/m.test(src.slice(0, 400))) continue;
      for (const m of src.matchAll(/export\s+(?:default\s+)?(?:async\s+)?function\s+([A-Z][\w$]*)/g)) names.add(m[1]);
      for (const m of src.matchAll(/export\s+const\s+([A-Z][\w$]*)\s*[:=]/g)) names.add(m[1]);
    }
  }
  return names;
}

function checkRawDocToClient(violations) {
  const clientComponents = buildClientComponentNames();
  for (const d of SCAN_DIRS) {
    for (const file of walk(join(ROOT, d))) {
      const raw = readFileSync(file, "utf8");
      if (/^\s*["']use client["']/m.test(raw.slice(0, 400))) continue; // client files don't serialise props
      const src = stripComments(raw);

      // Collect tainted identifiers: `const x = await <repo>.<method>(`
      const tainted = new Map();
      for (const source of SECRET_DOC_SOURCES) {
        const re = new RegExp(
          `(?:const|let)\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*await\\s+${source.repo}\\s*\\.\\s*(${source.methods.join("|")})\\s*\\(`,
          "g",
        );
        for (const m of src.matchAll(re)) tainted.set(m[1], source);
      }
      if (tainted.size === 0) continue;

      for (const [id, source] of tainted) {
        // `<Comp ... prop={id}` / `prop={id as X}` / `prop={{...id}}`
        const propRe = new RegExp(
          `<([A-Z][\\w$]*)(?:\\s[^>]*?)?\\s([A-Za-z_$][\\w$]*)=\\{\\s*(?:\\.\\.\\.)?${id}\\b(?:\\s+as\\s+[^}]*)?\\}`,
          "g",
        );
        for (const m of src.matchAll(propRe)) {
          const [, comp, prop] = m;
          if (!clientComponents.has(comp)) continue;
          violations.push({
            rule: "RAW_DOC_TO_CLIENT",
            where: relative(ROOT, file).split(sep).join("/"),
            msg: `"${id}" is a raw document from ${source.repo} and is passed as \`${prop}\` to Client Component <${comp}>. It will be serialised into the public RSC flight payload. Project it through ${source.adapter} first.`,
          });
        }

        // `as unknown as X` on a tainted id in a prop position is never right.
        const castRe = new RegExp(`=\\{\\s*${id}\\s+as\\s+unknown\\s+as\\s`, "g");
        for (const _ of src.matchAll(castRe)) {
          violations.push({
            rule: "RAW_DOC_DOUBLE_CAST",
            where: relative(ROOT, file).split(sep).join("/"),
            msg: `"${id}" (raw ${source.repo} document) is passed to a JSX prop via \`as unknown as\`. That cast has no runtime effect — it only silences the one type-level signal you had. Project it through ${source.adapter}.`,
          });
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
function main() {
  const violations = [];
  checkTriage(violations);
  checkRawDocToClient(violations);

  if (violations.length === 0) {
    console.log(`audit-public-projection-parity: clean ✓ (${REGISTRY.length} projection(s), ${SECRET_DOC_SOURCES.length} secret-bearing repo(s) checked)`);
    process.exit(0);
  }

  console.error(`audit-public-projection-parity: ${violations.length} violation(s) found.\n`);
  console.error("A public response or a Client Component prop is carrying a field that was");
  console.error("never triaged as safe to publish. New schema fields are PRIVATE by default:");
  console.error("add them to the adapter's PRIVATE_* list with a reason, or to the PUBLIC_*");
  console.error("list AND the projection literal once a real client reader exists.\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.where}: ${v.msg}`);
  }
  process.exit(1);
}

main();
