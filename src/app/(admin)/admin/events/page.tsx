"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { StatusBadge } from '@letitrip/react-library';
import { DateDisplay } from "@letitrip/react-library";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  status: "draft" | "published" | "archived";
  startDate: string;
  endDate: string;
  location?: string;
  isOnline: boolean;
  participantCount: number;
  maxParticipants?: number;
  isPollEvent: boolean;
  voteCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminEventsPage() {
  // Define columns
  const columns = [
    {
      key: "title",
      label: "Event",
      render: (event: Event) => (
        <div>
          <Link
            href={`/admin/events/${event.id}`}
            className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            {event.title}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
            {event.description}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (event: Event) => (
        <div className="flex flex-col gap-1">
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded w-fit">
            {event.type}
          </span>
          {event.isPollEvent && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded w-fit">
              Poll
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (event: Event) => <StatusBadge status={event.status} />,
    },
    {
      key: "dates",
      label: "Dates",
      render: (event: Event) => (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <div>
            <DateDisplay date={new Date(event.startDate)} format="short" />
            {" - "}
            <DateDisplay date={new Date(event.endDate)} format="short" />
          </div>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (event: Event) => (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>{event.isOnline ? "Online" : event.location || "TBA"}</span>
        </div>
      ),
    },
    {
      key: "participants",
      label: "Participants",
      render: (event: Event) => (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>
            {event.isPollEvent
              ? `${event.voteCount || 0} votes`
              : `${event.participantCount}${
                  event.maxParticipants ? ` / ${event.maxParticipants}` : ""
                }`}
          </span>
        </div>
      ),
    },
    {
      key: "created",
      label: "Created",
      render: (event: Event) => (
        <DateDisplay date={new Date(event.createdAt)} format="short" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "all", label: "All Status" },
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      key: "type",
      label: "Type",
      type: "select" as const,
      options: [
        { value: "all", label: "All Types" },
        { value: "workshop", label: "Workshop" },
        { value: "seminar", label: "Seminar" },
        { value: "competition", label: "Competition" },
        { value: "poll", label: "Poll" },
        { value: "announcement", label: "Announcement" },
      ],
    },
  ];

  // Load data function
  const loadData = async (options: {
    cursor: string | null;
    search?: string;
    filters?: Record<string, string>;
  }) => {
    // TODO: Replace with actual API call when events.service.ts is ready
    // For now, return empty data
    return {
      items: [] as Event[],
      nextCursor: null,
      hasNextPage: false,
    };
  };

  // Handle save
  const handleSave = async (id: string, data: Partial<Event>) => {
    // TODO: Implement save when events.service.ts is ready
    console.log("Save event", id, data);
  };

  // Fields for inline editing
  const fields = [
    {
      name: "title",
      label: "Title",
      type: "text",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
      ],
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      id: "publish",
      label: "Publish",
      variant: "default" as const,
      requiresConfirmation: false,
      handler: async (ids: string[]) => {
        // TODO: Implement bulk publish
        console.log("Publish events", ids);
      },
    },
    {
      id: "archive",
      label: "Archive",
      variant: "default" as const,
      requiresConfirmation: true,
      handler: async (ids: string[]) => {
        // TODO: Implement bulk archive
        console.log("Archive events", ids);
      },
    },
  ];

  return (
    <AdminResourcePage<Event>
      resourceName="Event"
      resourceNamePlural="Events"
      loadData={loadData}
      columns={columns}
      fields={fields}
      filters={filters}
      bulkActions={bulkActions}
      onSave={handleSave}
    />
  );
}
