/**
 * Node.js-only instrumentation.
 *
 * This file is ONLY bundled for the Node.js runtime.
 * Next.js will not include it in Edge bundles because it is imported behind a
 * `NEXT_RUNTIME === 'nodejs'` guard in instrumentation.ts.
 *
 * Keep this file free of Edge-incompatible imports (firebase-admin, fs, path,
 * crypto) — they all live transitively inside providers.config.
 */
import { initProviders } from "./src/providers.config";

export async function register(): Promise<void> {
  await initProviders();
}
