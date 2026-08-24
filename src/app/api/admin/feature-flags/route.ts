import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  siteSettingsRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

// `featureFlags` is NOT flat: `listingTypes` and `categoryTypes` are nested
// boolean maps, and AdminFeatureFlagsView PUTs the whole object back. A plain
// `record(string, boolean)` rejected those two keys, so every listing-type and
// category-type toggle silently failed to save while the flat flags went
// through — the form looked like it worked and did not.
const featureFlagsSchema = z.object({
  flags: z
    .record(z.string(), z.union([z.boolean(), z.record(z.string(), z.boolean())]))
    .optional(),
  rollouts: z.record(z.string(), z.number().min(0).max(100)).optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
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
