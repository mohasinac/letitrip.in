#!/usr/bin/env node
/**
 * Generic batch swap helper - takes file paths as args.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const FILES = process.argv.slice(2);
const REPO = "d:/proj/letitrip.in/";
let attempted = 0, succeeded = 0, reverted = 0;

for (const rel of FILES) {
  const abs = rel.startsWith("/d/") ? rel.replace("/d/", "d:/") : REPO + rel;
  if (!existsSync(abs)) {
    console.log(`MISSING: ${rel}`);
    continue;
  }
  const before = readFileSync(abs, "utf8");
  if (!before.includes("Record<string, unknown>")) {
    console.log(`SKIP (no pattern): ${rel}`);
    continue;
  }
  attempted++;
  let after = before.replaceAll("Record<string, unknown>", "Record<string, JsonValue>");
  if (!after.includes("import type { JsonValue }") && !/import .*JsonValue.*from/.test(after)) {
    const lines = after.split("\n");
    let firstImportIdx = -1;
    for (let i = 0; i < Math.min(lines.length, 30); i++) {
      if (/^import /.test(lines[i])) { firstImportIdx = i; break; }
    }
    if (firstImportIdx === -1) {
      console.log(`NO IMPORT: ${rel}`);
      continue;
    }
    lines.splice(firstImportIdx + 1, 0, `import type { JsonValue } from "@mohasinac/appkit";`);
    after = lines.join("\n");
  }
  writeFileSync(abs, after);
  try {
    const out = execSync(`cd ${REPO}appkit && npx tsc --noEmit --pretty false 2>&1`, { encoding: "utf8", timeout: 120000 });
    const fileBasename = abs.split("/").pop();
    if (out.includes(fileBasename)) {
      writeFileSync(abs, before);
      console.log(`REVERTED (tsc failed): ${rel}`);
      reverted++;
    } else {
      console.log(`OK: ${rel}`);
      succeeded++;
    }
  } catch (e) {
    const out = (e.stdout?.toString?.() ?? "") + (e.stderr?.toString?.() ?? "");
    const fileBasename = abs.split("/").pop();
    if (out.includes(fileBasename)) {
      writeFileSync(abs, before);
      console.log(`REVERTED (tsc failed): ${rel}`);
      reverted++;
    } else {
      console.log(`OK (other errors only): ${rel}`);
      succeeded++;
    }
  }
}

console.log(`\nAttempted ${attempted}, succeeded ${succeeded}, reverted ${reverted}`);
