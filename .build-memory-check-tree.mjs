import { createRequire } from "node:module";

/*
 * `buildCategoryTree` must EXECUTE to say anything — the derived fields
 * (parentIds, ancestors, tier, path, position, subtreeSize, isLeaf) are
 * computed, not parseable from source. So this reads the built dist.
 *
 * 🛑 Both `require` and `module.require` have to be shimmed for a pure-ESM
 * entry: `providers/db-firebase/admin.ts` calls `module.require(...)`, and
 * without the second half every repository call throws
 * `ReferenceError: module is not defined` while REPORTING SUCCESS (Root
 * Cause #24).
 */
const require_ = createRequire(import.meta.url);
globalThis.require = require_;
globalThis.module = { require: require_ };

const seed = await import("@mohasinac/appkit/seed").catch(async () => {
  /* The subpath is deliberately unpublished; fall back to the local build. */
  return import("./appkit/dist/seed/index.js");
});

const rows = seed.categoriesSeedData;
console.log(`  categoriesSeedData rows: ${rows.length}`);

const byId = new Map(rows.map((r) => [r.id, r]));
const problems = [];
const bump = (kind, detail) => problems.push({ kind, detail });

let roots = 0;
const tierCount = new Map();
for (const r of rows) {
  tierCount.set(r.tier, (tierCount.get(r.tier) ?? 0) + 1);
  if (r.tier === 0) roots++;

  /* 1. Every ancestor in the chain must exist. */
  for (const p of r.parentIds ?? []) {
    if (!byId.has(p)) bump("MISSING_PARENT", `${r.id} -> ${p}`);
  }

  /* 2. tier must equal the chain length. */
  const chainLen = (r.parentIds ?? []).length;
  if (r.tier !== chainLen) {
    bump("TIER_MISMATCH", `${r.id} tier=${r.tier} but ${chainLen} ancestor(s)`);
  }

  /* 3. A leaf must have no children; a branch must have some. */
  const kids = rows.filter((x) => (x.parentIds ?? [])[0] === r.id);
  if (r.isLeaf && kids.length > 0) {
    bump("LEAF_WITH_CHILDREN", `${r.id} isLeaf but has ${kids.length}`);
  }
  if (!r.isLeaf && kids.length === 0 && r.tier > 0) {
    bump("BRANCH_WITH_NO_CHILDREN", `${r.id} tier=${r.tier}`);
  }
}

/* 4. The headline guard: declared leaves vs leaves actually reached. */
const leaves = rows.filter((r) => r.isLeaf).length;

console.log(`  roots (tier 0)         : ${roots}`);
console.log(
  `  per tier               : ${[...tierCount.entries()].sort((a, b) => a[0] - b[0]).map(([t, n]) => `t${t}=${n}`).join(" ")}`,
);
console.log(`  leaves                 : ${leaves}`);
console.log("");

if (problems.length === 0) {
  console.log("  ✓ tree is internally consistent");
} else {
  const byKind = new Map();
  for (const p of problems) {
    if (!byKind.has(p.kind)) byKind.set(p.kind, []);
    byKind.get(p.kind).push(p.detail);
  }
  console.log(`  ✗ ${problems.length} problem(s):`);
  for (const [kind, list] of byKind) {
    console.log(`    ${kind}: ${list.length}`);
    for (const d of list.slice(0, 6)) console.log(`        ${d}`);
    if (list.length > 6) console.log(`        … and ${list.length - 6} more`);
  }
  process.exitCode = 1;
}
