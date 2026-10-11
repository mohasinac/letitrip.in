import { withProviders } from "@/providers.config";
import { reportsRepository } from "@mohasinac/appkit/features/store-extensions/repository/store-extensions.repositories";
import { reportCreateSchema } from "@mohasinac/appkit/features/store-extensions/schemas/report-create-form";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_AUTHENTICATED } from "@/constants";

export const POST = withProviders(
  createRouteHandler<(typeof reportCreateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    schema: reportCreateSchema,
    handler: async ({ user, body }) => {
      // The reporter's identity and the initial status come from the session
      // and from here — never the body. The schema is `.strict()` and declares
      // none of `reporterId` / `assignedTo` / `resolution` / `resolvedAt`, so a
      // caller can no longer file a report that claims to be already resolved
      // by a named admin.
      const doc = await reportsRepository.create({
        ...body!,
        evidenceUrls: body!.evidenceUrls ?? [],
        reporterId: user!.uid,
        reporterEmail: user!.email,
        status: "pending",
      });
      return successResponse(doc, "Report submitted", 201);
    },
  }),
);
