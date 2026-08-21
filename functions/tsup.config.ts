import { defineConfig } from "tsup";
import path from "node:path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  target: "node20",
  platform: "node",
  outDir: "lib",
  clean: true,
  sourcemap: true,
  external: ["firebase-admin", "firebase-functions"],
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
