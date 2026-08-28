import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  scammerRepository,
  getSearchParams,
  getStringParam,
  getNumberParam,
  sortBy,
  SCAMMER_FIELDS,
} from "@mohasinac/appkit";
import type { SieveModel } from "@mohasinac/appkit";
import { ROLES_TRUST_SAFETY } from "@/constants";

const DEFAULT_SORTS = sortBy(SCAMMER_FIELDS.CREATED_AT);

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES_TRUST_SAFETY,
    permission: "admin:scammers:read",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page     = getNumberParam(searchParams, "page",     1,  { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 25, { min: 1, max: 50 });
      const sorts    = getStringParam(searchParams, "sort")    || DEFAULT_SORTS;
      const filters  = getStringParam(searchParams, "filters") || undefined;
      const q        = getStringParam(searchParams, "q")       || undefined;

      // `searchTxt` is an `array-contains` clause, which Sieve cannot express —
      // so it travels alongside `filters`, not inside it.
      //
      // This used to build `displayNames@=${q}`. `@=` is array-contains, which
      // matches a WHOLE element: "Vikram" found nothing against
      // `displayNames: ["Vikram M", "Vikram Mehta"]`, and phones and UPI ids
      // were never searched at all despite the box promising them. searchTxt
      // indexes word prefixes across all four identity arrays.
      const model: SieveModel = { page, pageSize, sorts, filters };

      const result = await scammerRepository.listAll(model, { search: q });
      return successResponse({
        scammers: result.items,
        meta: { total: result.total, page, pageSize },
      });
    },
  }),
);

export const GET = withFeatureGuard("SCAM_REGISTRY", __GET__g);
