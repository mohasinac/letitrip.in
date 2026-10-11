import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";

export const revalidate = 3600;

export default function Page() {
  redirect(String(ROUTES.USER.BECOME_SELLER));
}
