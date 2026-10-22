/**
 * STRICT-ZERO: every relative import in the INSTALLED appkit resolves.
 *
 * ## Why this is not `appkit/scripts/verify-esm-dist.mjs`
 *
 * That script runs inside appkit, against `appkit/dist`, where every file the
 * compiler emitted is present. The tarball is a SUBSET of that tree —
 * `appkit/package.json` `files` carries `"!dist/seed"` and
 * `"!dist/features/tester/seed-data"`, cutting ~34 MB of fixtures out of the
 * published package. So a module can import a sibling that exists locally,
 * pass every appkit-side check, publish green, and then fail to resolve in the
 * consumer's bundler.
 *
 * That is not hypothetical. Measured on the 2026-10-22T01:20 production
 * deployment, which Vercel reported as `● Error` after 3 minutes:
 *
 *     ./node_modules/@mohasinac/appkit/dist/_internal/shared/obligations/deadlines.js
 *     Error: Module not found: Can't resolve
 *       '../../../features/tester/seed-data/tester-window.js'
 *
 * Nothing in appkit could see it: `tsc` compiled against the source tree,
 * `verify-esm-dist` resolved against `appkit/dist`, and the only gate that
 * could have noticed was a Turbopack build that had already consumed a publish,
 * a pin bump and a lockfile regeneration to reach. Two more production deploys
 * had errored before it.
 *
 * ## What it checks
 *
 * Every `import`/`export … from "<relative>"` and `import("<relative>")` in
 * every `.js` file under `node_modules/@mohasinac/appkit/dist`, resolved
 * against the installed tree. A specifier whose target is absent is a
 * violation, and the report
 * names the importing file, the specifier, and whether the path is one the
 * package deliberately excludes — because "you imported an unpublished path" is
 * a different fix from "you imported a typo".
 *
 * 🛑 `.d.ts` files are NOT scanned. TypeScript erases type-only imports, so a
 * declaration pointing at an unpublished path breaks `tsc` and not the bundle;
 * that is a real but separate failure, and conflating the two would report a
 * build-breaking error and a typecheck-breaking one under the same count.
 *
 * ## Skips, reported never silent
 *
 * No installed copy → SKIP. On a `file:./appkit` pin the installed tree IS
 * `appkit/dist` and the subset property does not hold, so the check is
 * vacuous — it still runs, and still passes, because every file is present.
 *
 * @tag domain:quality
 * @tag layer:script
 * @tag access:node-only
 * @tag sideEffects:none — pure reads
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const INSTALLED = "node_modules/@mohasinac/appkit/dist";
const MANIFEST = "appkit/package.json";

if (!existsSync(INSTALLED)) {
  console.log(
    `[audit-installed-dist-resolves] SKIP — ${INSTALLED} does not exist. Run \`npm install\`.`,
  );
  process.exit(0);
}

/** Paths the tarball deliberately omits, read from appkit's own manifest. */
function publishExclusions() {
  if (!existsSync(MANIFEST)) return [];
  const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
  return (m.files ?? [])
    .filter((f) => f.startsWith("!"))
    .map((f) => f.slice(1).replace(/^dist\//, "").replace(/\/$/, ""))
    .filter(Boolean);
}
const EXCLUDED = publishExclusions();

function jsFiles(root, out = []) {
  for (const e of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, e.name);
    if (e.isDirectory()) jsFiles(full, out);
    else if (e.isFile() && e.name.endsWith(".js")) out.push(full);
  }
  return out;
}

/*
 * Comments are stripped first. A relative specifier inside a doc comment is
 * prose — `deadlines.js` now documents the very path it used to import, and
 * flagging that would make the audit fire on its own fix.
 */
const { stripComments } = await import("./lib/strip-comments.mjs");

/*
 * Three specifier forms, and the third was a false negative the negative
 * control caught:
 *
 *   from "./x.js"        — import/export … from
 *   import("./x.js")     — dynamic
 *   import "./x.js"      — SIDE-EFFECT import, which has neither `from` nor a
 *                          parenthesis, so a `from`-anchored pattern sails
 *                          past it entirely
 *
 * The first draft matched only the first two. It still reproduced the real
 * production failure (that one is a named import), so it LOOKED verified —
 * injecting a plain `import "./does-not-exist.js"` is what proved otherwise.
 * CSS and asset side-effect imports are exactly this shape, which is the case
 * most likely to break a consumer build next.
 */
const SPEC_RE =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["'](\.{1,2}\/[^"']+)["']/g;

const files = jsFiles(INSTALLED);
const violations = [];

for (const file of files) {
  const src = stripComments(readFileSync(file, "utf8"));
  for (const m of src.matchAll(SPEC_RE)) {
    const spec = m[1];
    const target = resolve(dirname(file), spec);

    // A specifier may name a file or a directory with an index.
    const candidates = [
      target,
      `${target}.js`,
      join(target, "index.js"),
    ];
    if (candidates.some((c) => existsSync(c) && statSync(c).isFile())) continue;

    const rel = relative(INSTALLED, target).replace(/\\/g, "/");
    const unpublished = EXCLUDED.some(
      (e) => rel === e || rel.startsWith(`${e}/`),
    );
    violations.push({
      importer: relative(INSTALLED, file).replace(/\\/g, "/"),
      spec,
      unpublished,
    });
  }
}

if (violations.length === 0) {
  console.log(
    `[audit-installed-dist-resolves] OK — ${files.length} published module(s), every relative import resolves (${EXCLUDED.length} excluded path(s) honoured).`,
  );
  process.exit(0);
}

console.error(
  `[audit-installed-dist-resolves] STRICT-ZERO: ${violations.length} unresolvable import(s) in the published appkit.\n`,
);
for (const v of violations.slice(0, 20)) {
  console.error(`  ${v.importer}`);
  console.error(
    `    -> ${v.spec}${v.unpublished ? "   🛑 this path is EXCLUDED from the tarball" : "   (missing — typo or a file that was never emitted)"}`,
  );
}
if (violations.length > 20) {
  console.error(`  … and ${violations.length - 20} more`);
}

console.error(`
🛑 The consumer's bundler cannot resolve these, so \`next build\` fails on
   Vercel with "Module not found" — after a publish, a pin bump and a lockfile
   regeneration. That is what the 2026-10-22T01:20 deployment did.

   If the path is EXCLUDED: move the module somewhere the tarball ships.
   \`_internal/shared/\` is where \`tester-window\` went.
   Otherwise: the file was never emitted — check appkit's tsconfig include.

   No suppression marker: the import either resolves in the published package
   or the package is broken for every consumer.`);
process.exit(1);
