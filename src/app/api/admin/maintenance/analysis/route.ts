import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse } from "@mohasinac/appkit";
import { analyzeLogs } from "@mohasinac/appkit/server";
import { z } from "zod";
import { ROLES_ANY_STAFF } from "@/constants";

/**
 * Run the maintenance log analysis from the admin UI. Gated by the
 * `admin:maintenance:run-analysis` permission. Returns the same JSON shape
 * that `scripts/analyze-logs.mjs` writes — both share `analyzeLogs`.
 */
const analysisSchema = z.object({
  days: z.number().int().min(1).max(30).default(7),
  source: z.enum(["vercel", "client", "function", "all"]).default("all"),
  maxDocs: z.number().int().min(100).max(20000).default(5000),
});

// rbac-scope-enforced-in-handler: admin section — createRouteHandler permission "admin:maintenance:run-analysis" enforces the access surface
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ANY_STAFF],
    permission: "admin:maintenance:run-analysis",
    schema: analysisSchema,
    handler: async ({ body }) => {
      const sourceArg =
        body!.source === "all"
          ? "all"
          : (body!.source as "vercel" | "client" | "function");
      const report = await analyzeLogs({
        days: body!.days,
        source: sourceArg,
        maxDocs: body!.maxDocs,
      });
      return successResponse(report);
    },
  }),
);
