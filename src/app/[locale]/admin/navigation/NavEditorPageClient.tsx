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
import {
  AdminNavEditorView,
  ROUTES,
  apiClient,
  ADMIN_ENDPOINTS,
  PageLoader,
  EmptyState,
} from "@mohasinac/appkit/client";
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

  /*
   * 🛑 `item={null}` means CREATE to `AdminNavEditorView`, so
   * `items.find(...) ?? null` quietly turned an invented `itemId` into a NEW
   * nav item. `/admin/navigation/zzzznope/edit` offered a create form while
   * claiming to edit, and saving would have added an item nobody asked for.
   *
   * `null` is still correct when there is no `itemId` at all — that is the
   * `new` sibling route, and it genuinely is a create.
   */
  const item = itemId ? (items.find((i) => i.id === itemId) ?? null) : null;
  if (itemId && !item) {
    return (
      <EmptyState
        title="Nav item not found"
        description="This navigation item may have been deleted, or the link may be wrong."
        actionLabel="Back to navigation"
        actionHref={String(ROUTES.ADMIN.NAVIGATION)}
      />
    );
  }

  return (
    <AdminNavEditorView
      open
      onClose={back}
      onSaved={back}
      item={item}
      parentOptions={parentOptions}
    />
  );
}
