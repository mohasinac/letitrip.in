/**
 * Admin Coupons Page
 *
 * Route: /admin/coupons/[[...action]]
 * Thin wrapper — all logic lives in AdminCouponsView.
 */

import { use } from "react";
import { AdminCouponsView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminCouponsPage({ params }: PageProps) {
  const { action } = use(params);
  return <AdminCouponsView action={action} />;
}
