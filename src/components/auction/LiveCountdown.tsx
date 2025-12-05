/**
 * @fileoverview React Component
 * @module src/components/auction/LiveCountdown
 * @description This file contains the LiveCountdown component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Live Countdown Timer
 *
 * Synchronized countdown timer for auctions with Socket.io
 * Shows time remaining with automatic updates
 */

"use client";

import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";

/**
 * LiveCountdownProps interface
 * 
 * @interface
 * @description Defines the structure and contract for LiveCountdownProps
 */
interface LiveCountdownProps {
  /** End Time */
  endTime: string | Date;
  /** Server Time */
  serverTime?: string;
  /** On Expire */
  onExpire?: () => void;
  /** Class Name */
  className?: string;
  /** Compact */
  compact?: boolean;
}

export default function LiveCountdown({
  endTime,
  serverTime,
  onExpire,
  className = "",
  compact = false,
}: LiveCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    // Calculate initial time offset (if server time provided)
    let timeOffset = 0;
    if (serverTime) {
      const serverTimestamp = new Date(serverTime).getTime();
      const clientTimestamp = Date.now();
      timeOffset = serverTimestamp - clientTimestamp;
    }

    // Calculate remaining time
    /**
     * Calculates remaining
     *
     * @returns {any} The calculateremaining result
     */

    /**
     * Calculates remaining
     *
     * @returns {any} The calculateremaining result
     */

    const calculateRemaining = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now() + timeOffset;
      const remaining = Math.max(0, end - now);

      if (remaining === 0 && !hasExpired) {
        setHasExpired(true);
        onExpire?.();
      }

      return remaining;
    };

    // Initial calculation
    setTimeRemaining(calculateRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, serverTime, onExpire, hasExpired]);

  // Format time remaining
  /**
   * Formats time
   *
   * @param {number} ms - The ms
   *
   * @returns {number} The formattime result
   */

  /**
   * Formats time
   *
   * @param {number} ms - The ms
   *
   * @returns {number} The formattime result
   */

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return {
        /** Value */
        value: `${days}d ${hours % 24}h`,
        /** Unit */
        unit: "remaining",
        /** Color */
        color: "text-gray-700",
        /** Bg */
        bg: "bg-gray-100",
      };
    } else if (hours > 0) {
      return {
        /** Value */
        value: `${hours}h ${minutes % 60}m`,
        /** Unit */
        unit: "remaining",
        /** Color */
        color: "text-gray-700",
        /** Bg */
        bg: "bg-gray-100",
      };
    } else if (minutes > 5) {
      return {
        /** Value */
        value: `${minutes}m ${seconds % 60}s`,
        /** Unit */
        unit: "remaining",
        /** Color */
        color: "text-blue-700",
        /** Bg */
        bg: "bg-blue-100",
      };
    } else if (minutes > 0) {
      return {
        /** Value */
        value: `${minutes}m ${seconds % 60}s`,
        /** Unit */
        unit: "ending soon!",
        /** Color */
        color: "text-orange-700",
        /** Bg */
        bg: "bg-orange-100",
        /** Pulse */
        pulse: true,
      };
    } else if (seconds > 0) {
      return {
        /** Value */
        value: `${seconds}s`,
        /** Unit */
        unit: "ending now!",
        /** Color */
        color: "text-red-700",
        /** Bg */
        bg: "bg-red-100",
        /** Pulse */
        pulse: true,
      };
    } else {
      return {
        /** Value */
        value: "Ended",
        /** Unit */
        unit: "",
        /** Color */
        color: "text-gray-700",
        /** Bg */
        bg: "bg-gray-200",
      };
    }
  };

  const { value, unit, color, bg, pulse } = formatTime(timeRemaining);

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium ${bg} ${color} ${className}`}
      >
        <Clock className={`w-4 h-4 ${pulse ? "animate-pulse" : ""}`} />
        <span>{value}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border-2 ${bg} ${className}`}
    >
      <div className={`flex-shrink-0 ${pulse ? "animate-pulse" : ""}`}>
        {pulse ? (
          <AlertCircle className={`w-6 h-6 ${color}`} />
        ) : (
          <Clock className={`w-6 h-6 ${color}`} />
        )}
      </div>

      <div className="flex-1">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {unit && (
          <div className={`text-sm font-medium ${color} opacity-75`}>
            {unit}
          </div>
        )}
      </div>
    </div>
  );
}
