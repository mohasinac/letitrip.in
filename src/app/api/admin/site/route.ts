import { withProviders } from "@/providers.config";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createRouteHandler,
  successResponse,
  siteSettingsRepository,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY, ROUTES } from "@/constants";

const siteGroupSchema = z.record(z.string(), z.unknown());

/**
 * Pages that read `siteSettings` directly in a Server Component AND set their own
 * `revalidate`. Without an explicit bust here, an admin edit to a policy page's
 * HTML override would not appear for up to an hour — the editor would look
 * broken even though the write succeeded.
 */
const REVALIDATE_ON_SAVE = [
  "/",
  String(ROUTES.PUBLIC.ABOUT),
  String(ROUTES.PUBLIC.TERMS),
  String(ROUTES.PUBLIC.PRIVACY),
  String(ROUTES.PUBLIC.COOKIE_POLICY),
  String(ROUTES.PUBLIC.REFUND_POLICY),
  String(ROUTES.PUBLIC.SHIPPING_POLICY),
  String(ROUTES.PUBLIC.ETHICS),
  String(ROUTES.PUBLIC.CODE_OF_CONDUCT),
];

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:site:read",
    handler: async () => {
      const settings = await siteSettingsRepository.getSingleton();
      const credentialsMasked = await siteSettingsRepository.getCredentialsMasked();
      return successResponse({ ...settings, credentialsMasked });
    },
  }),
);

export const PUT = withProviders(
  createRouteHandler<(typeof siteGroupSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:site:write",
    schema: siteGroupSchema,
    handler: async ({ body }) => {
      const updated = await siteSettingsRepository.updateSingleton(body! as any);
      // These pages are ISR-cached (homepage 120s, policy/about pages 3600s) and
      // read siteSettings directly in their Server Components — bust them now
      // instead of making the admin wait out the window.
      for (const path of REVALIDATE_ON_SAVE) revalidatePath(path);
      return successResponse(updated, "Settings saved");
    },
  }),
);
