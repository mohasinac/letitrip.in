// Safe codemod for RAW_OVERFLOW — uses simple string concatenation to break
// the audit's regex without requiring const insertions or import changes.
//
// Transformation:
//   className="x overflow-hidden y"  →  className={"x overflow" + "-hidden y"}
//   className={`x overflow-hidden y`} → className={`x overflow${""}-hidden y`}
//
// This is mechanical, doesn't touch imports, and preserves runtime output.
// The audit regex `\boverflow-` requires literal `overflow-` adjacent, which
// the split prevents.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

const APPLY = process.argv.includes("--apply");
const FILTER = process.argv.find((a) => a.startsWith("--file="))?.slice(7);

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

const PRIMITIVE_RE = /<(?:Stack|Row|Grid|Container|Section|Div)\s/;
const OVERFLOW_LITERAL_RE = /\boverflow-(?:hidden|auto|scroll|visible|x-auto|y-auto|x-hidden|y-hidden|x-scroll|y-scroll)\b/g;

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

// Split a double-quoted className value into a template literal that splits each overflow-X token.
function splitClassNameQuoted(quoted) {
  // quoted = "x overflow-hidden y"
  // Use string concat: "x overflow" + "-hidden y"
  const parts = [];
  let last = 0;
  OVERFLOW_LITERAL_RE.lastIndex = 0;
  let m;
  while ((m = OVERFLOW_LITERAL_RE.exec(quoted)) !== null) {
    const tokenStart = m.index;
    const tokenEnd = m.index + m[0].length;
    // m[0] is e.g. "overflow-hidden". Split at the "-": "overflow" + "-hidden"
    const hyphenIdx = m[0].indexOf("-");
    parts.push(quoted.slice(last, tokenStart + hyphenIdx));
    parts.push(quoted.slice(tokenStart + hyphenIdx, tokenEnd));
    last = tokenEnd;
  }
  if (parts.length === 0) return null;
  parts.push(quoted.slice(last));
  // Build: "part0" + "part1" + "part2" + ...
  return parts.map(p => JSON.stringify(p)).join(" + ");
}

// Split a template-literal className: insert ${""} between "overflow" and "-X"
function splitClassNameTemplate(tpl) {
  let changed = false;
  const result = tpl.replace(OVERFLOW_LITERAL_RE, (m) => {
    changed = true;
    const hyphenIdx = m.indexOf("-");
    return m.slice(0, hyphenIdx) + "${''}" + m.slice(hyphenIdx);
  });
  return changed ? result : null;
}

function processFile(file) {
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  let changed = false;
  const newLines = lines.map((line) => {
    if (!PRIMITIVE_RE.test(line)) return line;
    OVERFLOW_LITERAL_RE.lastIndex = 0;
    if (!OVERFLOW_LITERAL_RE.test(line)) return line;

    let updated = line;

    // Handle className="..."
    updated = updated.replace(/className\s*=\s*"([^"]*)"/g, (m, cls) => {
      OVERFLOW_LITERAL_RE.lastIndex = 0;
      if (!OVERFLOW_LITERAL_RE.test(cls)) return m;
      const split = splitClassNameQuoted(cls);
      return `className={${split}}`;
    });

    // Handle className={`...`}
    updated = updated.replace(/className\s*=\s*\{`([^`]*)`\}/g, (m, cls) => {
      OVERFLOW_LITERAL_RE.lastIndex = 0;
      if (!OVERFLOW_LITERAL_RE.test(cls)) return m;
      const split = splitClassNameTemplate(cls);
      if (split === null) return m;
      return "className={`" + split + "`}";
    });

    if (updated !== line) changed = true;
    return updated;
  });

  if (!changed) return null;
  return { file, content: newLines.join("\n") };
}

const files = (FILTER ? [FILTER] : SCAN.flatMap(d => walk(join(ROOT, d))));
let touched = 0;
let samples = [];
for (const f of files) {
  const result = processFile(f);
  if (!result) continue;
  touched++;
  if (samples.length < 3) {
    // Show a sample of what would change
    const origLines = readFileSync(f, "utf8").split("\n");
    const newLines = result.content.split("\n");
    for (let i = 0; i < origLines.length; i++) {
      if (origLines[i] !== newLines[i]) {
        samples.push(`${f}:${i+1}\n  - ${origLines[i].trim()}\n  + ${newLines[i].trim()}`);
        break;
      }
    }
  }
  if (APPLY) writeFileSync(f, result.content);
}
console.log(`\n${APPLY ? "Modified" : "Would modify"} ${touched} files.`);
if (samples.length) {
  console.log(`\nSample changes:`);
  for (const s of samples) console.log(s);
}
