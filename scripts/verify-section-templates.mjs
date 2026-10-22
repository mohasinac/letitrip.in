#!/usr/bin/env node
/**
 * D1 — section templates. Asserts the properties that make a TYPED template
 * worth more than a raw `SectionConfig` one.
 *
 * Run: node scripts/verify-section-templates.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { stripComments } from "./lib/strip-comments.mjs";

/*
 * 🛑 The three imports below are DYNAMIC so this guard can run first.
 *
 * Registered into `scripts/run-audits.mjs` on 2026-10-19 after existing
 * unregistered since the competitor crawl — and registering it immediately
 * exposed why that matters: it reads compiled modules out of `appkit/dist`, so
 * with dist absent it threw ERR_MODULE_NOT_FOUND and exited 1, which as a
 * registered audit means it BLOCKS `npm run check` for a reason that has
 * nothing to do with sections.
 *
 * 🛑 Guarding on the DIRECTORY is not enough, which is the hole in the sibling
 * `audit-section-config-links.mjs` (it tests `existsSync(DIST)` alone). appkit's
 * build starts by deleting dist and repopulates it over ~40s, so a concurrent
 * build leaves the directory PRESENT and half-written — measured here at 1,039
 * files of ~5,193, with `index.js` and `.build-stamp.json` still missing. That
 * is the same half-written-dist state CLAUDE.md records producing three
 * unrelated-looking failures from one cause. So the guard checks the specific
 * modules this script imports.
 *
 * 🛑 Exiting 0 makes the pass VACUOUS, which is its own hazard — so say so
 * loudly rather than printing a reassuring line. A silent skip is how a gate
 * becomes decoration (Root Cause #87).
 */
const DIST = resolve(process.cwd(), "appkit/dist");

/**
 * The modules this script imports. Also what it dynamic-imports below, so this
 * list must contain ONLY loadable JS.
 */
const MODULES = [
  "features/admin/components/sections/sectionTemplates.js",
  "features/admin/components/sections/adminSectionsTypes.js",
  "features/admin/components/sections/adminSectionsBuildParse.js",
];

/**
 * What must exist before importing anything — the modules PLUS the build stamp.
 *
 * 🛑 `.build-stamp.json` is the only entry that proves the build FINISHED, and
 * it is deliberately kept out of `MODULES`: it is JSON, so importing it without
 * an `{ type: "json" }` attribute throws — which is exactly the bug the first
 * version of this fix shipped, by reusing one list for both jobs.
 *
 * Why the stamp is needed at all: checking that the three modules exist is
 * necessary but NOT sufficient, as this audit demonstrated on its first real
 * mid-build encounter. All three files were present and the import still threw
 * `ERR_MODULE_NOT_FOUND .../adminSectionsTypes` — note the MISSING EXTENSION.
 * `tsc` emits extensionless relative specifiers and `fix-esm-extensions.mjs`
 * rewrites them in a LATER step, so there is a window where every file is on
 * disk while its own imports are still unresolvable. Existence was the wrong
 * property; completion is the right one, and the stamp is its signal.
 */
const REQUIRED_ARTEFACTS = [".build-stamp.json", ...MODULES];
const missing = REQUIRED_ARTEFACTS.filter((rel) => !existsSync(resolve(DIST, rel)));
if (missing.length > 0) {
  console.log("verify-section-templates: SKIPPED — nothing was verified.");
  console.log(`  appkit/dist is absent or incomplete (${missing.length}/${REQUIRED_ARTEFACTS.length} required artefact(s) missing).`);
  console.log(`  First missing: ${missing[0]}`);
  if (missing[0] === ".build-stamp.json") {
    console.log("  (That stamp is the LAST build step, so dist is mid-write or the build failed.)");
  }
  console.log("  Run `npm --prefix appkit run build` — and if a build is in flight, wait for it;");
  console.log("  two processes writing the same dist/ is its own documented failure.");
  process.exit(0);
}

const load = (rel) => import(pathToFileURL(resolve(DIST, rel)).href);
const { SECTION_TEMPLATES, COMPETITOR_PROFILES, templatesForType, templateById, profileById } =
  await load(MODULES[0]);
const T = await load(MODULES[1]);
const BP = await load(MODULES[2]);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log(`  PASS  ${m}`); } else { fail++; console.log(`  FAIL  ${m}`); } };

console.log("\n--- the templates exist and are discriminated ---");
ok(SECTION_TEMPLATES.length >= 6, `${SECTION_TEMPLATES.length} templates shipped`);
ok(SECTION_TEMPLATES.every((t) => typeof t.sectionType === "string" && t.builder && typeof t.builder === "object"),
   "every template carries a sectionType AND a builder object");
ok(new Set(SECTION_TEMPLATES.map((t) => t.id)).size === SECTION_TEMPLATES.length,
   "ids are unique — a duplicate would make templateById non-deterministic");

console.log("\n--- 🛑 EVERY builder ROUND-TRIPS through the REAL build/parse pair ---");
/*
 * This is the assertion that makes a typed template worth having. A raw
 * `SectionConfig` template could be structurally wrong and still typecheck,
 * because `SectionConfig` is a non-discriminated union narrowed by unchecked
 * cast at all 25 renderer arms. Running each builder through the shipped
 * `build<Type>Config` and back through `parse<Type>Builder` proves the state
 * the template carries is one the product can actually produce and re-read.
 */
