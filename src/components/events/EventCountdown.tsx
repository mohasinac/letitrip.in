"use client";

import { Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export interface EventCountdownProps {
  targetDate: string;
  label?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  onComplete?: () => void;
}

/**
 * EventCountdown Component
 *
 * Live countdown timer for events.
 * Updates every second.
 *
 * Features:
 * - Configurable time units
 * - Auto-updates
 * - Completion callback
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <EventCountdown
 *   targetDate="2025-12-31T23:59:59Z"
 *   label="Event starts in"
 * />
 * ```
 */
export function EventCountdown({
  targetDate,
  label = "Time remaining",
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  onComplete,
}: EventCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isComplete: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isComplete: true,
        });
        if (onComplete && !timeRemaining.isComplete) {
          onComplete();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isComplete: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete, timeRemaining.isComplete]);

  if (timeRemaining.isComplete) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">Event is now active!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
      <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-3">
        <Clock className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {showDays && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {timeRemaining.days}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {timeRemaining.days === 1 ? "Day" : "Days"}
            </div>
          </div>
        )}

        {showHours && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {timeRemaining.hours}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {timeRemaining.hours === 1 ? "Hour" : "Hours"}
            </div>
          </div>
        )}

        {showMinutes && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {timeRemaining.minutes}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {timeRemaining.minutes === 1 ? "Minute" : "Minutes"}
            </div>
          </div>
        )}

        {showSeconds && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {timeRemaining.seconds}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {timeRemaining.seconds === 1 ? "Second" : "Seconds"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventCountdown;
