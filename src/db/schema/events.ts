/**
 * Events Collection Schema
 *
 * Stores events: sales, offers, polls, surveys, and feedback forms.
 * Collections: events, eventEntries
 */

// ============================================
// 1. COLLECTION INTERFACES & NAMES
// ============================================

export const EVENTS_COLLECTION = "events" as const;
export const EVENT_ENTRIES_COLLECTION = "eventEntries" as const;

export type EventType = "sale" | "offer" | "poll" | "survey" | "feedback";
export type EventStatus = "draft" | "active" | "paused" | "ended";
export type EntryReviewStatus = "pending" | "approved" | "flagged";
export type FormFieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "number"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "date"
  | "rating"
  | "file";
export type PollResultsVisibility = "always" | "after_vote" | "after_end";

// Dynamic form field used in survey + feedback events
export interface SurveyFormField {
  id: string; // nanoid()
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select / multiselect / checkbox / radio
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number; // display sort order
}

// Per-type config blocks stored inline on the event doc
export interface SaleConfig {
  discountPercent: number; // e.g. 20 => "20% Off Everything"
  bannerText?: string; // override display text
  affectedCategories?: string[]; // [] = site-wide
}

export interface OfferConfig {
  couponId: string; // FK -> coupons collection
  displayCode: string; // visible coupon code
  bannerText?: string;
}

export interface PollConfig {
  allowMultiSelect: boolean;
  allowComment: boolean;
  options: { id: string; label: string }[];
  resultsVisibility: PollResultsVisibility;
}

export interface SurveyConfig {
  requireLogin: boolean;
  maxEntriesPerUser: number; // 1 = one entry per user
  hasLeaderboard: boolean;
  hasPointSystem: boolean;
  pointsLabel?: string; // e.g. "Stars"
  entryReviewRequired: boolean; // true = mods must approve before counting
  formFields: SurveyFormField[];
}

export interface FeedbackConfig {
  formFields: SurveyFormField[];
  anonymous: boolean; // allow non-logged-in submissions
}

export interface EventDocument {
  id: string;
  type: EventType;
  title: string;
  description: string; // RichText HTML
  status: EventStatus;
  startsAt: Date;
  endsAt: Date;
  coverImageUrl?: string;
  tags?: string[];

  // Only one of these is populated per event
  saleConfig?: SaleConfig;
  offerConfig?: OfferConfig;
  pollConfig?: PollConfig;
  surveyConfig?: SurveyConfig;
  feedbackConfig?: FeedbackConfig;

  stats: {
    totalEntries: number;
    approvedEntries: number;
    flaggedEntries: number;
  };

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventEntryDocument {
  id: string;
  eventId: string;
  userId?: string; // undefined for anonymous feedback
  userDisplayName?: string;
  userEmail?: string;

  // Poll-specific
  pollVotes?: string[]; // selected option IDs
  pollComment?: string;

  // Survey / feedback responses: fieldId -> value
  formResponses?: Record<string, unknown>;

  // Moderation
  reviewStatus: EntryReviewStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNote?: string;

  // Point system
  points?: number;

  ipAddress?: string; // for dedup / fraud detection
  submittedAt: Date;
}

// ============================================
// 2. INDEXED FIELDS
// ============================================

/**
 * Firestore indices needed (see firestore.indexes.json):
 * - status + endsAt (active event queries)
 * - type + status (admin list filtering)
 * - eventId + reviewStatus + submittedAt (entry moderation)
 * - eventId + points (leaderboard)
 */
export const EVENT_INDEXED_FIELDS = [
  "type",
  "status",
  "startsAt",
  "endsAt",
  "createdAt",
] as const;

export const EVENT_ENTRY_INDEXED_FIELDS = [
  "eventId",
  "userId",
  "reviewStatus",
  "submittedAt",
  "points",
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================

/**
 * RELATIONSHIPS:
 *
 * events
 *   └─ eventEntries.eventId -> events.id   (1:many)
 *   └─ offerConfig.couponId -> coupons.id  (optional FK)
 *   └─ createdBy -> users.id               (audit FK)
 *
 * eventEntries
 *   └─ eventId -> events.id
 *   └─ userId  -> users.id (optional — anonymous for feedback)
 */

// ============================================
// 4. FIELD NAME CONSTANTS
// ============================================

export const EVENT_FIELDS = {
  ID: "id",
  TYPE: "type",
  TITLE: "title",
  DESCRIPTION: "description",
  STATUS: "status",
  STARTS_AT: "startsAt",
  ENDS_AT: "endsAt",
  COVER_IMAGE_URL: "coverImageUrl",
  TAGS: "tags",
  CREATED_BY: "createdBy",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  STATS: {
    TOTAL_ENTRIES: "stats.totalEntries",
    APPROVED_ENTRIES: "stats.approvedEntries",
    FLAGGED_ENTRIES: "stats.flaggedEntries",
  },
  STATUS_VALUES: {
    DRAFT: "draft" as EventStatus,
    ACTIVE: "active" as EventStatus,
    PAUSED: "paused" as EventStatus,
    ENDED: "ended" as EventStatus,
  },
  TYPE_VALUES: {
    SALE: "sale" as EventType,
    OFFER: "offer" as EventType,
    POLL: "poll" as EventType,
    SURVEY: "survey" as EventType,
    FEEDBACK: "feedback" as EventType,
  },
} as const;

export const EVENT_ENTRY_FIELDS = {
  ID: "id",
  EVENT_ID: "eventId",
  USER_ID: "userId",
  REVIEW_STATUS: "reviewStatus",
  REVIEWED_BY: "reviewedBy",
  REVIEWED_AT: "reviewedAt",
  SUBMITTED_AT: "submittedAt",
  POINTS: "points",
  REVIEW_STATUS_VALUES: {
    PENDING: "pending" as EntryReviewStatus,
    APPROVED: "approved" as EntryReviewStatus,
    FLAGGED: "flagged" as EntryReviewStatus,
  },
} as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================

export type EventCreateInput = Omit<
  EventDocument,
  "id" | "createdAt" | "updatedAt" | "stats"
>;

export type EventUpdateInput = Partial<
  Omit<EventDocument, "id" | "createdAt" | "createdBy">
>;

export type EventEntryCreateInput = Omit<
  EventEntryDocument,
  "id" | "submittedAt"
>;

// ============================================
// 6. QUERY HELPERS
// ============================================

export const eventQueryHelpers = {
  activeOnly: () => (query: FirebaseFirestore.Query) =>
    query.where(EVENT_FIELDS.STATUS, "==", EVENT_FIELDS.STATUS_VALUES.ACTIVE),

  byType: (type: EventType) => (query: FirebaseFirestore.Query) =>
    query.where(EVENT_FIELDS.TYPE, "==", type),

  byStatus: (status: EventStatus) => (query: FirebaseFirestore.Query) =>
    query.where(EVENT_FIELDS.STATUS, "==", status),
};
