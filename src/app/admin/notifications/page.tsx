import RoleGuard from "@/components/features/auth/RoleGuard";
import Notifications from "@/components/features/notifications/Notifications";

export default function AdminNotificationsPage() {
  return (
    <RoleGuard requiredRole="admin">
      <Notifications
        title="Notifications Management"
        description="Manage system notifications and alerts"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Notifications", href: "/admin/notifications", active: true },
        ]}
      />
    </RoleGuard>
  );
}
