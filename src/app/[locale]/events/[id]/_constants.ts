/**
 * Strings, tab values, and badge style maps for the public event detail surface.
 * Centralised so /events/[id], /events/[id]/participate and /events/[id]/leaderboard
 * stay in sync and so future i18n extraction has a single source.
 */

export const EVENT_TAB = {
  OVERVIEW: "overview",
  PARTICIPATE: "participate",
  LEADERBOARD: "leaderboard",
} as const;

export type EventTab = (typeof EVENT_TAB)[keyof typeof EVENT_TAB];

export const EVENT_LABELS = {
  TAB_OVERVIEW: "Overview",
  TAB_PARTICIPATE: "Participate",
  TAB_LEADERBOARD: "Leaderboard",
  TAB_WINNER: "Winner",
  TAB_SPIN: "Spin",
  HEADER_START: "Start:",
  HEADER_END: "End:",
  HEADER_PARTICIPANTS: "Participants:",
  HEADER_SHARE: "Share:",
  OVERVIEW_POLL_HEADING: "Cast Your Vote",
  LEADERBOARD_HEADING: "Leaderboard",
  LEADERBOARD_EMPTY: "No entries on the leaderboard yet.",
  ENDED_MESSAGE: "This event has ended.",
  PARTICIPANT_FALLBACK: "Participant",
  POINTS_SUFFIX: "pts",
  COVER_ALT_FALLBACK: "Event cover",
} as const;

export const EVENT_META = {
  DEFAULT_DESCRIPTION: (title: string) => `Join ${title} on LetItRip.`,
  TITLE_SUFFIX: "— LetItRip Events",
  PARTICIPATE_TITLE: (title: string) => `Participate — ${title}`,
  LEADERBOARD_TITLE: (title: string) => `Leaderboard — ${title}`,
  WINNER_TITLE: (title: string) => `Winner — ${title}`,
  NOT_FOUND_TITLE: "Event Not Found",
  DESCRIPTION_MAX_LEN: 155,
  LEADERBOARD_VISIBLE_LIMIT: 10,
} as const;

export const EVENT_TYPE_BADGE: Record<string, string> = {
  sale: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  offer: "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  poll: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  survey: "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  feedback: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  raffle: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  spin_wheel: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
} as const;

export const EVENT_STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  ended: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
} as const;

export const EVENT_BADGE_FALLBACK =
  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";

export const EVENT_TYPE = {
  POLL: "poll",
  SALE: "sale",
  OFFER: "offer",
  SURVEY: "survey",
  FEEDBACK: "feedback",
  RAFFLE: "raffle",
  SPIN_WHEEL: "spin_wheel",
} as const;

export const EVENT_STATUS = {
  ACTIVE: "active",
  ENDED: "ended",
  DRAFT: "draft",
} as const;
