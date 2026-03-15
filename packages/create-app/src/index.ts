#!/usr/bin/env node
/**
 * @mohasinac/create-app — interactive project scaffolder
 *
 * Usage:
 *   npx @mohasinac/create-app
 */

import { createInterface } from "readline";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";

import { runPrompts } from "./prompts.js";
import { generateProvidersConfig } from "./providers.js";
import { generateFeaturesConfig, writeFeaturePageStubs } from "./features.js";
import {
  generateEnvExample,
  generateI18nRequest,
  generateMiddleware,
  generateNextConfig,
  generateRootLayout,
  generateSiteConfig,
  generateThemeConfig,
} from "./generators.js";

// ─── helpers ──────────────────────────────────────────────────────────────────

function write(absTarget: string, relPath: string, content: string): void {
  const full = join(absTarget, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, "utf-8");
}

function isEmptyDir(dir: string): boolean {
  try {
    return readdirSync(dir).length === 0;
  } catch {
    return true;
  }
}

function confirm(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (ans) => {
      rl.close();
      resolve(["y", "yes"].includes(ans.trim().toLowerCase()));
    });
  });
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { projectName, locales, providers, features, targetDir } =
    await runPrompts();
  const absTarget = resolve(process.cwd(), targetDir);

  if (existsSync(absTarget) && !isEmptyDir(absTarget)) {
    const ok = await confirm(
      `\n  Directory "${targetDir}" exists and is not empty. Continue? [y/N] `,
    );
    if (!ok) {
      console.log("\n  Scaffold cancelled.");
      process.exit(0);
    }
  }

  mkdirSync(absTarget, { recursive: true });
  console.log("\n  Scaffolding files…\n");

  const created: string[] = [];

  function gen(relPath: string, content: string): void {
    write(absTarget, relPath, content);
    created.push(relPath);
  }

  // ── Config files ──────────────────────────────────────────────────────────
  gen("providers.config.ts", generateProvidersConfig(providers));
  gen("features.config.ts", generateFeaturesConfig(features));
  gen("next.config.js", generateNextConfig());
  gen(".env.example", generateEnvExample(providers));
  gen("constants/site.ts", generateSiteConfig(projectName, locales));
  gen("constants/theme.ts", generateThemeConfig());
  gen("i18n/request.ts", generateI18nRequest(locales));
  gen("middleware.ts", generateMiddleware(locales, providers.auth));
  gen("app/[locale]/layout.tsx", generateRootLayout(projectName, locales));

  // ── Locale message stubs ──────────────────────────────────────────────────
  for (const locale of locales) {
    gen(`messages/${locale}.json`, "{}");
  }

  // ── Feature page stubs ────────────────────────────────────────────────────
  const stubLog = writeFeaturePageStubs(features, absTarget);
  for (const entry of stubLog) {
    if (entry.result === "created") created.push(entry.path);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("  Created:\n");
  const shown = created.slice(0, 24);
  for (const f of shown) console.log(`    + ${f}`);
  if (created.length > 24) console.log(`    … and ${created.length - 24} more`);

  console.log(`\n  Next steps:\n`);
  console.log(`    cd ${targetDir}`);
  console.log(`    npm install`);
  console.log(`    cp .env.example .env.local  # fill in secrets`);
  for (const f of features) console.log(`    npx @mohasinac/cli add ${f}`);
  console.log(`    npm run dev`);
  console.log(`\n  Done! ${projectName} scaffolded in ${targetDir}\n`);
}

main().catch((err: unknown) => {
  console.error("\n  Error:", String(err));
  process.exit(1);
});
