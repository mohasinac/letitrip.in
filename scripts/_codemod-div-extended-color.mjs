#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__", "scripts", "seed"]);
const PRIMITIVE_SOURCE_DIRS = [
  /[\\/]appkit[\\/]src[\\/]ui[\\/]components[\\/]/,
  /[\\/]appkit[\\/]src[\\/]features[\\/]email[\\/]/,
];

const PAIRS = [
  ["text-zinc-900", "dark:text-zinc-100", "primary"],
  ["text-zinc-900", "dark:text-zinc-50", "primary"],
  ["text-zinc-900", "dark:text-white", "primary"],
  ["text-zinc-900", "dark:text-slate-100", "primary"],
  ["text-zinc-800", "dark:text-zinc-100", "primary"],
  ["text-zinc-800", "dark:text-zinc-200", "primary"],
  ["text-zinc-700", "dark:text-zinc-200", "primary"],
  ["text-zinc-700", "dark:text-zinc-300", "primary"],
  ["text-zinc-700", "dark:text-slate-300", "primary"],
  ["text-zinc-600", "dark:text-zinc-300", "muted"],
  ["text-zinc-600", "dark:text-zinc-400", "muted"],
  ["text-zinc-600", "dark:text-slate-300", "muted"],
  ["text-zinc-600", "dark:text-slate-400", "muted"],
  ["text-zinc-500", "dark:text-zinc-400", "muted"],
  ["text-zinc-500", "dark:text-zinc-500", "muted"],
  ["text-zinc-500", "dark:text-slate-400", "muted"],
  ["text-zinc-400", "dark:text-zinc-500", "faint"],
  ["text-zinc-400", "dark:text-zinc-600", "faint"],
  ["text-zinc-400", "dark:text-slate-500", "faint"],
  ["text-slate-900", "dark:text-slate-100", "primary"],
  ["text-slate-700", "dark:text-slate-300", "primary"],
  ["text-slate-600", "dark:text-slate-400", "muted"],
  ["text-slate-500", "dark:text-slate-400", "muted"],
  ["text-neutral-900", "dark:text-neutral-100", "primary"],
  ["text-neutral-900", "dark:text-zinc-100", "primary"],
  ["text-neutral-700", "dark:text-neutral-300", "primary"],
  ["text-neutral-600", "dark:text-neutral-400", "muted"],
  ["text-neutral-600", "dark:text-zinc-300", "muted"],
  ["text-neutral-500", "dark:text-zinc-400", "muted"],
  ["text-neutral-500", "dark:text-neutral-400", "muted"],
];

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) { walk(full, files); continue; }
    if (extname(e.name) !== ".tsx") continue;
    if (PRIMITIVE_SOURCE_DIRS.some(rx => rx.test(full))) continue;
    files.push(full);
  }
  return files;
}

function transform(text) {
  const out = [];
  const openRe = /<Div\b/g;
  let m; let last = 0;
  while ((m = openRe.exec(text)) !== null) {
    out.push(text.slice(last, m.index));
    const start = m.index;
    let pos = start + m[0].length;
    let depth = 0; let selfClose = false;
    while (pos < text.length) {
      const ch = text[pos];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      else if (depth === 0 && ch === ">") {
        if (text[pos - 1] === "/") selfClose = true;
        break;
      }
      pos++;
    }
    if (pos >= text.length) { out.push(text.slice(start)); last = text.length; break; }
    const attrsEnd = selfClose ? pos - 1 : pos;
    const attrs = text.slice(start + m[0].length, attrsEnd);
    const fullMatch = text.slice(start, pos + 1);

    if (/\bcolor\s*=/.test(attrs)) { out.push(fullMatch); last = pos + 1; openRe.lastIndex = last; continue; }

    const strMatch = attrs.match(/className\s*=\s*"([^"]*)"/);
    if (!strMatch) { out.push(fullMatch); last = pos + 1; openRe.lastIndex = last; continue; }
    let tokens = strMatch[1].split(/\s+/).filter(Boolean);

    let foundValue = null;
    for (const [light, dark, val] of PAIRS) {
      const i1 = tokens.indexOf(light);
      const i2 = tokens.indexOf(dark);
      if (i1 !== -1 && i2 !== -1) {
        tokens = tokens.filter(t => t !== light && t !== dark);
        foundValue = val;
        break;
      }
    }
    if (!foundValue) { out.push(fullMatch); last = pos + 1; openRe.lastIndex = last; continue; }

    const propAddition = `color="${foundValue}"`;
    const remaining = tokens.join(" ").trim();
    let newAttrs;
    if (remaining === "") {
      newAttrs = attrs.replace(/\s*className\s*=\s*"[^"]*"/, "");
      newAttrs = newAttrs.replace(/\s+$/, "") + " " + propAddition;
    } else {
      newAttrs = attrs.replace(/className\s*=\s*"[^"]*"/, `className="${remaining}" ${propAddition}`);
    }
    const close = selfClose ? "/>" : ">";
    out.push(`<Div${newAttrs}${close}`);
    last = pos + 1;
    openRe.lastIndex = last;
  }
  out.push(text.slice(last));
  return out.join("");
}

let filesChanged = 0;
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const before = readFileSync(file, "utf8");
    const after = transform(before);
    if (after !== before) {
      writeFileSync(file, after);
      filesChanged++;
    }
  }
}
console.log(`Div extended color codemod modified ${filesChanged} files.`);
