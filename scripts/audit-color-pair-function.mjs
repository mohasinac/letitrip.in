#!/usr/bin/env node
/**
 * audit-color-pair-function — enforces "colors as a function, not a
 * convention" (appkit/src/tokens/color-pairs.ts).
 *
 * Every layout primitive with a `surface` prop resolves its default text
 * color through getSurfaceTextClass() automatically (surface-tokens.ts).
 * This audit flags the one way that guarantee can still be defeated: a JSX
 * call site that sets BOTH `surface="X"` AND a manual `text-[var(--appkit-color-*)]`
 * (or a raw Tailwind text-color utility) in the same opening tag, silently
 * overriding the paired default with an unreviewed, independently-chosen
 * color. Flagging, not auto-fixing — some overrides are legitimate (a status
 * badge inside a neutral card, for instance); this just makes them visible.
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SCAN_DIRS = [join(ROOT, "appkit/src"), join(ROOT, "src")];
const SKIP_DIRS = new Set(["node_modules", "dist", ".next", "__tests__", ".claude"]);

const SURFACE_PROP = /surface="([a-zA-Z0-9-]+)"/;
const TEXT_COLOR_OVERRIDE = /text-\[var\(--appkit-color-text[a-z-]*\)\]|(?<!hover:)(?<!dark:)\btext-(?:zinc|slate|gray|red|blue|green|primary|secondary)-\d{2,3}\b/;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, files);
    } else if ([".tsx"].includes(extname(entry))) {
      files.push(full);
    }
  }
  return files;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  let files;
  try {
    files = walk(dir);
  } catch {
    continue;
  }
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    // Scan JSX opening tags (naive but effective: chunks between `<` and `>`
    // that contain both a surface prop and a className prop).
    const tagMatches = text.matchAll(/<[A-Za-z][\w.]*\s[^>]*?>/gs);
    for (const m of tagMatches) {
      const tag = m[0];
      if (!SURFACE_PROP.test(tag)) continue;
      const classNameMatch = tag.match(/className=(?:\{`([^`]*)`\}|\{"([^"]*)"\}|"([^"]*)")/);
      if (!classNameMatch) continue;
      const className = classNameMatch[1] ?? classNameMatch[2] ?? classNameMatch[3] ?? "";
      if (TEXT_COLOR_OVERRIDE.test(className)) {
        const line = text.slice(0, m.index).split("\n").length;
        const lineStart = text.lastIndexOf("\n", m.index) + 1;
        const prevLineStart = text.lastIndexOf("\n", lineStart - 2) + 1;
        const context = text.slice(prevLineStart, m.index + m[0].length);
        if (context.includes("audit-color-pair-function-ok")) continue;
        violations.push({ file: file.replace(ROOT, ""), line, snippet: tag.slice(0, 140).replace(/\s+/g, " ") });
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`audit-color-pair-function: ${violations.length} surface+manual-text-color combo(s) found — review each:\n`);
  for (const v of violations.slice(0, 50)) {
    console.error(`  ${v.file}:${v.line}\n    ${v.snippet}`);
  }
  if (violations.length > 50) console.error(`  ... and ${violations.length - 50} more`);
  console.error(`\nEach flagged site sets both \`surface\` and a manual text-color className in the same tag,`);
  console.error(`bypassing the paired default from getSurfaceTextPair() (appkit/src/tokens/color-pairs.ts).`);
  console.error(`If the override is intentional (e.g. a status accent on a neutral surface), leave a`);
  console.error(`comment explaining why; otherwise remove the manual override and let the surface pair through.`);
  process.exit(1);
}

console.log("audit-color-pair-function: clean ✓");
