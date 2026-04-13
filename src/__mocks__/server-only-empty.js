/**
 * Empty stub for server-only modules (e.g. firebase-admin/*).
 *
 * During the browser webpack compilation pass Next.js traces ALL imports
 * (including Server Component files) to locate client-component boundaries.
 * Server-only packages like firebase-admin are never *executed* in the
 * browser, but webpack still needs to resolve their module paths so it can
 * build the module graph.
 *
 * NormalModuleReplacementPlugin redirects every firebase-admin/* import to
 * this stub so the browser build succeeds without bundling Node.js packages.
 */
module.exports = {};
