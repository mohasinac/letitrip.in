/**
 * Pure helpers shared across the public event detail routes
 * (layout / overview / participate / leaderboard).
 */

import { LOCALE_CONFIG } from "@/constants";
import {
  EVENT_BADGE_FALLBACK,
  EVENT_META,
  EVENT_STATUS,
  EVENT_STATUS_BADGE,
  EVENT_TYPE_BADGE,
} from "./_constants";

type RawEvent = {
  status?: unknown;
  endsAt?: unknown;
};

export function formatEventDate(value: unknown): string {
  if (!value) return "";
  try {
    return new Date(value as string | number | Date).toLocaleDateString(
      LOCALE_CONFIG.DEFAULT_LOCALE,
      { dateStyle: "medium" },
    );
  } catch {
    return String(value);
  }
}

export function toIsoOrUndefined(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  try {
    return new Date(value as string | number | Date).toISOString();
  } catch {
    return undefined;
  }
}

 
export function eventIsActive(event: RawEvent, now: number = Date.now()): boolean {
  const status = typeof event.status === "string" ? event.status : "";
  if (status === EVENT_STATUS.ACTIVE) return true;
  if (!event.endsAt) return false;
  const endsAtMs = new Date(event.endsAt as string | number | Date).getTime();
  return Number.isFinite(endsAtMs) && endsAtMs > now;
}

export function badgeClass(
  map: Record<string, string>,
  key: string | undefined,
): string {
  return (key && map[key]) || EVENT_BADGE_FALLBACK;
}

export function typeBadgeClass(eventType: string | undefined): string {
  return badgeClass(EVENT_TYPE_BADGE, eventType);
}

export function statusBadgeClass(eventStatus: string | undefined): string {
  return badgeClass(EVENT_STATUS_BADGE, eventStatus);
}

export function stripHtmlAndTrim(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function metaDescriptionFromEvent(rawDescription: string, title: string): string {
  const plain = stripHtmlAndTrim(rawDescription);
  return (
    plain.slice(0, EVENT_META.DESCRIPTION_MAX_LEN) ||
    EVENT_META.DEFAULT_DESCRIPTION(title)
  );
}
