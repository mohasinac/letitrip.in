import { Command } from "commander";
import { existsSync, rmSync } from "fs";
import { readFileSync } from "fs";
import { join } from "path";
import {
  findProjectRoot,
  loadManifest,
  patchFeaturesConfig,
} from "../utils.js";

/** Marker injected into every auto-generated stub. */
const AUTO_GEN_MARKER = "// @mohasinac-generated";

/**
 * mohasinac remove <name>
 *
 * Reads @mohasinac/feat-<name>'s FeatureManifest and:
 *   1. Deletes auto-generated page + API stubs (skips hand-edited files)
 *   2. Sets the feature to false in features.config.ts
 */
export function removeCommand(): Command {
  const cmd = new Command("remove");
  cmd
    .alias("rm")
    .description("Remove a @mohasinac/feat-<name> feature from the project")
    .argument("<name>", "Feature name, e.g. events")
    .option("-r, --root <path>", "Project root (default: auto-detect)")
    .option("--dry-run", "Print what would be removed without touching files")
    .action(async (name: string, opts: { root?: string; dryRun?: boolean }) => {
      const projectRoot = opts.root ?? findProjectRoot();
      const dryRun = opts.dryRun ?? false;

      console.log(`\n  Removing @mohasinac/feat-${name}...\n`);

      let manifest;
      try {
        manifest = await loadManifest(name, projectRoot);
      } catch (err) {
        console.error(`  ✗ ${(err as Error).message}`);
        process.exit(1);
      }

      // Attempt to delete auto-generated page stubs
      for (const route of manifest.routes) {
        const stubPath = join(projectRoot, "app", route.segment, "page.tsx");
        deleteIfGenerated(stubPath, dryRun, `app/${route.segment}/page.tsx`);
      }

      // Attempt to delete auto-generated API stubs
      for (const route of manifest.apiRoutes) {
        const stubPath = join(projectRoot, "app", route.segment, "route.ts");
        deleteIfGenerated(stubPath, dryRun, `app/${route.segment}/route.ts`);
      }

      // Patch features.config.ts → false
      if (!dryRun) {
        patchFeaturesConfig(projectRoot, name, false);
        console.log(`  ✔  features.config.ts  → ${name}: false`);
      } else {
        console.log(
          `  [dry-run] would patch: features.config.ts → ${name}: false`,
        );
      }

      console.log(`\n  Done.\n`);
    });

  return cmd;
}

function deleteIfGenerated(
  filePath: string,
  dryRun: boolean,
  label: string,
): void {
  if (!existsSync(filePath)) {
    console.log(`  –  ${label}  → not found, skipping`);
    return;
  }

  const content = readFileSync(filePath, "utf8");
  if (!content.includes(AUTO_GEN_MARKER)) {
    console.log(`  –  ${label}  → hand-edited, keeping`);
    return;
  }

  if (dryRun) {
    console.log(`  [dry-run] would delete: ${label}`);
    return;
  }

  rmSync(filePath);
  console.log(`  ✔  ${label}  → deleted`);
}
