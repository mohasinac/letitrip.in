"use client";

import { StatusBadge } from '@letitrip/react-library';
import { DateDisplay } from "@letitrip/react-library";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";

export interface EventCardProps {
  event: {
    id: string;
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
    isPollEvent?: boolean;
    voteCount?: number;
  };
  href?: string;
  showStatus?: boolean;
}

/**
 * EventCard Component
 *
 * Displays event information in a card format.
 * Used in event lists and grids.
 *
 * Features:
 * - Event image, title, and description
 * - Date and location display
 * - Participant count with progress
 * - Poll vote count
 * - Dark mode support
 * - Mobile responsive
 *
 * @example
 * ```tsx
 * <EventCard event={event} href={`/events/${event.id}`} />
 * ```
 */
export function EventCard({ event, href, showStatus = false }: EventCardProps) {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isUpcoming = startDate > now;
  const isActive = startDate <= now && now <= endDate;
  const isEnded = endDate < now;

  const participantPercentage = event.maxParticipants
    ? (event.participantCount / event.maxParticipants) * 100
    : 0;

  const CardContent = (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {event.imageUrl && (
        <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          {showStatus && (
            <div className="absolute top-2 right-2">
              {isActive && <StatusBadge status="active" />}
              {isUpcoming && <StatusBadge status="pending" />}
              {isEnded && <StatusBadge status="inactive" />}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Type Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
            {event.type}
          </span>
          {event.isPollEvent && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              Poll
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {event.description}
        </p>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <DateDisplay date={event.startDate} format="short" />
          <span>-</span>
          <DateDisplay date={event.endDate} format="short" />
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{event.isOnline ? "Online" : event.location}</span>
          </div>
        )}

        {/* Participants or Votes */}
        {event.isPollEvent ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{event.voteCount || 0} votes</span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {event.participantCount}
                  {event.maxParticipants && ` / ${event.maxParticipants}`}{" "}
                  participants
                </span>
              </div>
              {event.maxParticipants && (
                <span className="text-xs">
                  {Math.round(participantPercentage)}%
                </span>
              )}
            </div>
            {event.maxParticipants && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(participantPercentage, 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Time indicator */}
        {isActive && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Clock className="w-4 h-4" />
            <span>Active now</span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{CardContent}</Link>;
  }

  return CardContent;
}

export default EventCard;
