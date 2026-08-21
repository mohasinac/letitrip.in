/**
 * Next.js Instrumentation Hook
 *
 * `register()` is called ONCE when the Node.js server process starts,
 * before any request is handled. This is the correct place for one-time
 * provider registration and DI setup.
 *
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

/**
 * Identifies the running build. On Vercel this is the commit SHA (unique per
 * deploy); locally it falls back to the package version, so restarting `npm
 * run dev` repeatedly doesn't re-send the deployment digest.
 */
function resolveDeploymentVersion(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (sha) return sha.slice(0, 12);
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID?.trim();
  if (deploymentId) return deploymentId;
  return process.env.npm_package_version?.trim() || "local";
}

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { initProviders } = await import("./src/providers.config");
      await initProviders();
      console.log("[instrumentation] Providers initialized successfully");
    } catch (error) {
      console.error("[instrumentation] Provider initialization failed:", error);
      throw error; // Fail fast on provider initialization error
    }

    // Deployment digest — one email per deployed version, not per cold start.
    // Vercel runs register() on every lambda cold start, so the send is
    // guarded by a Firestore version marker claimed in a transaction (see
    // runDeploymentDigest). Fire-and-forget with its own catch: a digest
    // failure must never stop the server from coming up.
    void (async () => {
      try {
        const { triggerDeploymentDigest } = await import("@mohasinac/appkit/server");
        const result = await triggerDeploymentDigest(resolveDeploymentVersion());
        if (result.sent) console.log("[instrumentation] Deployment digest sent");
      } catch (error) {
        console.error("[instrumentation] Deployment digest failed (non-fatal):", error);
      }
    })();
  }
}
