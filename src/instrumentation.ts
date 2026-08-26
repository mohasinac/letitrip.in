/**
 * Next.js Instrumentation Hook
 *
 * `register()` is called ONCE when the Node.js server process starts, before
 * any request is handled — the correct place for one-time provider
 * registration and DI setup.
 *
 * IMPORTANT — this file must live at `src/instrumentation.ts`, NOT the repo
 * root. Next.js only looks for the root `instrumentation.ts` when the project
 * has no `src/` directory; this app has `src/app`, so the root copy is never
 * loaded. A root `instrumentation.ts` previously carried the deployment-digest
 * wiring while this file did not, which is why no digest was ever sent on a
 * deploy: the code existed but sat in the file Next.js ignores.
 *
 * Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

/**
 * Identifies the running build. On Vercel this is the commit SHA (unique per
 * deploy); locally it falls back to the package version, so restarting
 * `npm run dev` repeatedly doesn't re-send the deployment digest.
 */
function resolveDeploymentVersion(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (sha) return sha.slice(0, 12);
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID?.trim();
  if (deploymentId) return deploymentId;
  return process.env.npm_package_version?.trim() || "local";
}

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { initProviders } = await import("./providers.config");
  await initProviders();

  // Deployment digest — one email per deployed version, not per cold start.
  // Vercel runs register() on every lambda cold start, so the send is guarded
  // by a Firestore version marker claimed in a transaction (see
  // runDeploymentDigest). Fire-and-forget with its own catch: a digest failure
  // must never stop the server from coming up.
  void (async () => {
    try {
      const { triggerDeploymentDigest } = await import("@mohasinac/appkit/server");
      const result = await triggerDeploymentDigest(resolveDeploymentVersion());
      if (result.sent) console.log("[instrumentation] Deployment digest sent");
    } catch (error) {
      // Dynamic import, matching the rest of this file: instrumentation runs at
      // process start before the app boots, so it deliberately keeps appkit off
      // the top-level import graph. The module is already resolved by this point
      // (the try block imported from it), so this costs nothing.
      const { normalizeError } = await import("@mohasinac/appkit");
      void normalizeError(error);
      console.error("[instrumentation] Deployment digest failed (non-fatal):", error);
    }
  })();
}

/**
 * Next.js error-reporting hook. Called for every uncaught server-side error —
 * **including RSC render errors and Server Action failures**, which never pass
 * through `createRouteHandler` and were therefore recorded nowhere at all.
 *
 * Why this matters: in production React replaces the real message with error
 * #441 ("An error occurred in the Server Components render… A digest property
 * is included"). The digest is the ONLY link back to the real error, and
 * without this hook it linked to nothing. Diagnosing the 2026-08-26 homepage
 * crash meant hand-parsing the RSC flight payload to find which subtree the
 * digest belonged to.
 *
 * `err.digest` is what the browser reports, so it is stored as `code` — that is
 * the field the admin list at /admin/maintenance/server-errors surfaces, making
 * a user-reported digest directly searchable.
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation#onrequesterror-optional
 */
export async function onRequestError(
  err: unknown,
  request: { path?: string; method?: string; headers?: Record<string, string | undefined> },
  context: { routerKind?: string; routePath?: string; routeType?: string },
): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { serverErrorsRepository } = await import("@mohasinac/appkit/server");
    const error = err as (Error & { digest?: string }) | undefined;

    await serverErrorsRepository().record({
      source: "vercel",
      route: context?.routePath || request?.path || "(unknown)",
      method: request?.method,
      // The digest is the user-visible identifier; fall back to the route type
      // so a row is never left without a code.
      code: error?.digest ?? `RSC_${context?.routeType ?? "unknown"}`,
      message: error?.message ?? String(err),
      stack: error?.stack,
      requestId: error?.digest ?? "rsc-no-digest",
      userAgent: request?.headers?.["user-agent"],
    });
  } catch (recordError) {
    // Never let error reporting throw inside the error path. Dynamic import to
    // match the rest of this file — instrumentation runs before the app boots,
    // so appkit stays off the top-level import graph.
    const { normalizeError } = await import("@mohasinac/appkit");
    void normalizeError(recordError);
    console.error("[instrumentation] onRequestError failed (non-fatal):", recordError);
  }
}
