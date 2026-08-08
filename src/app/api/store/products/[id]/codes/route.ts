import { withProviders } from "@/providers.config";
import { createRouteHandler, errorResponse } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";
import { USER_ROLE } from "@/constants/api-roles";

// NOTE: despite the route name ("codes"), this previously duplicated the
// barcode-scan lookup from /api/store/products/scan/route.ts verbatim — it
// silently returned barcode-scan results mislabeled as "digital codes"
// rather than doing anything with the actual digital-code pool for this
// listing type. There is no existing schema/repository for storing or
// redeeming per-product digital codes (appkit/src/features/digital-codes/
// only has public browse/listing UI, no reveal backend) — inventing that
// data model here would be an unreviewed design decision, so this route
// honestly reports "not implemented" instead of returning wrong data.
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE],
    permission: "store:api:write",
    handler: async () => {
      return errorResponse(
        "Digital code management is not implemented yet.",
        501,
      );
    },
  }),
);
