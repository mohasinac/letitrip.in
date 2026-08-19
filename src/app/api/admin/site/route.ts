import { withProviders } from "@/providers.config";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createRouteHandler,
  successResponse,
  siteSettingsRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

const siteGroupSchema = z.record(z.string(), z.unknown());

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

export const PUT = withProviders(
  createRouteHandler<(typeof siteGroupSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:site:write",
    schema: siteGroupSchema,
    handler: async ({ body }) => {
      const updated = await siteSettingsRepository.updateSingleton(body! as any);
      // Homepage is ISR-cached (revalidate=120) and reads siteSettings directly
      // in the Server Component — bust it now instead of waiting up to 2min.
      revalidatePath("/");
      return successResponse(updated, "Settings saved");
    },
  }),
);
