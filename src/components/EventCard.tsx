"use client";

import { useTranslations } from "next-intl";
import {
  BarChart2,
  ClipboardList,
  Gift,
  MessageSquare,
  Tag,
} from "lucide-react";
import {
  BaseListingCard,
  Heading,
  MediaImage,
  Span,
  Text,
  TextLink,
} from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { formatDate } from "@/utils";
import type { EventType, EventItem } from "@mohasinac/feat-events";

const { themed, flex, position } = THEME_CONSTANTS;

const EVENT_TYPE_CONFIG: Record<
  EventType,
  { Icon: React.FC<{ className?: string }>; className: string }
> = {
  sale: {
    Icon: Tag,
    className: "bg-rose-600/90 text-white",
  },
  offer: {
    Icon: Gift,
    className: "bg-emerald-600/90 text-white",
  },
  poll: {
    Icon: BarChart2,
    className: "bg-blue-600/90 text-white",
  },
  survey: {
    Icon: ClipboardList,
    className: "bg-purple-600/90 text-white",
  },
  feedback: {
    Icon: MessageSquare,
    className: "bg-amber-600/90 text-white",
  },
};

interface EventCardProps {
  event: EventItem;
  /** Show checkbox for bulk selection */
  selectable?: boolean;
  /** Whether this card is selected */
  selected?: boolean;
  /** Callback when checkbox is toggled */
  onSelect?: (id: string, checked: boolean) => void;
  /** "standard" = regular card layout. "overlay" = magazine with text over image. */
  variant?: "standard" | "overlay";
}

export function EventCard({
  event,
  selectable,
  selected,
  onSelect,
  variant = "standard",
}: EventCardProps) {
  const t = useTranslations("events");
  const tTypes = useTranslations("eventTypes");

  const typeConfig = EVENT_TYPE_CONFIG[event.type];
  const TypeIcon = typeConfig.Icon;

  const plainDescription = event.description
    ? event.description
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

  return (
    <BaseListingCard isSelected={selected}>
      {/* ── Image area ── */}
      <BaseListingCard.Hero aspect="4/3">
        <TextLink
          href={ROUTES.PUBLIC.EVENT_DETAIL(event.id)}
          className={`${position.fill} block z-0`}
          variant="bare"
        >
          {event.coverImageUrl ? (
            <MediaImage
              src={event.coverImageUrl}
              alt={event.title}
              size="card"
              className="group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className={`${flex.center} w-full h-full bg-gradient-to-br from-primary-500 to-cobalt-600`}
            >
              <Span className="text-white text-5xl font-bold opacity-30">
                {event.title.charAt(0).toUpperCase()}
              </Span>
            </div>
          )}
        </TextLink>

        {/* Checkbox — top left */}
        {selectable && (
          <BaseListingCard.Checkbox
            selected={!!selected}
            onSelect={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect?.(event.id, !selected);
            }}
            label={
              selected ? `Deselect ${event.title}` : `Select ${event.title}`
            }
            position="top-2 left-2"
          />
        )}

        {/* Type / category badge */}
        <div
          className={`absolute z-10 ${variant === "overlay" ? "top-3 left-3" : "top-2 right-2"}`}
        >
          <Span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              variant === "overlay"
                ? "bg-black/40 backdrop-blur-sm text-white"
                : typeConfig.className
            }`}
          >
            <TypeIcon className="w-3 h-3 flex-shrink-0" />
            {tTypes(event.type)}
          </Span>
        </div>

        {/* Date badge (overlay variant only) */}
        {variant === "overlay" && (
          <div className="absolute top-3 right-3 z-10">
            <Span className="bg-white dark:bg-slate-900 text-zinc-700 dark:text-zinc-300 text-xs rounded-lg px-2 py-1 shadow-sm">
              {formatDate(event.startsAt, "short")}
            </Span>
          </div>
        )}

        {/* Title overlay (overlay variant only) */}
        {variant === "overlay" && (
          <TextLink
            href={ROUTES.PUBLIC.EVENT_DETAIL(event.id)}
            variant="bare"
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-16 z-10"
          >
            <Heading
              level={3}
              className="font-display text-base sm:text-lg text-white leading-snug line-clamp-2"
            >
              {event.title}
            </Heading>
          </TextLink>
        )}

        {/* Status badge — bottom left (standard variant only) */}
        {variant === "standard" && (
          <div className="absolute bottom-2 left-2 z-10">
            <Span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                event.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                  : event.status === "ended"
                    ? "bg-zinc-100 text-zinc-600 dark:bg-slate-700 dark:text-zinc-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
              }`}
            >
              {event.status}
            </Span>
          </div>
        )}
      </BaseListingCard.Hero>

      {/* ── Content (standard variant only) ── */}
      {variant === "standard" && (
        <BaseListingCard.Info className="p-4">
          {/* Event title */}
          <TextLink href={ROUTES.PUBLIC.EVENT_DETAIL(event.id)}>
            <Heading
              level={3}
              className={`text-base sm:text-[17px] font-semibold leading-snug ${themed.textPrimary} line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}
            >
              {event.title}
            </Heading>
          </TextLink>

          {plainDescription && (
            <Text size="sm" variant="secondary" className="line-clamp-3 flex-1">
              {plainDescription}
            </Text>
          )}

          {/* Visit button */}
          <div className="mt-auto pt-2">
            <TextLink
              href={ROUTES.PUBLIC.EVENT_DETAIL(event.id)}
              className="inline-flex w-full items-center justify-center px-4 py-2 rounded-xl bg-primary-700 hover:bg-primary-800 active:scale-95 text-white text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
            >
              {t("visitEvent")}
            </TextLink>
          </div>
        </BaseListingCard.Info>
      )}
    </BaseListingCard>
  );
}
