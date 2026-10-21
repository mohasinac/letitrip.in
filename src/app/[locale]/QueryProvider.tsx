"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Imported from the DEFINING module, not a barrel (Root Cause #18). It is also
// not on the `/client` entry, and the consumer's own `API_ROUTES.SITE_SETTINGS`
// is a different endpoint (`/api/admin/site-settings`) — using that would seed
// a key `useSiteSettings` never reads.
import { SITE_SETTINGS_ENDPOINTS } from "@mohasinac/appkit/constants/api-endpoints";
import type { PublicSiteSettings } from "@mohasinac/appkit/client";

export default function QueryProvider({
  children,
  initialSiteSettings = null,
}: {
  children: ReactNode;
  /**
   * The public site-settings projection, read by the server layout and seeded
   * into the cache below. `null` when the settings read failed — the client
   * then fetches as it always did.
   *
   * Typed as the real projection, not `unknown`: this is the exact shape
   * `useSiteSettings` consumers read, so a drift between what the layout seeds
   * and what the hook expects should be a compile error here.
   */
  initialSiteSettings?: PublicSiteSettings | null;
}) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          // A failing endpoint costs (1 + retry) invocations, and the delay
          // below is deliberately tight, so retries land almost immediately —
          // at retry: 2 an outage tripled its own request volume against the
          // service that was already failing. One retry still absorbs the
          // transient blip that retrying exists for.
          retry: 1,
          retryDelay: (attempt) => Math.min(200 * 2 ** attempt, 3000),
          staleTime: 30_000,
          // Stays false as the global default. Hooks that genuinely need
          // focus-freshness opt in individually (useNotifications, useCart*),
          // which keeps the cost attributable to the hook that chose it.
          refetchOnWindowFocus: false,
        },
        mutations: { retry: 0 },
      },
    });

    /*
     * 🛑 Seeded INSIDE the useState initialiser, not in an effect.
     *
     * The whole point is that the FIRST client render sees the same settings
     * the server rendered with. An effect runs after hydration has already
     * compared the trees, so it would fix the second render and leave the
     * mismatch — which is the bug.
     *
     * The key must match `useSiteSettings` exactly: `["site-settings", endpoint]`
     * with the same endpoint constant, and the value must be what
     * `apiClient.get` would return — it unwraps the envelope and hands back
     * `data.data`, which is `toPublicSiteSettings(...)`. Seeding a different
     * shape would trade one mismatch for another.
     */
    if (initialSiteSettings !== null && initialSiteSettings !== undefined) {
      client.setQueryData(["site-settings", SITE_SETTINGS_ENDPOINTS.GET], initialSiteSettings);
    }

    return client;
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
