import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  customRolesRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async () => {
      const result = await customRolesRepository.listActive();
      return successResponse({ items: result.items });
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    handler: async ({ request, user }) => {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      try {
        const doc = await customRolesRepository.create({
          ...body,
          createdBy: user!.uid,
        });
        return successResponse(doc, "Role created", 201);
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Create failed", 400);
      }
    },
  }),
);
