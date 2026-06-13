import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  addressesRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:store-addresses:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const limit = Math.min(
        Number(url.searchParams.get("limit") ?? "500"),
        1000,
      );
      const storeId = url.searchParams.get("storeId");

      const items = storeId
        ? await addressesRepository.listByOwner("store", storeId)
        : await addressesRepository.listByOwnerType("store", limit);

      const mapped = items.map((addr) => ({
        id: addr.id,
        storeId: addr.ownerId,
        label: addr.label ?? "",
        city: addr.city ?? "",
        state: addr.state ?? "",
        postalCode: addr.postalCode ?? "",
        isDefault: addr.isDefault ?? false,
        createdAt:
          addr.createdAt instanceof Date
            ? addr.createdAt.toISOString()
            : (addr.createdAt as unknown as string) ?? null,
      }));

      return successResponse({ items: mapped, total: mapped.length });
    },
  }),
);
