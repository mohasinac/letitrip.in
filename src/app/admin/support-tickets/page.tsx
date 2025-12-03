"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { TICKET_FILTERS } from "@/constants/filters";
import { supportService } from "@/services/support.service";
import { useLoadingState } from "@/hooks/useLoadingState";
import { StatsCard, StatsCardGrid } from "@/components/common/StatsCard";
import { SimplePagination } from "@/components/common/Pagination";
import type { SupportTicketFE } from "@/types/frontend/support-ticket.types";
import { DateDisplay } from "@/components/common/values";

export default function SupportTicketsPage() {
  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <SupportTicketsContent />
    </AuthGuard>
  );
}

function SupportTicketsContent() {
  const {
    data: ticketsData,
    isLoading: loading,
    error,
    execute,
  } = useLoadingState<{
    tickets: SupportTicketFE[];
    totalPages: number;
    stats: {
      total: number;
      open: number;
      inProgress: number;
      resolved: number;
      urgent: number;
    };
  }>();

  const tickets = ticketsData?.tickets || [];
  const totalPages = ticketsData?.totalPages || 1;
  const stats = ticketsData?.stats || {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  };

  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [closingTicket, setClosingTicket] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [ticketsRes, statsData] = await Promise.all([
      supportService.listTickets({
        ...filterValues,
        search: searchQuery || undefined,
        page: currentPage,
        limit: 20,
      }),
      supportService.getStats(filterValues),
    ]);

    return {
      tickets: ticketsRes.data,
      totalPages: Math.ceil((ticketsRes.count || 0) / 20),
      stats: {
        total: statsData.totalTickets || 0,
        open: statsData.openTickets || 0,
        inProgress:
          statsData.totalTickets -
            statsData.openTickets -
            statsData.resolvedTickets || 0,
        resolved: statsData.resolvedTickets || 0,
        urgent: statsData.ticketsByPriority?.urgent || 0,
      },
    };
  }, [filterValues, currentPage, searchQuery]);

  useEffect(() => {
    execute(loadData);
  }, [execute, loadData]);

  const handleCloseTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to close this ticket?")) return;

    try {
      setClosingTicket(ticketId);
      await supportService.closeTicket(ticketId);
      await execute(loadData);
    } catch (err: any) {
      toast.error(err.message || "Failed to close ticket");
    } finally {
      setClosingTicket(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Support Tickets
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage customer support tickets and inquiries
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCardGrid columns={5} className="mb-8">
          <StatsCard title="Total Tickets" value={stats.total} />
          <StatsCard
            title="Open"
            value={stats.open}
            className="[&_p:last-child]:!text-blue-600 dark:[&_p:last-child]:!text-blue-400"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            className="[&_p:last-child]:!text-purple-600 dark:[&_p:last-child]:!text-purple-400"
          />
          <StatsCard
            title="Resolved"
            value={stats.resolved}
            className="[&_p:last-child]:!text-green-600 dark:[&_p:last-child]:!text-green-400"
          />
          <StatsCard
            title="Urgent"
            value={stats.urgent}
            className="[&_p:last-child]:!text-red-600 dark:[&_p:last-child]:!text-red-400"
          />
        </StatsCardGrid>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <div className="w-64 flex-shrink-0">
            <UnifiedFilterSidebar
              isOpen={true}
              sections={TICKET_FILTERS}
              values={filterValues}
              onChange={(key: string, value: any) => {
                setFilterValues((prev) => ({ ...prev, [key]: value }));
              }}
              onApply={() => setCurrentPage(1)}
              onReset={() => {
                setFilterValues({});
                setSearchQuery("");
                setCurrentPage(1);
              }}
              showInlineSearch={true}
              onInlineSearchChange={(value: string) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              inlineSearchValue={searchQuery}
              inlineSearchPlaceholder="Search tickets..."
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
                {error.message || "Failed to load support tickets"}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading tickets...
                </span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No support tickets found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {Object.keys(filterValues).length > 0
                    ? "Try adjusting your filters"
                    : "Tickets will appear here when customers create them"}
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Ticket ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Assigned To
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {tickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/admin/support-tickets/${ticket.id}`}
                                className="text-sm font-medium text-orange-600 hover:text-orange-700"
                              >
                                #{ticket.id.slice(0, 8)}
                              </Link>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                {ticket.subject}
                              </div>
                              {ticket.orderId && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Order: {ticket.orderId.slice(0, 8)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {ticket.userId.slice(0, 8)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                {formatStatus(ticket.category)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(
                                  ticket.priority,
                                )}`}
                              >
                                {formatStatus(ticket.priority)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(
                                  ticket.status,
                                )}`}
                              >
                                {formatStatus(ticket.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {ticket.assignedTo ? (
                                <span className="text-gray-900 dark:text-white">
                                  {ticket.assignedTo.slice(0, 8)}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 italic">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <DateDisplay
                                date={ticket.createdAt}
                                includeTime
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Link
                                  href={`/admin/support-tickets/${ticket.id}`}
                                  className="text-orange-600 hover:text-orange-700"
                                >
                                  View
                                </Link>
                                {ticket.status !== "closed" && (
                                  <button
                                    onClick={() => handleCloseTicket(ticket.id)}
                                    disabled={closingTicket === ticket.id}
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50"
                                  >
                                    {closingTicket === ticket.id
                                      ? "..."
                                      : "Close"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <SimplePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="mt-6"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
