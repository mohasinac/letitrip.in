import { AdminEventEntriesView } from "@/features/events/components";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEventEntriesPage({ params }: PageProps) {
  const { id } = await params;
  return <AdminEventEntriesView eventId={id} />;
}
