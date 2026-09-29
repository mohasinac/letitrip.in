/**
 * Strings, tab values, and badge style maps for the public event detail surface.
 * Centralised so /events/[id], /events/[id]/participate and /events/[id]/leaderboard
 * stay in sync and so future i18n extraction has a single source.
 */

export const EVENT_TAB = {
  OVERVIEW: "overview",
  PARTICIPATE: "participate",
  LEADERBOARD: "leaderboard",
  SPIN: "spin",
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
  POLL_RESULTS_HEADING: "Poll Results",
  POLL_RESULTS_EMPTY: "No votes yet.",
  /*
   * 🛑 A hidden tally is NOT an empty one, and saying so contradicts the page.
   *
   * `getEventPollResults` returns `[]` both when nobody has voted and when
   * `pollConfig.resultsVisibility` says the tally is not public yet — so the
   * leaderboard printed "No votes yet." on a poll whose own header, two lines
   * above, read "Participants: 365". Measured on event-favourite-blader-poll,
   * where `resultsVisibility` is unset so `canShow` is false.
   *
   * This wording matches what the inline vote block on the Overview already
   * tells a voter after they submit, so the two surfaces stop disagreeing.
   */
  POLL_RESULTS_HIDDEN: "Results will be shown after the poll closes.",
  VOTES_SUFFIX: "votes",
  TOTAL_VOTES_SUFFIX: "total votes",
  ENDED_MESSAGE: "This event has ended.",
  PARTICIPANT_FALLBACK: "Participant",
  GUEST_FALLBACK: "Guest",
  POINTS_SUFFIX: "pts",
  COVER_ALT_FALLBACK: "Event cover",
  SPIN_RESULTS_HEADING: "Last 10 Spin Results",
  SPIN_RESULTS_EMPTY: "No spins yet — be the first!",
  /*
   * The viewer-scoped block. `MY_SPINS_EMPTY` is deliberately about YOU, not
   * about the event — the whole defect this section fixes was that someone who
   * had never spun saw three strangers' prizes and no indication that none of
   * them were theirs. "No spins yet" would have been equally misleading here.
   */
  MY_SPINS_HEADING: "Your Spins",
  MY_SPINS_EMPTY: "You have not spun on this event yet.",
  MY_SPINS_SIGNED_OUT: "Sign in to see your own spins and the prizes you have won.",
} as const;

export const EVENT_META = {
  DEFAULT_DESCRIPTION: (title: string) => `Join ${title} on LetItRip.`,
  TITLE_SUFFIX: "— LetItRip Events",
  PARTICIPATE_TITLE: (title: string) => `Participate — ${title}`,
  LEADERBOARD_TITLE: (title: string) => `Leaderboard — ${title}`,
  WINNER_TITLE: (title: string) => `Winner — ${title}`,
  SPIN_RESULTS_TITLE: (title: string) => `Spin Results — ${title}`,
  NOT_FOUND_TITLE: "Event Not Found",
  DESCRIPTION_MAX_LEN: 155,
  LEADERBOARD_VISIBLE_LIMIT: 10,
} as const;

export const EVENT_TYPE_BADGE: Record<string, string> = {
  sale: "bg-success-surface text-success",
  offer: "bg-primary-100 text-primary-700",
  poll: "bg-[var(--appkit-color-primary-50)] text-[var(--appkit-color-primary-600)]",
  survey: "bg-primary-100 text-primary-700",
  feedback: "bg-warning-surface text-warning",
  raffle: "bg-warning-surface text-warning",
  spin_wheel: "bg-error-surface text-error",
  lottery: "bg-[var(--appkit-color-primary-50)] text-[var(--appkit-color-primary-700)]",
} as const;

export const EVENT_STATUS_BADGE: Record<string, string> = {
  active: "bg-success-surface text-success",
  ended: "bg-error-surface text-error",
  draft: "bg-warning-surface text-warning",
  paused: "bg-warning-surface text-warning",
  cancelled: "bg-error-surface text-error",
} as const;

export const EVENT_BADGE_FALLBACK =
  "bg-[var(--appkit-color-surface)] text-[var(--appkit-color-text-muted)]";

export const EVENT_TYPE = {
  POLL: "poll",
  SALE: "sale",
  OFFER: "offer",
  SURVEY: "survey",
  FEEDBACK: "feedback",
  RAFFLE: "raffle",
  SPIN_WHEEL: "spin_wheel",
  LOTTERY: "lottery",
} as const;

export const EVENT_STATUS = {
  ACTIVE: "active",
  ENDED: "ended",
  DRAFT: "draft",
  PAUSED: "paused",
  CANCELLED: "cancelled",
} as const;
