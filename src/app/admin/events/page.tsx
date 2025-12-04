"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { COLLECTIONS } from "@/constants/database";
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

const columns = [
  { key: "title", label: "Title", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "startDate", label: "Start Date", sortable: true },
  { key: "participantCount", label: "Participants", sortable: false },
  { key: "createdAt", label: "Created", sortable: true },
];

const filters = [
  {
    type: "select" as const,
    field: "status",
    label: "Status",
    options: ["draft", "published", "archived"],
  },
  {
    type: "select" as const,
    field: "type",
    label: "Type",
    options: ["workshop", "seminar", "competition", "poll", "announcement"],
  },
];

const bulkActions = [
  { id: "publish", label: "Publish", icon: CheckCircle },
  { id: "archive", label: "Archive", icon: XCircle },
];

export default function AdminEventsPage() {
  const router = useRouter();

  return (
    <AdminResourcePage
      title="Events"
      collection={COLLECTIONS.EVENTS}
      columns={columns}
      filters={filters}
      bulkActions={bulkActions}
      searchFields={["title", "description"]}
      onRowClick={(event) => router.push(`/admin/events/${event.id}`)}
      createButtonLabel="Create Event"
      createButtonHref="/admin/events/create"
    />
  );
}
