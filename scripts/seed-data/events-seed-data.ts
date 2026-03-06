/**
 * Events Seed Data
 * Sample events: sale, offer, poll, survey, and feedback — with entries
 */

import type {
  EventDocument,
  EventEntryDocument,
  SurveyFormField,
} from "@/db/schema";
import { EVENT_FIELDS, EVENT_ENTRY_FIELDS } from "@/db/schema";

// Helper type that accepts Date for Timestamp fields (converted at seed time)
type EventSeed = Omit<
  EventDocument,
  "startsAt" | "endsAt" | "createdAt" | "updatedAt"
> & { startsAt: Date; endsAt: Date; createdAt: Date; updatedAt: Date };

type EventEntrySeed = Omit<EventEntryDocument, "submittedAt" | "reviewedAt"> & {
  submittedAt: Date;
  reviewedAt?: Date;
};

// ── Events ────────────────────────────────────────────────────────────────────

export const eventsSeedData: EventSeed[] = [
  // 1. Active Sale Event — site-wide 20% off
  {
    id: "event-republic-day-sale-2026-sale",
    type: EVENT_FIELDS.TYPE_VALUES.SALE,
    title: "Republic Day Sale 2026 — 20% Off Everything",
    description:
      "<p>Celebrate Republic Day with a <strong>flat 20% discount</strong> across all categories. Limited-time offer — sale ends 26 Jan at midnight.</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ENDED,
    startsAt: new Date("2026-01-24T00:00:00Z"),
    endsAt: new Date("2026-01-26T23:59:59Z"),
    coverImageUrl:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&h=400&fit=crop",
    saleConfig: {
      discountPercent: 20,
      bannerText: "Republic Day Sale — 20% Off Sitewide 🇮🇳",
      affectedCategories: [],
    },
    stats: {
      totalEntries: 0,
      approvedEntries: 0,
      flaggedEntries: 0,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-01-20T10:00:00Z"),
    updatedAt: new Date("2026-01-27T00:05:00Z"),
  },

  // 2. Active Offer Event — coupon giveaway
  {
    id: "event-holi-offer-2026-offer",
    type: EVENT_FIELDS.TYPE_VALUES.OFFER,
    title: "Holi Special Offer — Extra 15% Off with HOLI15",
    description:
      "<p>Celebrate Holi with colours <em>and</em> savings! Use code <strong>HOLI15</strong> to get an extra 15% off your cart. Valid on all orders over ₹999.</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ACTIVE,
    startsAt: new Date("2026-03-01T00:00:00Z"),
    endsAt: new Date("2026-03-15T23:59:59Z"),
    coverImageUrl:
      "https://images.unsplash.com/photo-1549992948-c9c9a70e77e1?w=1200&h=400&fit=crop",
    offerConfig: {
      couponId: "coupon-HOLI15",
      displayCode: "HOLI15",
      bannerText: "🎨 Holi Offer — Use HOLI15 for 15% extra off",
    },
    stats: {
      totalEntries: 0,
      approvedEntries: 0,
      flaggedEntries: 0,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-02-22T10:00:00Z"),
    updatedAt: new Date("2026-02-22T10:00:00Z"),
  },

  // 3. Active Poll — Community Preference
  {
    id: "event-community-poll-gear-2026-poll",
    type: EVENT_FIELDS.TYPE_VALUES.POLL,
    title: "What Outdoor Gear Should We Feature Next Month?",
    description:
      "<p>We want to feature the category YOU care about most in March. Cast your vote and shape what appears on the LetItRip homepage next month!</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ENDED,
    startsAt: new Date("2026-02-15T00:00:00Z"),
    endsAt: new Date("2026-02-28T23:59:59Z"),
    pollConfig: {
      allowMultiSelect: false,
      allowComment: true,
      options: [
        { id: "opt-camping", label: "Camping & Tents" },
        { id: "opt-climbing", label: "Rock Climbing Gear" },
        { id: "opt-cycling", label: "Cycling & MTB" },
        { id: "opt-water", label: "Water Sports" },
        { id: "opt-winter", label: "Winter Sports & Snow Gear" },
      ],
      resultsVisibility: "after_vote",
    },
    stats: {
      totalEntries: 312,
      approvedEntries: 312,
      flaggedEntries: 0,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-02-10T14:00:00Z"),
    updatedAt: new Date("2026-02-27T20:00:00Z"),
  },

  // 4. Ended Survey — Product Feedback Survey
  {
    id: "event-platform-experience-survey-2026-survey",
    type: EVENT_FIELDS.TYPE_VALUES.SURVEY,
    title: "LetItRip Platform Experience Survey — Win ₹500 Voucher",
    description:
      "<p>Share your honest feedback about LetItRip and be entered into a draw to <strong>win a ₹500 shopping voucher</strong>. Takes 3 minutes — we promise.</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ENDED,
    startsAt: new Date("2026-01-01T00:00:00Z"),
    endsAt: new Date("2026-01-31T23:59:59Z"),
    surveyConfig: {
      requireLogin: true,
      maxEntriesPerUser: 1,
      hasLeaderboard: false,
      hasPointSystem: false,
      entryReviewRequired: false,
      formFields: [
        {
          id: "sf-overall",
          type: "rating",
          label: "Overall, how satisfied are you with LetItRip?",
          required: true,
          order: 1,
        } as SurveyFormField,
        {
          id: "sf-discovery",
          type: "radio",
          label: "How did you discover LetItRip?",
          required: true,
          options: [
            "Search engine",
            "Social media",
            "Friend / family",
            "Online ad",
            "Other",
          ],
          order: 2,
        } as SurveyFormField,
        {
          id: "sf-improve",
          type: "textarea",
          label: "What's one thing we could improve?",
          placeholder: "Tell us in a few words…",
          required: false,
          validation: { maxLength: 500 },
          order: 3,
        } as SurveyFormField,
      ],
    },
    stats: {
      totalEntries: 2418,
      approvedEntries: 2418,
      flaggedEntries: 12,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2025-12-28T10:00:00Z"),
    updatedAt: new Date("2026-02-01T09:00:00Z"),
  },

  // 5. Active Feedback Event — anonymous contact form
  {
    id: "event-seller-feedback-form-2026-feedback",
    type: EVENT_FIELDS.TYPE_VALUES.FEEDBACK,
    title: "Help Us Improve the Seller Experience",
    description:
      "<p>Selling on LetItRip? We'd love your feedback. This anonymous form takes 2 minutes and every response is reviewed by our product team.</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ACTIVE,
    startsAt: new Date("2026-02-01T00:00:00Z"),
    endsAt: new Date("2026-04-30T23:59:59Z"),
    feedbackConfig: {
      anonymous: true,
      formFields: [
        {
          id: "fb-dashboard",
          type: "rating",
          label: "How easy is the seller dashboard to use?",
          required: true,
          order: 1,
        } as SurveyFormField,
        {
          id: "fb-payout",
          type: "radio",
          label: "Are you satisfied with the payout turnaround time?",
          required: true,
          options: ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied"],
          order: 2,
        } as SurveyFormField,
        {
          id: "fb-comment",
          type: "textarea",
          label: "Any additional comments?",
          placeholder: "Optional — share whatever is on your mind…",
          required: false,
          validation: { maxLength: 1000 },
          order: 3,
        } as SurveyFormField,
      ],
    },
    stats: {
      totalEntries: 74,
      approvedEntries: 74,
      flaggedEntries: 0,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-01-28T11:00:00Z"),
    updatedAt: new Date("2026-02-27T16:00:00Z"),
  },
];

// ── Event Entries ─────────────────────────────────────────────────────────────

export const eventEntriesSeedData: EventEntrySeed[] = [
  // Poll votes
  {
    id: "entry-poll-gear-john-camping",
    eventId: "event-community-poll-gear-2026-poll",
    userId: "user-john-doe-johndoe",
    userDisplayName: "John Doe",
    userEmail: "john@letitrip.in",
    pollVotes: ["opt-camping"],
    pollComment: "Really keen to see more camping gear featured!",
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-02-16T10:12:00Z"),
  },
  {
    id: "entry-poll-gear-jane-climbing",
    eventId: "event-community-poll-gear-2026-poll",
    userId: "user-jane-smith-janes",
    userDisplayName: "Jane Smith",
    userEmail: "jane@letitrip.in",
    pollVotes: ["opt-climbing"],
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-02-17T14:30:00Z"),
  },
  {
    id: "entry-poll-gear-mike-cycling",
    eventId: "event-community-poll-gear-2026-poll",
    userId: "user-mike-johnson-mikejohn",
    userDisplayName: "Mike Johnson",
    userEmail: "mike@letitrip.in",
    pollVotes: ["opt-cycling"],
    pollComment: "MTB accessories are underrepresented on the platform.",
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-02-18T09:05:00Z"),
  },

  // Survey responses
  {
    id: "entry-survey-platform-john",
    eventId: "event-platform-experience-survey-2026-survey",
    userId: "user-john-doe-johndoe",
    userDisplayName: "John Doe",
    userEmail: "john@letitrip.in",
    formResponses: {
      "sf-overall": 5,
      "sf-discovery": "Search engine",
      "sf-improve": "Faster search filters would be great.",
    },
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-01-10T11:00:00Z"),
  },
  {
    id: "entry-survey-platform-jane",
    eventId: "event-platform-experience-survey-2026-survey",
    userId: "user-jane-smith-janes",
    userDisplayName: "Jane Smith",
    userEmail: "jane@letitrip.in",
    formResponses: {
      "sf-overall": 4,
      "sf-discovery": "Friend / family",
      "sf-improve": "Would love a wishlist sharing feature.",
    },
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-01-15T15:30:00Z"),
  },

  // Feedback (anonymous)
  {
    id: "entry-feedback-seller-anon-1",
    eventId: "event-seller-feedback-form-2026-feedback",
    formResponses: {
      "fb-dashboard": 4,
      "fb-payout": "Satisfied",
      "fb-comment":
        "The dashboard is quite good. Would love bulk image upload.",
    },
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-02-10T08:45:00Z"),
  },
  {
    id: "entry-feedback-seller-anon-2",
    eventId: "event-seller-feedback-form-2026-feedback",
    formResponses: {
      "fb-dashboard": 3,
      "fb-payout": "Neutral",
      "fb-comment": "Payout is a bit slow. 5 days feels long for small orders.",
    },
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-02-14T12:20:00Z"),
  },
  {
    id: "entry-feedback-seller-anon-flagged",
    eventId: "event-seller-feedback-form-2026-feedback",
    formResponses: {
      "fb-dashboard": 1,
      "fb-payout": "Dissatisfied",
      "fb-comment": "Spam content removed by moderation",
    },
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.FLAGGED,
    reviewedBy: "user-admin-user-admin",
    reviewedAt: new Date("2026-02-15T10:00:00Z"),
    reviewNote: "Spam submission — flagged",
    submittedAt: new Date("2026-02-15T09:55:00Z"),
  },
];
