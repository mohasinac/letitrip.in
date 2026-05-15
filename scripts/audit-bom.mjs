#!/usr/bin/env node
/**
 * audit-bom — detects UTF-8 BOM (0xEF 0xBB 0xBF) in source files.
 *
 * PowerShell 5.1 writes UTF-16 LE with BOM by default; piping through
 * Out-File / Set-Content without -Encoding utf8NoBOM silently prepends
 * the 3-byte BOM. TypeScript/webpack tolerate it locally but it can
 * produce garbage characters in build output and confuse downstream tools.
 *
 * Scans .ts, .tsx, .js, .mjs, .cjs files in:
 *   src/          appkit/src/          scripts/
 *
 * Skips: node_modules, .next, dist, .git
 *
 * Exits 0 — clean
 * Exits 1 — BOM found (lists every offending file)
 */

import { readdirSync, openSync, readSync, closeSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [
  join(ROOT, "src"),
  join(ROOT, "appkit", "src"),
  join(ROOT, "scripts"),
];

const SKIP_DIRS = new Set(["node_modules", ".next", "dist", ".git"]);
const SCAN_EXTS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs"]);

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (SCAN_EXTS.has(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function hasBom(filePath) {
  const buf = Buffer.alloc(3);
  let fd;
  try {
    fd = openSync(filePath, "r");
    const bytesRead = readSync(fd, buf, 0, 3, 0);
    return bytesRead === 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  } catch {
    return false;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

const bomFiles = [];
for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    if (hasBom(file)) bomFiles.push(relative(ROOT, file));
  }
}

if (bomFiles.length === 0) {
  console.log("audit-bom: clean");
  process.exit(0);
}

console.error(`audit-bom: ${bomFiles.length} file(s) contain a UTF-8 BOM (PowerShell encoding artifact).\n`);
console.error("Fix with PowerShell:");
console.error('  Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js,*.mjs | ForEach-Object {');
console.error('    $b = [IO.File]::ReadAllBytes($_.FullName)');
console.error('    if ($b.Length -ge 3 -and $b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF) {');
console.error('      [IO.File]::WriteAllBytes($_.FullName, $b[3..($b.Length-1)])');
console.error('    }');
console.error('  }\n');
console.error("Affected files:");
for (const f of bomFiles) console.error(`  ${f}`);
process.exit(1);
