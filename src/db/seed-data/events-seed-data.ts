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
  // 1. Ended Sale Event — Anime Winter Season Sale
  {
    id: "event-anime-winter-season-sale-2026-sale",
    type: EVENT_FIELDS.TYPE_VALUES.SALE,
    title: "Anime Winter Season Sale 2026 — 20% Off Everything",
    description:
      "<p>Celebrate the end of the Winter anime season with a <strong>flat 20% discount</strong> across all collectibles, figures, and cosplay. Limited-time offer — sale ends 26 Jan at midnight.</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ENDED,
    startsAt: new Date("2026-01-24T00:00:00Z"),
    endsAt: new Date("2026-01-26T23:59:59Z"),
    coverImageUrl: "https://picsum.photos/seed/anime-winter-sale/1200/400",
    saleConfig: {
      discountPercent: 20,
      bannerText: "❄️ Anime Winter Season Sale — 20% Off Sitewide!",
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

  // 2. Active Offer Event — AniCon 2026 Coupon Drop
  {
    id: "event-anicon-2026-coupon-drop-offer",
    type: EVENT_FIELDS.TYPE_VALUES.OFFER,
    title: "AniCon 2026 Coupon Drop — Extra 15% Off with ANIMECON15",
    description:
      "<p>Celebrating AniCon 2026! Use code <strong>ANIMECON15</strong> to get an extra 15% off any order. Valid on all orders over ₹999 — stack it on top of sale prices!</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ACTIVE,
    startsAt: new Date("2026-03-01T00:00:00Z"),
    endsAt: new Date("2026-03-15T23:59:59Z"),
    coverImageUrl: "https://picsum.photos/seed/animecon-2026-offer/1200/400",
    offerConfig: {
      couponId: "coupon-ANIMECON15",
      displayCode: "ANIMECON15",
      bannerText: "🎌 AniCon 2026 — Use ANIMECON15 for 15% extra off!",
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

  // 3. Ended Poll — Anime Franchise Features
  {
    id: "event-anime-franchise-poll-2026-poll",
    type: EVENT_FIELDS.TYPE_VALUES.POLL,
    title: "Which Anime Franchise Should We Feature Next Month?",
    description:
      "<p>We want to feature the franchise YOU love most in March. Cast your vote and shape what drops on the LetItRip homepage next month — new figures, exclusive cosplay, and special auction lots!</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ENDED,
    startsAt: new Date("2026-02-15T00:00:00Z"),
    endsAt: new Date("2026-02-28T23:59:59Z"),
    pollConfig: {
      allowMultiSelect: false,
      allowComment: true,
      options: [
        { id: "opt-dragon-ball", label: "Dragon Ball (Z / Super)" },
        { id: "opt-one-piece", label: "One Piece" },
        { id: "opt-jjk", label: "Jujutsu Kaisen" },
        { id: "opt-demon-slayer", label: "Demon Slayer" },
        { id: "opt-bleach", label: "Bleach: Thousand-Year Blood War" },
      ],
      resultsVisibility: "after_vote",
    },
    coverImageUrl: "https://picsum.photos/seed/anime-franchise-poll/1200/400",
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

  // 6. Active Sale — Spring Otaku Sale 15% off all collectibles
  {
    id: "event-spring-otaku-sale-2026-sale",
    type: EVENT_FIELDS.TYPE_VALUES.SALE,
    title: "Spring Otaku Sale 2026 — 15% Off All Collectibles & Cosplay",
    description:
      "<p>Spring season is here and so are new anime releases! Grab <strong>15% off</strong> all figures, cosplay, Nendoroids, and Gunpla kits. Valid 8–10 March 2026 only.</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ACTIVE,
    startsAt: new Date("2026-03-08T00:00:00Z"),
    endsAt: new Date("2026-03-10T23:59:59Z"),
    coverImageUrl: "https://picsum.photos/seed/spring-otaku-sale/1200/400",
    saleConfig: {
      discountPercent: 15,
      bannerText: "🌸 Spring Otaku Sale — 15% off all Figures & Cosplay!",
      affectedCategories: ["category-electronics", "category-fashion"],
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

  // 7. Draft Sale — Summer Anime Season Sale (future)
  {
    id: "event-summer-anime-season-sale-2026-sale",
    type: EVENT_FIELDS.TYPE_VALUES.SALE,
    title: "Summer Anime Season Sale 2026 — Up to 40% Off",
    description:
      "<p>Get ready for our biggest otaku sale of the year! Enjoy <strong>up to 40% off</strong> exclusive figures, pre-orders, Gunpla, and cosplay across LetItRip. Mark your calendars — 1–10 July 2026.</p>",
    status: EVENT_FIELDS.STATUS_VALUES.DRAFT,
    startsAt: new Date("2026-07-01T00:00:00Z"),
    endsAt: new Date("2026-07-10T23:59:59Z"),
    coverImageUrl:
      "https://picsum.photos/seed/summer-anime-season-sale/1200/400",
    saleConfig: {
      discountPercent: 40,
      bannerText: "☀️ Summer Anime Season Sale — Up to 40% off sitewide!",
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

  // 8. Active Offer — Golden Week Anime Special
  {
    id: "event-golden-week-anime-special-2026-offer",
    type: EVENT_FIELDS.TYPE_VALUES.OFFER,
    title: "Golden Week Anime Special — 10% Off with GOLDENWEEK10",
    description:
      "<p>Celebrate Golden Week with otaku deals! Use code <strong>GOLDENWEEK10</strong> at checkout to get 10% off all pre-orders, scale figures, and Gunpla kits. Valid on orders over ₹500.</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ACTIVE,
    startsAt: new Date("2026-04-29T00:00:00Z"),
    endsAt: new Date("2026-05-05T23:59:59Z"),
    coverImageUrl: "https://picsum.photos/seed/golden-week-anime/1200/400",
    offerConfig: {
      couponId: "coupon-GOLDENWEEK10",
      displayCode: "GOLDENWEEK10",
      bannerText:
        "⛩️ Golden Week Special — Use GOLDENWEEK10 for 10% off figures & pre-orders!",
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

  // 9. Active Poll — Favourite Anime Figure Manufacturer
  {
    id: "event-best-anime-figures-brand-poll-2026-poll",
    type: EVENT_FIELDS.TYPE_VALUES.POLL,
    title: "Who Makes the Best Anime Figures? Cast Your Vote!",
    description:
      "<p>Which figure manufacturer do you trust most? Cast your vote and see live results — everyone can see the tally as it updates in real time!</p>",
    status: EVENT_FIELDS.STATUS_VALUES.ACTIVE,
    startsAt: new Date("2026-03-01T00:00:00Z"),
    endsAt: new Date("2026-04-30T23:59:59Z"),
    coverImageUrl:
      "https://picsum.photos/seed/figure-manufacturer-poll/1200/400",
    pollConfig: {
      allowMultiSelect: false,
      allowComment: false,
      options: [
        { id: "opt-gsc", label: "Good Smile Company" },
        { id: "opt-alter", label: "Alter" },
        { id: "opt-kotobukiya", label: "Kotobukiya" },
        { id: "opt-megahouse", label: "MegaHouse" },
        { id: "opt-bandai", label: "Bandai / S.H.Figuarts" },
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
            "Scale Figures",
            "Nendoroids & Chibis",
            "Gunpla & Model Kits",
            "Cosplay & Apparel",
            "TCG & Trading Cards",
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
  // Poll votes — anime franchise poll
  {
    id: "entry-poll-franchise-john-one-piece",
    eventId: "event-anime-franchise-poll-2026-poll",
    userId: "user-john-doe-johndoe",
    userDisplayName: "John Doe",
    userEmail: "john@letitrip.in",
    pollVotes: ["opt-one-piece"],
    pollComment:
      "One Piece has so many incredible figures and the Going Merry model is stunning!",
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-02-16T10:12:00Z"),
  },
  {
    id: "entry-poll-franchise-jane-demon-slayer",
    eventId: "event-anime-franchise-poll-2026-poll",
    userId: "user-jane-smith-janes",
    userDisplayName: "Jane Smith",
    userEmail: "jane@letitrip.in",
    pollVotes: ["opt-demon-slayer"],
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-02-17T14:30:00Z"),
  },
  {
    id: "entry-poll-franchise-mike-jjk",
    eventId: "event-anime-franchise-poll-2026-poll",
    userId: "user-mike-johnson-mikejohn",
    userDisplayName: "Mike Johnson",
    userEmail: "mike@letitrip.in",
    pollVotes: ["opt-jjk"],
    pollComment:
      "JJK figures have the best sculpts right now — Sukuna and Gojo both look incredible.",
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

  // Figure Manufacturer Poll votes — event-best-anime-figures-brand-poll-2026-poll (#9)
  {
    id: "entry-poll-brand-john-gsc",
    eventId: "event-best-anime-figures-brand-poll-2026-poll",
    userId: "user-john-doe-johndoe",
    userDisplayName: "John Doe",
    userEmail: "john@letitrip.in",
    pollVotes: ["opt-gsc"],
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-03-02T10:00:00Z"),
  },
  {
    id: "entry-poll-brand-jane-alter",
    eventId: "event-best-anime-figures-brand-poll-2026-poll",
    userId: "user-jane-smith-janes",
    userDisplayName: "Jane Smith",
    userEmail: "jane@letitrip.in",
    pollVotes: ["opt-alter"],
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-03-03T14:22:00Z"),
  },
  {
    id: "entry-poll-brand-mike-kotobukiya",
    eventId: "event-best-anime-figures-brand-poll-2026-poll",
    userId: "user-mike-johnson-mikejohn",
    userDisplayName: "Mike Johnson",
    userEmail: "mike@letitrip.in",
    pollVotes: ["opt-kotobukiya"],
    reviewStatus: EVENT_ENTRY_FIELDS.REVIEW_STATUS_VALUES.APPROVED,
    submittedAt: new Date("2026-03-04T09:10:00Z"),
  },
  {
    id: "entry-poll-brand-animecraft-bandai",
    eventId: "event-best-anime-figures-brand-poll-2026-poll",
    userId: "user-fashion-boutique-fashionb",
    userDisplayName: "AnimeCraft Apparel",
    userEmail: "fashionb@letitrip.in",
    pollVotes: ["opt-bandai"],
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
      "sq-category": "Scale Figures",
      "sq-features": ["Wishlist", "Product Reviews", "Deals & Events"],
      "sq-suggestion":
        "A 'coming soon' pre-order tracker with email alerts for new Alter and GSC announcements would be amazing.",
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
      "sq-category": "Cosplay & Apparel",
      "sq-features": ["Wishlist", "Price Alerts"],
      "sq-suggestion":
        "A size guide comparison tool for cosplay items across different sellers would be incredibly helpful.",
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
