#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const DIRS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];
const IGNORE_DIRS = ["node_modules", ".next", "dist", "__tests__", "scripts"];
const EXTS = [".tsx", ".jsx"];

const ALLOW = [
  /appkit[/\\]src[/\\]features[/\\]email[/\\]/,
  /appkit[/\\]src[/\\]features[/\\]contact[/\\]email\.tsx$/,
  /appkit[/\\]src[/\\]ui[/\\]components[/\\]/,
  /appkit[/\\]src[/\\]ui[/\\]forms[/\\]/,
  /appkit[/\\]src[/\\]ui[/\\]rich-text[/\\]/,
  /appkit[/\\]src[/\\]features[/\\]media[/\\]/,
  /appkit[/\\]src[/\\]_internal[/\\]client[/\\]/,
];

const SUPPRESS = /(?:\/\/|\{?\/\*)\s*audit-inline-style-ok/;

const RULES = [
  { id: "IS", re: /style\s*=\s*\{\{/ },
  { id: "ISV", re: /style\s*=\s*\{(?!\{)[a-zA-Z]/ },
  { id: "RO", re: /<(?:Stack|Row|Grid|Container|Section|Div)\s[^>]*className\s*=\s*[{"'].*\boverflow-(?:auto|scroll|hidden|x-auto|y-auto|x-hidden|y-hidden)\b/ },
  { id: "ICO", re: /style\s*=\s*\{\{[^}]*\b(?:color|backgroundColor|borderColor)\s*:/ },
];

function walk(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (IGNORE_DIRS.includes(entry)) continue;
    const stat = statSync(full, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isDirectory()) results.push(...walk(full));
    else if (EXTS.some(x => entry.endsWith(x)) && !ALLOW.some(rx => rx.test(full)))
      results.push(full);
  }
  return results;
}

const counts = {};
for (const dir of DIRS) {
  for (const f of walk(dir)) {
    const lines = readFileSync(f, "utf-8").split("\n");
    let c = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) continue;
      const prev = i > 0 ? lines[i - 1] : "";
      if (SUPPRESS.test(line) || SUPPRESS.test(prev)) continue;
      for (const rule of RULES) if (rule.re.test(line)) c++;
    }
    if (c > 0) {
      const rel = relative(ROOT, f).replace(/\\/g, "/");
      counts[rel] = c;
    }
  }
}

const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
for (const [f, n] of sorted) process.stdout.write(n + "\t" + f + "\n");
process.stdout.write("Files: " + sorted.length + "  Total: " + Object.values(counts).reduce((a, b) => a + b, 0) + "\n");
