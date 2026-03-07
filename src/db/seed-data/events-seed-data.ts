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
    coverImageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop",
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
    coverImageUrl:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=400&fit=crop",
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
    coverImageUrl:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=400&fit=crop",
    stats: {
      totalEntries: 74,
      approvedEntries: 74,
      flaggedEntries: 0,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-01-28T11:00:00Z"),
    updatedAt: new Date("2026-02-27T16:00:00Z"),
  },

  // 6. Active Sale — Women's Day 15% off Fashion + Beauty
  {
    id: "event-womens-day-sale-2026-sale",
    type: EVENT_FIELDS.TYPE_VALUES.SALE,
    title: "Women's Day Sale — 15% Off Fashion & Beauty",
    description:
      "<p>Celebrate International Women's Day with <strong>15% off</strong> everything in Fashion and Beauty & Health. Valid 8–10 March 2026.</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ACTIVE,
    startsAt: new Date("2026-03-08T00:00:00Z"),
    endsAt: new Date("2026-03-10T23:59:59Z"),
    coverImageUrl:
      "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=1200&h=400&fit=crop",
    saleConfig: {
      discountPercent: 15,
      bannerText: "💜 Women's Day — 15% off Fashion & Beauty this weekend",
      affectedCategories: ["category-fashion", "category-beauty-health"],
    },
    stats: {
      totalEntries: 0,
      approvedEntries: 0,
      flaggedEntries: 0,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-03-01T10:00:00Z"),
    updatedAt: new Date("2026-03-01T10:00:00Z"),
  },

  // 7. Draft Sale — Diwali 40% off sitewide (future)
  {
    id: "event-diwali-sale-2026-sale",
    type: EVENT_FIELDS.TYPE_VALUES.SALE,
    title: "Diwali Grand Sale 2026 — Up to 40% Off",
    description:
      "<p>Our biggest sale of the year is coming! Enjoy <strong>up to 40% off</strong> across every category on LetItRip. Mark your calendars — 20–28 Oct 2026.</p>",
    status: EVENT_FIELDS.STATUS_VALUES.DRAFT,
    startsAt: new Date("2026-10-20T00:00:00Z"),
    endsAt: new Date("2026-10-28T23:59:59Z"),
    coverImageUrl:
      "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1200&h=400&fit=crop",
    saleConfig: {
      discountPercent: 40,
      bannerText: "🪔 Diwali Sale is coming — Up to 40% off sitewide!",
      affectedCategories: [],
    },
    stats: {
      totalEntries: 0,
      approvedEntries: 0,
      flaggedEntries: 0,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-03-15T09:00:00Z"),
    updatedAt: new Date("2026-03-15T09:00:00Z"),
  },

  // 8. Active Offer — Sports Season coupon giveaway
  {
    id: "event-sports-season-offer-2026-offer",
    type: EVENT_FIELDS.TYPE_VALUES.OFFER,
    title: "Sports Season Deal — 10% Off with SPORT10",
    description:
      "<p>Gear up for the sporting season! Use code <strong>SPORT10</strong> at checkout to get 10% off all Sports & Outdoors products. Valid on orders over ₹500.</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ACTIVE,
    startsAt: new Date("2026-04-01T00:00:00Z"),
    endsAt: new Date("2026-05-31T23:59:59Z"),
    coverImageUrl:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=400&fit=crop",
    offerConfig: {
      couponId: "coupon-SPORT10",
      displayCode: "SPORT10",
      bannerText:
        "🏅 Sports Season — Use SPORT10 for 10% off Sports & Outdoors",
    },
    stats: {
      totalEntries: 0,
      approvedEntries: 0,
      flaggedEntries: 0,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-03-20T10:00:00Z"),
    updatedAt: new Date("2026-03-20T10:00:00Z"),
  },

  // 9. Active Poll — Favourite Electronics Brand
  {
    id: "event-favourite-brand-poll-2026-poll",
    type: EVENT_FIELDS.TYPE_VALUES.POLL,
    title: "Your Favourite Electronics Brand on LetItRip",
    description:
      "<p>Which electronics brand do you trust most? Cast your vote and see live results — everyone can see the tally as it updates!</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ACTIVE,
    startsAt: new Date("2026-03-01T00:00:00Z"),
    endsAt: new Date("2026-04-30T23:59:59Z"),
    coverImageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop",
    pollConfig: {
      allowMultiSelect: false,
      allowComment: false,
      options: [
        { id: "opt-samsung", label: "Samsung" },
        { id: "opt-apple", label: "Apple" },
        { id: "opt-sony", label: "Sony" },
        { id: "opt-oneplus", label: "OnePlus" },
        { id: "opt-lg", label: "LG" },
        { id: "opt-other", label: "Other" },
      ],
      resultsVisibility: "always",
    },
    stats: {
      totalEntries: 4,
      approvedEntries: 4,
      flaggedEntries: 0,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-02-25T14:00:00Z"),
    updatedAt: new Date("2026-03-10T11:00:00Z"),
  },

  // 10. Active Survey — Shopping Experience with leaderboard + points
  {
    id: "event-shopping-experience-survey-2026-survey",
    type: EVENT_FIELDS.TYPE_VALUES.SURVEY,
    title: "Tell Us About Your Shopping Experience — Earn Stars!",
    description:
      "<p>Complete this short survey and earn <strong>Stars</strong> on our leaderboard. Top contributors each month win exclusive LetItRip rewards!</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ACTIVE,
    startsAt: new Date("2026-04-01T00:00:00Z"),
    endsAt: new Date("2026-06-30T23:59:59Z"),
    coverImageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop",
    surveyConfig: {
      requireLogin: true,
      maxEntriesPerUser: 1,
      hasLeaderboard: true,
      hasPointSystem: true,
      pointsLabel: "Stars",
      entryReviewRequired: true,
      formFields: [
        {
          id: "sq-name",
          type: "text",
          label: "Your first name",
          placeholder: "e.g. Priya",
          required: true,
          order: 1,
        } as SurveyFormField,
        {
          id: "sq-rating",
          type: "rating",
          label: "How would you rate your overall shopping experience?",
          required: true,
          order: 2,
        } as SurveyFormField,
        {
          id: "sq-category",
          type: "radio",
          label: "Which category do you shop in most?",
          required: true,
          options: [
            "Electronics",
            "Fashion",
            "Home & Kitchen",
            "Sports",
            "Other",
          ],
          order: 3,
        } as SurveyFormField,
        {
          id: "sq-features",
          type: "checkbox",
          label: "Which platform features do you use? (select all that apply)",
          required: false,
          options: [
            "Wishlist",
            "Product Reviews",
            "Price Alerts",
            "Deals & Events",
            "Auction",
          ],
          order: 4,
        } as SurveyFormField,
        {
          id: "sq-suggestion",
          type: "textarea",
          label: "What one feature would you most like to see added?",
          placeholder: "Describe in a few sentences…",
          required: false,
          validation: { maxLength: 500 },
          order: 5,
        } as SurveyFormField,
      ],
    },
    stats: {
      totalEntries: 2,
      approvedEntries: 1,
      flaggedEntries: 0,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-03-25T09:00:00Z"),
    updatedAt: new Date("2026-04-12T16:00:00Z"),
  },

  // 11. Active Feedback — App Experience (non-anonymous)
  {
    id: "event-app-experience-feedback-2026-feedback",
    type: EVENT_FIELDS.TYPE_VALUES.FEEDBACK,
    title: "Rate Your LetItRip App Experience",
    description:
      "<p>Tell us what you think about the LetItRip app. Your named feedback helps our team prioritise improvements — thank you for taking a moment!</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ACTIVE,
    startsAt: new Date("2026-04-01T00:00:00Z"),
    endsAt: new Date("2026-06-30T23:59:59Z"),
    coverImageUrl:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=400&fit=crop",
    feedbackConfig: {
      anonymous: false,
      formFields: [
        {
          id: "afb-ease",
          type: "rating",
          label: "How easy is it to find what you're looking for?",
          required: true,
          order: 1,
        } as SurveyFormField,
        {
          id: "afb-performance",
          type: "radio",
          label: "How would you rate the app's speed and performance?",
          required: true,
          options: ["Excellent", "Good", "Average", "Poor"],
          order: 2,
        } as SurveyFormField,
        {
          id: "afb-recommend",
          type: "radio",
          label: "Would you recommend LetItRip to a friend?",
          required: true,
          options: ["Definitely", "Probably", "Not sure", "No"],
          order: 3,
        } as SurveyFormField,
        {
          id: "afb-comments",
          type: "textarea",
          label: "Any other feedback for our team?",
          placeholder: "Share your thoughts…",
          required: false,
          validation: { maxLength: 600 },
          order: 4,
        } as SurveyFormField,
      ],
    },
    stats: {
      totalEntries: 3,
      approvedEntries: 3,
      flaggedEntries: 0,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-03-25T09:00:00Z"),
    updatedAt: new Date("2026-04-15T12:00:00Z"),
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

  // Brand Poll votes — event-favourite-brand-poll-2026-poll (#9)
  {
    id: "entry-poll-brand-john-samsung",
    eventId: "event-favourite-brand-poll-2026-poll",
    userId: "user-john-doe-johndoe",
    userDisplayName: "John Doe",
    userEmail: "john@letitrip.in",
    pollVotes: ["opt-samsung"],
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-03-02T10:00:00Z"),
  },
  {
    id: "entry-poll-brand-jane-apple",
    eventId: "event-favourite-brand-poll-2026-poll",
    userId: "user-jane-smith-janes",
    userDisplayName: "Jane Smith",
    userEmail: "jane@letitrip.in",
    pollVotes: ["opt-apple"],
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-03-03T14:22:00Z"),
  },
  {
    id: "entry-poll-brand-mike-sony",
    eventId: "event-favourite-brand-poll-2026-poll",
    userId: "user-mike-johnson-mikejohn",
    userDisplayName: "Mike Johnson",
    userEmail: "mike@letitrip.in",
    pollVotes: ["opt-sony"],
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-03-04T09:10:00Z"),
  },
  {
    id: "entry-poll-brand-fashionb-oneplus",
    eventId: "event-favourite-brand-poll-2026-poll",
    userId: "user-fashion-boutique-fashionb",
    userDisplayName: "Fashion Boutique",
    userEmail: "fashionb@letitrip.in",
    pollVotes: ["opt-oneplus"],
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-03-05T16:45:00Z"),
  },

  // Survey responses — event-shopping-experience-survey-2026-survey (#10)
  {
    id: "entry-survey-shopping-john",
    eventId: "event-shopping-experience-survey-2026-survey",
    userId: "user-john-doe-johndoe",
    userDisplayName: "John Doe",
    userEmail: "john@letitrip.in",
    formResponses: {
      "sq-name": "John",
      "sq-rating": 5,
      "sq-category": "Electronics",
      "sq-features": ["Wishlist", "Product Reviews", "Deals & Events"],
      "sq-suggestion":
        "A price-drop alert direct to WhatsApp would be fantastic.",
    },
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    reviewedBy: "user-admin-user-admin",
    reviewedAt: new Date("2026-04-10T10:00:00Z"),
    reviewNote: "Well-written response — awarded full Stars",
    points: 95,
    submittedAt: new Date("2026-04-05T11:30:00Z"),
  },
  {
    id: "entry-survey-shopping-jane",
    eventId: "event-shopping-experience-survey-2026-survey",
    userId: "user-jane-smith-janes",
    userDisplayName: "Jane Smith",
    userEmail: "jane@letitrip.in",
    formResponses: {
      "sq-name": "Jane",
      "sq-rating": 4,
      "sq-category": "Fashion",
      "sq-features": ["Wishlist", "Price Alerts"],
      "sq-suggestion":
        "Outfit-builder feature combining multiple products would be amazing.",
    },
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.PENDING,
    submittedAt: new Date("2026-04-08T15:00:00Z"),
  },

  // App feedback — event-app-experience-feedback-2026-feedback (#11)
  {
    id: "entry-feedback-app-john",
    eventId: "event-app-experience-feedback-2026-feedback",
    userId: "user-john-doe-johndoe",
    userDisplayName: "John Doe",
    userEmail: "john@letitrip.in",
    formResponses: {
      "afb-ease": 5,
      "afb-performance": "Excellent",
      "afb-recommend": "Definitely",
      "afb-comments":
        "Love how fast searches load. The filter panel is intuitive.",
    },
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-04-03T09:15:00Z"),
  },
  {
    id: "entry-feedback-app-mike",
    eventId: "event-app-experience-feedback-2026-feedback",
    userId: "user-mike-johnson-mikejohn",
    userDisplayName: "Mike Johnson",
    userEmail: "mike@letitrip.in",
    formResponses: {
      "afb-ease": 3,
      "afb-performance": "Average",
      "afb-recommend": "Probably",
      "afb-comments":
        "Occasionally slow on category pages with lots of products.",
    },
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-04-06T13:40:00Z"),
  },
  {
    id: "entry-feedback-app-priya",
    eventId: "event-app-experience-feedback-2026-feedback",
    userId: "user-priya-sharma-priya",
    userDisplayName: "Priya Sharma",
    userEmail: "priya@letitrip.in",
    formResponses: {
      "afb-ease": 4,
      "afb-performance": "Good",
      "afb-recommend": "Definitely",
      "afb-comments":
        "Love the auction feature! Wish there were more live auctions.",
    },
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-04-09T17:05:00Z"),
  },
];
