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
import {
  getRealtimeTokenAction,
  getChatRoomsAction,
  sendChatMessageAction,
  createOrGetChatRoomAction,
  deleteChatRoomAction,
} from "@/actions";
import { logger } from "@/classes";
import { nowMs } from "@/utils";
import { useQuery, useMutation } from "@tanstack/react-query";

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
  // Store the specific listener so off() only removes this subscription
  const listenerRef = useRef<
    ((snap: import("firebase/database").DataSnapshot) => void) | null
  >(null);

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
        const tokenResponse = await getRealtimeTokenAction();
        const realtimeAuth = getAuth(realtimeApp);
        await signInWithCustomToken(realtimeAuth, tokenResponse.customToken);
        tokenExpiresAtRef.current = tokenResponse.expiresAt;
      }

      // Subscribe to /chat/{chatId}/messages
      if (msgRefRef.current && listenerRef.current) {
        off(msgRefRef.current, "value", listenerRef.current);
        listenerRef.current = null;
      }

      const messagesRef = ref(chatRealtimeDb, `/chat/${chatId}/messages`);
      msgRefRef.current = messagesRef;

      listenerRef.current = (snapshot) => {
        if (snapshot.exists()) {
          const raw = snapshot.val() as Record<string, Omit<ChatMessage, "id">>;
          const parsed: ChatMessage[] = Object.entries(raw)
            .map(([id, msg]) => ({ id, ...msg }))
            .sort((a, b) => a.timestamp - b.timestamp);
          setMessages(parsed);
        } else {
          setMessages([]);
        }
        setIsConnected(true);
        setIsLoading(false);
      };

      onValue(messagesRef, listenerRef.current, (err) => {
        logger.error("Chat RTDB subscription error", err);
        setError("Could not connect to chat. Please try again.");
        setIsConnected(false);
        setIsLoading(false);
      });
    } catch (err) {
      logger.error("Failed to authenticate for chat RTDB", err);
      setError("Failed to connect to chat.");
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    connectAndSubscribe();

    return () => {
      if (msgRefRef.current && listenerRef.current) {
        off(msgRefRef.current, "value", listenerRef.current);
        listenerRef.current = null;
        msgRefRef.current = null;
      }
    };
  }, [connectAndSubscribe]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!chatId || !text.trim()) return;
      await sendChatMessageAction(chatId, text.trim());
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
  return useQuery({
    queryKey: ["chat", "rooms"],
    queryFn: () => getChatRoomsAction().then((r) => r.rooms),
  });
}

export function useCreateChatRoom() {
  return useMutation({
    mutationFn: (data: { orderId: string; sellerId: string }) =>
      createOrGetChatRoomAction(data).then((r) => r.room),
  });
}

export function useDeleteChatRoom() {
  return useMutation({
    mutationFn: (chatId: string) => deleteChatRoomAction(chatId),
  });
}
