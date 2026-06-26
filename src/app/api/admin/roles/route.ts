import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  customRolesRepository,
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
      try {
        const doc = await customRolesRepository.create({
          ...body,
          createdBy: user!.uid,
        });
        return successResponse(doc, "Role created", 201);
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Create failed", 400);
      }
    },
  }),
);
