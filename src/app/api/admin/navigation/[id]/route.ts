import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  siteSettingsRepository,
} from "@mohasinac/appkit";
import type { NavItem } from "../route";

const MSG_NAV_ITEM_NOT_FOUND = "Navigation item not found.";

const updateNavItemSchema = z.object({
  label: z.string().min(1).optional(),
  href: z.string().min(1).optional(),
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

export const PUT = withProviders(
  createRouteHandler<(typeof updateNavItemSchema)["_output"]>({
    auth: true,
    roles: ["admin"],
    permission: "admin:navigation:write",
    schema: updateNavItemSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const b = body!;
      const items = await getNavItems();
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return errorResponse(MSG_NAV_ITEM_NOT_FOUND, 404);
      items[idx] = { ...items[idx], ...b };
      await saveNavItems(items);
      return successResponse(items[idx], "Nav item updated");
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateNavItemSchema)["_output"]>({
    auth: true,
    roles: ["admin"],
    permission: "admin:navigation:write",
    schema: updateNavItemSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const b = body!;
      const items = await getNavItems();
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return errorResponse(MSG_NAV_ITEM_NOT_FOUND, 404);
      items[idx] = { ...items[idx], ...b };
      await saveNavItems(items);
      return successResponse(items[idx], "Nav item updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    permission: "admin:navigation:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const items = await getNavItems();
      const filtered = items.filter((i) => i.id !== id);
      if (filtered.length === items.length)
        return errorResponse(MSG_NAV_ITEM_NOT_FOUND, 404);
      await saveNavItems(filtered);
      return successResponse(null, "Nav item deleted");
    },
  }),
);
