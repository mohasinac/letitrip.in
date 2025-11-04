/**
 * Admin Analytics Page
 * Platform-wide analytics using the reusable Analytics component
 */

"use client";

import RoleGuard from "@/components/features/auth/RoleGuard";
import { Analytics } from "@/components/features/analytics/Analytics";

export default function AdminAnalytics() {
  const breadcrumbs = [
    { label: "Admin", href: "/admin" },
    { label: "Analytics", active: true },
  ];

  return (
    <RoleGuard requiredRole="admin">
      <Analytics
        context="admin"
        title="Analytics"
        description="Track platform performance and insights"
        breadcrumbs={breadcrumbs}
      />
    </RoleGuard>
  );
}
