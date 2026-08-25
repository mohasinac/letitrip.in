import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  customRolesRepository,
  customRoleUpdateSchema,
  ValidationError,
  errorResponse,
  parseJsonBody,
  type JsonValue,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

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
    handler: async ({ request, params }) => {
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
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      await customRolesRepository.delete(id);
      return successResponse({ deleted: true });
    },
  }),
);
