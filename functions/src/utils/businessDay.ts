/**
 * Business Day Utilities — Cloud Functions
 *
 * LetItRip platform day starts at 10:00 AM IST (UTC+5:30).
 *
 * Rule:
 *   - Any event before 10:00 AM IST belongs to the previous business day.
 *   - Day 1 = the next upcoming 10:00 AM IST at or after the event.
 *   - "7 business days after delivery" means 7 consecutive 10:00 AM IST
 *     boundaries must pass after the delivery event.
 *
 * This is used for all day-counting logic: payouts, pending windows,
 * order timeouts, and any other business-rule countdown.
 */

const IST_OFFSET_MS = 330 * 60 * 1000; // UTC+5:30 in milliseconds
const DAY_MS = 24 * 60 * 60 * 1000;

export const BUSINESS_DAY_HOUR_IST = 10; // 10:00 AM IST

/**
 * Returns the UTC Date for the start of the current business day —
 * i.e. the most recent 10:00 AM IST at or before `now`.
 *
 * Examples (IST times):
 *   11:30 AM IST on Day N  →  10:00 AM IST on Day N  (= 04:30 UTC Day N)
 *   07:00 AM IST on Day N  →  10:00 AM IST on Day N-1 (= 04:30 UTC Day N-1)
 */
export function getBusinessDayStart(now: Date = new Date()): Date {
  // Shift to IST so we can work with IST "local" dates via UTC methods
  const istMs = now.getTime() + IST_OFFSET_MS;
  const istDate = new Date(istMs);

  // Midnight of the IST calendar day (in the shifted representation)
  const istMidnight = new Date(istDate);
  istMidnight.setUTCHours(0, 0, 0, 0);

  // 10:00 AM of the IST calendar day (in the shifted representation)
  const todayAt10Shifted = new Date(
    istMidnight.getTime() + BUSINESS_DAY_HOUR_IST * 60 * 60 * 1000,
  );

  if (istMs >= todayAt10Shifted.getTime()) {
    // Current IST time is at or after 10:00 AM → today's business day
    return new Date(todayAt10Shifted.getTime() - IST_OFFSET_MS);
  }

  // Current IST time is before 10:00 AM → yesterday's business day
  return new Date(todayAt10Shifted.getTime() - DAY_MS - IST_OFFSET_MS);
}

/**
 * Returns the UTC cutoff Date for a Firestore `updatedAt <= cutoff` query.
 *
 * An order/event is considered `windowDays` business days old when
 * `windowDays` full 10:00 AM IST boundaries have elapsed since the event.
 *
 * Usage:
 *   const cutoff = getBusinessDayCutoff(AUTO_PAYOUT_WINDOW_DAYS);
 *   .where("updatedAt", "<=", cutoff)
 */
export function getBusinessDayCutoff(
  windowDays: number,
  now: Date = new Date(),
): Date {
  const start = getBusinessDayStart(now);
  return new Date(start.getTime() - windowDays * DAY_MS);
}

/**
 * Returns the number of business days that have elapsed since `since`.
 * Each day = one 10:00 AM IST boundary crossing.
 */
export function getBusinessDaysElapsed(
  since: Date,
  now: Date = new Date(),
): number {
  const start = getBusinessDayStart(now);
  const sinceStart = getBusinessDayStart(since);
  return Math.max(
    0,
    Math.floor((start.getTime() - sinceStart.getTime()) / DAY_MS),
  );
}
