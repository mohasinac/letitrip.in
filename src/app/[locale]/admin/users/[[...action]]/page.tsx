/**
 * Admin Users Page
 *
 * Route: /admin/users/[[...action]]
 * Thin wrapper — all logic lives in AdminUsersView.
 */

import { use } from "react";
import { AdminUsersView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminUsersPage({ params }: PageProps) {
  const { action } = use(params);
  return <AdminUsersView action={action} />;
}
