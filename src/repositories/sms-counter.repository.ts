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
}

export const smsCounterRepository = new SmsCounterRepository();
