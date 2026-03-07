/**
 * Chat Service
 *
 * Client-side service functions for buyer↔seller messaging.
 * Room creation and message dispatch go through API routes.
 * Real-time message streaming is handled by useChat hook via Firebase RTDB.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";
import type { ChatRoomDocument } from "@/repositories";

export interface CreateRoomRequest {
  orderId: string;
  sellerId: string;
}

export interface CreateRoomResponse {
  room: ChatRoomDocument;
}

export interface ChatRoomsResponse {
  rooms: ChatRoomDocument[];
}

export const chatService = {
  /** GET: list all chat rooms the user participates in */
  getRooms: () => apiClient.get<ChatRoomsResponse>(API_ENDPOINTS.CHAT.ROOMS),

  /** POST: create or return existing chat room for an order */
  createOrGetRoom: (data: CreateRoomRequest) =>
    apiClient.post<CreateRoomResponse>(API_ENDPOINTS.CHAT.ROOMS, data),

  /** POST: send a message in a chat room */
  sendMessage: (chatId: string, message: string) =>
    apiClient.post<{ messageId: string; timestamp: number }>(
      API_ENDPOINTS.CHAT.MESSAGES(chatId),
      { message },
    ),

  /** DELETE: remove a chat room (soft-delete for user; hard-delete for admin group) */
  deleteRoom: (chatId: string) =>
    apiClient.delete<{ deleted: boolean }>(API_ENDPOINTS.CHAT.ROOM(chatId)),
};
