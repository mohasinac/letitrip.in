import { withProviders } from "@/providers.config";
import {
  addressesRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const updated = await addressesRepository.setDefault("user", user!.uid, id);
      return successResponse(updated, "Default address updated");
    },
  }),
);
