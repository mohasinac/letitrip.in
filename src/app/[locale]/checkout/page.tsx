import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { CheckoutRouteClient } from "@/components/routing/CheckoutRouteClient";
import { ROUTES, siteSettingsRepository } from "@mohasinac/appkit";

export default async function Page() {
  const user = await getServerSessionUser();
  if (!user) {
    redirect(`${String(ROUTES.AUTH.LOGIN)}?redirect=/checkout`);
  }

  // Admin bypass is available only when the user is admin AND the feature flag
  // is explicitly enabled in siteSettings. Computed server-side so the client
  // never needs a role check or an extra API call.
  let adminBypassEnabled = false;
  if (user.role === "admin") {
    const settings = await siteSettingsRepository.getSingleton();
    adminBypassEnabled = settings?.featureFlags?.adminCheckoutBypass === true;
  }

  return <CheckoutRouteClient adminBypassEnabled={adminBypassEnabled} />;
}
