import { redirect } from "next/navigation";
import { ROUTES } from "@mohasinac/appkit";

export default function Page() {
  redirect(String(ROUTES.ADMIN.DASHBOARD));
}
