import { withProviders } from "@/providers.config";
/**
 * Admin Address Clusters API
 *
 * GET /api/admin/addresses/clusters — Returns clusters of addresses sharing the same
 * addressHash (same physical address used across multiple accounts). Read-only; no blocking.
 */

import { createRouteHandler, successResponse, addressesRepository } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:addresses:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "200", 10), 500);

      // Load all store + user addresses and group by addressHash
      const [userAddresses, storeAddresses] = await Promise.all([
        addressesRepository.listByOwnerType("user", limit),
        addressesRepository.listByOwnerType("store", Math.floor(limit / 2)),
      ]);

      const all = [...userAddresses, ...storeAddresses];

      // Group by addressHash
      const grouped = new Map<string, typeof all>();
      for (const addr of all) {
        if (!addr.addressHash) continue;
        const existing = grouped.get(addr.addressHash) ?? [];
        existing.push(addr);
        grouped.set(addr.addressHash, existing);
      }

      // Only return clusters with 2+ distinct ownerIds
      const clusters = Array.from(grouped.entries())
        .filter(([, addrs]) => new Set(addrs.map((a) => a.ownerId)).size >= 2)
        .map(([addressHash, addrs]) => ({
          addressHash,
          addresses: addrs.map((a) => ({
            id: a.id,
            ownerId: a.ownerId,
            ownerType: a.ownerType,
            city: a.city,
            state: a.state,
            postalCode: a.postalCode,
            banStatus: a.banStatus,
          })),
        }))
        .slice(0, 50);

      return successResponse({ clusters, total: clusters.length });
    },
  }),
);
