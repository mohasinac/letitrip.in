import { use } from "react";
import { AdminProductsView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminProductsPage({ params }: PageProps) {
  const { action } = use(params);
  return <AdminProductsView action={action} />;
}
