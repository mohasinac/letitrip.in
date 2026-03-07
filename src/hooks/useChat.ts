"use client";

/**
 * useChat Hook
 *
 * Manages buyer↔seller chat for a given chat room.
 *
 * Flow:
 *   1. Obtain a Firebase custom token from POST /api/realtime/token
 *   2. Sign into a dedicated Firebase app instance using the custom token
 *   3. Subscribe (read-only) to /chat/{chatId}/messages in Realtime DB
 *   4. Expose sendMessage (calls POST /api/chat/{chatId}/messages — server write)
 *
 * The custom token encodes chatIds that the user may read. If the token does
 * not include this room's ID, the subscription will be automatically denied
 * by Firebase Realtime DB rules.
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isConnected, isLoading } = useChat(chatId);
 * ```
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { ref, onValue, off, type DatabaseReference } from "firebase/database";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { realtimeApp, chatRealtimeDb } from "@/lib/firebase/realtime";
import { realtimeTokenService, chatService } from "@/services";
import { logger } from "@/classes";
import { nowMs } from "@/utils";
import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useChat(chatId: string | null): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenExpiresAtRef = useRef<number>(0);
  const msgRefRef = useRef<DatabaseReference | null>(null);

  /**
   * Authenticate the secondary Firebase app instance with a server-issued
   * custom token, then subscribe to the chat messages path.
   */
  const connectAndSubscribe = useCallback(async () => {
    if (!chatId) return;

    setIsLoading(true);
    setError(null);

    try {
      // (Re-)fetch token if it has expired or is within 60s of expiry
      const shouldRefresh =
        !tokenExpiresAtRef.current ||
        tokenExpiresAtRef.current - nowMs() < 60_000;

      if (shouldRefresh) {
        const tokenResponse = await realtimeTokenService.getToken();
        const realtimeAuth = getAuth(realtimeApp);
        await signInWithCustomToken(realtimeAuth, tokenResponse.customToken);
        tokenExpiresAtRef.current = tokenResponse.expiresAt;
      }

      // Subscribe to /chat/{chatId}/messages
      if (msgRefRef.current) {
        off(msgRefRef.current);
      }

      const messagesRef = ref(chatRealtimeDb, `/chat/${chatId}/messages`);
      msgRefRef.current = messagesRef;

      onValue(
        messagesRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val() as Record<
              string,
              Omit<ChatMessage, "id">
            >;
            const parsed: ChatMessage[] = Object.entries(raw)
              .map(([id, msg]) => ({ id, ...msg }))
              .sort((a, b) => a.timestamp - b.timestamp);
            setMessages(parsed);
          } else {
            setMessages([]);
          }
          setIsConnected(true);
          setIsLoading(false);
        },
        (err) => {
          logger.error("Chat RTDB subscription error", err);
          setError("Could not connect to chat. Please try again.");
          setIsConnected(false);
          setIsLoading(false);
        },
      );
    } catch (err) {
      logger.error("Failed to authenticate for chat RTDB", err);
      setError("Failed to connect to chat.");
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    connectAndSubscribe();

    return () => {
      if (msgRefRef.current) {
        off(msgRefRef.current);
        msgRefRef.current = null;
      }
    };
  }, [connectAndSubscribe]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!chatId || !text.trim()) return;
      await chatService.sendMessage(chatId, text.trim());
    },
    [chatId],
  );

  return { messages, sendMessage, isConnected, isLoading, error };
}

/**
 * useChatRooms
 *
 * Fetches the list of chat rooms the authenticated user participates in.
 */
export function useChatRooms() {
  return useApiQuery({
    queryKey: ["chat", "rooms"],
    queryFn: () => chatService.getRooms(),
  });
}

export function useCreateChatRoom() {
  return useApiMutation({
    mutationFn: (data: { orderId: string; sellerId: string }) =>
      chatService.createOrGetRoom(data),
  });
}

export function useDeleteChatRoom() {
  return useApiMutation({
    mutationFn: (chatId: string) => chatService.deleteRoom(chatId),
  });
}
