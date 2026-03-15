import { Command } from "commander";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { findProjectRoot } from "../utils.js";

/** Known feature keys — expanded as @mohasinac/feat-* packages are published. */
const KNOWN_FEATURES = [
  "auth",
  "products",
  "categories",
  "events",
  "orders",
  "bookings",
  "reviews",
  "promotions",
  "blog",
  "sellers",
  "search",
  "notifications",
  "analytics",
  "media",
] as const;

/**
 * mohasinac list
 *
 * Reads features.config.ts and prints the enabled / disabled state for every
 * known feature, plus any unknown key that appears in the config file.
 */
export function listCommand(): Command {
  const cmd = new Command("list");
  cmd
    .alias("ls")
    .description("List all @mohasinac/feat-* features and their enabled state")
    .option("-r, --root <path>", "Project root (default: auto-detect)")
    .option("--enabled-only", "Show only enabled features")
    .action((opts: { root?: string; enabledOnly?: boolean }) => {
      const projectRoot = opts.root ?? findProjectRoot();
      const configPath = join(
        projectRoot,
        "src",
        "config",
        "features.config.ts",
      );
      const altConfigPath = join(projectRoot, "features.config.ts");

      const resolvedPath = existsSync(configPath)
        ? configPath
        : existsSync(altConfigPath)
          ? altConfigPath
          : null;

      const parsed: Record<string, boolean> = {};

      if (resolvedPath) {
        const source = readFileSync(resolvedPath, "utf8");
        const kvRe = /(\w+)\s*:\s*(true|false)/g;
        let m: RegExpExecArray | null;
        while ((m = kvRe.exec(source)) !== null) {
          parsed[m[1]] = m[2] === "true";
        }
      }

      const allKeys = Array.from(
        new Set([...KNOWN_FEATURES, ...Object.keys(parsed)]),
      ).sort();

      const rows = allKeys
        .map((key) => ({
          key,
          enabled: parsed[key] ?? false,
          pkg: `@mohasinac/feat-${key}`,
        }))
        .filter((r) => !opts.enabledOnly || r.enabled);

      if (rows.length === 0) {
        console.log("\n  No features found.\n");
        return;
      }

      console.log();
      console.log(
        "  Feature              Package                        State",
      );
      console.log(
        "  ─────────────────────────────────────────────────────────",
      );

      for (const { key, pkg, enabled } of rows) {
        const state = enabled ? "✔ enabled" : "  disabled";
        const paddedKey = key.padEnd(20);
        const paddedPkg = pkg.padEnd(30);
        console.log(`  ${paddedKey} ${paddedPkg} ${state}`);
      }

      console.log();

      if (!resolvedPath) {
        console.log(
          "  ℹ  No features.config.ts found — run 'mohasinac add <name>' to create one.",
        );
        console.log();
      }
    });

  return cmd;
}
