/**
 * Seller Messages Page
 *
 * @status IMPLEMENTED
 * @epic E023 - Messaging System
 *
 * Allows sellers to:
 * - View buyer inquiries
 * - Respond to messages
 * - Manage conversations
 * - Track response times
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { FormInput } from "@/components/forms";
import { messagesService } from "@/services/messages.service";
import type { ConversationFE } from "@/types/frontend/message.types";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Search,
  User,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Package,
  Store,
} from "lucide-react";

export default function SellerMessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(
    async (pageNum: number = 1, refresh: boolean = false) => {
      if (!user) return;

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Set user ID for service transformations
        messagesService.setCurrentUserId(user.uid);

        const result = await messagesService.getConversations({
          page: pageNum,
          pageSize: 20,
          status: "all",
        });

        // Filter to only show conversations where seller is a participant
        // and the other party is a buyer (user type)
        const sellerConversations = result.conversations.filter(
          (c) => c.otherParticipant.type === "user",
        );

        if (pageNum === 1) {
          setConversations(sellerConversations);
        } else {
          setConversations((prev) => [...prev, ...sellerConversations]);
        }

        setHasMore(result.pagination.hasNext);
        setPage(pageNum);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load messages",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  useEffect(() => {
    loadConversations(1);
  }, [loadConversations]);

  const handleRefresh = () => {
    loadConversations(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadConversations(page + 1);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.subject?.toLowerCase().includes(query) ||
      conv.otherParticipant.name.toLowerCase().includes(query) ||
      conv.lastMessage?.content.toLowerCase().includes(query) ||
      conv.context?.productName?.toLowerCase().includes(query)
    );
  });

  const getConversationIcon = (conv: ConversationFE) => {
    switch (conv.type) {
      case "order":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "buyer_seller":
        return <Store className="w-5 h-5 text-green-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-yellow-800">
            Please log in to view your messages
          </h2>
          <Link
            href="/login?redirect=/seller/messages"
            className="mt-4 inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buyer Messages</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage conversations with your buyers
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <FormInput
          id="conversation-search"
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-5 w-5" />}
        />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {conversations.length}
          </div>
          <div className="text-sm text-gray-600">Total Conversations</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {conversations.filter((c) => c.unreadCount > 0).length}
          </div>
          <div className="text-sm text-gray-600">Unread</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {conversations.filter((c) => c.type === "order").length}
          </div>
          <div className="text-sm text-gray-600">Order Related</div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={() => loadConversations(1)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !refreshing && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredConversations.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {searchQuery ? "No matching conversations" : "No messages yet"}
          </h2>
          <p className="text-gray-500">
            {searchQuery
              ? "Try a different search term"
              : "When buyers contact you about your products, their messages will appear here."}
          </p>
        </div>
      )}

      {/* Conversations List */}
      {!loading && filteredConversations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          {filteredConversations.map((conv) => {
            const isUnread = conv.unreadCount > 0;

            return (
              <Link
                key={conv.id}
                href={`/user/messages?conversation=${conv.id}`}
                className={`block p-4 hover:bg-gray-50 transition-colors ${
                  isUnread ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            isUnread ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {conv.otherParticipant?.name || "Unknown User"}
                        </span>
                        {isUnread && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {conv.lastMessage?.sentAt
                          ? formatDistanceToNow(
                              new Date(conv.lastMessage.sentAt),
                              {
                                addSuffix: true,
                              },
                            )
                          : "No messages"}
                      </div>
                    </div>

                    {/* Conversation Type & Related Item */}
                    <div className="flex items-center gap-2 mb-1">
                      {getConversationIcon(conv)}
                      <span className="text-sm text-gray-600 truncate">
                        {conv.context?.productName ||
                          conv.subject ||
                          "General Inquiry"}
                      </span>
                    </div>

                    {/* Last Message */}
                    <p
                      className={`text-sm truncate ${
                        isUnread ? "text-gray-900 font-medium" : "text-gray-500"
                      }`}
                    >
                      {conv.lastMessage?.senderId === user?.uid && "You: "}
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 self-center">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
