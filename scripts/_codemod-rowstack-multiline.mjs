#!/usr/bin/env node
/**
 * Multi-line Row/Stack align/justify/gap/wrap codemod.
 * Handles plain + template-literal className across multi-line opening tags.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];
const SKIP = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__", "scripts", "seed"]);
const PRIMITIVE_SOURCE_DIRS = [
  /[\\/]appkit[\\/]src[\\/]ui[\\/]components[\\/]/,
  /[\\/]appkit[\\/]src[\\/]ui[\\/]forms[\\/]/,
  /[\\/]appkit[\\/]src[\\/]ui[\\/]rich-text[\\/]/,
  /[\\/]appkit[\\/]src[\\/]features[\\/]email[\\/]/,
];

const ALIGN_MAP = new Map([
  ["items-start", "start"], ["items-center", "center"], ["items-end", "end"],
  ["items-stretch", "stretch"], ["items-baseline", "baseline"],
]);
const JUSTIFY_MAP = new Map([
  ["justify-start", "start"], ["justify-center", "center"], ["justify-end", "end"],
  ["justify-between", "between"], ["justify-around", "around"], ["justify-evenly", "evenly"],
]);
const GAP_MAP = new Map([
  ["gap-0", "none"], ["gap-px", "px"], ["gap-1", "xs"], ["gap-2", "sm"],
  ["gap-3", "3"], ["gap-4", "md"], ["gap-5", "5"], ["gap-6", "lg"],
  ["gap-8", "xl"], ["gap-12", "2xl"],
]);
const SPACE_Y_MAP = new Map([
  ["space-y-1", "xs"], ["space-y-2", "sm"], ["space-y-3", "3"], ["space-y-4", "md"],
  ["space-y-5", "5"], ["space-y-6", "lg"], ["space-y-8", "xl"],
]);
const SPACE_X_MAP = new Map([
  ["space-x-1", "xs"], ["space-x-2", "sm"], ["space-x-3", "3"], ["space-x-4", "md"],
  ["space-x-5", "5"], ["space-x-6", "lg"], ["space-x-8", "xl"],
]);

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

function splitTemplate(body) {
  const out = []; let i = 0; let buf = "";
  while (i < body.length) {
    if (body[i] === "$" && body[i + 1] === "{") {
      if (buf) out.push({ kind: "static", text: buf });
      buf = ""; let depth = 1; let j = i + 2;
      while (j < body.length && depth > 0) {
        if (body[j] === "{") depth++;
        else if (body[j] === "}") depth--;
        if (depth === 0) break;
        j++;
      }
      out.push({ kind: "interp", text: body.slice(i + 2, j) });
      i = j + 1;
    } else { buf += body[i]; i++; }
  }
  if (buf) out.push({ kind: "static", text: buf });
  return out;
}

function joinTemplate(parts) {
  return parts.map(p => p.kind === "static" ? p.text : `\${${p.text}}`).join("");
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
    const attrsEnd = selfClose ? pos - 1 : pos;
    const attrs = text.slice(start + m[0].length, attrsEnd);
    const fullMatch = text.slice(start, pos + 1);

    const tlMatch = attrs.match(/className\s*=\s*\{`([\s\S]*?)`\}/);
    const strMatch = attrs.match(/className\s*=\s*"([^"]*)"/);
    let isTemplate = false; let parts;
    if (tlMatch) { isTemplate = true; parts = splitTemplate(tlMatch[1]); }
    else if (strMatch) parts = [{ kind: "static", text: strMatch[1] }];
    else { out.push(fullMatch); last = pos + 1; openRe.lastIndex = last; continue; }

    const additions = {};
    function addProp(name, value) {
      if (new RegExp(`\\b${name}\\s*=`).test(attrs)) return false;
      if (additions[name]) return false;
      additions[name] = value;
      return true;
    }

    let touchedAny = false;
    for (let pi = 0; pi < parts.length; pi++) {
      if (parts[pi].kind !== "static") continue;
      let toks = parts[pi].text.split(/(\s+)/);
      const wordIdx = [];
      toks.forEach((t, idx) => { if (t && !/^\s+$/.test(t)) wordIdx.push(idx); });
      function removeAt(idx) { toks[idx] = ""; }

      const ai = wordIdx.find(i => ALIGN_MAP.has(toks[i]));
      if (ai !== undefined) {
        const v = ALIGN_MAP.get(toks[ai]);
        if (!(tag === "Stack" && v === "baseline") && addProp("align", v)) {
          removeAt(ai); touchedAny = true;
        }
      }

      if (tag === "Row") {
        const ji = wordIdx.find(i => JUSTIFY_MAP.has(toks[i]));
        if (ji !== undefined && addProp("justify", JUSTIFY_MAP.get(toks[ji]))) {
          removeAt(ji); touchedAny = true;
        }
      }

      const gi = wordIdx.find(i => GAP_MAP.has(toks[i]));
      if (gi !== undefined && addProp("gap", GAP_MAP.get(toks[gi]))) {
        removeAt(gi); touchedAny = true;
      } else if (tag === "Stack") {
        const sy = wordIdx.find(i => SPACE_Y_MAP.has(toks[i]));
        if (sy !== undefined && addProp("gap", SPACE_Y_MAP.get(toks[sy]))) {
          removeAt(sy); touchedAny = true;
        }
      } else if (tag === "Row") {
        const sx = wordIdx.find(i => SPACE_X_MAP.has(toks[i]));
        if (sx !== undefined && addProp("gap", SPACE_X_MAP.get(toks[sx]))) {
          removeAt(sx); touchedAny = true;
        }
      }

      if (tag === "Row") {
        const wi = wordIdx.find(i => toks[i] === "flex-wrap");
        if (wi !== undefined) {
          const hasWrapAttr = /\bwrap(\s*=|\b)/.test(attrs);
          if (!hasWrapAttr && addProp("wrap", true)) {
            removeAt(wi); touchedAny = true;
          } else if (hasWrapAttr) {
            removeAt(wi); touchedAny = true;
          }
        }
      }

      parts[pi].text = toks.join("").replace(/\s+/g, " ");
    }

    if (!touchedAny) { out.push(fullMatch); last = pos + 1; openRe.lastIndex = last; continue; }

    if (parts.length > 0 && parts[0].kind === "static") parts[0].text = parts[0].text.replace(/^\s+/, "");
    if (parts.length > 0 && parts[parts.length - 1].kind === "static") parts[parts.length - 1].text = parts[parts.length - 1].text.replace(/\s+$/, "");
    const newBody = joinTemplate(parts).replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");

    const propAdditions = Object.entries(additions).map(([k, v]) => (v === true ? k : `${k}="${v}"`)).join(" ");
    const replClass = isTemplate
      ? (newBody ? `className={\`${newBody}\`}` : "")
      : (newBody ? `className="${newBody}"` : "");
    const removeRe = isTemplate ? /\s*className\s*=\s*\{`[\s\S]*?`\}/ : /\s*className\s*=\s*"[^"]*"/;
    const keepRe = isTemplate ? /className\s*=\s*\{`[\s\S]*?`\}/ : /className\s*=\s*"[^"]*"/;
    let newAttrs;
    if (!newBody) {
      newAttrs = attrs.replace(removeRe, "");
      newAttrs = newAttrs.replace(/\s+$/, "") + (propAdditions ? " " + propAdditions : "");
    } else {
      newAttrs = attrs.replace(keepRe, `${replClass}${propAdditions ? " " + propAdditions : ""}`);
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
    for (const tag of ["Row", "Stack"]) {
      text = transform(text, tag);
    }
    if (text !== before) {
      writeFileSync(file, text);
      filesChanged++;
    }
  }
}
console.log(`Multi-line Row/Stack codemod modified ${filesChanged} files.`);
