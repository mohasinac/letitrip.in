"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { COLLECTIONS } from "@/constants/database";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const columns = [
  {
    key: "title",
    label: "Title",
    sortable: true,
    render: (event: { id: string }) => event.id,
  },
  {
    key: "type",
    label: "Type",
    sortable: true,
    render: (event: { id: string }) => event.id,
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (event: { id: string }) => event.id,
  },
  {
    key: "startDate",
    label: "Start Date",
    sortable: true,
    render: (event: { id: string }) => event.id,
  },
  {
    key: "participantCount",
    label: "Participants",
    sortable: false,
    render: (event: { id: string }) => event.id,
  },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
    render: (event: { id: string }) => event.id,
  },
];

const filters = [
  {
    key: "status",
    type: "select" as const,
    field: "status",
    label: "Status",
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
    ],
  },
  {
    key: "type",
    type: "select" as const,
    field: "type",
    label: "Type",
    options: [
      { value: "workshop", label: "Workshop" },
      { value: "seminar", label: "Seminar" },
      { value: "competition", label: "Competition" },
      { value: "poll", label: "Poll" },
      { value: "announcement", label: "Announcement" },
    ],
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
      onRowClick={(event: { id: string }) =>
        router.push(`/admin/events/${event.id}`)
      }
      createButtonLabel="Create Event"
      createButtonHref="/admin/events/create"
    />
  );
}
