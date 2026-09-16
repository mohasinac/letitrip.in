#!/usr/bin/env node
/*
 * Add the missing server-side existence check to admin detail pages.
 *
 * 27 of 40 rendered a full editor — inputs, Save, Delete — for an id that
 * does not exist. Measured on production: /admin/products/zzzznope-…/edit
 * rendered 36 inputs, "Save changes" and "Delete product", status "draft".
 *
 * Only the SERVER-SHIM shape is rewritten here: a page whose whole body is
 * `const { id } = await params; return <XClient id={id} />`. A "use client"
 * page needs a different repair (it must distinguish loading from not-found
 * rather than spinning forever) and is left for a hand edit — mixing the two
 * in one codemod is how a half-migration ships.
 *
 * 🛑 CONTROLS FIRST, both directions: the transform must change the known-bad
 * shim, and must refuse a page it does not understand.
 */
import { readFileSync, writeFileSync } from "node:fs";

/** page-path fragment → [import name, repository expression] */
const REPO = {
  "admin/blog": ["blogRepository", "blogRepository.findById(id)"],
  "admin/brands": ["categoriesRepository", "categoriesRepository.findById(id)"],
  "admin/bundles": ["categoriesRepository", "categoriesRepository.findById(id)"],
  "admin/carousel": ["carouselRepository", "carouselRepository.findById(id)"],
  "admin/categories": ["categoriesRepository", "categoriesRepository.findById(id)"],
  "admin/events": ["eventRepository", "eventRepository.findById(id)"],
  "admin/faqs": ["faqsRepository", "faqsRepository.findById(id)"],
  "admin/features": ["productFeaturesRepository", "productFeaturesRepository.findById(id)"],
  "admin/prize-draws": ["productRepository", "productRepository.findById(id)"],
  "admin/products": ["productRepository", "productRepository.findById(id)"],
  "admin/sublisting-categories": ["categoriesRepository", "categoriesRepository.findById(id)"],
  "admin/tester-checklist": [
    "testerChecklistItemRepository",
    "testerChecklistItemRepository.findById(id)",
  ],
  "admin/addresses": ["addressesRepository", "addressesRepository.findById(id)"],
  "admin/bids": ["bidRepository", "bidRepository.findById(id)"],
  "admin/payouts": ["payoutRepository", "payoutRepository.findById(id)"],
  "admin/stores": ["storeRepository", "storeRepository.findById(id)"],
  "admin/grouped-listings": ["groupedListingsRepository", "groupedListingsRepository.findById(id)"],
};

const SHIM =
  /^(?<imports>(?:import[^\n]*\n|\s*\n)*)export default async function (?<fn>\w+)\(\{\s*params\s*\}:\s*\{\s*params:\s*Promise<\{\s*id:\s*string\s*\}>\s*\}\)\s*\{\s*const \{ id \} = await params;\s*return (?<jsx><[^;]+>);\s*\}\s*$/;

function transform(src, repoImport, repoCall) {
  const m = SHIM.exec(src.trim() + "\n");
  if (!m) return null;
  const { imports, fn, jsx } = m.groups;
  return `import { notFound } from "next/navigation";
import { ${repoImport} } from "@mohasinac/appkit";
${imports.trim()}

/*
 * 🛑 THE EXISTENCE CHECK IS THE POINT OF THIS FILE.
 *
 * This was a bare shim with no check, so an invented id rendered a full
 * editor — every field, a Save button and usually a Delete button — for a
 * record that does not exist. 27 of 40 admin detail pages were like this.
 * /admin/orders/[id]/view already did it correctly and is the reference.
 */
export default async function ${fn}({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const record = await ${repoCall};
  if (!record) return notFound();

  return ${jsx};
}
`;
}

// ── Controls ────────────────────────────────────────────────────────────────
const KNOWN_BAD = `import { ProductEditClient } from "./product-edit-client";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductEditClient id={id} />;
}
`;
const out = transform(KNOWN_BAD, "productRepository", "productRepository.findById(id)");
if (!out || !out.includes("notFound()") || !out.includes("<ProductEditClient id={id} />")) {
  console.error("✗ CONTROL FAILED — transform did not rewrite the known-bad shim correctly.");
  process.exit(2);
}
if (transform(`"use client";\nexport default function P(){return null}`, "x", "x") !== null) {
  console.error("✗ CONTROL FAILED — transform accepted a page it should refuse.");
  process.exit(2);
}
console.log("✓ controls: rewrites the known-bad shim, refuses a shape it does not understand\n");

// ── Apply ───────────────────────────────────────────────────────────────────
const files = process.argv.slice(2);
let changed = 0,
  skipped = 0;
for (const file of files) {
  const key = Object.keys(REPO).find((k) => file.replace(/\\/g, "/").includes(k));
  if (!key) {
    console.log(`  ? no repository mapped: ${file}`);
    skipped++;
    continue;
  }
  const src = readFileSync(file, "utf8");
  const next = transform(src, REPO[key][0], REPO[key][1]);
  if (!next) {
    console.log(`  - not a server shim, hand-edit needed: ${file}`);
    skipped++;
    continue;
  }
  writeFileSync(file, next);
  console.log(`  + guarded with ${REPO[key][0]}: ${file}`);
  changed++;
}
console.log(`\n${changed} guarded, ${skipped} skipped`);
