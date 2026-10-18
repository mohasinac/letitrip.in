import { defineConfig } from "tsup";
import path from "node:path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  // Must track functions/package.json engines.node — this is the syntax level
  // esbuild downlevels to, and leaving it behind the runtime emits older
  // JS than the deployed Node can natively run.
  target: "node22",
  platform: "node",
  outDir: "lib",
  clean: true,
  sourcemap: true,
  /*
   * 🛑 "sharp" is MANDATORY here, not an optimisation. It is a native module
   * with per-platform prebuilt binaries — bundling it would inline a
   * win32-x64 .node into a bundle that runs on linux. External means Cloud
   * Build installs the right binary from functions/package.json instead.
   */
  external: ["firebase-admin", "firebase-functions", "sharp"],
  noExternal: ["@mohasinac/appkit"],
  esbuildOptions(options) {
    // `server-only` throws on import outside a React Server Component. The
    // Functions runtime IS a server, but esbuild's node platform resolves the
    // package's throwing `default` entry rather than the empty `react-server`
    // one — so any job that transitively imports appkit's email renderer
    // (dailyStatusDigest does) crashes the ENTIRE codebase at load time with
    // "This module cannot be imported from a Client Component module."
    // Alias it to a no-op here; the Next.js build resolves the real package
    // independently, so its client/server guard is unaffected.
    options.alias = {
      ...options.alias,
      "server-only": path.resolve(__dirname, "server-only-shim.js"),
    };
  },
});
