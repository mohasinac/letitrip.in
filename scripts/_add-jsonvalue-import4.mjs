#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const FILES = `
src/app/[locale]/checkout/page.tsx
src/app/[locale]/events/[id]/layout.tsx
src/app/[locale]/events/[id]/page.tsx
src/app/[locale]/events/[id]/participate/page.tsx
`.split("\n").map((s) => s.trim()).filter(Boolean);

for (const rel of FILES) {
  const abs = "d:/proj/letitrip.in/" + rel;
  if (!existsSync(abs)) {
    console.log(`MISSING: ${rel}`);
    continue;
  }
  let src = readFileSync(abs, "utf8");
  if (src.includes("import type { JsonValue }")) {
    console.log(`SKIP: ${rel}`);
    continue;
  }
  const lines = src.split("\n");
  let firstImportIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    if (/^import /.test(lines[i])) { firstImportIdx = i; break; }
  }
  if (firstImportIdx === -1) {
    console.log(`NO IMPORT: ${rel}`);
    continue;
  }
  lines.splice(firstImportIdx + 1, 0, `import type { JsonValue } from "@mohasinac/appkit";`);
  writeFileSync(abs, lines.join("\n"));
  console.log(`ADDED: ${rel}`);
}
