const fs = require("fs");
const path = require("path");

const exts = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs"]);
const roots = [
  "src/app/api",
  "src/actions",
  "src/lib",
  "src/app/sitemap.ts",
  "src/providers.config.ts",
  "instrumentation.ts",
  "functions/src",
];

let changed = 0;

function walk(target) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);

  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target)) {
      walk(path.join(target, entry));
    }
    return;
  }

  if (!exts.has(path.extname(target))) return;

  const original = fs.readFileSync(target, "utf8");
  const next = original.replace(
    /@mohasinac\/appkit(["'])/g,
    "@mohasinac/appkit/server$1",
  );

  if (next !== original) {
    fs.writeFileSync(target, next);
    changed += 1;
  }
}

for (const root of roots) {
  walk(root);
}

console.log(`changed_files=${changed}`);
