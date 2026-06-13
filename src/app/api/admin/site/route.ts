import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  siteSettingsRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

const siteGroupSchema = z.record(z.string(), z.unknown());

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:site:read",
    handler: async () => {
      const settings = await siteSettingsRepository.getSingleton();
      const credentialsMasked = await siteSettingsRepository.getCredentialsMasked();
      return successResponse({ ...settings, credentialsMasked });
    },
  }),
);

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const PUT = withProviders(
  createRouteHandler<(typeof siteGroupSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:site:write",
    schema: siteGroupSchema,
    handler: async ({ body }) => {
      const updated = await siteSettingsRepository.updateSingleton(body! as any);
      return successResponse(updated, "Settings saved");
    },
  }),
);
