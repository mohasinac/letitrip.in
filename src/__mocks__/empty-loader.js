/**
 * Empty webpack loader — stubs a module with an empty CommonJS export.
 *
 * Used in next.config.js to replace server-only packages (firebase-admin,
 * firebase-admin/* subpaths) with an empty object in the browser webpack
 * build.  The replaced modules are never executed in the browser; this loader
 * only prevents "Module not found" errors when webpack's static analyser
 * traces server-component imports into firebase-admin territory.
 */
module.exports = function emptyLoader() {
  return "module.exports = {};";
};
module.exports.raw = false;
