import { redirect } from "@/i18n/navigation";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { CheckoutRouteClient } from "@/components";
import { ROUTES, siteSettingsRepository, ADMIN_CHECKOUT_BYPASS_FLAG_KEY, isAdminUser } from "@mohasinac/appkit";

export default async function Page() {
  const user = await getServerSessionUser();
  if (!user) {
    redirect(`${String(ROUTES.AUTH.LOGIN)}?redirect=/checkout`);
  }

  // Admin bypass is available only when the user is admin AND the feature flag
  // is explicitly enabled in siteSettings. Computed server-side so the client
  // never needs a role check or an extra API call.
  let adminBypassEnabled = false;
  if (isAdminUser(user)) {
    const settings = await siteSettingsRepository.getSingleton();
    const flags = settings?.featureFlags as Record<string, unknown> | undefined;
    adminBypassEnabled = flags?.[ADMIN_CHECKOUT_BYPASS_FLAG_KEY] === true;
  }

  return <CheckoutRouteClient adminBypassEnabled={adminBypassEnabled} />;
}
