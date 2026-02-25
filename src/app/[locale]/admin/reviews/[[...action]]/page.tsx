import { use } from "react";
import { AdminReviewsView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminReviewsPage({ params }: PageProps) {
  const { action } = use(params);
  return <AdminReviewsView action={action} />;
}
