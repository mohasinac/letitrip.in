import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  adminUpdateUser,
} from "@mohasinac/appkit";
import type { UserAdminUpdateInput } from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

const updateSchema = z.object({
  permissionGroup: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const PUT = withProviders(
  createRouteHandler<z.infer<typeof updateSchema>>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:team:write",
    schema: updateSchema,
    handler: async ({ body, user: adminUser, params }) => {
      const { id } = params as { id: string };
      const update: UserAdminUpdateInput = {};
      if (body?.permissionGroup !== undefined) {
        update.permissionGroup = body.permissionGroup as UserAdminUpdateInput["permissionGroup"];
      }
      if (body?.permissions !== undefined) {
        update.permissions = body.permissions as UserAdminUpdateInput["permissions"];
      }
      await adminUpdateUser(adminUser!.uid, id, update);
      return successResponse({ uid: id }, "Permissions updated");
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:team:write",
    handler: async ({ user: adminUser, params }) => {
      const { id } = params as { id: string };
      const update: UserAdminUpdateInput = {
        role: "user",
        permissionGroup: undefined,
        permissions: [],
      };
      await adminUpdateUser(adminUser!.uid, id, update);
      return successResponse({ uid: id }, "Employee access revoked");
    },
  }),
);
