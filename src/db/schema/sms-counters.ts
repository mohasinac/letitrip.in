/**
 * SMS Counters Collection Schema
 *
 * Tracks daily outbound SMS OTP count to enforce the free-tier limit.
 * One document per calendar day (IST), document ID = YYYY-MM-DD.
 *
 * Atomic increment via Firestore transaction in SmsCounterRepository
 * ensures no double-counting under concurrent requests.
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================

export interface SmsCounterDocument {
  /** Calendar date string in IST — YYYY-MM-DD (= document ID) */
  date: string;
  /** Number of OTPs sent today */
  count: number;
  updatedAt: Date;
}

export const SMS_COUNTERS_COLLECTION = "sms_counters" as const;

// ============================================
// 2. FIELD CONSTANTS
// ============================================

export const SMS_COUNTER_FIELDS = {
  DATE: "date",
  COUNT: "count",
  UPDATED_AT: "updatedAt",
} as const;

// ============================================
// 3. BUSINESS CONSTANTS
// ============================================

/** Firebase phone auth free-tier daily OTP limit */
export const SMS_DAILY_LIMIT = 1000;
