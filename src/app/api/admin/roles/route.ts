import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withProviders } from "@/providers.config";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { customRolesRepository } from "@mohasinac/appkit/features/store-extensions/repository/rbac.repositories";
import { customRoleCreateSchema } from "@mohasinac/appkit/features/store-extensions/schemas/custom-role-form";
import { errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { parseJsonBody } from "@mohasinac/appkit/next/api/parseJsonBody";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { recordAdminAction } from "@mohasinac/appkit";
import { AdminAuditActionValues } from "@mohasinac/appkit/features/audit-log/schemas/firestore";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:team:read",
    handler: async () => {
      const result = await customRolesRepository.listActive();
      return successResponse({ items: result.items });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async ({ request, user }) => {
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      // Parse, don't spread. This route GRANTS PERMISSIONS and validated
      // nothing: a role could be written with no name, a `permissions` array
      // of arbitrary strings, a `scope` outside its union, or any invented
      // key — straight into the document the permission system reads.
      //
      // A permission string outside the catalogue is the quiet case: it never
      // matches, so the role looks configured and grants nothing.
      const parsed = customRoleCreateSchema.safeParse(body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid role",
          parsed.error.issues,
        );
      }
      try {
        const doc = await customRolesRepository.create({
          ...parsed.data,
          // From the session, never the body — otherwise a privilege grant
          // could be attributed to someone else, which is the one field an
          // audit trail depends on.
          createdBy: user!.uid,
        });
        /*
         * A role IS a permission grant — the definition of who can do what.
         * The route already takes `createdBy` from the session rather than
         * the body, for the reason its own comment gives; this puts the same
         * fact in the log an admin actually scans.
         */
        void recordAdminAction({
          actorUid: user!.uid,
          actorName: user!.name,
          action: AdminAuditActionValues.ROLE_CHANGE,
          targetType: "role",
          targetId: doc.id,
          targetLabel: parsed.data.name ?? doc.id,
          metadata: { change: "created", permissions: parsed.data.permissions?.length ?? 0 },
        });
        return successResponse(doc, "Role created", 201);
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Create failed", 400);
      }
    },
  }),
);
