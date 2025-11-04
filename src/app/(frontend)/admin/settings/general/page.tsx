import { Metadata } from "next";
import SettingsManagement from "@/components/features/settings/SettingsManagement";
import RoleGuard from "@/components/features/auth/RoleGuard";

export const metadata: Metadata = {
  title: "Settings | Admin Dashboard",
  description: "Manage site settings, payment gateways, and configurations",
};

export default function SettingsPage() {
  return (
    <RoleGuard requiredRole="admin">
      <SettingsManagement
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings", href: "/admin/settings/general", active: true },
        ]}
      />
    </RoleGuard>
  );
}
