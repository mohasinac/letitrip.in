import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  siteSettingsRepository,
} from "@mohasinac/appkit";

const siteGroupSchema = z.record(z.string(), z.unknown());

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
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
    roles: ["admin"],
    schema: siteGroupSchema,
    handler: async ({ body }) => {
      const updated = await siteSettingsRepository.updateSingleton(body! as any);
      return successResponse(updated, "Settings saved");
    },
  }),
);
