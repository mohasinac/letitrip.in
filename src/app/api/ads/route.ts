import { withProviders } from "@/providers.config";
import { createApiHandler as createRouteHandler, siteSettingsRepository, successResponse } from "@mohasinac/appkit";
import type { JsonValue } from "@mohasinac/appkit";

/**
 * Ad inventory is admin-authored and changes rarely, but the homepage mounts
 * FOUR `<AdSlot>`s and each one calls this route on every visit — and each call
 * reads the `siteSettings` singleton from Firestore. Uncached, that is four
 * reads and four function invocations per homepage view, for data that is
 * identical across every visitor.
 *
 * Matches the window its siblings use (`/api/products`, `/api/stores`,
 * `/api/events`). `stale-while-revalidate` keeps a paused ad from flickering
 * back in while the CDN refreshes.
 */
const ADS_CACHE_CONTROL = "public, max-age=300, s-maxage=600, stale-while-revalidate=300";

function isAdActive(item: Record<string, JsonValue>): boolean {
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

export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const slot = url.searchParams.get("slot")?.trim();
      if (!slot) {
        const empty = successResponse(null);
        empty.headers.set("Cache-Control", ADS_CACHE_CONTROL);
        return empty;
      }

      const settings = (await siteSettingsRepository.getSingleton()) as unknown as Record<string, JsonValue>;
      const adSettingsRaw = (settings.adSettings as Record<string, JsonValue> | undefined) ?? {};
      const inventory = Array.isArray(adSettingsRaw.inventory)
        ? (adSettingsRaw.inventory as Array<Record<string, JsonValue>>)
        : [];

      const candidates = inventory
        .filter((item) => {
          const placements = Array.isArray(item.placementIds)
            ? (item.placementIds as string[])
            : [];
          return placements.includes(slot) && isAdActive(item);
        })
        .sort((a, b) => Number(b.priority ?? 0) - Number(a.priority ?? 0));

      const response = successResponse(candidates[0] ?? null);
      response.headers.set("Cache-Control", ADS_CACHE_CONTROL);
      return response;
    },
  }),
);