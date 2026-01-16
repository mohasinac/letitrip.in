/**
 * useConversationState Hook
 *
 * Framework-agnostic conversation/messaging state management.
 * Manages conversation list, messages, and UI state for messaging features.
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

import { useCallback, useState } from "react";

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  timestamp: Date;
  [key: string]: any;
}

export interface Conversation {
  id: string;
  lastMessage?: Message;
  [key: string]: any;
}

export interface ConversationStateOptions {
  /** Error handler for conversation operations */
  onError?: (error: Error) => void;
}

export interface UseConversationStateReturn {
  // Conversation list
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation | null) => void;

  // Messages
  messages: Message[];
  setMessages: (messages: Message[]) => void;
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
  selectConversation: (conversation: Conversation) => void;
  addMessage: (message: Message) => void;
  updateConversationLastMessage: (
    conversationId: string,
    message: Message
  ) => void;
  clearMessages: () => void;
}

export function useConversationState(
  options?: ConversationStateOptions
): UseConversationStateReturn {
  // Conversation list state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
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
  const selectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
  }, []);

  /**
   * Add a new message to current conversation
   */
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /**
   * Update conversation's last message (for real-time updates)
   */
  const updateConversationLastMessage = useCallback(
    (conversationId: string, message: Message) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, lastMessage: message } : conv
        )
      );
    },
    []
  );

  /**
   * Clear all messages
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

export default useConversationState;
