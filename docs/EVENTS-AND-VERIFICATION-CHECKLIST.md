# Events & User Verification Implementation Checklist

> **Created**: December 3, 2025
> **Status**: Planning Phase
> **Priority**: HIGH - Required before enabling purchases/bidding

---

## Table of Contents

1. [Priority 1: User Verification System](#priority-1-user-verification-system)
2. [Priority 2: IP Tracking & Security](#priority-2-ip-tracking--security)
3. [Priority 3: Events Management System](#priority-3-events-management-system)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Implementation Order](#implementation-order)

---

## Priority 1: User Verification System

### 1.1 Email Verification

- [ ] **Email OTP Service**

  - [ ] Create `src/services/otp.service.ts`
  - [ ] Generate 6-digit OTP with 10-minute expiry
  - [ ] Store OTP in Firestore with `otp_verifications` collection
  - [ ] Rate limiting: max 3 OTP requests per hour per email

- [ ] **Email Verification API**

  - [ ] `POST /api/auth/verify-email/send` - Send OTP to email
  - [ ] `POST /api/auth/verify-email/verify` - Verify OTP code
  - [ ] `GET /api/auth/verify-email/status` - Check verification status

- [ ] **Email Templates**

  - [ ] Create OTP email template in `src/lib/email/templates/otp-verification.ts`
  - [ ] Include branding, OTP code, expiry time

- [ ] **UI Components**
  - [ ] `src/components/auth/EmailVerificationModal.tsx`
  - [ ] `src/components/auth/OTPInput.tsx` (6-digit input with auto-focus)
  - [ ] Resend OTP button with countdown timer

### 1.2 Phone Verification

- [ ] **SMS OTP Service**

  - [ ] Integrate with SMS provider (MSG91/Twilio for India)
  - [ ] Create `src/services/sms.service.ts`
  - [ ] Generate 6-digit OTP with 5-minute expiry
  - [ ] Rate limiting: max 3 OTP requests per hour per phone

- [ ] **Phone Verification API**

  - [ ] `POST /api/auth/verify-phone/send` - Send OTP via SMS
  - [ ] `POST /api/auth/verify-phone/verify` - Verify OTP code
  - [ ] `GET /api/auth/verify-phone/status` - Check verification status

- [ ] **UI Components**
  - [ ] `src/components/auth/PhoneVerificationModal.tsx`
  - [ ] Phone number input with country code (India +91 default)
  - [ ] OTP input with auto-submit

### 1.3 Verification Enforcement

- [ ] **Middleware/Guards**

  - [ ] Create `src/hooks/useVerificationCheck.ts`
  - [ ] Create `src/components/auth/VerificationGate.tsx`
  - [ ] Block checkout if not verified
  - [ ] Block bidding if not verified
  - [ ] Block placing orders if not verified

- [ ] **User Profile Updates**
  - [ ] Add verification status badges in profile
  - [ ] Add verification prompts in header/navigation
  - [ ] Show verification reminder on dashboard

### 1.4 Database Updates

- [ ] **OTP Verifications Collection**

  ```typescript
  interface OTPVerification {
    id: string;
    userId: string;
    type: "email" | "phone";
    target: string; // email or phone number
    code: string; // hashed OTP
    attempts: number;
    maxAttempts: number; // default 3
    expiresAt: Timestamp;
    verifiedAt: Timestamp | null;
    createdAt: Timestamp;
    ipAddress: string;
  }
  ```

- [ ] **User Document Updates**
  - [ ] Ensure `emailVerified: boolean` field exists
  - [ ] Ensure `phoneVerified: boolean` field exists
  - [ ] Add `emailVerifiedAt: Timestamp | null`
  - [ ] Add `phoneVerifiedAt: Timestamp | null`
  - [ ] Add `verificationReminderSentAt: Timestamp | null`

---

## Priority 2: IP Tracking & Security

### 2.1 IP Address Tracking

- [ ] **IP Capture Middleware**

  - [ ] Create `src/app/api/middleware/ip-tracker.ts`
  - [ ] Capture IP from headers (`x-forwarded-for`, `x-real-ip`)
  - [ ] Handle Vercel/Cloudflare proxies

- [ ] **User Activity Logging**

  - [ ] Create `user_activities` collection
  - [ ] Log IP on: login, registration, verification, orders, bids
  - [ ] Store user agent and device info

- [ ] **Database Schema**
  ```typescript
  interface UserActivity {
    id: string;
    userId: string;
    action:
      | "login"
      | "register"
      | "verify_email"
      | "verify_phone"
      | "place_order"
      | "place_bid"
      | "event_vote"
      | "event_register";
    ipAddress: string;
    userAgent: string;
    deviceType: "mobile" | "tablet" | "desktop";
    location?: {
      country: string;
      state: string;
      city: string;
    };
    metadata?: Record<string, any>;
    createdAt: Timestamp;
  }
  ```

### 2.2 Security Measures

- [ ] **Rate Limiting**

  - [ ] Max 5 login attempts per IP per 15 minutes
  - [ ] Max 3 OTP requests per user per hour
  - [ ] Max 10 bids per auction per user per hour

- [ ] **Fraud Detection**
  - [ ] Flag multiple accounts from same IP
  - [ ] Alert on suspicious voting patterns
  - [ ] Block known VPN/proxy IPs (optional)

---

## Priority 3: Events Management System

### 3.1 Event Types

| Type         | Description              | Features                              |
| ------------ | ------------------------ | ------------------------------------- |
| `giveaway`   | Free item giveaway       | Random winner selection, registration |
| `draw`       | Lucky draw/raffle        | Ticket-based, multiple prizes         |
| `contest`    | Competition with judging | Submissions, voting, winners          |
| `poll`       | Voting/survey            | Options, vote counting, results       |
| `tournament` | Multi-stage competition  | Brackets, rounds, leaderboard         |

### 3.2 Database Schema

- [ ] **Events Collection** (`events`)

  ```typescript
  interface Event {
    id: string;
    slug: string;
    title: string;
    description: string; // Rich text HTML
    shortDescription: string;
    type: "giveaway" | "draw" | "contest" | "poll" | "tournament";
    status: "draft" | "scheduled" | "live" | "voting" | "ended" | "cancelled";

    // Media
    bannerImage: string;
    thumbnailImage: string;
    gallery: string[];

    // Timing
    startDate: Timestamp;
    endDate: Timestamp;
    votingStartDate?: Timestamp;
    votingEndDate?: Timestamp;
    resultsDate?: Timestamp;

    // Configuration
    maxParticipants?: number;
    requiresVerification: boolean; // email + phone verified
    requiresRegistration: boolean;
    allowMultipleEntries: boolean;
    entriesPerUser: number;

    // Google Forms Integration
    googleFormId?: string;
    googleFormUrl?: string;
    googleSheetId?: string; // For results

    // Prizes
    prizes: EventPrize[];

    // Eligibility
    eligibility: {
      minAge?: number;
      countries: string[]; // Empty = all
      userTypes: ("all" | "verified" | "seller" | "buyer")[];
      minOrders?: number;
      minSpent?: number;
    };

    // Stats
    totalRegistrations: number;
    totalVotes: number;
    totalViews: number;

    // Metadata
    createdBy: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    publishedAt?: Timestamp;
  }

  interface EventPrize {
    id: string;
    position: number; // 1st, 2nd, 3rd
    title: string;
    description: string;
    value: number;
    image?: string;
    winnerId?: string;
    winnerName?: string;
    winnerAvatar?: string;
  }
  ```

- [ ] **Event Registrations Collection** (`event_registrations`)

  ```typescript
  interface EventRegistration {
    id: string;
    eventId: string;
    userId: string;
    userEmail: string;
    userPhone: string;
    userName: string;
    userAvatar?: string;

    // Verification at time of registration
    emailVerified: boolean;
    phoneVerified: boolean;

    // Entry data
    entryNumber: number; // For draws
    submissionUrl?: string; // For contests
    submissionData?: Record<string, any>;

    // Google Form data
    googleFormResponseId?: string;
    formResponses?: Record<string, any>;

    // Tracking
    ipAddress: string;
    userAgent: string;

    // Status
    status: "pending" | "approved" | "rejected" | "winner" | "disqualified";

    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  ```

- [ ] **Event Votes Collection** (`event_votes`)

  ```typescript
  interface EventVote {
    id: string;
    eventId: string;
    optionId: string; // For polls, or registrationId for contests
    userId: string;

    // Verification
    emailVerified: boolean;
    phoneVerified: boolean;
    ipAddress: string;

    // Vote type
    type: "vote" | "like" | "rating";
    value?: number; // For ratings (1-5)

    createdAt: Timestamp;
  }
  ```

- [ ] **Event Options Collection** (`event_options`) - For polls
  ```typescript
  interface EventOption {
    id: string;
    eventId: string;
    title: string;
    description?: string;
    image?: string;
    order: number;
    voteCount: number;
    createdAt: Timestamp;
  }
  ```

### 3.3 Admin Event Management

- [ ] **Admin Event Pages**

  - [ ] `src/app/admin/events/page.tsx` - List all events
  - [ ] `src/app/admin/events/create/page.tsx` - Create wizard
  - [ ] `src/app/admin/events/[id]/page.tsx` - View/Edit event
  - [ ] `src/app/admin/events/[id]/registrations/page.tsx` - Manage registrations
  - [ ] `src/app/admin/events/[id]/results/page.tsx` - Manage results/winners

- [ ] **Event Form Components**
  - [ ] `src/components/admin/events/EventForm.tsx` - Main form
  - [ ] `src/components/admin/events/EventTypeSelector.tsx`
  - [ ] `src/components/admin/events/PrizeManager.tsx`
  - [ ] `src/components/admin/events/EligibilitySettings.tsx`
  - [ ] `src/components/admin/events/GoogleFormsIntegration.tsx`
  - [ ] `src/components/admin/events/WinnerSelector.tsx`

### 3.4 Public Event Pages

- [ ] **Event Pages**

  - [ ] `src/app/events/page.tsx` - List current & past events
  - [ ] `src/app/events/[slug]/page.tsx` - Event detail page
  - [ ] `src/app/events/[slug]/register/page.tsx` - Registration page
  - [ ] `src/app/events/[slug]/vote/page.tsx` - Voting page
  - [ ] `src/app/events/[slug]/results/page.tsx` - Results page

- [ ] **Event Components**
  - [ ] `src/components/events/EventCard.tsx` - Card for listings
  - [ ] `src/components/events/EventBanner.tsx` - Hero banner
  - [ ] `src/components/events/EventCountdown.tsx` - Timer
  - [ ] `src/components/events/EventRegistrationForm.tsx`
  - [ ] `src/components/events/PollVoting.tsx` - Poll voting UI
  - [ ] `src/components/events/ContestGallery.tsx` - Contest submissions
  - [ ] `src/components/events/WinnersSection.tsx` - Winners display
  - [ ] `src/components/events/EventResultsChart.tsx` - Results visualization
  - [ ] `src/components/events/PrizeShowcase.tsx` - Prize display

### 3.5 API Endpoints

- [ ] **Admin APIs**

  - [ ] `GET /api/admin/events` - List events (with filters)
  - [ ] `POST /api/admin/events` - Create event
  - [ ] `GET /api/admin/events/[id]` - Get event details
  - [ ] `PATCH /api/admin/events/[id]` - Update event
  - [ ] `DELETE /api/admin/events/[id]` - Delete event
  - [ ] `POST /api/admin/events/[id]/publish` - Publish event
  - [ ] `POST /api/admin/events/[id]/end` - End event early
  - [ ] `GET /api/admin/events/[id]/registrations` - List registrations
  - [ ] `PATCH /api/admin/events/[id]/registrations/[regId]` - Update registration
  - [ ] `POST /api/admin/events/[id]/select-winners` - Select winners (random/manual)
  - [ ] `POST /api/admin/events/[id]/import-results` - Import from Google Sheets

- [ ] **Public APIs**
  - [ ] `GET /api/events` - List live & upcoming events
  - [ ] `GET /api/events/[slug]` - Get event details
  - [ ] `POST /api/events/[slug]/register` - Register for event
  - [ ] `GET /api/events/[slug]/my-registration` - Get user's registration
  - [ ] `POST /api/events/[slug]/vote` - Cast vote
  - [ ] `GET /api/events/[slug]/results` - Get results (if published)
  - [ ] `GET /api/events/[slug]/winners` - Get winners

### 3.6 Google Forms Integration

- [ ] **Form Response Sync**

  - [ ] Service to fetch Google Form responses via API
  - [ ] Map form responses to event registrations
  - [ ] Scheduled sync job for continuous imports
  - [ ] Manual import trigger for admins

- [ ] **Google Sheets Results Import**
  - [ ] Parse Excel/CSV uploads
  - [ ] Map columns to vote/rating fields
  - [ ] Validate user emails match registrations

### 3.7 Business Rules

- [ ] **Max 2 Live Events**

  - [ ] Enforce in create/publish API
  - [ ] Show warning when limit reached
  - [ ] Allow scheduling future events

- [ ] **Verification Requirements**

  - [ ] Block unverified users from registering
  - [ ] Block unverified users from voting
  - [ ] Show verification prompt before actions

- [ ] **IP-Based Fraud Prevention**
  - [ ] One vote per IP per event (configurable)
  - [ ] Flag multiple registrations from same IP
  - [ ] Admin review for suspicious activity

---

## Database Schema Summary

### New Collections to Add to `database.ts`

```typescript
// Add to COLLECTIONS
EVENTS: "events",
EVENT_REGISTRATIONS: "event_registrations",
EVENT_VOTES: "event_votes",
EVENT_OPTIONS: "event_options",
OTP_VERIFICATIONS: "otp_verifications",
USER_ACTIVITIES: "user_activities",
```

---

## API Endpoints Summary

### Verification APIs

| Method | Endpoint                        | Description      |
| ------ | ------------------------------- | ---------------- |
| POST   | `/api/auth/verify-email/send`   | Send email OTP   |
| POST   | `/api/auth/verify-email/verify` | Verify email OTP |
| POST   | `/api/auth/verify-phone/send`   | Send phone OTP   |
| POST   | `/api/auth/verify-phone/verify` | Verify phone OTP |

### Event APIs (Admin)

| Method | Endpoint                                | Description     |
| ------ | --------------------------------------- | --------------- |
| GET    | `/api/admin/events`                     | List all events |
| POST   | `/api/admin/events`                     | Create event    |
| GET    | `/api/admin/events/[id]`                | Get event       |
| PATCH  | `/api/admin/events/[id]`                | Update event    |
| DELETE | `/api/admin/events/[id]`                | Delete event    |
| POST   | `/api/admin/events/[id]/publish`        | Publish event   |
| POST   | `/api/admin/events/[id]/select-winners` | Select winners  |

### Event APIs (Public)

| Method | Endpoint                      | Description        |
| ------ | ----------------------------- | ------------------ |
| GET    | `/api/events`                 | List live events   |
| GET    | `/api/events/[slug]`          | Get event details  |
| POST   | `/api/events/[slug]/register` | Register for event |
| POST   | `/api/events/[slug]/vote`     | Cast vote          |
| GET    | `/api/events/[slug]/results`  | Get results        |

---

## Implementation Order

### Week 1: User Verification

1. [ ] Email OTP service & API
2. [ ] Phone OTP service & API (with SMS provider)
3. [ ] Verification UI components
4. [ ] Verification enforcement in checkout/bidding

### Week 2: IP Tracking & Security

1. [ ] IP capture middleware
2. [ ] User activity logging
3. [ ] Rate limiting implementation
4. [ ] Security alerts setup

### Week 3: Events Core

1. [ ] Database schema & collections
2. [ ] Admin event CRUD APIs
3. [ ] Admin event management pages
4. [ ] Event form with rich text editor

### Week 4: Events Public & Features

1. [ ] Public event pages
2. [ ] Registration & voting flows
3. [ ] Google Forms integration
4. [ ] Winners section & results display

### Week 5: Polish & Testing

1. [ ] Mobile responsiveness
2. [ ] Dark mode support
3. [ ] E2E testing
4. [ ] Performance optimization

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── verify-email/
│   │   │   │   ├── send/route.ts
│   │   │   │   └── verify/route.ts
│   │   │   └── verify-phone/
│   │   │       ├── send/route.ts
│   │   │       └── verify/route.ts
│   │   ├── admin/
│   │   │   └── events/
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           ├── route.ts
│   │   │           ├── publish/route.ts
│   │   │           ├── registrations/route.ts
│   │   │           └── select-winners/route.ts
│   │   └── events/
│   │       ├── route.ts
│   │       └── [slug]/
│   │           ├── route.ts
│   │           ├── register/route.ts
│   │           ├── vote/route.ts
│   │           └── results/route.ts
│   ├── admin/
│   │   └── events/
│   │       ├── page.tsx
│   │       ├── create/page.tsx
│   │       └── [id]/
│   │           ├── page.tsx
│   │           ├── registrations/page.tsx
│   │           └── results/page.tsx
│   └── events/
│       ├── page.tsx
│       └── [slug]/
│           ├── page.tsx
│           ├── register/page.tsx
│           ├── vote/page.tsx
│           └── results/page.tsx
├── components/
│   ├── auth/
│   │   ├── EmailVerificationModal.tsx
│   │   ├── PhoneVerificationModal.tsx
│   │   ├── OTPInput.tsx
│   │   └── VerificationGate.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventBanner.tsx
│   │   ├── EventCountdown.tsx
│   │   ├── EventRegistrationForm.tsx
│   │   ├── PollVoting.tsx
│   │   ├── ContestGallery.tsx
│   │   ├── WinnersSection.tsx
│   │   ├── EventResultsChart.tsx
│   │   └── PrizeShowcase.tsx
│   └── admin/
│       └── events/
│           ├── EventForm.tsx
│           ├── EventTypeSelector.tsx
│           ├── PrizeManager.tsx
│           ├── EligibilitySettings.tsx
│           ├── GoogleFormsIntegration.tsx
│           └── WinnerSelector.tsx
├── services/
│   ├── otp.service.ts
│   ├── sms.service.ts
│   ├── events.service.ts
│   └── ip-tracker.service.ts
├── hooks/
│   ├── useVerificationCheck.ts
│   └── useEventRegistration.ts
└── types/
    ├── backend/
    │   └── event.types.ts
    └── frontend/
        └── event.types.ts
```

---

## Dependencies to Add

```json
{
  "dependencies": {
    "otplib": "^12.0.1", // OTP generation
    "twilio": "^4.x.x", // SMS provider (or MSG91 for India)
    "googleapis": "^126.0.1" // Google Forms/Sheets integration
  }
}
```

---

## Environment Variables

```env
# SMS Provider (Twilio example)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# Or MSG91 for India
MSG91_AUTH_KEY=xxx
MSG91_SENDER_ID=xxx
MSG91_TEMPLATE_ID=xxx

# Google APIs
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx
GOOGLE_PRIVATE_KEY=xxx
```

---

_Checklist Created: December 3, 2025_
_Last Updated: December 3, 2025_
