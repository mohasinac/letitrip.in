/**
 * Admin Categories Page
 * Route: /admin/categories/[[...action]]
 *
 * Thin orchestration layer — all logic lives in AdminCategoriesView.
 */

import { use } from "react";
import { AdminCategoriesView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminCategoriesPage({ params }: PageProps) {
  const { action } = use(params);
  return <AdminCategoriesView action={action} />;
}
