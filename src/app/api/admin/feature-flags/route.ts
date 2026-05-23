import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  siteSettingsRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const featureFlagsSchema = z.object({
  flags: z.record(z.string(), z.boolean()).optional(),
  rollouts: z.record(z.string(), z.number().min(0).max(100)).optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:feature-flags:read",
    handler: async () => {
      const settings = await siteSettingsRepository.getSingleton();
      return successResponse({
        flags: (settings as any).featureFlags ?? {},
        rollouts: (settings as any).featureFlagRollouts ?? {},
      });
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof featureFlagsSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:feature-flags:write",
    schema: featureFlagsSchema,
    handler: async ({ body }) => {
      await siteSettingsRepository.updateSingleton({
        featureFlags: body!.flags,
        featureFlagRollouts: body!.rollouts,
      } as any);
      return successResponse(null, "Feature flags updated");
    },
  }),
);
