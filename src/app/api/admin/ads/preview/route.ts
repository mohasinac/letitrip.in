import { withProviders } from "@/providers.config";

import {
  createApiHandler as createRouteHandler,
  errorResponse,
  siteSettingsRepository,
  successResponse,
} from "@mohasinac/appkit";
import { defaultPlacements } from "../validation";

function normalizeAdSettings(settings: Record<string, unknown>) {
  const adSettingsRaw = (settings.adSettings as Record<string, unknown> | undefined) ?? {};
  const inventory = Array.isArray(adSettingsRaw.inventory)
    ? (adSettingsRaw.inventory as Array<Record<string, unknown>>)
    : [];
  const placements = Array.isArray(adSettingsRaw.placements)
    ? (adSettingsRaw.placements as Array<Record<string, unknown>>)
    : [];
  return {
    inventory,
    placements,
    consentRequired: Boolean(adSettingsRaw.consentRequired),
  };
}

function isScheduleActive(item: Record<string, unknown>): boolean {
  const now = Date.now();
  const start = item.startAt ? new Date(String(item.startAt)).getTime() : 0;
  const end = item.endAt ? new Date(String(item.endAt)).getTime() : Infinity;
  return now >= start && now <= end;
}

/**
 * GET /api/admin/ads/preview?placementId=<id>&consentGranted=<true|false>
 *
 * Returns the highest-priority eligible ad for a given placement under the given
 * consent state. Used by the admin UI to preview ad slot fill before publish.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const placementId = url.searchParams.get("placementId");
      const consentGranted = url.searchParams.get("consentGranted") === "true";

      if (!placementId) {
        return errorResponse("placementId query param is required", 400);
      }

      const settings = (await siteSettingsRepository.getSingleton()) as unknown as Record<string, unknown>;
      const { inventory, placements } = normalizeAdSettings(settings);
      const resolvedPlacements = placements.length > 0 ? placements : defaultPlacements();

      // Validate placement exists and is enabled
      const placement = resolvedPlacements.find((p) => String(p.id) === placementId);
      if (!placement) {
        return errorResponse(`Placement '${placementId}' not found`, 404);
      }
      if (placement.enabled === false) {
        return successResponse(
          { ad: null, placementId, reason: "placement_disabled" },
          "Placement is disabled — no ad would render",
        );
      }

      // Filter active/scheduled ads that:
      // 1. include this placementId
      // 2. respect consent gate if consentRequired
      // 3. are within their schedule window
      const eligible = inventory.filter((item) => {
        if (item.status !== "active" && item.status !== "scheduled") return false;
        const placementIds = Array.isArray(item.placementIds) ? item.placementIds : [];
        if (!placementIds.includes(placementId)) return false;
        if (item.requiresConsent && !consentGranted) return false;
        if (!isScheduleActive(item)) return false;
        return true;
      });

      if (eligible.length === 0) {
        return successResponse(
          { ad: null, placementId, reason: "no_eligible_ads", consentGranted },
          "No eligible ads for this placement under current consent state",
        );
      }

      // Pick highest priority (lower number = higher priority)
      const winner = eligible.reduce((best, current) => {
        const bestPriority = typeof best.priority === "number" ? best.priority : 0;
        const currentPriority = typeof current.priority === "number" ? current.priority : 0;
        return currentPriority > bestPriority ? current : best;
      });

      return successResponse(
        {
          ad: winner,
          placementId,
          placement,
          totalEligible: eligible.length,
          consentGranted,
        },
        "Preview ad resolved",
      );
    },
  }),
);
