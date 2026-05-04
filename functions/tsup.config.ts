import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  target: "node20",
  platform: "node",
  outDir: "lib",
  clean: true,
  sourcemap: true,
  // firebase-admin and firebase-functions are provided by the Cloud Run runtime;
  // do not bundle them so the runtime version is used.
  external: ["firebase-admin", "firebase-functions"],
});
