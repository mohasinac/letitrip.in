/**
 * Admin FAQs Page
 * Route: /admin/faqs/[[...action]]
 *
 * Thin orchestration layer — all logic lives in AdminFaqsView.
 */

import { use } from "react";
import { AdminFaqsView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminFAQsPage({ params }: PageProps) {
  const { action } = use(params);
  return <AdminFaqsView action={action} />;
}
