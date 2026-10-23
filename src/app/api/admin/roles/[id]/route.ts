import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withProviders } from "@/providers.config";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { customRolesRepository } from "@mohasinac/appkit/features/store-extensions/repository/rbac.repositories";
import { customRoleUpdateSchema } from "@mohasinac/appkit/features/store-extensions/schemas/custom-role-form";
import { ApiErrors, errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
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
    permission: "admin:team:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const doc = await customRolesRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      return successResponse(doc);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async ({ request, params, user }) => {
      const id = (params as { id: string }).id;
      const doc = await customRolesRepository.findById(id);
      if (!doc) return ApiErrors.notFound("Not found");
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      // Same reasoning as the create path. `.strict()`, so an unknown key is a
      // 400 rather than a silent write — and `slug`/`createdBy` are not in the
      // update schema at all, so a role cannot be re-attributed or have its
      // stable identifier changed out from under the users assigned to it.
      const parsed = customRoleUpdateSchema.safeParse(body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid role",
          parsed.error.issues,
        );
      }
      try {
        const updated = await customRolesRepository.update(id, parsed.data);
        void recordAdminAction({
          actorUid: user!.uid,
          actorName: user!.name,
          action: AdminAuditActionValues.ROLE_CHANGE,
          targetType: "role",
          targetId: id,
          targetLabel: doc.name ?? id,
          metadata: { change: "updated" },
        });
        return successResponse(updated);
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
      }
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const doomed = await customRolesRepository.findById(id);
      await customRolesRepository.delete(id);
      /*
       * 🛑 The label is read BEFORE the delete. Afterwards there is no
       * document to name, and a log row reading only "role <id>" is the one
       * that is useless later — the id is a slug nobody recognises once the
       * row it belonged to is gone.
       */
      void recordAdminAction({
        actorUid: user!.uid,
        actorName: user!.name,
        action: AdminAuditActionValues.ROLE_CHANGE,
        targetType: "role",
        targetId: id,
        targetLabel: doomed?.name ?? id,
        metadata: { change: "deleted" },
      });
      return successResponse({ deleted: true });
    },
  }),
);
