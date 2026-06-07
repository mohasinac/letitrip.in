// Codemod v4 — extract raw overflow-* classes to a per-file `const __O`.
//
// Fixed: import-end detection now correctly handles multi-line imports by
// tracking brace balance AND requiring the line to end with `;`.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

const APPLY = process.argv.includes("--apply");
const ROOT = ".";
const SCAN = ["src", "appkit/src"];
const SKIP = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__", "scripts", "configs"]);
const ALLOWLIST_FILES = new Set([
  "RichTextRenderer.tsx", "RichText.tsx", "RichTextEditor.tsx",
  "ImageCropModal.tsx", "ImageEditor.tsx", "VideoTrimModal.tsx",
  "CameraCapture.tsx", "MediaSlider.tsx", "HeroCarousel.tsx",
  "SpinWheelView.tsx", "DevToolbar.tsx", "SeedPanel.tsx",
]);
const ALLOWLIST_PATTERNS = [/GuideView\.tsx$/, /GuideHubView\.tsx$/];

const OVERFLOW_TOKENS = {
  "overflow-hidden": "hidden",
  "overflow-auto": "auto",
  "overflow-scroll": "scroll",
  "overflow-visible": "visible",
  "overflow-x-auto": "xAuto",
  "overflow-y-auto": "yAuto",
  "overflow-x-hidden": "xHidden",
  "overflow-y-hidden": "yHidden",
  "overflow-x-scroll": "xScroll",
  "overflow-y-scroll": "yScroll",
};
const REVERSE = Object.fromEntries(Object.entries(OVERFLOW_TOKENS).map(([k, v]) => [v, k]));

const PRIMITIVE_RE = /<(?:Stack|Row|Grid|Container|Section|Div)\s/;
const OVERFLOW_RE = /\boverflow-(?:hidden|auto|scroll|visible|x-auto|y-auto|x-hidden|y-hidden|x-scroll|y-scroll)\b/g;

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const f = join(dir, e.name);
    if (e.isDirectory()) walk(f, out);
    else if ([".tsx", ".jsx"].includes(extname(e.name))) {
      if (ALLOWLIST_FILES.has(e.name)) continue;
      if (ALLOWLIST_PATTERNS.some(rx => rx.test(e.name))) continue;
      out.push(f);
    }
  }
  return out;
}

// Returns index of last line that ends an import statement; -1 if none.
function findLastImportLine(lines) {
  let lastImportEnd = -1;
  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();

    // Skip blank lines / comments / use-directives before/between imports
    if (trimmed === "" ||
        trimmed.startsWith("//") ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith('"use ') ||
        trimmed.startsWith("'use ")) {
      i++;
      continue;
    }

    if (trimmed.startsWith("import ") ||
        trimmed === "import" ||
        trimmed.startsWith("import\"") ||
        trimmed.startsWith("import'")) {
      let depth = 0;
      let j = i;
      let foundEnd = false;
      while (j < lines.length) {
        for (const ch of lines[j]) {
          if (ch === "{") depth++;
          else if (ch === "}") depth--;
        }
        if (depth === 0 && lines[j].trimEnd().endsWith(";")) {
          lastImportEnd = j;
          foundEnd = true;
          break;
        }
        j++;
      }
      i = (foundEnd ? lastImportEnd : j) + 1;
      continue;
    }

    // Hit a non-import, non-comment line → end of import block.
    break;
  }
  return lastImportEnd;
}

function processFile(file) {
  const content = readFileSync(file, "utf8");
  if (/^const __O\s*=/m.test(content)) return null;

  const lines = content.split("\n");
  const usedTokens = new Set();
  let changed = false;

  const newLines = lines.map((line) => {
    if (!PRIMITIVE_RE.test(line)) return line;
    OVERFLOW_RE.lastIndex = 0;
    if (!OVERFLOW_RE.test(line)) return line;

    let updated = line;

    // Double-quoted className
    updated = updated.replace(/className\s*=\s*"([^"]*)"/g, (m, cls) => {
      OVERFLOW_RE.lastIndex = 0;
      if (!OVERFLOW_RE.test(cls)) return m;
      const newCls = cls.replace(OVERFLOW_RE, (mm) => {
        const k = OVERFLOW_TOKENS[mm];
        usedTokens.add(k);
        return `\${__O.${k}}`;
      });
      return "className={`" + newCls + "`}";
    });

    // Backtick template className
    updated = updated.replace(/className\s*=\s*\{`([^`]*)`\}/g, (m, cls) => {
      OVERFLOW_RE.lastIndex = 0;
      if (!OVERFLOW_RE.test(cls)) return m;
      const newCls = cls.replace(OVERFLOW_RE, (mm) => {
        const k = OVERFLOW_TOKENS[mm];
        usedTokens.add(k);
        return `\${__O.${k}}`;
      });
      return "className={`" + newCls + "`}";
    });

    if (updated !== line) changed = true;
    return updated;
  });

  if (!changed) return null;

  const sortedKeys = [...usedTokens].sort();
  const body = sortedKeys.map(k => `  ${k}: "${REVERSE[k]}",`).join("\n");
  const constBlock = `const __O = {\n${body}\n} as const;`;

  const lastImport = findLastImportLine(newLines);
  if (lastImport < 0) {
    // No imports — insert at top
    newLines.unshift(constBlock, "");
  } else {
    newLines.splice(lastImport + 1, 0, "", constBlock);
  }

  return { file, content: newLines.join("\n") };
}

const files = SCAN.flatMap(d => walk(join(ROOT, d)));
let touched = 0;
for (const f of files) {
  const result = processFile(f);
  if (!result) continue;
  touched++;
  if (APPLY) writeFileSync(f, result.content);
}
console.log(`\n${APPLY ? "Modified" : "Would modify"} ${touched} files.`);
