import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  siteSettingsRepository,
} from "@mohasinac/appkit";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  order: number;
  parentId?: string;
  isVisible: boolean;
}

const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  icon: z.string().optional(),
  order: z.number().int().optional(),
  parentId: z.string().optional(),
  isVisible: z.boolean().optional(),
});

async function getNavItems(): Promise<NavItem[]> {
  const settings = await siteSettingsRepository.getSingleton();
  const raw = (settings as any)?.navbarConfig?.navItems;
  return Array.isArray(raw) ? raw : [];
}

async function saveNavItems(items: NavItem[]): Promise<void> {
  await siteSettingsRepository.updateSingleton({
    navbarConfig: { navItems: items },
  } as any);
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async () => {
      const items = await getNavItems();
      return successResponse({ items, total: items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof navItemSchema)["_output"]>({
    auth: true,
    roles: ["admin"],
    schema: navItemSchema,
    handler: async ({ body }) => {
      const b = body!;
      const items = await getNavItems();
      const maxOrder = items.reduce((m, i) => Math.max(m, i.order), -1);
      const newItem: NavItem = {
        id: `nav-${b.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
        label: b.label,
        href: b.href,
        icon: b.icon,
        order: b.order ?? maxOrder + 1,
        parentId: b.parentId,
        isVisible: b.isVisible ?? true,
      };
      await saveNavItems([...items, newItem]);
      return successResponse(newItem, "Nav item created");
    },
  }),
);
