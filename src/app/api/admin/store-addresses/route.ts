import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  addressesRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const limit = Math.min(
        Number(url.searchParams.get("limit") ?? "500"),
        1000,
      );
      const storeId = url.searchParams.get("storeId");
      const sorts = url.searchParams.get("sorts") ?? "";

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

      // Low-cardinality collection (~35 store addresses target) — sort in
      // memory rather than provisioning Firestore composite indexes for it.
      if (sorts.includes("city")) {
        mapped.sort((a, b) => a.city.localeCompare(b.city));
      } else if (sorts.includes("storeId")) {
        const desc = sorts.startsWith("-");
        mapped.sort((a, b) => (desc ? b.storeId.localeCompare(a.storeId) : a.storeId.localeCompare(b.storeId)));
      }

      return successResponse({ items: mapped, total: mapped.length });
    },
  }),
);
