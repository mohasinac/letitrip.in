import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  customRolesRepository,
  customRoleCreateSchema,
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
        return successResponse(doc, "Role created", 201);
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Create failed", 400);
      }
    },
  }),
);
