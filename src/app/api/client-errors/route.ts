import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse } from "@mohasinac/appkit";
import { serverErrorsRepository } from "@mohasinac/appkit/server";
import { z } from "zod";

/**
 * Client-error ingestion endpoint. POST-only. Accepts unauthenticated reports
 * (clients can be unauthenticated when something fails) and writes them to the
 * unified `serverErrors` collection with `source: "client"`.
 *
 * Rate limiting is enforced upstream (in production, via Vercel / Cloudflare
 * front of API). For an in-process limiter, see appkit's rate-limit helper.
 */
const clientErrorSchema = z.object({
  code: z.string().min(1).max(64),
  message: z.string().min(1).max(2048),
  stack: z.string().max(8192).optional(),
  componentStack: z.string().max(8192).optional(),
  requestId: z.string().max(128).optional(),
  route: z.string().max(2048).optional(),
  userAgent: z.string().max(1024).optional(),
});

// rbac-public: client error reporter — auth optional so anonymous browsers can submit error telemetry, payload validated by clientErrorSchema
export const POST = withProviders(
  createRouteHandler({
    authOptional: true,
    schema: clientErrorSchema,
    handler: async ({ body, user, request }) => {
      await serverErrorsRepository().record({
        source: "client",
        route: body!.route ?? "(unknown)",
        method: "POST",
        userId: user?.uid,
        code: body!.code,
        message: body!.message,
        stack: body!.stack,
        componentStack: body!.componentStack,
        requestId: body!.requestId ?? "client-self",
        userAgent: body!.userAgent ?? request.headers.get("user-agent") ?? undefined,
      });
      return successResponse({ recorded: true });
    },
  }),
);
