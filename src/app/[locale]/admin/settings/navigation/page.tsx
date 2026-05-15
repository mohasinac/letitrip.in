import { siteSettingsRepository } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit";
import { NavPermissionsManager, Div, Heading, Text } from "@mohasinac/appkit/client";
import type { NavPermissionsGroup as NavGroup } from "@mohasinac/appkit/client";
import { updateNavConfigAction } from "@/actions/admin-settings.actions";

const MAIN_NAV_GROUP: NavGroup = {
  groupLabel: "Main Navigation",
  items: [
    { id: "nav-home",        label: "Home",        href: String(ROUTES.HOME) },
    { id: "nav-products",    label: "Products",    href: String(ROUTES.PUBLIC.PRODUCTS) },
    { id: "nav-auctions",    label: "Auctions",    href: String(ROUTES.PUBLIC.AUCTIONS) },
    { id: "nav-pre-orders",  label: "Pre-Orders",  href: String(ROUTES.PUBLIC.PRE_ORDERS) },
    { id: "nav-bundles",     label: "Bundles",     href: String(ROUTES.PUBLIC.BUNDLES) },
    { id: "nav-prize-draws", label: "Prize Draws", href: String(ROUTES.PUBLIC.PRIZE_DRAWS) },
    { id: "nav-categories",  label: "Categories",  href: String(ROUTES.PUBLIC.CATEGORIES) },
    { id: "nav-stores",      label: "Stores",      href: String(ROUTES.PUBLIC.STORES) },
    { id: "nav-events",      label: "Events",      href: String(ROUTES.PUBLIC.EVENTS) },
    { id: "nav-blog",        label: "Blog",        href: String(ROUTES.PUBLIC.BLOG) },
    { id: "nav-reviews",     label: "Reviews",     href: String(ROUTES.PUBLIC.REVIEWS) },
  ],
};

const ALL_NAV_ITEMS = MAIN_NAV_GROUP.items.filter((i) => !!i.id) as Array<{ id: string; href: string }>;

async function handleUpdateNavConfig(navId: string, enabled: boolean): Promise<void> {
  "use server";
  await updateNavConfigAction(navId, enabled, ALL_NAV_ITEMS);
}

export default async function Page() {
  const settings = await siteSettingsRepository.getSingleton().catch(() => null);
  const initialConfig = (settings?.navConfig ?? {}) as Record<string, { enabled: boolean }>;

  return (
    <Div className="p-6 max-w-5xl mx-auto">
      <Div className="mb-6">
        <Heading level={1} className="text-2xl font-semibold">Navigation Permissions</Heading>
        <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Enable or disable individual navigation items. Disabled items are hidden from the nav and return 404.
        </Text>
      </Div>
      <NavPermissionsManager
        initialConfig={initialConfig}
        navGroups={[MAIN_NAV_GROUP]}
        onUpdate={handleUpdateNavConfig}
      />
    </Div>
  );
}
