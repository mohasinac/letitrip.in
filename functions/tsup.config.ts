import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  platform: "node",
  outDir: "lib",
  clean: true,
  sourcemap: true,
  // firebase-admin and firebase-functions are provided by the Cloud Run runtime;
  // do not bundle them so the runtime version is used.
  external: ["firebase-admin", "firebase-functions"],
  // Inject ESM-compatible __dirname/__filename shims so CJS modules bundled
  // from appkit (e.g. next/server's ua-parser-js) don't throw at load time.
  shims: true,
});
