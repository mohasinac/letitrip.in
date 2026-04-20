/**
 * Next.js Instrumentation Hook
 *
 * `register()` is called ONCE when the server process starts, before any
 * request is handled. The dynamic import of providers.config is deferred
 * inside the onNodeServer callback so it only runs on the Node.js runtime.
 * The appkit files that were previously triggering Edge warnings (server-logger,
 * admin, encryption) now use lazy require() for Node built-ins (fs, path,
 * crypto), so this import chain no longer causes Edge Runtime warnings.
 *
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import { createInstrumentation } from "@mohasinac/appkit/instrumentation";

const { register } = createInstrumentation({
  onNodeServer: async () => {
    const { initProviders } = await import("./src/providers.config");
    await initProviders();
  },
});

export { register };