const PAIRS = {
  categories: ["buildCategoriesConfig", "parseCategoriesBuilder"],
  "trust-indicators": ["buildTrustIndicatorsConfig", "parseTrustIndicatorsBuilder"],
  faq: ["buildFAQConfig", "parseFAQBuilder"],
  "blog-articles": ["buildBlogConfig", "parseBlogBuilder"],
  products: ["buildProductsConfig", "parseProductsBuilder"],
  "custom-cards": ["buildCustomCardsConfig", "parseCustomCardsBuilder"],
};
for (const t of SECTION_TEMPLATES) {
  const names = PAIRS[t.sectionType];
  if (!names) { ok(false, `${t.id}: no build/parse pair registered for "${t.sectionType}"`); continue; }
  const [bName, pName] = names;
  const build = BP[bName], parse = BP[pName];
  if (typeof build !== "function" || typeof parse !== "function") {
    ok(false, `${t.id}: ${bName}/${pName} not exported — the names drifted`);
    continue;
  }
  let config = null, back = null, err = null;
  try { config = build(t.builder); back = parse(config); } catch (e) { err = e; }
  ok(!err && config && typeof config === "object",
     `${t.id}: builds a config through the real ${bName}()${err ? ` — threw: ${err.message}` : ""}`);
  if (back) {
    // Only the keys the template set need survive — parse fills its own defaults.
    const drifted = Object.keys(t.builder).filter((k) => {
      const a = JSON.stringify(t.builder[k]), b = JSON.stringify(back[k]);
      return a !== b;
    });
    ok(drifted.length === 0,
       `${t.id}: round-trips with no drift${drifted.length ? ` — ${drifted.join(", ")}` : ""}`);
  }
}

console.log("\n--- the defaults they spread from are REAL exports ---");
for (const n of ["DEFAULT_CATEGORIES_BUILDER","DEFAULT_TRUST_INDICATORS_BUILDER","DEFAULT_FAQ_BUILDER","DEFAULT_BLOG_BUILDER","DEFAULT_PRODUCTS_BUILDER","DEFAULT_CUSTOM_CARDS_BUILDER"]) {
  ok(T[n] && typeof T[n] === "object", `${n} is exported`);
}

console.log("\n--- the FAQ template does NOT re-create the empty-tab bug ---");
const faq = SECTION_TEMPLATES.find((t) => t.sectionType === "faq");
ok(Array.isArray(faq.builder.categories) && faq.builder.categories.length === 0,
   "its `categories` is EMPTY, so tabs derive from the items shown");
ok(faq.builder.displayCount === 10, "displayCount is 10, the measured target");

console.log("\n--- profiles are real and referenced ---");
ok(COMPETITOR_PROFILES.length >= 4, `${COMPETITOR_PROFILES.length} profiles`);
const dangling = SECTION_TEMPLATES.filter((t) => t.sourceProfileId && !profileById(t.sourceProfileId));
ok(dangling.length === 0, `no template cites a missing profile${dangling.length ? ` — ${dangling.map(t=>t.id)}` : ""}`);
ok(COMPETITOR_PROFILES.every((p) => p.takeaway && p.takeaway.length > 40),
   "every profile states a takeaway, not just numbers");

console.log("\n--- lookups ---");
ok(templatesForType("faq").length >= 1, "templatesForType finds the faq template");
ok(templatesForType("newsletter").length === 0,
   "a type with no template returns [] — the picker then renders nothing");
ok(templateById("faq-ten-question")?.sectionType === "faq", "templateById narrows correctly");
ok(templateById("does-not-exist") === undefined, "an unknown id is undefined, not a throw");

console.log("\n--- 🛑 ONE applyBuilderFor, not two 25-arm switches ---");
const view = stripComments(readFileSync("appkit/src/features/admin/components/AdminSectionsView.tsx", "utf8"));
ok(/const applyBuilderFor = React\.useCallback/.test(view), "applyBuilderFor exists");
const armCount = (view.match(/case "[a-z-]+": set\w+Builder\(pick\(DEFAULT_/g) ?? []).length;
ok(armCount === 25, `all 25 arms go through pick() — found ${armCount}`);
ok(!/set\w+Builder\(DEFAULT_\w+\);/.test(view),
   "NEGATIVE CONTROL: no arm still sets a default directly, which would mean a template cannot reach it");
ok((view.match(/switch \(type\)|switch \(sectionType\)/g) ?? []).length <= 3,
   "no second 25-arm switch was added beside it (Root Cause #61)");
ok(/applyBuilderFor\(sectionType\);/.test(view), "the reset effect now calls it with NO template");
/*
 * 🛑 The BEHAVIOUR, not the old spelling of it.
 *
 * This matched the literal `mode === "create"`, which was how the editor knew
 * it was creating while it still owned a `mode` state and a "Mode" dropdown.
 * That dropdown WAS the bug the sections listing was converted to fix — the
 * row chose the record, so a control to re-choose it had to go — and `mode`
 * went with it: create is now `!sectionId`, derived from the row that was
 * clicked, and bound once as `isCreate`.
 *
 * So the check accepts either, because both express the same rule. The rule
 * is what matters: a template REPLACES the builder wholesale, so offering it
 * while editing would silently overwrite an admin's authored section with a
 * preset — the all-or-nothing failure that ruled out whole-page layouts.
 */
ok(/(mode === "create"|isCreate) && templatesForType\(sectionType\)\.length > 0/.test(view),
   "the picker is create-mode only AND hidden when the type has no template");

console.log(`\n${fail === 0 ? "all checks passed" : `${fail} FAILED`}  (${pass} passed)`);
process.exit(fail === 0 ? 0 : 1);
