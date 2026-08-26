"use client";

/**
 * Shareable URLs for the nav-item drawer `AdminNavigationView` opens inline.
 *
 * `AdminNavEditorView` hard-renders `<SideDrawer>` and takes the whole
 * `item` record plus `parentOptions` — not an id — because inside the list
 * both are already in hand. A standalone page has neither, so it fetches the
 * SAME list endpoint once and derives both from it.
 *
 * Deriving rather than adding an `itemId?` prop is deliberate: `parentOptions`
 * is "every top-level item", which needs the list regardless, so an id-based
 * loader would have to fetch it anyway and would then own a second copy of
 * that filter. One fetch, one derivation, matching the list exactly.
 */
import { AdminNavEditorView, ROUTES, apiClient, ADMIN_ENDPOINTS, PageLoader } from "@mohasinac/appkit/client";
import type { NavItemData } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";

export function NavEditorPageClient({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const back = () => router.push(String(ROUTES.ADMIN.NAVIGATION));

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "navigation"],
    queryFn: async () => {
      const res = await apiClient.get(ADMIN_ENDPOINTS.NAVIGATION);
      const payload = res as { data?: NavItemData[] } | NavItemData[];
      return (Array.isArray(payload) ? payload : (payload.data ?? [])) as NavItemData[];
    },
  });

  if (isLoading) return <PageLoader />;

  const items = data ?? [];
  // Same filter the list uses: only top-level items can be a parent.
  const parentOptions = items
    .filter((i) => !i.parentId)
    .map((i) => ({ label: i.label, value: i.id! }));

  return (
    <AdminNavEditorView
      open
      onClose={back}
      onSaved={back}
      item={itemId ? (items.find((i) => i.id === itemId) ?? null) : null}
      parentOptions={parentOptions}
    />
  );
}
