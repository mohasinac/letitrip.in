#!/usr/bin/env node
/**
 * Map compound `px-N py-N` pairs on Div/Stack/Row/Grid/Container/Section
 * to the existing PADDING_MAP inline-style presets.
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

const TAGS = ["Div", "Stack", "Row", "Grid", "Container", "Section"];

// PADDING_MAP keys: inlineSm=px-3 py-2, inline=px-4 py-3, inlineLg=px-6 py-4,
// toolbar=px-3 py-1.5, card=p-5 sm:p-6 lg:p-8, card-tight=p-3 sm:p-4
const PADDING_PAIRS = [
  [["px-3", "py-2"], "inlineSm"],
  [["px-4", "py-3"], "inline"],
  [["px-6", "py-4"], "inlineLg"],
  [["px-3", "py-1.5"], "toolbar"],
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

      for (const [pair, value] of PADDING_PAIRS) {
        const i1 = wordIdx.find(i => toks[i] === pair[0]);
        const i2 = wordIdx.find(i => toks[i] === pair[1]);
        if (i1 !== undefined && i2 !== undefined) {
          if (addProp("padding", value)) {
            removeAt(i1); removeAt(i2);
            touchedAny = true;
          }
          break;
        }
      }

      parts[pi].text = toks.join("").replace(/\s+/g, " ");
    }

    if (!touchedAny) { out.push(fullMatch); last = pos + 1; openRe.lastIndex = last; continue; }

    if (parts.length > 0 && parts[0].kind === "static") parts[0].text = parts[0].text.replace(/^\s+/, "");
    if (parts.length > 0 && parts[parts.length - 1].kind === "static") parts[parts.length - 1].text = parts[parts.length - 1].text.replace(/\s+$/, "");
    const newBody = joinTemplate(parts).replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");

    const propAdditions = Object.entries(additions).map(([k, v]) => `${k}="${v}"`).join(" ");
    const replClass = isTemplate
      ? (newBody ? `className={\`${newBody}\`}` : "")
      : (newBody ? `className="${newBody}"` : "");
    const removeRe = isTemplate ? /\s*className\s*=\s*\{`[\s\S]*?`\}/ : /\s*className\s*=\s*"[^"]*"/;
    const keepRe = isTemplate ? /className\s*=\s*\{`[\s\S]*?`\}/ : /className\s*=\s*"[^"]*"/;
    let newAttrs;
    if (!newBody) {
      newAttrs = attrs.replace(removeRe, "");
      newAttrs = newAttrs.replace(/\s+$/, "") + " " + propAdditions;
    } else {
      newAttrs = attrs.replace(keepRe, `${replClass} ${propAdditions}`);
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
console.log(`Compound padding codemod modified ${filesChanged} files.`);
