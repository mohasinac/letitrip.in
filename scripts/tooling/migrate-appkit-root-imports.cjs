const fs = require("fs");
const path = require("path");

const exts = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs"]);
const roots = ["src", "functions/src", "instrumentation.ts", "proxy.ts"];
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
  let next = original;

  next = next.replace(
    /from\s+["']@mohasinac\/appkit\/[^"']+["']/g,
    'from "@mohasinac/appkit"',
  );

  next = next.replace(
    /import\(\s*["']@mohasinac\/appkit\/[^"']+["']\s*\)/g,
    'import("@mohasinac/appkit")',
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
