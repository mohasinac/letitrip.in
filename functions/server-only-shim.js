/**
 * No-op stand-in for the `server-only` npm package, used ONLY by the Firebase
 * Functions bundle (see tsup.config.ts's esbuild alias).
 *
 * `server-only` is a Next.js client/server boundary guard: its real entry point
 * unconditionally `throw`s, and Next swaps in an empty module under the
 * `react-server` export condition. That guard is correct inside the Next app —
 * `appkit/src/features/contact/email.tsx` imports it deliberately so the email
 * renderer can never be pulled into a Client Component.
 *
 * The Cloud Functions runtime, however, IS a server. esbuild bundles for
 * `platform: "node"` and so resolves `server-only` to the throwing `default`
 * entry, which detonates at codebase-load time the moment ANY job transitively
 * imports the email module — taking down every function in the codebase, not
 * just the importing one. That is exactly what happened when `dailyStatusDigest`
 * began sending its digest through `features/contact/email.tsx`:
 *
 *   Error: This module cannot be imported from a Client Component module.
 *          It should only be used from a Server Component.
 *
 * Aliasing to this empty module restores the semantics the guard actually
 * intends (no-op on a server) without weakening it for the Next.js build, which
 * resolves the real package independently.
 *
 * Same failure class as CLAUDE.md Recurrent Root Cause #24 (a top-level import
 * poisoning a whole bundle), with a boundary-marker package in place of a
 * `node:` builtin.
 */
module.exports = {};
