import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  testerChecklistResponseRepository,
  sortBy,
} from "@mohasinac/appkit";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

const DEFAULT_SORTS = sortBy("createdAt", "DESC");

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);
    const testerId = getStringParam(searchParams, "testerId");
    const groupKey = getStringParam(searchParams, "groupKey");
    const pageKey = getStringParam(searchParams, "pageKey");
    const answer = getStringParam(searchParams, "answer");
    const status = getStringParam(searchParams, "status");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 50 });

    const filters = [getStringParam(searchParams, "filters")].filter(Boolean) as string[];
    if (testerId) filters.push(`testerId==${testerId}`);
    if (groupKey) filters.push(`groupKey==${groupKey}`);
    if (pageKey) filters.push(`pageKey==${pageKey}`);
    if (answer === "yes" || answer === "no") filters.push(`answer==${answer}`);
    if (status === "new" || status === "reviewed") filters.push(`status==${status}`);

    const result = await testerChecklistResponseRepository.list({
      filters: filters.length > 0 ? filters.join(",") : undefined,
      sorts,
      page: String(page),
      pageSize: String(pageSize),
    });

    return successResponse(result);
  },
}));
