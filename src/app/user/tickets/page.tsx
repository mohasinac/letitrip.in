"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { supportService } from "@/services/support.service";
import type { SupportTicketFE } from "@/types/frontend/support-ticket.types";

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  escalated: "bg-red-100 text-red-800",
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
  const [tickets, setTickets] = useState<SupportTicketFE[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Cursor pagination state
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const [filter, setFilter] = useState({
    status: "",
    category: "",
  });

  useEffect(() => {
    fetchTickets();
  }, [filter, currentPage]);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError("");

    try {
      const startAfter = cursors[currentPage - 1];
      const response = await supportService.listTickets({
        status: filter.status as any,
        category: filter.category as any,
        startAfter,
        limit: 20,
      } as any);
      
      setTickets(response.data || []);
      setHasNextPage(response.hasMore || false);
      
      if (response.nextCursor) {
        setCursors((prev) => {
          const newCursors = [...prev];
          newCursors[currentPage] = response.nextCursor || null;
          return newCursors;
        });
      }
    } catch (err: any) {
      console.error("Error fetching tickets:", err);
      setError(err.message || "Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
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
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filter.status}
                onChange={(e) => {
                  setFilter({ ...filter, status: e.target.value });
                  handleFilterChange();
                }}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={filter.category}
                onChange={(e) => {
                  setFilter({ ...filter, category: e.target.value });
                  handleFilterChange();
                }}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All Categories</option>
                <option value="order-issue">Order Issue</option>
                <option value="return-refund">Return/Refund</option>
                <option value="product-question">Product Question</option>
                <option value="account">Account</option>
                <option value="payment">Payment</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-yellow-500"></div>
            <p className="mt-4 text-gray-600">Loading tickets...</p>
          </div>
        )}

        {/* Tickets List */}
        {!isLoading && tickets.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Support Tickets
            </h2>
            <p className="text-gray-600 mb-4">
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
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {ticket.subject}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {ticket.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                statusColors[
                                  ticket.status as keyof typeof statusColors
                                ]
                              }`}
                            >
                              {ticket.status}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                              {categoryLabels[
                                ticket.category as keyof typeof categoryLabels
                              ] || ticket.category}
                            </span>
                            <span>
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ticket.priority === "urgent" && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                          Urgent
                        </span>
                      )}
                      {ticket.priority === "high" && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                          High
                        </span>
                      )}
                      <svg
                        className="h-5 w-5 text-gray-400"
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
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {currentPage} • {tickets.length} tickets
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage || isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
