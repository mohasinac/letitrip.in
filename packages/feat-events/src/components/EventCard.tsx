import React from "react";
import type { EventItem, EventType } from "../types";
import { EventStatusBadge } from "./EventStatusBadge";

const TYPE_ICONS: Record<EventType, string> = {
  sale: "🏷️",
  offer: "🎁",
  poll: "📊",
  survey: "📝",
  feedback: "💬",
};

interface EventCardProps {
  event: EventItem;
  labels?: {
    participate?: string;
    viewResults?: string;
    entries?: string;
  };
  onParticipate?: (event: EventItem) => void;
  className?: string;
}

export function EventCard({
  event,
  labels = {},
  onParticipate,
  className = "",
}: EventCardProps) {
  const now = new Date();
  const endsAt = new Date(event.endsAt);
  const msLeft = endsAt.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

  return (
    <article
      className={`rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {event.coverImageUrl && (
        <div className="aspect-video overflow-hidden">
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-lg" aria-hidden="true">
            {TYPE_ICONS[event.type]}
          </span>
          <EventStatusBadge status={event.status} />
        </div>
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1">
          {event.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {event.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          {event.status === "active" && daysLeft > 0 && (
            <span>{daysLeft}d remaining</span>
          )}
          <span>
            {event.stats.totalEntries} {labels.entries ?? "entries"}
          </span>
        </div>

        {event.status === "active" && onParticipate && (
          <button
            type="button"
            onClick={() => onParticipate(event)}
            className="w-full rounded-lg bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
          >
            {labels.participate ?? "Participate"}
          </button>
        )}
      </div>
    </article>
  );
}
