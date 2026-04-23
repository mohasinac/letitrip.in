import { AdminEventEntriesView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { id: string } }) {
  return <AdminEventEntriesView eventId={params.id} />;
}
