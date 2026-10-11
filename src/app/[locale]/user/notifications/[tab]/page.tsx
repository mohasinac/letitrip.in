import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";

export default async function Page() {
  redirect(String(ROUTES.USER.NOTIFICATIONS));
}
