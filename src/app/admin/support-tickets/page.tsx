"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { TICKET_FILTERS } from "@/constants/filters";
import { supportService } from "@/services/support.service";
import type { SupportTicketFE } from "@/types/frontend/support-ticket.types";

export default function SupportTicketsPage() {
  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <SupportTicketsContent />
    </AuthGuard>
  );
}

function SupportTicketsContent() {
  const [tickets, setTickets] = useState<SupportTicketFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  });

  const [closingTicket, setClosingTicket] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [filterValues, currentPage, searchQuery]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await supportService.listTickets({
        ...filterValues,
        search: searchQuery || undefined,
        page: currentPage,
        limit: 20,
      });

      setTickets(response.data);
      // Calculate total pages from count
      setTotalPages(Math.ceil((response.count || 0) / 20));
    } catch (err: any) {
      console.error("Failed to load tickets:", err);
      setError(err.message || "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await supportService.getStats(filterValues);
      setStats({
        total: statsData.totalTickets || 0,
        open: statsData.openTickets || 0,
        inProgress:
          statsData.totalTickets -
            statsData.openTickets -
            statsData.resolvedTickets || 0,
        resolved: statsData.resolvedTickets || 0,
        urgent: statsData.ticketsByPriority?.urgent || 0,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to close this ticket?")) return;

    try {
      setClosingTicket(ticketId);
      await supportService.closeTicket(ticketId);
      await loadTickets();
      await loadStats();
    } catch (err: any) {
      alert(err.message || "Failed to close ticket");
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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="mt-2 text-gray-600">
            Manage customer support tickets and inquiries
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Total Tickets
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {stats.total.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Open</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">
              {stats.open.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">In Progress</div>
            <div className="mt-2 text-3xl font-bold text-purple-600">
              {stats.inProgress.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Resolved</div>
            <div className="mt-2 text-3xl font-bold text-green-600">
              {stats.resolved.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Urgent</div>
            <div className="mt-2 text-3xl font-bold text-red-600">
              {stats.urgent.toLocaleString()}
            </div>
          </div>
        </div>

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
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="ml-3 text-gray-600">Loading tickets...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No support tickets found
                </h3>
                <p className="text-gray-500">
                  {Object.keys(filterValues).length > 0
                    ? "Try adjusting your filters"
                    : "Tickets will appear here when customers create them"}
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ticket ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Assigned To
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/admin/support-tickets/${ticket.id}`}
                                className="text-sm font-medium text-orange-600 hover:text-orange-700"
                              >
                                #{ticket.id.slice(0, 8)}
                              </Link>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {ticket.subject}
                              </div>
                              {ticket.orderId && (
                                <div className="text-xs text-gray-500">
                                  Order: {ticket.orderId.slice(0, 8)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {ticket.userId.slice(0, 8)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                                {formatStatus(ticket.category)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(
                                  ticket.priority
                                )}`}
                              >
                                {formatStatus(ticket.priority)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(
                                  ticket.status
                                )}`}
                              >
                                {formatStatus(ticket.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {ticket.assignedTo ? (
                                <span className="text-gray-900">
                                  {ticket.assignedTo.slice(0, 8)}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(ticket.createdAt)}
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
                                    className="text-gray-600 hover:text-gray-700 disabled:opacity-50"
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
