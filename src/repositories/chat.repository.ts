/**
 * Chat Repository
 *
 * Manages Firestore chat room metadata documents.
 * Actual messages are stored in Realtime Database for live streaming.
 * This repository provides the persistent record of rooms and participants.
 */

import { BaseRepository } from "./base.repository";
import { prepareForFirestore } from "@/lib/firebase/firestore-helpers";
import { DatabaseError } from "@/lib/errors";
import type { ChatRoomCreateInput, ChatRoomDocument } from "@/db/schema";
import { CHAT_ROOM_COLLECTION } from "@/db/schema";

// Re-export so existing callers that import from this repository continue to work
export type { ChatRoomDocument, ChatRoomCreateInput } from "@/db/schema";
export { CHAT_ROOM_COLLECTION } from "@/db/schema";

class ChatRepository extends BaseRepository<ChatRoomDocument> {
  constructor() {
    super(CHAT_ROOM_COLLECTION);
  }

  /**
   * Create a new chat room (buyer ↔ seller for an order)
   */
  async create(input: ChatRoomCreateInput): Promise<ChatRoomDocument> {
    const id = `chat_${input.buyerId}_${input.sellerId}_${input.orderId}`;

    const doc: Omit<ChatRoomDocument, "id"> = {
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db
      .collection(this.collection)
      .doc(id)
      .set(prepareForFirestore(doc));

    return { id, ...doc };
  }

  /**
   * Find existing room by buyerId + sellerId + orderId (idempotent create)
   */
  async findRoom(
    buyerId: string,
    sellerId: string,
    orderId: string,
  ): Promise<ChatRoomDocument | null> {
    const id = `chat_${buyerId}_${sellerId}_${orderId}`;
    return this.findById(id);
  }

  /**
   * Get all chat room IDs for a user (as buyer or seller)
   */
  async getChatIdsForUser(userId: string): Promise<string[]> {
    try {
      const [asBuyer, asSeller] = await Promise.all([
        this.getCollection().where("buyerId", "==", userId).get(),
        this.getCollection().where("sellerId", "==", userId).get(),
      ]);

      const ids = new Set<string>();
      asBuyer.docs.forEach((d) => ids.add(d.id));
      asSeller.docs.forEach((d) => ids.add(d.id));
      return Array.from(ids);
    } catch (error) {
      throw new DatabaseError(
        `Failed to get chatIds for user: ${userId}`,
        error,
      );
    }
  }

  /**
   * List all rooms for a user with most recent first (for inbox view)
   */
  async listForUser(userId: string): Promise<ChatRoomDocument[]> {
    try {
      const [asBuyer, asSeller] = await Promise.all([
        this.getCollection()
          .where("buyerId", "==", userId)
          .orderBy("updatedAt", "desc")
          .get(),
        this.getCollection()
          .where("sellerId", "==", userId)
          .orderBy("updatedAt", "desc")
          .get(),
      ]);

      const seen = new Set<string>();
      const rooms: ChatRoomDocument[] = [];
      [...asBuyer.docs, ...asSeller.docs].forEach((d) => {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          rooms.push({ id: d.id, ...d.data() } as ChatRoomDocument);
        }
      });

      // Sort by updatedAt desc
      rooms.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

      return rooms;
    } catch (error) {
      throw new DatabaseError(
        `Failed to list rooms for user: ${userId}`,
        error,
      );
    }
  }

  /**
   * Update last message preview (called after a new message is sent)
   */
  async updateLastMessage(chatId: string, message: string): Promise<void> {
    try {
      await this.db
        .collection(this.collection)
        .doc(chatId)
        .update(
          prepareForFirestore({
            lastMessage: message.slice(0, 80),
            lastMessageAt: new Date(),
            updatedAt: new Date(),
          }),
        );
    } catch (error) {
      throw new DatabaseError(
        `Failed to update last message for room: ${chatId}`,
        error,
      );
    }
  }
}

export const chatRepository = new ChatRepository();
