"use client";

import { useCallback, useState } from "react";

/**
 * @interface ConversationStateOptions
 * Options for initializing conversation state
 */
interface ConversationStateOptions {
  onError?: (error: Error) => void;
}

/**
 * @interface UseConversationStateReturn
 * Return type for useConversationState hook
 */
interface UseConversationStateReturn {
  // Conversation list
  conversations: any[];
  setConversations: (conversations: any[]) => void;
  selectedConversation: any | null;
  setSelectedConversation: (conversation: any | null) => void;

  // Messages
  messages: any[];
  setMessages: (messages: any[]) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;

  // Loading states
  messagesLoading: boolean;
  setMessagesLoading: (loading: boolean) => void;
  sendingMessage: boolean;
  setSendingMessage: (sending: boolean) => void;

  // Search and filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;

  // Helper methods
  selectConversation: (conversation: any) => void;
  addMessage: (message: any) => void;
  updateConversationLastMessage: (conversationId: string, message: any) => void;
  clearMessages: () => void;
}

/**
 * useConversationState Hook
 * Manages all state for conversation/messaging features
 *
 * @param options - Configuration options
 * @returns Conversation state and methods
 *
 * @example
 * ```tsx
 * const {
 *   conversations,
 *   selectedConversation,
 *   messages,
 *   newMessage,
 *   setNewMessage,
 *   selectConversation,
 *   addMessage,
 *   sendingMessage,
 *   messagesLoading,
 * } = useConversationState();
 * ```
 */
export function useConversationState(
  options?: ConversationStateOptions
): UseConversationStateReturn {
  // Conversation list state
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(
    null
  );

  // Messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Loading states
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  /**
   * Select a conversation and clear messages
   */
  const selectConversation = useCallback((conversation: any) => {
    setSelectedConversation(conversation);
    setMessages([]);
  }, []);

  /**
   * Add a message to the conversation
   */
  const addMessage = useCallback((message: any) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /**
   * Update a conversation's last message and move to top
   */
  const updateConversationLastMessage = useCallback(
    (conversationId: string, message: any) => {
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
              isUnread: false,
            };
          }
          return conv;
        });

        // Move updated conversation to top
        const conversation = updated.find((c) => c.id === conversationId);
        if (conversation) {
          const filtered = updated.filter((c) => c.id !== conversationId);
          return [conversation, ...filtered];
        }

        return updated;
      });
    },
    []
  );

  /**
   * Clear all messages (e.g., when switching conversations)
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    // Conversation list
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,

    // Messages
    messages,
    setMessages,
    newMessage,
    setNewMessage,

    // Loading states
    messagesLoading,
    setMessagesLoading,
    sendingMessage,
    setSendingMessage,

    // Search and filter
    searchQuery,
    setSearchQuery,
    showArchived,
    setShowArchived,

    // Helper methods
    selectConversation,
    addMessage,
    updateConversationLastMessage,
    clearMessages,
  };
}

export type { ConversationStateOptions, UseConversationStateReturn };
