import { withProviders } from "@/providers.config";
import { createApiHandler as createRouteHandler, siteSettingsRepository, successResponse } from "@mohasinac/appkit";

function isAdActive(item: Record<string, unknown>): boolean {
  if (String(item.status || "") !== "active") return false;
  const now = Date.now();
  if (item.startAt) {
    const start = new Date(String(item.startAt)).getTime();
    if (!isNaN(start) && start > now) return false;
  }
  if (item.endAt) {
    const end = new Date(String(item.endAt)).getTime();
    if (!isNaN(end) && end <= now) return false;
  }
  return true;
}

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const slot = url.searchParams.get("slot")?.trim();
      if (!slot) return successResponse(null);

      const settings = (await siteSettingsRepository.getSingleton()) as unknown as Record<string, unknown>;
      const adSettingsRaw = (settings.adSettings as Record<string, unknown> | undefined) ?? {};
      const inventory = Array.isArray(adSettingsRaw.inventory)
        ? (adSettingsRaw.inventory as Array<Record<string, unknown>>)
        : [];

      const candidates = inventory
        .filter((item) => {
          const placements = Array.isArray(item.placementIds)
            ? (item.placementIds as string[])
            : [];
          return placements.includes(slot) && isAdActive(item);
        })
        .sort((a, b) => Number(b.priority ?? 0) - Number(a.priority ?? 0));

      return successResponse(candidates[0] ?? null);
    },
  }),
);
