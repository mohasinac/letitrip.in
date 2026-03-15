/**
 * @mohasinac/cli — Node API
 *
 * Import these helpers directly into Next.js config / i18n request files —
 * no CLI invocation required.
 *
 * @example next.config.js
 *   const { withFeatures } = require("@mohasinac/cli/next");
 *
 * @example src/i18n/request.ts
 *   import { mergeFeatureMessages } from "@mohasinac/cli/i18n";
 */

// Next.js config helpers
export { withFeatures, resolveTranspilePackages } from "./next.js";

// i18n helpers
export { mergeFeatureMessages } from "./i18n.js";
