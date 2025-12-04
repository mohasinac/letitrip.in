"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { DateDisplay } from "@/components/common/values";
import { FormTextarea } from "@/components/forms";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { supportService } from "@/services/support.service";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = (params.id as string) || "";
  const { data: ticket, isLoading, error, execute } = useLoadingState<any>();
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      });

      setReplyMessage("");
      await fetchTicket(); // Refresh ticket with new message
    } catch (err: any) {
      logError(err as Error, {
        component: "UserTicketDetail.handlePostReply",
        metadata: { ticketId },
      });
      toast.error(err.message || "Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
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
      <AuthGuard requireAuth>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-red-700 dark:text-red-400">
            {error?.message || "Ticket not found"}
          </div>
          <Link
            href="/user/tickets"
            className="inline-block mt-4 text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-semibold"
          >
            ← Back to Tickets
          </Link>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/user/tickets"
            className="inline-flex items-center text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-semibold mb-4"
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

        {/* Ticket Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
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
                  <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-sm font-semibold">
                    Urgent
                  </span>
                )}
                {ticket.priority === "high" && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded text-sm font-semibold">
                    High Priority
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Ticket #{ticketId.slice(0, 8)}</p>
              <p>
                Created{" "}
                <DateDisplay
                  date={ticket.createdAt}
                  format="short"
                  className="inline"
                />
              </p>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 mb-6">
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
                      ? "bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800"
                      : "bg-gray-50 border border-gray-100 dark:bg-gray-700 dark:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {message.senderRole === "admin" ? "Support Team" : "You"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      <DateDisplay date={message.createdAt} includeTime />
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {message.message}
                  </p>
                  {message.isInternal && (
                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-semibold rounded">
                      Internal Note
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No messages yet. Be the first to reply!
              </p>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {ticket.status !== "closed" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add Reply
            </h2>
            <form onSubmit={handleReply}>
              <FormTextarea
                id="reply-message"
                label="Your Message"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
                placeholder="Type your message here..."
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || replyMessage.trim().length < 1}
                className="bg-yellow-500 text-gray-900 px-6 py-2 rounded hover:bg-yellow-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Reply"}
              </button>
            </form>
          </div>
        )}

        {ticket.status === "closed" && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300">
              This ticket is closed. If you need further assistance, please
              create a new ticket.
            </p>
            <Link
              href="/support/ticket"
              className="inline-block mt-4 bg-yellow-500 text-gray-900 px-6 py-2 rounded hover:bg-yellow-600 font-bold"
            >
              Create New Ticket
            </Link>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
