"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { TICKET_FILTERS } from "@/constants/filters";
import { logError } from "@/lib/firebase-error-logger";
import { supportService } from "@/services/support.service";
import type { SupportTicketFE } from "@/types/frontend/support-ticket.types";
import { TicketStatus } from "@/types/shared/common.types";
import {
  StatusBadge,
  UnifiedFilterSidebar,
  useIsMobile,
  useLoadingState,
} from "@letitrip/react-library";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  MessageSquare,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function SellerSupportTicketsPage() {
  return (
    <AuthGuard requireAuth allowedRoles={["seller", "admin"]}>
      <SellerSupportTicketsContent />
    </AuthGuard>
  );
}

interface TicketsData {
  tickets: SupportTicketFE[];
  totalTickets: number;
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
}

function SellerSupportTicketsContent() {
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(!isMobile);
  const { data, isLoading, execute } = useLoadingState<TicketsData>({
    initialData: {
      tickets: [],
      totalTickets: 0,
      stats: { total: 0, open: 0, inProgress: 0, resolved: 0 },
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const tickets = data?.tickets || [];
  const totalTickets = data?.totalTickets || 0;
  const stats = data?.stats || {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  };

  const loadData = useCallback(async () => {
    try {
      const [ticketsRes, totalRes, openRes, inProgressRes, resolvedRes] =
        await Promise.all([
          supportService.getMyTickets({
            search: searchQuery || undefined,
            page: currentPage,
            limit: 20,
            ...filterValues,
          }),
          supportService.getTicketCount({}),
          supportService.getTicketCount({ status: TicketStatus.OPEN }),
          supportService.getTicketCount({ status: TicketStatus.IN_PROGRESS }),
          supportService.getTicketCount({ status: TicketStatus.RESOLVED }),
        ]);

      return {
        tickets: ticketsRes.data || [],
        totalTickets: ticketsRes.count || 0,
        stats: {
          total: totalRes.count || 0,
          open: openRes.count || 0,
          inProgress: inProgressRes.count || 0,
          resolved: resolvedRes.count || 0,
        },
      };
    } catch (error) {
      logError(error as Error, { component: "SellerSupportTickets.loadData" });
      return {
        tickets: [],
        totalTickets: 0,
        stats: { total: 0, open: 0, inProgress: 0, resolved: 0 },
      };
    }
  }, [searchQuery, filterValues, currentPage]);

  useEffect(() => {
    execute(loadData);
  }, [execute, loadData]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30";
      case "high":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/30";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30";
      case "low":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "order":
        return "📦";
      case "product":
        return "🛍️";
      case "payment":
        return "💳";
      case "shipping":
        return "🚚";
      case "return":
        return "↩️";
      case "technical":
        return "🔧";
      case "account":
        return "👤";
      default:
        return "❓";
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const ticketDate = new Date(date);
    const diffInMinutes = Math.floor(
      (now.getTime() - ticketDate.getTime()) / 60000
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Support Tickets
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your support inquiries
          </p>
        </div>
        {/* NOTE: /seller/support-tickets/create does not exist - use /support/create */}
        <Link
          href="/support/create"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Tickets
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-3">
              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Open
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.open}
              </p>
            </div>
            <div className="rounded-full bg-yellow-50 dark:bg-yellow-900/30 p-3">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                In Progress
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.inProgress}
              </p>
            </div>
            <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-3">
              <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Resolved
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {stats.resolved}
              </p>
            </div>
            <div className="rounded-full bg-green-50 dark:bg-green-900/30 p-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      {isMobile && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      )}

      {/* Main Content with Sidebar Layout */}
      <div className="flex gap-6">
        {/* Desktop Filters - Always Visible Sidebar */}
        {!isMobile && (
          <UnifiedFilterSidebar
            sections={TICKET_FILTERS as any}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({
                ...prev,
                [key]: value,
              }));
            }}
            onApply={() => {}}
            onReset={() => {
              setFilterValues({});
              setSearchQuery("");
            }}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            searchable={true}
            mobile={false}
            resultCount={totalTickets}
            isLoading={isLoading}
            showInlineSearch={true}
            inlineSearchValue={searchQuery}
            onInlineSearchChange={setSearchQuery}
            inlineSearchPlaceholder="Search tickets..."
          />
        )}

        {/* Content Area */}
        <div className="flex-1 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600 dark:text-gray-400">
                Loading tickets...
              </div>
            </div>
          )}

          {!isLoading && tickets.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No tickets found
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {searchQuery || Object.keys(filterValues).length > 0
                  ? "Try adjusting your search or filters"
                  : "Create your first support ticket to get help"}
              </p>
              <Link
                href="/support/create"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                New Ticket
              </Link>
            </div>
          )}

          {!isLoading && tickets.length > 0 && (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/seller/support-tickets/${ticket.id}`}
                  className="block rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getCategoryIcon(ticket.category)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {ticket.subject}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span>#{ticket.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span className="capitalize">
                              {ticket.category}
                            </span>
                            {ticket.orderId && (
                              <>
                                <span>•</span>
                                <span>Order #{ticket.orderId.slice(0, 8)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {ticket.description || "No description"}
                      </p>

                      {/* Meta Info */}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(ticket.createdAt)}
                        </span>
                        {ticket.assignedTo && (
                          <span>Assigned to support agent</span>
                        )}
                      </div>
                    </div>

                    {/* Status & Priority */}
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={ticket.status} />
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalTickets > 20 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage * 20 >= totalTickets}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * 20 + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * 20, totalTickets)}
                    </span>{" "}
                    of <span className="font-medium">{totalTickets}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage * 20 >= totalTickets}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobile && (
        <UnifiedFilterSidebar
          sections={TICKET_FILTERS as any}
          values={filterValues}
          onChange={(key, value) => {
            setFilterValues((prev) => ({
              ...prev,
              [key]: value,
            }));
          }}
          onApply={() => {
            setShowFilters(false);
          }}
          onReset={() => {
            setFilterValues({});
            setSearchQuery("");
          }}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          searchable={true}
          mobile={true}
          resultCount={totalTickets}
          isLoading={isLoading}
          showInlineSearch={true}
          inlineSearchValue={searchQuery}
          onInlineSearchChange={setSearchQuery}
          inlineSearchPlaceholder="Search tickets..."
        />
      )}
    </div>
  );
}

