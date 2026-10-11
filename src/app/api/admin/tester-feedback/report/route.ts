import { withProviders } from "@/providers.config";
import { testerChecklistResponseRepository } from "@mohasinac/appkit/features/tester/repository/tester-checklist-response.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
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
