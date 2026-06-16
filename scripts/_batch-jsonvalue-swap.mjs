#!/usr/bin/env node
/**
 * Batch swap Record<string, unknown> → Record<string, JsonValue> in admin
 * view components (small count, mostly dynamic-field-access patterns).
 * Adds JsonValue import after first import line.
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { execSync } from "node:child_process";

const FILES = `
appkit/src/features/admin/components/AdminBlogEditorView.tsx
appkit/src/features/admin/components/AdminContactView.tsx
appkit/src/features/admin/components/AdminCouponsView.tsx
appkit/src/features/admin/components/AdminDigitalCodesView.tsx
appkit/src/features/admin/components/AdminFaqEditorView.tsx
appkit/src/features/admin/components/AdminFeatureFlagsView.tsx
appkit/src/features/admin/components/AdminFeaturesView.tsx
appkit/src/features/admin/components/AdminLiveView.tsx
appkit/src/features/admin/components/AdminNewsletterView.tsx
appkit/src/features/admin/components/AdminOrderEditorView.tsx
appkit/src/features/admin/components/AdminPayoutsView.tsx
appkit/src/features/admin/components/AdminProductEditorView.tsx
appkit/src/features/admin/components/AdminProductsView.tsx
appkit/src/features/admin/components/AdminReviewsView.tsx
appkit/src/features/admin/components/AdminScammersView.tsx
appkit/src/features/admin/components/AdminStoresView.tsx
appkit/src/features/admin/components/AdminSupportTicketsView.tsx
appkit/src/features/admin/components/AdminTeamView.tsx
`.split("\n").map((s) => s.trim()).filter(Boolean);

const REPO = "d:/proj/letitrip.in/";
let attempted = 0, succeeded = 0, reverted = 0;

for (const rel of FILES) {
  const abs = REPO + rel;
  if (!existsSync(abs)) {
    console.log(`MISSING: ${rel}`);
    continue;
  }
  const before = readFileSync(abs, "utf8");
  if (!before.includes("Record<string, unknown>")) {
    console.log(`SKIP (already swapped): ${rel}`);
    continue;
  }
  attempted++;
  // Apply swap
  let after = before.replaceAll("Record<string, unknown>", "Record<string, JsonValue>");
  // Inject JsonValue import after first import line if not present
  if (!after.includes("import type { JsonValue }") && !/import .*JsonValue.* from/.test(after)) {
    const lines = after.split("\n");
    let firstImportIdx = -1;
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
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
  // tsc check
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
