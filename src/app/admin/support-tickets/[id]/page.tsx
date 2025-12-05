"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { supportService } from "@/services/support.service";
import type {
  SupportTicketFE,
  SupportTicketMessageFE,
} from "@/types/frontend/support-ticket.types";
import { TicketStatus } from "@/types/shared/common.types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface AssignTicketData {
  assignedTo: string;
  notes?: string;
}

interface ReplyToTicketData {
  message: string;
  attachments?: string[];
  isInternal: boolean;
}

export default function TicketDetailPage() {
  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <TicketDetailContent />
    </AuthGuard>
  );
}

function TicketDetailContent() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [messages, setMessages] = useState<SupportTicketMessageFE[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [replying, setReplying] = useState(false);

  const {
    isLoading: loading,
    error,
    data: ticket,
    setData: setTicket,
    execute,
  } = useLoadingState<SupportTicketFE | null>({
    initialData: null,
    onLoadError: (err) => {
      logError(err, {
        component: "SupportTicketDetail.loadTicket",
        metadata: { ticketId },
      });
    },
  });

  const [assignedTo, setAssignedTo] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [escalateReason, setEscalateReason] = useState("");
  const [escalateNotes, setEscalateNotes] = useState("");
  const [escalating, setEscalating] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  const [updating, setUpdating] = useState(false);
  const [closing, setClosing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTicket();
    loadMessages();
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadTicket = async () => {
    await execute(async () => {
      const data = await supportService.getTicket(ticketId);
      setAssignedTo(data.assignedTo || "");
      return data;
    });
  };

  const loadMessages = async () => {
    try {
      const response = await supportService.getMessages(ticketId, 1, 100);
      setMessages(response.data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      setReplying(true);

      let uploadedUrls: string[] = [];
      if (attachments.length > 0) {
        uploadedUrls = await Promise.all(
          attachments.map((file) => supportService.uploadAttachment(file))
        ).then((results) => results.map((r) => r.url));
      }

      const replyData: ReplyToTicketData = {
        message: replyMessage,
        attachments: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        isInternal,
      };

      await supportService.replyToTicket(ticketId, replyData);

      setReplyMessage("");
      setAttachments([]);
      setIsInternal(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      await loadMessages();
      await loadTicket();
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  const handleAssign = async () => {
    if (!assignedTo.trim()) {
      toast.error("Please enter an agent ID to assign");
      return;
    }

    try {
      setAssigning(true);
      const data: AssignTicketData = {
        assignedTo,
        notes: assignNotes || undefined,
      };
      await supportService.assignTicket(ticketId, data);
      setAssignNotes("");
      await loadTicket();
      await loadMessages();
    } catch (err: any) {
      toast.error(err.message || "Failed to assign ticket");
    } finally {
      setAssigning(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim()) {
      toast.error("Please provide a reason for escalation");
      return;
    }

    try {
      setEscalating(true);
      await supportService.escalateTicket(ticketId);
      setEscalateReason("");
      setEscalateNotes("");
      setShowEscalateModal(false);
      await loadTicket();
      await loadMessages();
    } catch (err: any) {
      toast.error(err.message || "Failed to escalate ticket");
    } finally {
      setEscalating(false);
    }
  };

  const handleUpdateStatus = async (newStatus: TicketStatus) => {
    try {
      setUpdating(true);
      await supportService.updateTicket(ticketId, { status: newStatus });
      await loadTicket();
      await loadMessages();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = async () => {
    if (!confirm("Are you sure you want to close this ticket?")) return;

    try {
      setClosing(true);
      await supportService.closeTicket(ticketId);
      await loadTicket();
      await loadMessages();
    } catch (err: any) {
      toast.error(err.message || "Failed to close ticket");
    } finally {
      setClosing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading ticket...
        </span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {(error instanceof Error ? error.message : error) ||
              "Ticket not found"}
          </h3>
          <button
            onClick={() => router.push("/admin/support-tickets")}
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            ← Back to Support Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/support-tickets"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center mb-4"
          >
            ← Back to Support Tickets
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ticket #{ticket.id.slice(0, 8)}
            </h1>
            <div className="flex items-center space-x-3">
              {ticket.status !== "closed" && (
                <>
                  {ticket.status === "open" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(TicketStatus.IN_PROGRESS)
                      }
                      disabled={updating}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {updating ? "..." : "Mark In Progress"}
                    </button>
                  )}
                  {ticket.status === "in-progress" && (
                    <button
                      onClick={() => handleUpdateStatus(TicketStatus.RESOLVED)}
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating ? "..." : "Mark Resolved"}
                    </button>
                  )}
                  <button
                    onClick={() => setShowEscalateModal(true)}
                    className="px-4 py-2 border border-red-600 text-red-600 dark:text-red-400 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Escalate
                  </button>
                  <button
                    onClick={handleClose}
                    disabled={closing}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                  >
                    {closing ? "..." : "Close Ticket"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Ticket Information
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {formatStatus(ticket.status)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Priority
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {formatStatus(ticket.priority)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Category
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatStatus(ticket.category)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Customer
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {ticket.userId.slice(0, 8)}
                  </dd>
                </div>
                {ticket.orderId && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Order
                    </dt>
                    <dd className="mt-1">
                      <Link
                        href={`/admin/orders/${ticket.orderId}`}
                        className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                      >
                        {ticket.orderId.slice(0, 8)}
                      </Link>
                    </dd>
                  </div>
                )}
                {ticket.shopId && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Shop
                    </dt>
                    <dd className="mt-1">
                      <Link
                        href={`/admin/shops/${ticket.shopId}`}
                        className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                      >
                        {ticket.shopId.slice(0, 8)}
                      </Link>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created
                  </dt>
                  <dd className="mt-1">
                    <DateDisplay
                      date={ticket.createdAt}
                      includeTime
                      className="text-sm text-gray-900 dark:text-white"
                    />
                  </dd>
                </div>
                {ticket.resolvedAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Resolved
                    </dt>
                    <dd className="mt-1">
                      <DateDisplay
                        date={ticket.resolvedAt}
                        includeTime
                        className="text-sm text-gray-900 dark:text-white"
                      />
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Assign Ticket
              </h3>
              <div className="space-y-3">
                <FormInput
                  label="Agent ID"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Enter agent user ID"
                />
                <FormTextarea
                  label="Notes (optional)"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Add assignment notes..."
                  rows={2}
                />
                <button
                  onClick={handleAssign}
                  disabled={assigning || !assignedTo.trim()}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Assign Ticket"}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {ticket.subject}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {ticket.description}
              </p>
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Attachments:
                  </h4>
                  <div className="space-y-1">
                    {ticket.attachments.map((url: string, index: number) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-orange-600 hover:text-orange-700"
                      >
                        📎 Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Conversation ({messages.length})
                </h3>
              </div>
              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No messages yet. Be the first to reply!
                  </p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.isInternal
                          ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700"
                          : message.senderRole === "admin"
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                          : "bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {message.senderRole === "admin"
                              ? "Admin"
                              : "Customer"}
                          </span>
                          {message.isInternal && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-200 text-yellow-800 rounded">
                              Internal
                            </span>
                          )}
                        </div>
                        <DateDisplay
                          date={message.createdAt}
                          includeTime
                          className="text-xs"
                        />
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {message.message}
                      </p>
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map(
                              (url: string, index: number) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-xs text-orange-600 hover:text-orange-700"
                                >
                                  📎 Attachment {index + 1}
                                </a>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {ticket.status !== "closed" && (
                <form
                  onSubmit={handleReply}
                  className="p-6 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="space-y-3">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />

                    {attachments.length > 0 && (
                      <div className="space-y-1">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded"
                          >
                            <span>📎 {file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Internal note (not visible to customer)
                          </span>
                        </label>
                        <label className="text-sm text-orange-600 hover:text-orange-700 cursor-pointer">
                          📎 Attach files
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <button
                        type="submit"
                        disabled={replying || !replyMessage.trim()}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                      >
                        {replying ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {showEscalateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Escalate Ticket
                </h3>
                <div className="space-y-4">
                  <FormInput
                    label="Reason for Escalation *"
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    placeholder="e.g., Customer dissatisfaction, complex issue"
                    required
                  />
                  <FormTextarea
                    label="Additional Notes (optional)"
                    value={escalateNotes}
                    onChange={(e) => setEscalateNotes(e.target.value)}
                    placeholder="Add any additional context..."
                    rows={3}
                  />
                </div>
                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowEscalateModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEscalate}
                    disabled={escalating || !escalateReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {escalating ? "Escalating..." : "Escalate"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
