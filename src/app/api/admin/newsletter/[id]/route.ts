import "@/providers.config";

import { createRouteHandler } from "@mohasinac/appkit/server";
import { successResponse } from "@mohasinac/appkit/server";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/server";
import { faqsRepository } from "@mohasinac/appkit/server";

export const GET = createRouteHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);
    const category = getStringParam(searchParams, "category");
    const search = getStringParam(searchParams, "q");
    const isActive = getStringParam(searchParams, "isActive");
    const sorts = getStringParam(searchParams, "sorts") || "-priority,order";
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 200,
    });

    const filters = [getStringParam(searchParams, "filters")].filter(
      Boolean,
    ) as string[];
    if (category) filters.push(`category==${category}`);
    if (isActive === "true" || isActive === "false") {
      filters.push(`isActive==${isActive}`);
    }

    const result = await faqsRepository.list(
      {
        filters: filters.length > 0 ? filters.join(",") : undefined,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      },
      {
        search,
      },
    );

    return successResponse(result);
  },
});
