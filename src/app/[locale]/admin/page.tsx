import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit";

export default function Page() {
  redirect(String(ROUTES.ADMIN.DASHBOARD));
}
