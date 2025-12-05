/**
 * @fileoverview React Component
 * @module src/app/user/messages/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { messagesService } from "@/services/messages.service";
import {
  ConversationFE,
  ConversationType,
  MessageFE,
  ParticipantType,
} from "@/types/frontend/message.types";
import {
  Archive,
  ArrowLeft,
  ChevronLeft,
  Loader2,
  MessageSquare,
  Package,
  RefreshCw,
  Search,
  Send,
  Shield,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Participant type icons
const participantIcons: Record<ParticipantType, React.ReactNode> = {
  /** User */
  user: <User className="h-4 w-4" />,
  /** Seller */
  seller: <Store className="h-4 w-4" />,
  /** Admin */
  admin: <Shield className="h-4 w-4" />,
};

// Conversation type colors
/**
 * Performs type colors operation
 *
 * @param {{
  
  /** Conversation */
  conversation: ConversationFE;
  
  /** IsSelected */
  isSelected: boolean;
  
  /** OnClick */
  onClick: (} {
  conversation,
  isSelected,
  onClick,
} - The {
  conversation,
  isselected,
  onclick,
}
 *
 * @returns {any} The typecolors result
 *
 */
const typeColors: Record<ConversationType, string> = {
  buyer_seller:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  /** Order */
  order:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  /** Support */
  support:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

/**
 * Function: Conversation Item
 */
/**
 * Performs conversation item operation
 *
 * @returns {any} The conversationitem result
 */

/**
 * Performs conversation item operation
 *
 * @returns {any} The conversationitem result
 */

function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: {
  /** Conversation */
  conversation: ConversationFE;
  /** Is Selected */
  isSelected: boolean;
  /** On Click */
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        isSelected ? "bg-indigo-50 dark:bg-indigo-900/30" : ""
      } ${conversation.isUnread ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {participantIcons[conversation.otherParticipant.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`font-medium truncate ${
                conversation.isUnread
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {conversation.otherParticipant.name}
            </span>
            <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
              {conversation.timeAgo}
            </span>
          </div>

          {conversation.subject && (
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate mt-0.5">
              {conversation.subject}
            </p>
          )}

          <p
            className={`text-sm truncate mt-0.5 ${
              conversation.isUnread
                ? "text-gray-700 dark:text-gray-300"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {conversation.lastMessage.isFromMe && (
              <span className="text-gray-400 dark:text-gray-500">You: </span>
            )}
            {conversation.lastMessage.content}
          </p>

          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                typeColors[conversation.type]
              }`}
            >
              {messagesService.getTypeLabel(conversation.type)}
            </span>
            {conversation.isUnread && conversation.unreadCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-600 text-white">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Function: Message Bubble
 */
/**
 * Performs message bubble operation
 *
 * @param {{ message} { message } - The { message }
 *
 * @returns {any} The messagebubble result
 */

/**
 * Performs message bubble operation
 *
 * @param {{ message} { message } - The { message }
 *
 * @returns {any} The messagebubble result
 */

function MessageBubble({ message }: { message: MessageFE }) {
  return (
    <div
      className={`flex ${message.isFromMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          message.isFromMe
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm"
        }`}
      >
        {!message.isFromMe && (
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {message.senderName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            message.isFromMe
              ? "text-indigo-200"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {message.formattedTime}
        </p>
      </div>
    </div>
  );
}

/**
 * Function: Messages Content
 */
/**
 * Performs messages content operation
 *
 * @returns {any} The messagescontent result
 */

/**
 * Performs messages content operation
 *
 * @returns {any} The messagescontent result
 */

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationFE[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationFE | null>(null);
  const [messages, setMessages] = useState<MessageFE[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
/**
 * Performs load conversations operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The loadconversations result
 *
 */

  // Loading state
  const { isLoading, error, execute } = useLoadingState<void>();

  // Set user ID in service for transformations
  useEffect(() => {
    if (user?.uid) {
      messagesService.setCurrentUserId(user.uid);
    }
  }, [user?.uid]);

  // Load conversations
  const loadConvers/**
 * Performs load messages operation
 *
 * @param {string} async(conversationId - The async(conversationid
 *
 * @returns {Promise<any>} The loadmessages result
 *
 */
ations = useCallback(async () => {
    await execute(async () => {
      const response = await messagesService.getConversations({
        /** Status */
        status: showArchived ? "archived" : "active",
      });
      setConversations(response.conversations);
    });
  }, [showArchived, execute]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const response = await messagesService.getConversation(conversationId);
      setSelectedConversation(response.conversation);
      setMessages(response.messages);

      // Update conversation list to reflect read status
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, unreadCount: 0, isUnread: false }
            : c,
        ),
      );
    } catch (err) {
      logError(err as Error, { component: "MessagesPage.loadMessages" });
      toast.error("Failed to load messages");
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Check for conversation ID in URL
  useEffect(() => {
    const conversationId = searchParams.get("id");
    if (conversationId && !selectedConversation) {
      loadMessages(conversationId);
    }
  }, [searchParams, selectedConversation, loadMessages]);

  // Send message
  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to a/**
 * Performs optimistic message operation
 *
 * @returns {any} The optimisticmessage result
 *
 */
sync  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      await messagesService.sendMessage(selectedConversation.id, {
        /** Content */
        content: newMessage.trim(),
      });

      // Add optimistic message
      const optimisticMessage: MessageFE = {
        /** Id */
        id: `temp-${Date.now()}`,
        /** Conversation Id */
        conversationId: selectedConversation.id,
        /** Sender Id */
        senderId: user?.uid || "",
        /** Sender Name */
        senderName: user?.displayName || "You",
        /** Sender Type */
        senderType: "user",
        /** Content */
        content: newMessage.trim(),
        /** Attachments */
        attachments: [],
        /** Is Read */
        isRead: true,
        /** Is From Me */
        isFromMe: true,
        /** Is Deleted */
        isDeleted: false,
        /** Created At */
        createdAt: new Date(),
        /** Time Ago */
        timeAgo: "just now",
        /** Formatted Time */
        formattedTime: new Date().toLocaleTimeString([], {
          /** Hour */
          hour: "numeric",
          /** Minute */
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage("");

      // Update conversation in list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                /** Last Message */
                lastMessage: {
                  /** Content */
                  content: newMessage.trim(),
                  /** Sender Id */
                  senderId: user?.uid || "",
                  /** Sent At */
                  sentAt: new Date(),
                  /** Is From Me */
                  isFromMe: true,
                },
                /** Time Ago */
                timeAgo: "just now",
              }
            : c,
        ),
      );
    } catch (err) {
      logError(err as Error, { component: "MessagesPage.sendMessage" });
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle conversation selection
  /**
   * Handles select conversation event
   *
   * @param {ConversationFE} conversation - The conversation
   *
   * @returns {any} The handleselectconversation result
   */

  /**
   * Handles select conversation event
   *
   * @param {ConversationFE} conversation - The conversation
   *
   * @returns {any} The handleselectconversation result
   */

  const handleSelectConversation = (conversation: ConversationFE) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    router.push(`/user/messages?id=${conversation.id}`, { scroll: false });
  };

  // Handle archive
  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation /**
 * Performs filtered conversations operation
 *
 * @param {any} (c - The (c
 *
 * @returns {any} The filteredconversations result
 *
 */
fails or validation errors occur
   */

  const handleArchive = async () => {
    if (!selectedConversation) return;

    try {
      await messagesService.archiveConversation(selectedConversation.id);
      setConversations((prev) =>
        prev.filter((c) => c.id !== selectedConversation.id),
      );
      setSelectedConversation(null);
      setMessages([]);
    } catch (err) {
      logError(err as Error, {
        /** Component */
        component: "MessagesPage.handleArchive",
        /** Metadata */
        metadata: { conversationId: selectedConversation?.id },
      });
      toast.error("Failed to archive conversation");
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.otherParticipant.name.toLowerCase().includes(query) ||
      c.subject?.toLowerCase().includes(query) ||
      c.lastMessage.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Mobile header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          {selectedConversation ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedConversation(null);
                  setMessages([]);
                  router.push("/user/messages", { scroll: false });
                }}
                className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="font-medium truncate">
                  {selectedConversation.otherParticipant.name}
                </h2>
                {selectedConversation.subject && (
                  <p className="text-sm text-gray-500 truncate">
                    {selectedConversation.subject}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <Link
                href="/user"
                className="flex items-center gap-1 text-sm text-gray-600"
              >
                <ChevronLeft className="h-4 w-4" />
                Account
              </Link>
              <h1 className="font-semibold">Messages</h1>
              <button
                onClick={loadConversations}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)]">
          {/* Conversation list */}
          <div
            className={`w-full lg:w-80 xl:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${
              selectedConversation ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Desktop header */}
            <div className="hidden lg:block p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Link
                  href="/user"
                  className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Account
                </Link>
                <button
                  onClick={loadConversations}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Messages
              </h1>
            </div>

            {/* Search and filters */}
            <div className="p-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
              <FormInput
                id="message-search"
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                compact
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowArchived(false)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg ${
                    !showArchived
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setShowArchived(true)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 ${
                    showArchived
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  <Archive className="h-4 w-4" />
                  Archived
                </button>
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-red-600 dark:text-red-400 mb-2">
                    {error.message}
                  </p>
                  <button
                    onClick={loadConversations}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? "No conversations found"
                      : showArchived
                        ? "No archived conversations"
                        : "No messages yet"}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversation?.id === conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Message thread */}
          <div
            className={`flex-1 flex flex-col bg-white dark:bg-gray-800 ${
              !selectedConversation ? "hidden lg:flex" : "flex"
            }`}
          >
            {selectedConversation ? (
              <>
                {/* Thread header */}
                <div className="hidden lg:flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {
                        participantIcons[
                          selectedConversation.otherParticipant.type
                        ]
                      }
                    </div>
                    <div>
                      <h2 className="font-medium text-gray-900 dark:text-white">
                        {selectedConversation.otherParticipant.name}
                      </h2>
                      {selectedConversation.subject && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedConversation.subject}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConversation.context?.orderId && (
                      <Link
                        href={`/user/orders/${selectedConversation.context.orderId}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                      >
                        <Package className="h-4 w-4" />
                        View Order
                      </Link>
                    )}
                    <button
                      onClick={handleArchive}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                      title="Archive"
                    >
                      <Archive className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))
                  )}
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-end gap-2">
                    <FormTextarea
                      id="new-message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 resize-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    Choose a conversation from the list to view messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default /**
 * Performs messages page operation
 *
 * @returns {any} The messagespage result
 *
 */
function MessagesPage() {
  return (
    <AuthGuard>
      <MessagesContent />
    </AuthGuard>
  );
}
