import { Suspense, type ReactNode } from "react";
import { redirect } from "@/i18n/navigation";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { getServerPermissions } from "@mohasinac/appkit/server";
import { DashboardLayoutClient } from "@mohasinac/appkit/client";
import { ADMIN_NAV_GROUPS } from "@/constants";
import { ROUTES } from "@/constants";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getServerSessionUser();
  if (!user) redirect(String(ROUTES.AUTH.LOGIN));
  if (user.role !== "admin" && user.role !== "employee") redirect("/unauthorized");

  const resolved = await getServerPermissions(user.uid);

  // employees must have at least dashboard:view; admin passes unconditionally
  if (!resolved.isAdmin && !resolved.permissions.includes("admin:dashboard:view")) {
    redirect("/unauthorized");
  }

  // null = admin sees all nav; explicit array = employee filtered nav
  const permissions = resolved.isAdmin ? null : resolved.permissions;

  return (
    <DashboardLayoutClient variant="admin" groups={ADMIN_NAV_GROUPS} permissions={permissions}>
      <Suspense>{children}</Suspense>
    </DashboardLayoutClient>
  );
}
