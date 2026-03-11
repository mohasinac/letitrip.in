import { AdminOrdersView } from "@/features/admin";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default async function AdminOrdersPage({ params }: PageProps) {
  const { action } = await params;
  return <AdminOrdersView action={action} />;
}
