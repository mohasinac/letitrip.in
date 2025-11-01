import { Metadata } from "next";
import RoleGuard from "@/components/features/auth/RoleGuard";
import BulkOperationsManagement from "@/components/features/bulk/BulkOperationsManagement";

export const metadata: Metadata = {
  title: "Bulk Operations | Admin Panel",
  description: "Import, export, and perform batch operations on your data",
};

export default function BulkOperationsPage() {
  return (
    <RoleGuard requiredRole="admin">
      <BulkOperationsManagement
        title="Bulk Operations"
        description="Import, export, and perform batch operations on your data"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Bulk Operations", href: "/admin/bulk" },
        ]}
      />
    </RoleGuard>
  );
}
