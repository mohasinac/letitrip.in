#!/usr/bin/env node
/**
 * audit-email-raw-html.mjs
 *
 * Strict-zero. Flags any source file that builds an email payload by
 * concatenating raw HTML into a `html: \`<...` template-literal field —
 * the pattern the legacy `appkit/src/features/contact/email.ts` used to
 * embed `<table>` / `<tr>` / `<td>` markup directly in JS strings.
 *
 * The Phase 11 rewrite (commit `<TBD>`) moved every sender to compose
 * `<EmailDoc>` family primitives and serialise via `renderToStaticMarkup`.
 * Future regressions to the raw-HTML pattern fail this check.
 *
 * Scope: `appkit/src/features/**` + `appkit/src/_internal/**` + `src/**`.
 * Allowlist: the email primitives source itself + email tests + the
 * canonical re-export shims.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [
  join(ROOT, "src"),
  join(ROOT, "appkit", "src", "features"),
  join(ROOT, "appkit", "src", "_internal"),
];
const ALLOW_PATHS = [
  "appkit/src/features/email/primitives.tsx",
];
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "__tests__",
  "__mocks__",
]);

// Match `html: \`<` (i.e. the field "html" holding a template literal that
// opens with an HTML tag). The renderToStaticMarkup output also assigns to
// `html: \`<!DOCTYPE…` — that's caught by the same regex, BUT those callsites
// always wrap a `renderToStaticMarkup(<` call inside the literal. The audit
// distinguishes by requiring the template literal NOT contain
// `renderToStaticMarkup` in the next 200 chars.
const RAW_HTML_RE = /html:\s*`<[\s\S]{0,200}/g;

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { walk(full, files); continue; }
    if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) continue;
    files.push(full);
  }
  return files;
}

function isAllowed(file) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  return ALLOW_PATHS.some((p) => rel === p || rel.startsWith(p + "/"));
}

const violations = [];
for (const root of SCAN_DIRS) {
  for (const file of walk(root)) {
    if (isAllowed(file)) continue;
    const text = readFileSync(file, "utf8");
    if (!/html:\s*`</.test(text)) continue;
    for (const match of text.matchAll(RAW_HTML_RE)) {
      const slice = match[0];
      // Allow renderToStaticMarkup-generated payloads; flag direct raw HTML.
      if (slice.includes("renderToStaticMarkup")) continue;
      const before = text.slice(0, match.index ?? 0);
      const line = before.split("\n").length;
      violations.push({
        file: relative(ROOT, file).replace(/\\/g, "/"),
        line,
        snippet: slice.replace(/\s+/g, " ").slice(0, 80),
      });
    }
  }
}

if (violations.length === 0) {
  console.log("audit-email-raw-html: clean ✓");
  process.exit(0);
}

console.error(
  `audit-email-raw-html: STRICT-ZERO violation(s) — ${violations.length} raw-HTML email payload(s) found.\n`,
);
console.error(
  "Compose <EmailDoc> family primitives from appkit/src/features/email/primitives.tsx + serialise via renderToStaticMarkup.\n",
);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ${v.snippet}…`);
}
process.exit(1);
