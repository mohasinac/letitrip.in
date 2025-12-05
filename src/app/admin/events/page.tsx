/**
 * @fileoverview React Component
 * @module src/app/admin/events/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";

/**
 * Event interface
 * 
 * @interface
 * @description Defines the structure and contract for Event
 */
interface Event {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Type */
  type: string;
  /** Status */
  status: "draft" | "published" | "archived";
  /** Start Date */
  startDate: string;
  /** End Date */
  endDate: string;
  /** Location */
  location?: string;
  /** Is Online */
  isOnline: boolean;
  /** Participant Count */
  participantCount: number;
  /** Max Participants */
  maxParticipants?: number;
  /** Is Poll Event */
  isPollEvent: boolean;
  /** Vote Count */
  voteCount?: number;
  /** Created At */
  createdAt: string;
  /** Updated At */
  updatedAt: string;
}

export default /**
 * Performs admin events page operation
 *
 * @returns {any} The admineventspage result
 *
 */
function AdminEventsPage() {
  // Define columns
  /**
 * Performs columns operation
 *
 * @param {Event} event - The event
 *
 * @returns {any} The columns result
 *
 */
const columns = [
    {
      /** Key */
      key: "title",
      /** Label */
      label: "Event",
      /** Render */
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
      /** Key */
      key: "type",
      /** Label */
      label: "Type",
      /** Render */
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
      /** Key */
      key: "status",
      /** Label */
      label: "Status",
      /** Render */
      render: (event: Event) => <StatusBadge status={event.status} />,
    },
    {
      /** Key */
      key: "dates",
      /** Label */
      label: "Dates",
      /** Render */
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
      /** Key */
      key: "location",
      /** Label */
      label: "Location",
      /** Render */
      render: (event: Event) => (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>{event.isOnline ? "Online" : event.location || "TBA"}</span>
        </div>
      ),
    },
    {
      /** Key */
      key: "participants",
      /** Label */
      label: "Participants",
      /** Render */
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
      /** Key */
      key: "created",
      /** Label */
      label: "Created",
      /** Render */
      render: (event: Event) => (
        <DateDisplay date={new Date(event.createdAt)} format="short" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      /** Key */
      key: "status",
      /** Label */
      label: "Status",
      /** Type */
      type: "select" as const,
      /** Options */
      options: [
        { value: "all", label: "All Status" },
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      /** Key */
      key: "type",
      /** Label */
      label: "Type",
      /** Type */
      type: "select" as const,
      /** Options */
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
  /**
   * Performs async operation
   *
   * @param {{
    cursor} [options] - Configuration options
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadData = async (options: {
    /** Cursor */
    cursor: string | null;
    /** Search */
    search?: string;
    /** Filters */
    filters?: Record<string, string>;
  }) => {
    // TODO: Replace with actual API call when events.service.ts is ready
    // For now, return empty data
    return {
      /** Items */
      items: [] as Event[],
      /** Next Cursor */
      nextCursor: null,
      /** Has Next Page */
      hasNextPage: false,
    };
  };

  // Handle save
  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<Event>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<Event>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSave = async (id: string, data: Partial<Event>) => {
    // TODO: Implement save when events.service.ts is ready
    console.log("Save event", id, data);
  };

  // Fields for inline editing
  const fields = [
    {
      /** Name */
      name: "title",
      /** Label */
      label: "Title",
      /** Type */
      type: "text",
      /** Required */
      required: true,
    },
    {
      /** Name */
      name: "status",
      /** Label */
      label: "Status",
      /** Type */
      type: "select",
      /** Required */
      required: true,
      /** Options */
      options: [
        { value: "draft", label: "Draft" },
        { value: "published", l/**
 * Performs bulk actions operation
 *
 * @param {string[]} ids - The ids
 *
 * @returns {Promise<any>} The bulkactions result
 *
 */
abel: "Published" },
        { value: "archived", label: "Archived" },
      ],
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      /** Id */
      id: "publish",
      /** Label */
      label: "Publish",
      /** Variant */
      variant: "default" as const,
      /** Requires Confirmation */
      requiresConfirmation: false,
      /** Handler */
      handler: async (ids: string[]) => {
        // TODO: Implement bulk publish
        console.log("Publish events", ids);
      },
    },
    {
      /** Id */
      id: "archive",
      /** Label */
      label: "Archive",
      /** Variant */
      variant: "default" as const,
      /** Requires Confirmation */
      requiresConfirmation: true,
      /** Handler */
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
