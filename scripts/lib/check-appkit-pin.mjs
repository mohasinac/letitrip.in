// Pure, side-effect-free check used by dev-light.mjs's appkit local-dev pin
// guard. Extracted to its own module so it can be unit-tested without
// executing dev-light.mjs's memory guard / build pipeline as an import
// side effect.

/**
 * Returns the offending version spec string when package.json pins
 * "@mohasinac/appkit" to the npm registry instead of "file:./appkit", or
 * null when the pin is correct (or the dependency isn't present at all).
 */
export function checkAppkitPin(pkg) {
  const appkitSpec = pkg.dependencies?.["@mohasinac/appkit"];
  if (appkitSpec && !appkitSpec.startsWith("file:")) return appkitSpec;
  return null;
}
