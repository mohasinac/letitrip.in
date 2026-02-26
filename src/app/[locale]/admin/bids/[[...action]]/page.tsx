import { use } from "react";
import { AdminBidsView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminBidsPage({ params }: PageProps) {
  const { action } = use(params);
  return <AdminBidsView action={action} />;
}
