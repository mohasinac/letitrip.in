"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import { DateDisplay } from "@/components/common/values";
import { FormSelect, FormTextarea, FormCheckbox } from "@/components/forms";
import { supportService } from "@/services/support.service";
import { useLoadingState } from "@/hooks/useLoadingState";

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "in-progress":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  resolved:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  escalated: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const categoryLabels = {
  "order-issue": "Order Issue",
  "return-refund": "Return/Refund",
  "product-question": "Product Question",
  account: "Account",
  payment: "Payment",
  other: "Other",
};

export default function AdminTicketDetailsPage() {
  const params = useParams();
  const ticketId = (params.id as string) || "";
  const { data: ticket, isLoading, error, execute } = useLoadingState<any>();
  const [replyMessage, setReplyMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTicket = useCallback(async () => {
    await execute(() => supportService.getTicket(ticketId));
  }, [ticketId, execute]);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId, fetchTicket]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (replyMessage.trim().length < 1) {
      return;
    }

    setIsSubmitting(true);

    try {
      await supportService.replyToTicket(ticketId, {
        message: replyMessage,
        isInternal,
      });

      setReplyMessage("");
      setIsInternal(false);
      await fetchTicket();
    } catch (err: any) {
      console.error("Error posting reply:", err);
      toast.error(err.message || "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await supportService.updateTicket(ticketId, {
        status: newStatus as any,
      });
      await fetchTicket();
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setIsUpdating(true);
    try {
      await supportService.updateTicket(ticketId, {
        priority: newPriority as any,
      });
      await fetchTicket();
    } catch (err: any) {
      console.error("Error updating priority:", err);
      toast.error(err.message || "Failed to update priority");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth allowedRoles={["admin"]}>
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 dark:border-gray-600 border-t-yellow-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading ticket...
            </p>
          </div>
        </main>
      </AuthGuard>
    );
  }

  if (error || !ticket) {
    return (
      <AuthGuard requireAuth allowedRoles={["admin"]}>
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-red-700 dark:text-red-300">
            {error?.message || "Ticket not found"}
          </div>
          <Link
            href="/admin/tickets"
            className="inline-block mt-4 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-semibold"
          >
            ← Back to Tickets
          </Link>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/tickets"
            className="inline-flex items-center text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-semibold mb-4"
          >
            <svg
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Tickets
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {ticket.subject}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        statusColors[ticket.status as keyof typeof statusColors]
                      }`}
                    >
                      {ticket.status}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-medium text-gray-800 dark:text-gray-200">
                      {categoryLabels[
                        ticket.category as keyof typeof categoryLabels
                      ] || ticket.category}
                    </span>
                    {ticket.priority === "urgent" && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-semibold">
                        Urgent
                      </span>
                    )}
                    {ticket.priority === "high" && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-sm font-semibold">
                        High Priority
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              {/* User Info */}
              {ticket.user && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    User Information
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <strong>Name:</strong> {ticket.user.name || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong> {ticket.user.email}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Conversation Thread */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Conversation
              </h2>

              <div className="space-y-4">
                {ticket.messages && ticket.messages.length > 0 ? (
                  ticket.messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.senderRole === "admin"
                          ? "bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800"
                          : "bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {message.senderRole === "admin" ? "Admin" : "User"}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          <DateDisplay date={message.createdAt} includeTime />
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {message.message}
                      </p>
                      {message.isInternal && (
                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                          Internal Note
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No messages yet.
                  </p>
                )}
              </div>
            </div>

            {/* Reply Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add Reply
              </h2>
              <form onSubmit={handleReply}>
                <FormTextarea
                  id="reply-message"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  placeholder="Type your message here..."
                  required
                />
                <FormCheckbox
                  id="is-internal"
                  label="Internal Note (not visible to user)"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                />
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || replyMessage.trim().length < 1}
                    className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Ticket Info
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">ID:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-white">
                    {ticketId.slice(0, 8)}...
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Created:
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    <DateDisplay date={ticket.createdAt} includeTime />
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Updated:
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    <DateDisplay date={ticket.updatedAt} includeTime />
                  </span>
                </div>
                {ticket.resolvedAt && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Resolved:
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      <DateDisplay date={ticket.resolvedAt} includeTime />
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Control */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Change Status
              </h3>
              <FormSelect
                id="ticket-status"
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdating}
                options={[
                  { value: "open", label: "Open" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "resolved", label: "Resolved" },
                  { value: "closed", label: "Closed" },
                  { value: "escalated", label: "Escalated" },
                ]}
              />
            </div>

            {/* Priority Control */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Change Priority
              </h3>
              <FormSelect
                id="ticket-priority"
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                disabled={isUpdating}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "urgent", label: "Urgent" },
                ]}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleStatusChange("resolved")}
                  disabled={isUpdating || ticket.status === "resolved"}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Mark as Resolved
                </button>
                <button
                  onClick={() => handleStatusChange("escalated")}
                  disabled={isUpdating || ticket.status === "escalated"}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Escalate Ticket
                </button>
                <button
                  onClick={() => handleStatusChange("closed")}
                  disabled={isUpdating || ticket.status === "closed"}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
