#!/usr/bin/env node
/**
 * Migrate Section padding="y-2-5xl" + className "md:py-16 lg:py-20" -> padding="banner".
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__", "scripts", "seed"]);
const PRIMITIVE_SOURCE_DIRS = [
  /[\\/]appkit[\\/]src[\\/]ui[\\/]components[\\/]/,
  /[\\/]appkit[\\/]src[\\/]features[\\/]email[\\/]/,
];
const TAGS = ["Section", "Div"];

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

function transform(text, tag) {
  const out = [];
  const openRe = new RegExp(`<${tag}\\b`, "g");
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
    const attrs = text.slice(start + m[0].length, selfClose ? pos - 1 : pos);
    const fullMatch = text.slice(start, pos + 1);

    if (!/\bpadding="y-2-5xl"/.test(attrs)) {
      out.push(fullMatch); last = pos + 1; openRe.lastIndex = last; continue;
    }
    const strMatch = attrs.match(/className\s*=\s*"([^"]*)"/);
    if (!strMatch) { out.push(fullMatch); last = pos + 1; openRe.lastIndex = last; continue; }
    const cv = strMatch[1];
    if (!/\bmd:py-16\b/.test(cv) || !/\blg:py-20\b/.test(cv)) {
      out.push(fullMatch); last = pos + 1; openRe.lastIndex = last; continue;
    }

    const newClass = cv.replace(/\bmd:py-16\b/g, "").replace(/\blg:py-20\b/g, "").replace(/\s+/g, " ").trim();
    let newAttrs = attrs.replace(/\bpadding="y-2-5xl"/, `padding="banner"`);
    if (newClass) {
      newAttrs = newAttrs.replace(/className\s*=\s*"[^"]*"/, `className="${newClass}"`);
    } else {
      newAttrs = newAttrs.replace(/\s*className\s*=\s*"[^"]*"/, "");
    }
    const close = selfClose ? "/>" : ">";
    out.push(`<${tag}${newAttrs}${close}`);
    last = pos + 1;
    openRe.lastIndex = last;
  }
  out.push(text.slice(last));
  return out.join("");
}

let filesChanged = 0;
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    let text = readFileSync(file, "utf8");
    const before = text;
    for (const tag of TAGS) {
      text = transform(text, tag);
    }
    if (text !== before) {
      writeFileSync(file, text);
      filesChanged++;
    }
  }
}
console.log(`Banner-pad codemod modified ${filesChanged} files.`);
