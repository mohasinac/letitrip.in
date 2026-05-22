import { defineConfig } from "tsup";

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
});
