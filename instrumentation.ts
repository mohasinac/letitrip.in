/**
 * Next.js Instrumentation Hook
 *
 * `register()` is called ONCE when the Node.js server process starts,
 * before any request is handled — including API routes.
 *
 * This is the correct place for one-time DI / provider registration.
 * Heavy observability (APM, error tracking, health checks) must NOT live
 * here on Vercel Hobby tier — use Firebase Functions (functions/src/) instead.
 *
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import { createInstrumentation } from "@mohasinac/instrumentation";

const { register } = createInstrumentation({
  onNodeServer: async () => {
    const { initProviders } = await import("./src/providers.config");
    await initProviders();
  },
});

export { register };
