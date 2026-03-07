/**
 * SMS Counter Repository
 *
 * Manages the daily OTP send counter in Firestore.
 * One document per calendar day (IST), document ID = YYYY-MM-DD.
 *
 * Uses a Firestore transaction for atomic check-and-increment so that
 * concurrent requests never double-count or exceed the daily limit.
 */

import { BaseRepository } from "./base.repository";
import {
  SMS_COUNTERS_COLLECTION,
  SMS_DAILY_LIMIT,
  SMS_COUNTER_FIELDS,
  type SmsCounterDocument,
} from "@/db/schema";

export class SmsCounterRepository extends BaseRepository<SmsCounterDocument> {
  constructor() {
    super(SMS_COUNTERS_COLLECTION);
  }

  /**
   * Atomically check the daily counter and increment it if under the limit.
   *
   * @param dateStr - ISO date string YYYY-MM-DD in IST
   * @returns `{ allowed: true, count }` when the OTP may be sent,
   *          `{ allowed: false, count }` when the daily cap is reached.
   */
  async checkAndIncrement(
    dateStr: string,
  ): Promise<{ allowed: boolean; count: number }> {
    const db = this.db;
    const docRef = db.collection(this.collection).doc(dateStr);

    return db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      const current: number = snap.exists
        ? ((snap.data()?.[SMS_COUNTER_FIELDS.COUNT] as number) ?? 0)
        : 0;

      if (current >= SMS_DAILY_LIMIT) {
        return { allowed: false, count: current };
      }

      const newCount = current + 1;
      tx.set(
        docRef,
        {
          [SMS_COUNTER_FIELDS.DATE]: dateStr,
          [SMS_COUNTER_FIELDS.COUNT]: newCount,
          [SMS_COUNTER_FIELDS.UPDATED_AT]: new Date(),
        },
        { merge: true },
      );

      return { allowed: true, count: newCount };
    });
  }

  /**
   * Read today's count (non-atomic, for observability / admin dashboards).
   */
  async getCount(dateStr: string): Promise<number> {
    const snap = await this.db.collection(this.collection).doc(dateStr).get();
    return snap.exists
      ? ((snap.data()?.[SMS_COUNTER_FIELDS.COUNT] as number) ?? 0)
      : 0;
  }

  /**
   * Check whether a user is still within the 15-minute OTP cooldown window.
   * If NOT locked, atomically records the request time so the next call is gated.
   *
   * @param userId - Firebase Auth UID
   * @returns `{ allowed: true }` if the user may request an OTP now,
   *          `{ allowed: false, retryAfterSeconds }` when still in cooldown.
   */
  async checkAndSetUserCooldown(
    userId: string,
  ): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
    const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
    const docId = `user_cooldown_${userId}`;
    const docRef = this.db.collection(this.collection).doc(docId);

    return this.db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      const lastRequestedAt: Date | null = snap.exists
        ? (snap.data()?.lastRequestedAt?.toDate?.() ?? null)
        : null;

      if (lastRequestedAt) {
        const elapsed = Date.now() - lastRequestedAt.getTime();
        if (elapsed < COOLDOWN_MS) {
          const retryAfterSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
          return { allowed: false, retryAfterSeconds };
        }
      }

      tx.set(docRef, { lastRequestedAt: new Date() }, { merge: true });
      return { allowed: true, retryAfterSeconds: 0 };
    });
  }
}

export const smsCounterRepository = new SmsCounterRepository();
