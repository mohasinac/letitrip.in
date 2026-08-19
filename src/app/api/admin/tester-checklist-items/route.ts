import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  testerChecklistItemRepository,
  sortBy,
} from "@mohasinac/appkit";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const DEFAULT_SORTS = sortBy("order", "ASC");

const createChecklistItemSchema = z.object({
  groupKey: z.string().min(1).max(100),
  groupLabel: z.string().min(1).max(200),
  pageKey: z.string().min(1).max(100),
  pageLabel: z.string().min(1).max(200),
  label: z.string().min(3).max(500),
  description: z.string().max(2000).optional(),
  href: z.string().max(300).optional(),
  order: z.number().int().min(0).optional(),
  phase: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  adminOnly: z.boolean().optional(),
});

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:tester-checklist:read",
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);
    const groupKey = getStringParam(searchParams, "groupKey");
    const pageKey = getStringParam(searchParams, "pageKey");
    const isActive = getStringParam(searchParams, "isActive");
    const search = getStringParam(searchParams, "q");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 50 });

    const filters = [getStringParam(searchParams, "filters")].filter(Boolean) as string[];
    if (groupKey) filters.push(`groupKey==${groupKey}`);
    if (pageKey) filters.push(`pageKey==${pageKey}`);
    if (isActive === "true" || isActive === "false") filters.push(`isActive==${isActive}`);

    const result = await testerChecklistItemRepository.list({
      filters: filters.length > 0 ? filters.join(",") : undefined,
      sorts,
      page: String(page),
      pageSize: String(pageSize),
      search: search || undefined,
    } as any);

    return successResponse(result);
  },
}));

export const POST = withProviders(
  createRouteHandler<(typeof createChecklistItemSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:tester-checklist:write",
    schema: createChecklistItemSchema,
    handler: async ({ body }) => {
      const item = await testerChecklistItemRepository.createItem({
        groupKey: body!.groupKey,
        groupLabel: body!.groupLabel,
        pageKey: body!.pageKey,
        pageLabel: body!.pageLabel,
        label: body!.label,
        description: body!.description,
        href: body!.href,
        order: body!.order ?? 0,
        phase: body!.phase ?? 1,
        isActive: body!.isActive ?? true,
        adminOnly: body!.adminOnly ?? false,
      });
      return successResponse(item, "Checklist item created");
    },
  }),
);
