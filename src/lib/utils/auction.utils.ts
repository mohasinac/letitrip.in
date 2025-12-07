/**
 * Auction Utility Functions
 * Helper functions for auction time calculations and bid validation
 */

export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
  formatted: string;
}

/**
 * Get remaining time for an auction
 * @param endTime - Auction end time
 * @returns Time remaining object with detailed breakdown
 */
export function getTimeRemaining(endTime: Date | string | null): TimeRemaining {
  if (!endTime) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isEnded: true,
      formatted: "Auction ended",
    };
  }

  const now = new Date();
  const end = new Date(endTime);

  if (isNaN(end.getTime())) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isEnded: true,
      formatted: "Auction ended",
    };
  }

  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isEnded: true,
      formatted: "Auction ended",
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  let formatted: string;
  if (days > 0) {
    formatted = `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m ${seconds}s`;
  } else {
    formatted = `${minutes}m ${seconds}s`;
  }

  return {
    totalMs: diff,
    days,
    hours,
    minutes,
    seconds,
    isEnded: false,
    formatted,
  };
}

/**
 * Calculate next minimum bid for an auction
 * @param currentBid - Current highest bid
 * @param reservePrice - Auction reserve price
 * @param bidIncrement - Minimum bid increment
 * @returns Next minimum bid amount
 */
export function getNextMinimumBid(
  currentBid: number,
  reservePrice: number,
  bidIncrement: number = 100
): number {
  if (currentBid === 0) {
    return reservePrice;
  }
  return currentBid + bidIncrement;
}

/**
 * Check if auction is active
 * @param startTime - Auction start time
 * @param endTime - Auction end time
 * @returns true if auction is currently active
 */
export function isAuctionActive(
  startTime: Date | string,
  endTime: Date | string
): boolean {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  return now >= start && now <= end;
}

/**
 * Check if auction has started
 * @param startTime - Auction start time
 * @returns true if auction has started
 */
export function hasAuctionStarted(startTime: Date | string): boolean {
  const now = new Date();
  const start = new Date(startTime);
  return now >= start;
}

/**
 * Check if auction has ended
 * @param endTime - Auction end time
 * @returns true if auction has ended
 */
export function hasAuctionEnded(endTime: Date | string): boolean {
  const now = new Date();
  const end = new Date(endTime);
  return now > end;
}
