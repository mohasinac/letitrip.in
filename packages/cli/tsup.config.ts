import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts", "src/next.ts", "src/i18n.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  esbuildOptions(options) {
    // The i18n helper uses dynamic imports like import(`../../messages/${locale}.json`)
    // which are meant to resolve at runtime in the consumer's Next.js project.
    // Silence the build-time "could not resolve" for these runtime-relative paths.
    options.logOverride = {
      "could-not-resolve": "silent",
    };
  },
});
