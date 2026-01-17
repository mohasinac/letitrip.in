"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateDisplay } from "@letitrip/react-library";
import { FormSelect } from "@letitrip/react-library";
import AuthGuard from "@/components/auth/AuthGuard";
import { supportService } from "@/services/support.service";
import { useLoadingState } from "@letitrip/react-library";
import type { SupportTicketFE } from "@/types/frontend/support-ticket.types";

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "in-progress":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  escalated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const categoryLabels = {
  "order-issue": "Order Issue",
  "return-refund": "Return/Refund",
  "product-question": "Product Question",
  account: "Account",
  payment: "Payment",
  other: "Other",
};

export default function UserTicketsPage() {
  const router = useRouter();
  const {
    data: ticketsData,
    isLoading,
    error,
    execute,
  } = useLoadingState<{
    data: SupportTicketFE[];
    pagination: any;
  }>();
  const tickets = ticketsData?.data || [];

  // Cursor pagination state
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [filter, setFilter] = useState({
    status: "",
    category: "",
  });

  const fetchTickets = useCallback(async () => {
    const startAfter = cursors[currentPage - 1];
    const response = await execute(() =>
      supportService.listTickets({
        status: filter.status as any,
        category: filter.category as any,
        startAfter,
        limit: 20,
      } as any),
    );

    if (response) {
      // Check if it's cursor pagination
      if ("hasNextPage" in response.pagination) {
        setHasNextPage(response.pagination.hasNextPage || false);

        if ("nextCursor" in response.pagination) {
          const cursorPagination = response.pagination as any;
          if (cursorPagination.nextCursor) {
            setCursors((prev) => {
              const newCursors = [...prev];
              newCursors[currentPage] = cursorPagination.nextCursor || null;
              return newCursors;
            });
          }
        }
      }
    }
  }, [filter, currentPage, cursors, execute]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    setCursors([null]);
  };

  return (
    <AuthGuard requireAuth>
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            Support Tickets
          </h1>
          <Link
            href="/support/ticket"
            className="bg-yellow-500 text-gray-900 px-6 py-2 rounded hover:bg-yellow-600 font-bold text-center"
          >
            Create New Ticket
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormSelect
                id="status-filter"
                label="Filter by Status"
                value={filter.status}
                onChange={(e) => {
                  setFilter({ ...filter, status: e.target.value });
                  handleFilterChange();
                }}
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "open", label: "Open" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "resolved", label: "Resolved" },
                  { value: "closed", label: "Closed" },
                  { value: "escalated", label: "Escalated" },
                ]}
              />
            </div>

            <div>
              <FormSelect
                id="category-filter"
                label="Filter by Category"
                value={filter.category}
                onChange={(e) => {
                  setFilter({ ...filter, category: e.target.value });
                  handleFilterChange();
                }}
                options={[
                  { value: "", label: "All Categories" },
                  { value: "order-issue", label: "Order Issue" },
                  { value: "return-refund", label: "Return/Refund" },
                  { value: "product-question", label: "Product Question" },
                  { value: "account", label: "Account" },
                  { value: "payment", label: "Payment" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error.message || "Failed to load tickets"}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-yellow-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading tickets...
            </p>
          </div>
        )}

        {/* Tickets List */}
        {!isLoading && tickets.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Support Tickets
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter.status || filter.category
                ? "No tickets match your filters"
                : "You haven't created any support tickets yet"}
            </p>
            {!filter.status && !filter.category && (
              <Link
                href="/support/ticket"
                className="inline-block bg-yellow-500 text-gray-900 px-6 py-2 rounded hover:bg-yellow-600 font-bold"
              >
                Create Your First Ticket
              </Link>
            )}
          </div>
        )}

        {/* Tickets Grid */}
        {!isLoading && tickets.length > 0 && (
          <>
            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => router.push(`/user/tickets/${ticket.id}`)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    router.push(`/user/tickets/${ticket.id}`)
                  }
                  role="button"
                  tabIndex={0}
                  className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {ticket.subject}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {ticket.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                statusColors[
                                  ticket.status as keyof typeof statusColors
                                ]
                              }`}
                            >
                              {ticket.status}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                              {categoryLabels[
                                ticket.category as keyof typeof categoryLabels
                              ] || ticket.category}
                            </span>
                            <DateDisplay
                              date={ticket.createdAt}
                              format="short"
                              className="text-sm text-gray-500 dark:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ticket.priority === "urgent" && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs font-semibold">
                          Urgent
                        </span>
                      )}
                      {ticket.priority === "high" && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded text-xs font-semibold">
                          High
                        </span>
                      )}
                      <svg
                        className="h-5 w-5 text-gray-400 dark:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} • {tickets.length} tickets
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </AuthGuard>
  );
}
