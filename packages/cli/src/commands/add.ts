import { Command } from "commander";
import { join } from "path";
import {
  findProjectRoot,
  loadManifest,
  generateRouteStub,
  generateApiRouteStub,
  writeStub,
  patchFeaturesConfig,
  patchEnvExample,
} from "../utils.js";

/**
 * mohasinac add <name>
 *
 * Reads @mohasinac/feat-<name>'s FeatureManifest and:
 *   1. Writes 2-line page route stubs under app/[locale]/...
 *   2. Writes 2-line API route stubs under app/api/...
 *   3. Sets the feature to true in features.config.ts
 *   4. Appends missing env keys to .env.example
 */
export function addCommand(): Command {
  const cmd = new Command("add");
  cmd
    .description("Add a @mohasinac/feat-<name> feature to the project")
    .argument("<name>", "Feature name, e.g. events")
    .option("-r, --root <path>", "Project root (default: auto-detect)")
    .option("--dry-run", "Print what would be created without writing files")
    .action(async (name: string, opts: { root?: string; dryRun?: boolean }) => {
      const projectRoot = opts.root ?? findProjectRoot();
      const dryRun = opts.dryRun ?? false;

      console.log(`\n  Adding @mohasinac/feat-${name}...\n`);

      let manifest;
      try {
        manifest = await loadManifest(name, projectRoot);
      } catch (err) {
        console.error(`  ✗ ${(err as Error).message}`);
        process.exit(1);
      }

      // Write page route stubs
      for (const route of manifest.routes) {
        const stubPath = join(projectRoot, "app", route.segment, "page.tsx");
        const content = generateRouteStub(route, name);
        if (dryRun) {
          console.log(
            `  [dry-run] would create: app/${route.segment}/page.tsx`,
          );
        } else {
          const result = writeStub(stubPath, content);
          const icon = result === "created" ? "✔" : "–";
          const label = result === "created" ? "created" : "already exists";
          console.log(`  ${icon}  app/${route.segment}/page.tsx  → ${label}`);
        }
      }

      // Write API route stubs
      for (const route of manifest.apiRoutes) {
        const stubPath = join(projectRoot, "app", route.segment, "route.ts");
        const content = generateApiRouteStub(route, name);
        if (dryRun) {
          console.log(
            `  [dry-run] would create: app/${route.segment}/route.ts`,
          );
        } else {
          const result = writeStub(stubPath, content);
          const icon = result === "created" ? "✔" : "–";
          const label = result === "created" ? "created" : "already exists";
          console.log(`  ${icon}  app/${route.segment}/route.ts  → ${label}`);
        }
      }

      // Patch features.config.ts
      if (!dryRun) {
        patchFeaturesConfig(projectRoot, name, true);
        console.log(`  ✔  features.config.ts  → ${name}: true`);
      } else {
        console.log(
          `  [dry-run] would patch: features.config.ts → ${name}: true`,
        );
      }

      // Patch .env.example
      if (manifest.envKeys.length > 0) {
        if (!dryRun) {
          patchEnvExample(projectRoot, manifest.envKeys);
          console.log(`  ✔  .env.example  → ${manifest.envKeys.join(", ")}`);
        } else {
          console.log(
            `  [dry-run] would add to .env.example: ${manifest.envKeys.join(", ")}`,
          );
        }
      }

      console.log(`\n  Done.\n`);
    });

  return cmd;
}
