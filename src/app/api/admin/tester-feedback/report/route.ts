import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  testerChecklistResponseRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async () => {
      const report = await testerChecklistResponseRepository.getCoverageReport();
      return successResponse(report);
    },
  }),
);
