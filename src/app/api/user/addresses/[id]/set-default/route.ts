import { withProviders } from "@/providers.config";
import {
  addressRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const updated = await addressRepository.setDefault(user!.uid, id);
      return successResponse(updated, "Default address updated");
    },
  }),
);
