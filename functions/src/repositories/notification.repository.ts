import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import {
  COLLECTIONS,
  QUERY_LIMIT,
  NOTIFICATION_TTL_DAYS,
} from "../config/constants";

export interface CreateNotificationInput {
  userId: string;
  type: string;
  priority: "low" | "normal" | "high";
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: "order" | "product" | "bid" | "review" | "blog" | "user";
}

export const notificationRepository = {
  /** Read notification refs older than NOTIFICATION_TTL_DAYS. */
  async getOldReadRefs(): Promise<DocumentReference[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - NOTIFICATION_TTL_DAYS);

    const snap = await db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where("isRead", "==", true)
      .where("createdAt", "<", cutoff)
      .limit(QUERY_LIMIT)
      .get();
    return snap.docs.map((d) => d.ref);
  },

  /** Create a notification inside an existing write batch. */
  createInBatch(
    batch: FirebaseFirestore.WriteBatch,
    input: CreateNotificationInput,
  ): DocumentReference {
    const ref = db.collection(COLLECTIONS.NOTIFICATIONS).doc();
    batch.create(ref, {
      id: ref.id,
      userId: input.userId,
      type: input.type,
      priority: input.priority,
      title: input.title,
      message: input.message,
      isRead: false,
      relatedId: input.relatedId ?? null,
      relatedType: input.relatedType ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return ref;
  },

  /** Create a notification as a standalone write (outside of a batch). */
  async create(input: CreateNotificationInput): Promise<DocumentReference> {
    const ref = db.collection(COLLECTIONS.NOTIFICATIONS).doc();
    await ref.create({
      id: ref.id,
      userId: input.userId,
      type: input.type,
      priority: input.priority,
      title: input.title,
      message: input.message,
      isRead: false,
      relatedId: input.relatedId ?? null,
      relatedType: input.relatedType ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return ref;
  },
};
