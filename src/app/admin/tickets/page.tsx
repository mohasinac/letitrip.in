"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { supportService } from "@/services/support.service";
import { useIsMobile } from "@/hooks/useMobile";
import { DateDisplay } from "@/components/common/values";
import { FormSelect } from "@/components/forms";

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  escalated: "bg-red-100 text-red-800",
};

export default function AdminTicketsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: "",
    category: "",
    priority: "",
  });

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await supportService.listTickets({
        status: filter.status as any,
        category: filter.category as any,
        priority: filter.priority as any,
      });
      setTickets(response.data || []);
      setStats((response as any).stats || {});
    } catch (err: any) {
      console.error("Error fetching admin tickets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Support Tickets Management
        </h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">
                {stats.open || 0}
              </div>
              <div className="text-sm text-blue-700">Open</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-900">
                {stats.inProgress || 0}
              </div>
              <div className="text-sm text-yellow-700">In Progress</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-900">
                {stats.resolved || 0}
              </div>
              <div className="text-sm text-green-700">Resolved</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {stats.closed || 0}
              </div>
              <div className="text-sm text-gray-700">Closed</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-2xl font-bold text-red-900">
                {stats.escalated || 0}
              </div>
              <div className="text-sm text-red-700">Escalated</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect
              id="filter-status"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              options={[
                { value: "", label: "All Statuses" },
                { value: "open", label: "Open" },
                { value: "in-progress", label: "In Progress" },
                { value: "resolved", label: "Resolved" },
                { value: "closed", label: "Closed" },
                { value: "escalated", label: "Escalated" },
              ]}
            />

            <FormSelect
              id="filter-category"
              value={filter.category}
              onChange={(e) =>
                setFilter({ ...filter, category: e.target.value })
              }
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

            <FormSelect
              id="filter-priority"
              value={filter.priority}
              onChange={(e) =>
                setFilter({ ...filter, priority: e.target.value })
              }
              options={[
                { value: "", label: "All Priorities" },
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
            />
          </div>
        </div>

        {/* Tickets Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-yellow-500"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-600">No tickets found</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            {isMobile && (
              <div className="lg:hidden space-y-4 mb-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                    className="bg-white dark:bg-gray-800 rounded-lg border p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {ticket.subject}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {ticket.category}
                        </p>
                      </div>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[
                            ticket.status as keyof typeof statusColors
                          ]
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-400">
                          Priority:
                        </span>
                        <span
                          className={`font-medium ${
                            ticket.priority === "urgent"
                              ? "text-red-600"
                              : ticket.priority === "high"
                                ? "text-orange-600"
                                : ticket.priority === "medium"
                                  ? "text-yellow-600"
                                  : "text-gray-600"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-400">
                          Created:
                        </span>
                        <DateDisplay
                          date={ticket.createdAt}
                          format="short"
                          className="text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/tickets/${ticket.id}`);
                      }}
                      className="w-full py-2 text-center text-yellow-600 hover:text-yellow-700 font-medium border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Desktop Table */}
            <div
              className={`bg-white rounded-lg border overflow-hidden ${
                isMobile ? "hidden" : ""
              }`}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
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
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.subject}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ticket.category}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusColors[
                              ticket.status as keyof typeof statusColors
                            ]
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <DateDisplay date={ticket.createdAt} format="short" />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/tickets/${ticket.id}`);
                          }}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </AuthGuard>
  );
}
