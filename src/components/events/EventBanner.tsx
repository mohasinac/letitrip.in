"use client";

import { Calendar, MapPin, Users, Clock, CheckCircle } from "lucide-react";
import { DateDisplay } from "@/components/common/value/DateDisplay";

export interface EventBannerProps {
  event: {
    title: string;
    description: string;
    type: string;
    startDate: string;
    endDate: string;
    location?: string;
    isOnline: boolean;
    participantCount: number;
    maxParticipants?: number;
    imageUrl?: string;
  };
  isRegistered?: boolean;
  showRegistrationButton?: boolean;
  onRegister?: () => void;
}

/**
 * EventBanner Component
 *
 * Large hero banner for event detail pages.
 *
 * Features:
 * - Full-width image background
 * - Event details overlay
 * - Registration status
 * - Dark mode support
 * - Mobile responsive
 *
 * @example
 * ```tsx
 * <EventBanner
 *   event={event}
 *   isRegistered={true}
 *   onRegister={handleRegister}
 * />
 * ```
 */
export function EventBanner({
  event,
  isRegistered = false,
  showRegistrationButton = true,
  onRegister,
}: EventBannerProps) {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isUpcoming = startDate > now;
  const isActive = startDate <= now && now <= endDate;

  const isFull =
    event.maxParticipants && event.participantCount >= event.maxParticipants;

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {/* Background Image */}
      {event.imageUrl && (
        <div className="absolute inset-0">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/40" />
        </div>
      )}

      {/* Content */}
      <div className="relative p-6 sm:p-8 lg:p-12 min-h-[400px] flex flex-col justify-end">
        <div className="max-w-4xl">
          {/* Type Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 text-sm font-medium bg-purple-600 text-white rounded-full">
              {event.type}
            </span>
            {isActive && (
              <span className="px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-full flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Active Now
              </span>
            )}
            {isRegistered && (
              <span className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-full flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Registered
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {event.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-200 mb-6 max-w-3xl">
            {event.description}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Date */}
            <div className="flex items-start gap-3 text-white">
              <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-300">Date & Time</div>
                <div className="font-medium">
                  <DateDisplay date={event.startDate} format="full" />
                </div>
                <div className="text-sm text-gray-300">
                  to <DateDisplay date={event.endDate} format="full" />
                </div>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3 text-white">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-300">Location</div>
                  <div className="font-medium">
                    {event.isOnline ? "Online Event" : event.location}
                  </div>
                </div>
              </div>
            )}

            {/* Participants */}
            <div className="flex items-start gap-3 text-white">
              <Users className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-300">Participants</div>
                <div className="font-medium">
                  {event.participantCount}
                  {event.maxParticipants && ` / ${event.maxParticipants}`}
                </div>
                {isFull && (
                  <div className="text-sm text-red-300">Event is full</div>
                )}
              </div>
            </div>
          </div>

          {/* Registration Button */}
          {showRegistrationButton && onRegister && (
            <div className="flex flex-wrap items-center gap-4">
              {!isRegistered ? (
                <button
                  type="button"
                  onClick={onRegister}
                  disabled={isFull || !isUpcoming}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {isFull
                    ? "Event Full"
                    : !isUpcoming
                      ? "Registration Closed"
                      : "Register Now"}
                </button>
              ) : (
                <div className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  You're Registered
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventBanner;
