import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { CheckoutRouteClient } from "@/components/routing/CheckoutRouteClient";
import { ROUTES } from "@mohasinac/appkit";

export default async function Page() {
  const user = await getServerSessionUser();
  if (!user) {
    redirect(`${String(ROUTES.AUTH.LOGIN)}?redirect=/checkout`);
  }
  return <CheckoutRouteClient />;
}
