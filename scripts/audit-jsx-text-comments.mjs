#!/usr/bin/env node
/**
 * audit-jsx-text-comments.mjs — detect `//` line comments in JSX child position.
 *
 * A `//` comment placed between two JSX elements (e.g. directly after `>` and
 * before the next `<`) is NOT a comment to React — it is text content and gets
 * rendered into the DOM literally. This is how audit-suppression markers like
 * `// audit-inline-style-ok: ...` leaked to the top of every production page
 * once (BackgroundRenderer mounted near the root layout).
 *
 *   WRONG (renders as text):
 *     return (
 *       <>
 *         // audit-inline-style-ok: pass-through style prop
 *         <Div style={x} />
 *       </>
 *     );
 *
 *   CORRECT (comment sits inside the prop list, JS context):
 *     return (
 *       <>
 *         <Div
 *           // audit-inline-style-ok: pass-through style prop
 *           style={x}
 *         />
 *       </>
 *     );
 *
 *   ALSO CORRECT (JSX comment syntax):
 *     return (
 *       <>
 *         {/* audit-inline-style-ok: pass-through style prop *\/}
 *         <Div style={x} />
 *       </>
 *     );
 *
 * Heuristic: a `//` line where the previous non-empty line ends with a JSX
 * close (`>`, `/>`, `<>`, `}>`) and the next non-empty line starts with `<`.
 * `=>` (arrow function) is excluded.
 *
 * Exits 0 on clean, 1 on violations.
 */

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function gitListTsx(cwd) {
  try {
    return execSync("git ls-files \"*.tsx\"", { cwd, encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

const consumerFiles = gitListTsx(ROOT).map((f) => join(ROOT, f));
const appkitFiles = gitListTsx(join(ROOT, "appkit")).map((f) =>
  join(ROOT, "appkit", f),
);
const all = [...consumerFiles, ...appkitFiles];

const violations = [];

for (const file of all) {
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed.startsWith("//")) continue;
    let prev = "";
    for (let j = i - 1; j >= 0; j--) {
      const t = lines[j].trim();
      if (t) {
        prev = t;
        break;
      }
    }
    let next = "";
    for (let j = i + 1; j < lines.length; j++) {
      const t = lines[j].trim();
      if (t) {
        next = t;
        break;
      }
    }
    const prevEndsJsx =
      /(?<!=)>$/.test(prev) ||
      prev.endsWith("/>") ||
      prev.endsWith("<>") ||
      prev === "<>" ||
      prev.endsWith("}>");
    const nextStartsJsx = next.startsWith("<") && !next.startsWith("<=");
    if (prevEndsJsx && nextStartsJsx) {
      violations.push({
        file: file.replace(ROOT + "\\", "").replace(ROOT + "/", ""),
        line: i + 1,
        text: trimmed.slice(0, 100),
      });
    }
  }
}

if (violations.length === 0) {
  console.log(
    "audit-jsx-text-comments: no // comments in JSX child position found ✓",
  );
  process.exit(0);
}

const out = [
  `audit-jsx-text-comments: ${violations.length} violation(s) — \`//\` line comment in JSX child position renders as literal text in the DOM:`,
  "",
  ...violations.map((v) => `  ${v.file}:${v.line}  ${v.text}`),
  "",
  "Fix: move the comment INSIDE the next element's prop list (above the prop it documents),",
  "or convert to JSX comment syntax {/* ... */}.",
];

process.stderr.write(out.join("\n") + "\n");
process.exit(1);
