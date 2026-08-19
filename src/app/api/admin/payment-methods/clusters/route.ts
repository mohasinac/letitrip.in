import { withProviders } from "@/providers.config";
/**
 * Admin Payment Method Clusters API
 *
 * GET /api/admin/payment-methods/clusters — Clusters of payment methods sharing the same
 * identifierHash across multiple user accounts. Read-only; no blocking.
 */

import { createRouteHandler, successResponse, savedPaymentMethodsRepository } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const banStatus = url.searchParams.get("banStatus") as "banned" | "suspicious" | null;

      // Load banned + suspicious methods to find clusters
      const [banned, suspicious] = await Promise.all([
        savedPaymentMethodsRepository.listByBanStatus("banned", 200, 0),
        savedPaymentMethodsRepository.listByBanStatus("suspicious", 200, 0),
      ]);

      const all = banStatus === "banned" ? banned : banStatus === "suspicious" ? suspicious : [...banned, ...suspicious];

      // Group by identifierHash
      const grouped = new Map<string, typeof all>();
      for (const method of all) {
        if (!method.identifierHash) continue;
        const existing = grouped.get(method.identifierHash) ?? [];
        existing.push(method);
        grouped.set(method.identifierHash, existing);
      }

      // Only return clusters with 2+ distinct userIds
      const clusters = Array.from(grouped.entries())
        .filter(([, methods]) => new Set(methods.map((m) => m.userId)).size >= 2)
        .map(([identifierHash, methods]) => ({
          identifierHash,
          methods: methods.map((m) => ({
            id: m.id,
            userId: m.userId,
            type: m.type,
            displayLabel: m.displayLabel,
            banStatus: m.banStatus,
          })),
        }))
        .slice(0, 50);

      return successResponse({ clusters, total: clusters.length });
    },
  }),
);
