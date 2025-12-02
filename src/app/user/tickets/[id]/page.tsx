"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { DateDisplay } from "@/components/common/values";
import { FormTextarea } from "@/components/forms";
import AuthGuard from "@/components/auth/AuthGuard";
import { supportService } from "@/services/support.service";

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

export default function TicketDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = (params.id as string) || "";
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await supportService.getTicket(ticketId);
      setTicket(response);
    } catch (err: any) {
      console.error("Error fetching ticket:", err);
      setError(err.message || "Failed to load ticket");
    } finally {
      setIsLoading(false);
    }
  };

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
      console.error("Error posting reply:", err);
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-yellow-500"></div>
            <p className="mt-4 text-gray-600">Loading ticket...</p>
          </div>
        </main>
      </AuthGuard>
    );
  }

  if (error || !ticket) {
    return (
      <AuthGuard requireAuth>
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
            {error || "Ticket not found"}
          </div>
          <Link
            href="/user/tickets"
            className="inline-block mt-4 text-yellow-600 hover:text-yellow-700 font-semibold"
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
            className="inline-flex items-center text-yellow-600 hover:text-yellow-700 font-semibold mb-4"
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
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
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
                <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
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
            <div className="text-sm text-gray-500">
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

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Conversation</h2>

          <div className="space-y-4">
            {ticket.messages && ticket.messages.length > 0 ? (
              ticket.messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.senderRole === "admin"
                      ? "bg-blue-50 border border-blue-100"
                      : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      {message.senderRole === "admin" ? "Support Team" : "You"}
                    </span>
                    <span className="text-sm text-gray-500">
                      <DateDisplay date={message.createdAt} includeTime />
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
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
              <p className="text-gray-500 text-center py-4">
                No messages yet. Be the first to reply!
              </p>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {ticket.status !== "closed" && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Reply</h2>
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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-700">
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
