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
const TAG = "Label";

const GAP_MAP = { "gap-1": "xs", "gap-1.5": "sm", "gap-2": "md", "gap-3": "lg" };

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
  const openRe = new RegExp(`<${TAG}\\b`, "g");
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

    if (/\b(layout|gap)\s*=/.test(attrs)) {
      out.push(fullMatch); last = pos + 1; openRe.lastIndex = last; continue;
    }
    const strMatch = attrs.match(/className\s*=\s*"([^"]*)"/);
    if (!strMatch) { out.push(fullMatch); last = pos + 1; openRe.lastIndex = last; continue; }
    const classValue = strMatch[1];

    let layout = null;
    if (/\binline-flex\b/.test(classValue) && /\bitems-center\b/.test(classValue)) layout = "inline-flex";
    else if (/\bflex\b(?!-)/.test(classValue) && /\bitems-center\b/.test(classValue)) layout = "flex";
    if (!layout) { out.push(fullMatch); last = pos + 1; openRe.lastIndex = last; continue; }

    let newClass = classValue;
    if (layout === "inline-flex") newClass = newClass.replace(/\binline-flex\b/g, "");
    if (layout === "flex") newClass = newClass.replace(/\bflex\b(?!-)/g, "");
    newClass = newClass.replace(/\bitems-center\b/g, "");

    let gapValue = null;
    const gapMatch = newClass.match(/\b(gap-(?:1|1\.5|2|3))\b/);
    if (gapMatch) {
      gapValue = GAP_MAP[gapMatch[1]];
      newClass = newClass.replace(gapMatch[0], "");
    }
    newClass = newClass.replace(/\s+/g, " ").trim();

    let newAttrs;
    if (newClass) {
      newAttrs = attrs.replace(/className\s*=\s*"[^"]*"/, `className="${newClass}"`);
    } else {
      newAttrs = attrs.replace(/\s*className\s*=\s*"[^"]*"/, "");
    }
    const gapProp = gapValue ? ` gap="${gapValue}"` : "";
    newAttrs = ` layout="${layout}"${gapProp}${newAttrs.startsWith(" ") ? newAttrs : " " + newAttrs}`;
    const close = selfClose ? "/>" : ">";
    out.push(`<${TAG}${newAttrs}${close}`);
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
    text = transform(text);
    if (text !== before) {
      writeFileSync(file, text);
      filesChanged++;
    }
  }
}
console.log(`Label-layout codemod modified ${filesChanged} files.`);
