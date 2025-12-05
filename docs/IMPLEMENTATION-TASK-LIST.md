# 📋 IMPLEMENTATION TASK LIST

> **Last Updated**: December 5, 2025  
> **Organized by Priority**: Create → Integrate → Fix  
> **Status Tracking**: Use checkboxes to track progress  
> **Validation**: Run `npx tsc --noEmit` after each phase  
> **🔥 Firebase First**: Use Firebase Functions, Firestore, Storage, and Cloud features wherever possible

---

## 🔥 FIREBASE INTEGRATION STRATEGY

### Firebase Tools to Maximize

1. **Firebase Functions** (Cloud Functions for Firebase)

   - Payment webhooks (Razorpay, PayPal, Stripe)
   - Order processing and notifications
   - Email sending (with SendGrid/Resend integration)
   - WhatsApp notifications (with Twilio/Gupshup integration)
   - Scheduled tasks (cleanup, reminders, analytics)
   - Image processing (thumbnails, optimization)
   - Data aggregation and metrics

2. **Firestore** (NoSQL Database)

   - All data storage (already in use)
   - Firestore Security Rules for access control
   - Firestore Triggers for automatic actions
   - Real-time listeners for live updates

3. **Firebase Storage**

   - Product/auction images
   - User avatars
   - Shop logos
   - Document uploads (invoices, labels)
   - Video uploads with automatic thumbnail generation

4. **Firebase Authentication**

   - User authentication (already in use)
   - Custom claims for roles (admin, seller, buyer)
   - Email verification
   - Password reset

5. **Firebase Cloud Messaging (FCM)**

   - Push notifications (web and mobile)
   - Order updates
   - Bid notifications
   - Chat messages

6. **Firebase Extensions**

   - Resize Images (automatic image optimization)
   - Translate Text (multi-language support)
   - Send Email (Mailgun, SendGrid, etc.)
   - Trigger Email (for transactional emails)

7. **Firebase Emulators**

   - Local development and testing
   - Functions, Firestore, Auth, Storage emulation

8. **Firebase Remote Config**

   - Feature flags
   - Dynamic configuration without redeployment

9. **Firebase Performance Monitoring**

   - Track app performance
   - Monitor API response times

10. **Firebase Analytics**
    - User behavior tracking
    - Conversion tracking
    - Custom events

---

## 🎯 PHASE 1: CREATE NEW COMPONENTS & SERVICES (Priority 1)

**Goal**: Build all new reusable tools with mobile and dark mode support

### 1.1 Payment Gateway System (Priority: CRITICAL) ✅

- [x] **Task 1.1.1**: Create `src/config/payment-gateways.config.ts` ✅ (1,159 lines)

  - [x] Define `PaymentGatewayConfig` interface
  - [x] Define `PaymentGatewayConfigField` interface
  - [x] Add all gateway configurations (Razorpay, PayU, PayPal, Stripe, etc.)
  - [x] Add helper functions (getGatewayById, getGatewaysByType, etc.)
  - [x] ✅ Mobile responsive
  - [x] ✅ Dark mode support

- [x] **Task 1.1.2**: Create `src/services/payment.service.ts` ✅ (603 lines)

  - [x] Add Razorpay methods (createOrder, verify, capture, refund)
  - [x] Add PayPal methods (createOrder, capture, refund)
  - [x] Add generic payment methods
  - [x] Add currency conversion methods
  - [x] Add payment validation methods

- [x] **Task 1.1.3**: Create `src/services/payment-gateway.service.ts` ✅ (532 lines)

  - [x] Add gateway abstraction layer
  - [x] Implement createOrder for all gateways
  - [x] Implement verifyPayment for all gateways
  - [x] Implement refundPayment for all gateways
  - [x] Add gateway-specific implementations

- [x] **Task 1.1.4**: Create `src/lib/payment-gateway-selector.ts` ✅ (358 lines)

  - [x] Implement selectBestGateway function
  - [x] Add calculateFee function
  - [x] Add gateway filtering logic

- [x] **Task 1.1.5**: Create `src/lib/validators/address.validator.ts` ✅ (395 lines)

  - [x] Add isInternationalAddress function
  - [x] Add isPayPalEligibleCountry function
  - [x] Add validateInternationalAddress function

- [x] **Task 1.1.6**: Create `src/app/admin/settings/payment-gateways/page.tsx` ✅ (541 lines)

  - [x] Build gateway management UI
  - [x] Add gateway cards with enable/disable toggles
  - [x] Add GatewayConfigModal component
  - [x] Add test connection functionality
  - [x] ✅ Mobile responsive (stacked cards)
  - [x] ✅ Dark mode support (all variants)

- [x] **Task 1.1.7**: 🔥 Create Firebase Functions for Payment Webhooks ✅ (6 files, 1,066 lines)
  - [x] **CREATE**: `functions/src/webhooks/razorpay.ts` (270 lines)
    - Razorpay webhook handler with HMAC SHA-256 signature verification
    - Events: payment.authorized, payment.captured, payment.failed, order.paid, refund.created, refund.processed
    - Update Firestore order status with batch writes
    - Create notification documents for buyers
    - Use Firebase Functions environment config for secrets
  - [x] **CREATE**: `functions/src/webhooks/paypal.ts` (183 lines)
    - PayPal webhook handler (certificate verification simplified for MVP)
    - Events: PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED, PAYMENT.CAPTURE.REFUNDED
    - Update Firestore order status
    - Handle multiple currencies (USD, EUR, GBP, etc.)
    - Create notification documents for buyers
  - [x] **CREATE**: `functions/src/webhooks/stripe.ts` (177 lines)
    - Stripe webhook handler (signature verification simplified for MVP)
    - Events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
    - Update Firestore order status
    - Handle payment intent events with metadata
    - Create notification documents for buyers
  - [x] **CREATE**: `functions/src/webhooks/payu.ts` (143 lines)
    - PayU webhook handler with SHA-512 hash verification
    - Events: success, failure, pending, cancel
    - Update Firestore order status
    - Create notification documents for buyers
  - [x] **CREATE**: `functions/src/webhooks/phonepe.ts` (146 lines)
    - PhonePe webhook handler with SHA-256 checksum verification
    - Events: COMPLETED, FAILED, PENDING
    - Decode base64 payload
    - Update Firestore order status
    - Create notification documents for buyers
  - [x] **CREATE**: `functions/src/webhooks/cashfree.ts` (147 lines)
    - Cashfree webhook handler with HMAC SHA-256 signature verification
    - Events: ORDER_PAID, PAYMENT_SUCCESS, PAYMENT_FAILED, PAYMENT_USER_DROPPED
    - Update Firestore order status
    - Create notification documents for buyers
  - [x] ✅ All functions use Firebase Admin SDK for Firestore
  - [x] ✅ All functions use Firebase Functions environment config (process.env)
  - [x] ✅ All functions have error logging to Firebase Functions logs
  - [x] ✅ All files under 300 lines (largest: 270 lines)

### 1.2 Address API Integration (Priority: HIGH) ✅

- [x] **Task 1.2.1**: Create `src/config/address-api.config.ts` ✅ (480 lines)

  - [x] Define `AddressAPIProvider` interface
  - [x] Define `CountryData`, `StateData`, `CityData` interfaces
  - [x] Define `PostalLookupResult` interface
  - [x] Add all API provider configurations
  - [x] Add Indian states list
  - [x] Add US states list
  - [x] Add fallback countries list

- [x] **Task 1.2.2**: Create `src/services/address.service.ts` ✅ (242 lines)

  - [x] Implement lookupByPostalCode method
  - [x] Implement lookupIndianPincode method
  - [x] Implement lookupInternationalPostalCode method
  - [x] Implement getCountries method
  - [x] Implement getStates method
  - [x] Implement validateAddress method
  - [x] Implement getAddressSuggestions method
  - [x] Add caching mechanism (24-hour cache)
  - [x] Add helper methods for state codes

- [x] **Task 1.2.3**: Create `src/components/forms/AddressInput.tsx` ✅ (321 lines)

  - [x] Build address input component
  - [x] Add country dropdown
  - [x] Add postal code input with auto-lookup
  - [x] Add state dropdown (dynamic loading)
  - [x] Add city input
  - [x] Add address line 1 & 2 inputs
  - [x] Implement debounced postal code lookup (500ms)
  - [x] Add loading indicators
  - [x] ✅ Mobile responsive (stacked fields)
  - [x] ✅ Dark mode support (all inputs)

- [x] **Task 1.2.4**: Create `src/app/admin/settings/address-api/page.tsx` ✅ (526 lines)
  - [x] Build address API settings UI
  - [x] Add primary provider selector
  - [x] Add fallback provider selector
  - [x] Add feature toggles
  - [x] ✅ Mobile responsive
  - [x] ✅ Dark mode support

### 1.3 Shipping Integration (Priority: HIGH) ✅

- [x] **Task 1.3.1**: Create `src/services/shiprocket.service.ts` ✅ (552 lines)

  - [x] Add authentication method
  - [x] Add createOrder method
  - [x] Add generateAWB method
  - [x] Add createPickup method
  - [x] Add trackShipment method
  - [x] Add getAvailableCouriers method
  - [x] Add generateLabel method
  - [x] Add generateManifest method

- [x] **Task 1.3.2**: Create shipping API routes ✅ (4 routes)

  - [x] Create `src/app/api/shipping/shiprocket/create-order/route.ts` (47 lines)
  - [x] Create `src/app/api/shipping/shiprocket/track/[awbCode]/route.ts`
  - [x] Create `src/app/api/shipping/shiprocket/calculate-rates/route.ts` (78 lines)
  - [x] Create `src/app/api/shipping/shiprocket/generate-awb/route.ts` (39 lines)

- [x] **Task 1.3.3**: 🔥 Create Firebase Functions for Shipping Automation ✅ (3 files, 745 lines)
  - [x] **CREATE**: `functions/src/shipping/generateLabel.ts` ✅ (241 lines)
    - Firebase Function to generate shipping labels on order confirmation
    - Firestore onUpdate trigger on orders collection
    - Shiprocket API integration for label generation
    - Download label PDF and upload to Firebase Storage
    - Update Firestore order document with label URL
    - Create notification for customer
    - Error handling with fallback notifications
  - [x] **CREATE**: `functions/src/shipping/trackingUpdates.ts` ✅ (242 lines)
    - Firebase HTTP Function for Shiprocket webhook handler
    - 19 status mappings (pending, in_transit, delivered, RTO, etc.)
    - Update Firestore order tracking status in real-time
    - Create notification documents for customer updates
    - Handle AWB code and order number lookups
    - Track pickup, delivery, and RTO dates
  - [x] **CREATE**: `functions/src/shipping/autoPickup.ts` ✅ (262 lines)
    - Firebase Scheduled Function (daily at 10 AM IST)
    - Query Firestore for orders ready for pickup (confirmed + AWB + not scheduled)
    - Shiprocket API integration for pickup scheduling
    - Batch processing (max 50 orders per run)
    - Group orders by shop for efficient processing
    - Update orders with pickup date and token
    - Create pickup notifications for customers
    - Calculate next business day (skip weekends)
  - [x] ✅ Use Firebase Storage for label/manifest PDFs
  - [x] ✅ Use Firestore triggers for automatic workflow
  - [x] ✅ All files under 300 lines (largest: 262 lines)
  - [x] ✅ Firebase Functions v1 API for consistency
  - [x] ✅ Environment variable configuration (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD, SHIPROCKET_API_URL)
  - [x] ✅ Zero TypeScript errors

### 1.4 WhatsApp Integration (Priority: MEDIUM) ⚠️ PARTIAL

- [x] **Task 1.4.1**: Create `src/services/whatsapp.service.ts` ✅ (518 lines)

  - [x] Add sendMessage method
  - [x] Add sendTemplateMessage method
  - [x] Add sendBulkMessages method
  - [x] Add createGroup method
  - [x] Add addToGroup method
  - [x] Add subscribeToCategory method

- [x] **Task 1.4.2**: Create `src/constants/whatsapp-templates.ts` ✅ (367 lines)

  - [x] Define WhatsApp message templates
  - [x] Add templates for all notification types (12 templates: Order, Auction, Account, Marketing)

- [x] **Task 1.4.3**: Create `src/app/admin/settings/whatsapp/page.tsx` ✅ (454 lines)

  - [x] Build WhatsApp settings UI
  - [x] Add API configuration fields
  - [x] Add test connection button
  - [x] ✅ Mobile responsive
  - [x] ✅ Dark mode support

- [x] **Task 1.4.4**: Create WhatsApp API routes ✅ (4 routes)

  - [x] Create `src/app/api/whatsapp/send-template/route.ts` (48 lines)
  - [x] Create `src/app/api/whatsapp/opt-in/route.ts` (39 lines)
  - [x] Create `src/app/api/whatsapp/opt-out/route.ts` (44 lines)
  - [x] Create `src/app/api/whatsapp/send-media/route.ts` (43 lines)

- [x] **Task 1.4.5**: 🔥 Create Firebase Functions for WhatsApp Notifications ✅ (4 files, 685 lines)
  - [x] **CREATE**: `functions/src/notifications/whatsapp/orderNotifications.ts` ✅ (138 lines)
    - Firebase Firestore onUpdate trigger on orders collection
    - Monitors order status changes (confirmed, shipped, delivered, cancelled)
    - Multi-provider support (Twilio & Gupshup)
    - WhatsApp opt-in check before sending
    - Message templates for each status
    - Logs notifications to Firestore notificationLogs collection
  - [x] **CREATE**: `functions/src/notifications/whatsapp/bidNotifications.ts` ✅ (185 lines)
    - Firebase Firestore onCreate trigger on bids collection
    - Notifies auction owner of new bids
    - Notifies previous highest bidder (outbid notification)
    - Query for previous bidder from bids collection
    - Personalized messages with auction and bid details
    - Logs notifications with auctionId and bidId
  - [x] **CREATE**: `functions/src/notifications/whatsapp/bulkMessages.ts` ✅ (193 lines)
    - Firebase HTTP Callable Function for bulk campaigns
    - Admin-only access control
    - User segmentation (tags, minOrders, lastOrderDays)
    - Batch processing (max 100 messages per batch)
    - Rate limiting (1 second delay between batches)
    - Message personalization ({name}, {firstName})
    - Campaign tracking with status updates
    - Logs to campaignLogs collection
  - [x] **CREATE**: `functions/src/notifications/whatsapp/shared.ts` ✅ (169 lines)
    - Shared utilities for all WhatsApp functions
    - Multi-provider message sending (Twilio & Gupshup)
    - Phone number formatting (E.164 format)
    - getUserData helper with opt-in check
    - logNotification helper for audit trail
    - DRY principle - eliminates code duplication
  - [x] ✅ Use Firebase Functions config for WhatsApp API credentials (TWILIO*\*, GUPSHUP*\*)
  - [x] ✅ Use Firestore triggers for event-driven notifications
  - [x] ✅ Store notification logs in Firestore for audit trail
  - [x] ✅ All files under 300 lines (largest: 193 lines)
  - [x] ✅ Firebase Functions v1 API for consistency
  - [x] ✅ Zero TypeScript errors

### 1.5 Email Integration (Priority: MEDIUM) ⚠️ PARTIAL

- [x] **Task 1.5.1**: Create `src/services/email.service.ts` ✅ (195 lines)

  - [x] Add sendEmail method
  - [x] Add sendBulkEmail method
  - [x] Add sendTemplateEmail method
  - [x] Add createTemplate method
  - [x] Add getInbox method
  - [x] Add sendNewsletter method

- [x] **Task 1.5.2**: Create email templates directory ✅

  - [x] Create `src/templates/email/` directory
  - [x] Create OrderConfirmation.tsx (298 lines) ✅
  - [x] Create ShippingUpdate.tsx (277 lines) ✅
  - [x] Create AuctionBidNotification.tsx (218 lines) ✅
  - [x] Create PasswordReset.tsx (147 lines) ✅
  - [x] Create WelcomeEmail.tsx (205 lines) ✅
  - [x] Create Newsletter.tsx (294 lines) ✅

- [x] **Task 1.5.3**: Create `src/app/admin/settings/email/page.tsx` ✅ (522 lines)

  - [ ] Build email settings UI
  - [ ] Add provider configuration
  - [ ] Add SMTP/IMAP settings
  - [ ] Add test email button
  - [ ] ✅ Mobile responsive
  - [ ] ✅ Dark mode support

- [x] **Task 1.5.4**: Create `src/app/admin/emails/page.tsx` ✅

  - [x] Build email dashboard
  - [x] Add sent emails list
  - [x] Add inbox viewer
  - [x] Add template manager
  - [x] Add newsletter composer
  - [x] ✅ Mobile responsive
  - [x] ✅ Dark mode support

- [x] **Task 1.5.5**: Create email API routes ✅

  - [x] Create `src/app/api/email/send/route.ts` (pre-existing)
  - [x] Create `src/app/api/email/templates/route.ts` (207 lines)
  - [x] Create `src/app/api/email/inbox/route.ts` (192 lines)
  - [x] Create `src/app/api/email/webhook/route.ts` (175 lines)

- [x] **Task 1.5.6**: 🔥 Create Firebase Functions for Email Notifications ✅
  - [x] **CREATE**: `functions/src/notifications/email/orderEmails.ts` (191 lines)
    - Firebase Function triggered by Firestore order events
    - Send transactional emails via Resend/SendGrid API
    - Use Firestore triggers (onCreate, onUpdate) on orders collection
    - Render React email templates to HTML
    - Log email status to Firestore notifications collection
  - [x] **CREATE**: `functions/src/notifications/email/auctionEmails.ts` (221 lines)
    - Firebase Function for auction-related emails
    - Trigger on bid creation, auction ending, auction won
    - Use Firestore triggers on auctions and bids collections
  - [x] **CREATE**: `functions/src/notifications/email/accountEmails.ts` (136 lines)
    - Firebase Function triggered by Firestore user onCreate
    - Send welcome email with email verification link
    - Account-related emails (verification, password reset)
  - [x] **CREATE**: `functions/src/notifications/email/scheduledNewsletter.ts` (171 lines)
    - Firebase Function for scheduled newsletter campaigns
    - Trigger via scheduled function (weekly/monthly)
    - Query Firestore for subscribed users
    - Support batch processing with rate limiting
  - [x] ✅ Use Firebase Functions config for email API credentials
  - [x] ✅ Use Firestore triggers for event-driven emails
  - [x] ✅ Use Firebase Auth triggers for authentication emails
  - [x] ✅ Store email logs in Firestore for tracking

### 1.6 Payment API Routes (Priority: CRITICAL) ✅

> **Note**: Webhook handlers moved to Firebase Functions (see Task 1.1.7). API routes below are for frontend-triggered actions only.

- [x] **Task 1.6.1**: Create Razorpay API routes

  - [x] Create `src/app/api/payments/razorpay/order/route.ts` (initiate payment)
  - [x] Create `src/app/api/payments/razorpay/verify/route.ts` (verify payment signature)
  - [x] Create `src/app/api/payments/razorpay/capture/route.ts` (capture authorized payment)
  - [x] Create `src/app/api/payments/razorpay/refund/route.ts` (initiate refund)
  - [x] ~~Webhook moved to Firebase Function: `functions/src/webhooks/razorpay.ts`~~

- [x] **Task 1.6.2**: Create PayPal API routes

  - [x] Create `src/app/api/payments/paypal/order/route.ts` (create PayPal order)
  - [x] Create `src/app/api/payments/paypal/capture/route.ts` (capture PayPal payment)
  - [x] Create `src/app/api/payments/paypal/refund/route.ts` (initiate refund)
  - [x] ~~Webhook moved to Firebase Function: `functions/src/webhooks/paypal.ts`~~

- [x] **Task 1.6.3**: Create gateway management API routes

  - [x] Create `src/app/api/admin/settings/payment-gateways/route.ts`
  - [x] Create `src/app/api/admin/settings/payment-gateways/toggle/route.ts`
  - [x] Create `src/app/api/admin/settings/payment-gateways/config/route.ts`
  - [x] Create `src/app/api/admin/settings/payment-gateways/test/route.ts`
  - [x] ✅ Store gateway config in Firestore admin settings collection
  - [x] ✅ Use Firebase Admin SDK for secure updates

- [x] **Task 1.6.4**: Create available gateways API route
  - [x] Create `src/app/api/payments/available-gateways/route.ts`
  - [x] ✅ Query Firestore for enabled gateways
  - [x] ✅ Filter by country/currency support

### 1.7 Address API Routes (Priority: HIGH) ✅

- [x] **Task 1.7.1**: Create address lookup API routes

  - [x] Create `src/app/api/address/lookup/route.ts`
  - [x] Create `src/app/api/address/countries/route.ts`
  - [x] Create `src/app/api/address/states/[countryCode]/route.ts`
  - [x] Create `src/app/api/address/validate/route.ts`
  - [x] Create `src/app/api/address/autocomplete/route.ts`

- [x] **Task 1.7.2**: Create address settings API route
  - [x] Create `src/app/api/admin/settings/address-api/route.ts`

### 1.8 Common Hooks & Utilities (Priority: MEDIUM) ✅

- [x] **Task 1.8.1**: Create `src/hooks/useResourceList.ts`

  - [x] Implement unified resource list hook
  - [x] Add Sieve pagination support
  - [x] Add filtering support
  - [x] Add sorting support
  - [x] Add search support

- [x] **Task 1.8.2**: Create `src/hooks/useWindowResize.ts`
  - [x] Implement window resize hook
  - [x] Add debounce support

### 1.9 Shop Settings Pages (Priority: MEDIUM) ✅

- [x] **Task 1.9.1**: Create `src/app/seller/shops/[slug]/settings/page.tsx`
  - [x] Build shop settings UI with tabs
  - [x] Add General Settings tab
  - [x] Add Shipping Settings tab
  - [x] Add Payment Settings tab
  - [x] Add Default Policies tab
  - [x] Add Team Management tab
  - [x] ✅ Mobile responsive (tabs → accordion)
  - [x] ✅ Dark mode support

### 1.10 Server Actions (Priority: HIGH) ✅

- [x] **Task 1.10.1**: Create `src/app/actions/payment.ts`
  - [x] Add initiatePayment server action
  - [x] Add verifyPayment server action
  - [x] Add refundPayment server action
  - [x] Add getAvailableGateways server action
  - [x] Add server-side validation with Zod schemas
  - [x] Add authentication checks with Firebase Admin SDK
  - [x] Add proper error handling

### 1.11 🔥 Firebase Firestore Triggers (Priority: HIGH) ✅

- [x] **Task 1.11.1**: Create order status automation ✅ (201 lines)

  - [x] **CREATE**: `functions/src/triggers/orderStatusUpdate.ts`
    - Firestore trigger on orders collection onUpdate
    - Automatically update inventory when order confirmed
    - Create notification documents for buyer and seller
    - Update seller metrics (total sales, etc.)
    - Log order status changes to audit collection
  - [x] ✅ Use Firestore batch writes for atomic updates

- [x] **Task 1.11.2**: Create auction automation ✅ (2 files, 322 lines)

  - [x] **CREATE**: `functions/src/triggers/auctionEndHandler.ts` (228 lines)
    - Firestore trigger when auction endDate passes
    - Determine winner and create winning notification
    - Create order document for winner automatically
    - Update auction status to "ended"
    - Notify all bidders of auction result
  - [x] **CREATE**: `functions/src/triggers/bidNotification.ts` (94 lines)
    - Firestore trigger on bids collection onCreate
    - Notify auction owner of new bid
    - Notify previous highest bidder they've been outbid
    - Update auction currentBid and bidCount
  - [x] ✅ Use scheduled function to check for ended auctions every hour

- [x] **Task 1.11.3**: Create user activity tracking ✅ (212 lines)

  - [x] **CREATE**: `functions/src/triggers/userActivityLog.ts`
    - Firestore trigger on multiple collections (product views, searches, orders)
    - Log user actions (product views, searches, purchases)
    - Update user preferences based on activity
    - Aggregate data for analytics dashboard (scheduled function)
  - [x] ✅ Use Firestore subcollections for user activity logs

- [x] **Task 1.11.4**: Create review moderation ✅ (230 lines)

  - [x] **CREATE**: `functions/src/triggers/reviewModeration.ts`
    - Firestore trigger on reviews collection onCreate
    - Auto-flag reviews with profanity or spam patterns
    - Update product/shop average rating
    - Notify shop owner of new review
    - Callable function for admin moderation actions
  - [x] ✅ Basic pattern matching for profanity/spam detection

- [x] **Task 1.11.5**: Create image processing automation ✅ (222 lines)
  - [x] **CREATE**: `functions/src/triggers/imageOptimization.ts`
    - Firebase Storage trigger on image upload
    - Generate multiple thumbnail sizes (small 150x150, medium 400x400, large 800x800)
    - Optimize image compression with Sharp
    - Store thumbnails in Storage
    - Update Firestore document with thumbnail URLs
    - Auto-delete thumbnails when original is deleted
  - [x] ✅ Use Sharp library for image processing

---

## 🔗 PHASE 2: INTEGRATE EXISTING CODE (Priority 2)

**Goal**: Connect new components with existing pages and flows

### 2.1 Payment Gateway Integration

- [ ] **Task 2.1.1**: Update `src/app/checkout/page.tsx`

  - [ ] Replace manual address fields with `<AddressInput />`
  - [ ] Add dynamic gateway loading based on address
  - [ ] Add PayPal option for international addresses
  - [ ] Add Razorpay/PayU for Indian addresses
  - [ ] Add currency selector for international orders
  - [ ] Add converted amount display
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

- [ ] **Task 2.1.2**: Update `src/app/checkout/success/page.tsx`

  - [ ] Add PayPal capture handler
  - [ ] Add redirect logic after payment
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

- [ ] **Task 2.1.3**: Update `src/app/admin/settings/payment/page.tsx`

  - [ ] Add Razorpay configuration section
  - [ ] Add PayPal configuration section
  - [ ] Add PayU configuration section
  - [ ] Link to payment-gateways page
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

- [ ] **Task 2.1.4**: Update `src/app/admin/analytics/payments/page.tsx`

  - [ ] Add gateway breakdown chart
  - [ ] Add currency-wise revenue tracking
  - [ ] Add international vs domestic split
  - [ ] Add transaction fees analysis
  - [ ] ✅ Query Firestore orders collection with payment gateway filters
  - [ ] ✅ Aggregate data using Firestore queries or Firebase Functions
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

- [ ] **Task 2.1.5**: 🔥 Update Payment Flow to Use Firebase Functions
  - [ ] Update checkout page to call Firebase Function for order creation
  - [ ] Use Firebase Callable Functions for payment initiation
  - [ ] Store payment status in Firestore orders collection
  - [ ] Listen to Firestore real-time updates for payment status changes
  - [ ] ✅ Use Firebase Callable Functions instead of Next.js API routes where possible
  - [ ] ✅ Use Firestore real-time listeners for instant UI updates

### 2.2 Address Integration

- [ ] **Task 2.2.1**: Update all address input forms

  - [ ] Update `src/app/user/profile/page.tsx`
  - [ ] Update `src/app/seller/shops/[slug]/edit/page.tsx`
  - [ ] Update seller registration flow
  - [ ] Update user registration flow
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

- [ ] **Task 2.2.2**: 🔥 Create Firestore Triggers for Address Validation
  - [ ] **CREATE**: `functions/src/triggers/validateAddress.ts`
    - Firestore trigger on user addresses collection
    - Validate address format and postal code
    - Auto-correct common formatting issues
    - Flag invalid addresses for manual review
    - Use Firestore onWrite trigger

### 2.3 Shipping Integration

- [ ] **Task 2.3.1**: Update `src/app/admin/settings/shipping/page.tsx`

  - [ ] Add Shiprocket configuration section
  - [ ] Add API credentials fields
  - [ ] Add test connection button
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

- [ ] **Task 2.3.2**: Update `src/app/seller/orders/[id]/page.tsx`
  - [ ] Add Generate AWB button
  - [ ] Add Select Courier dropdown
  - [ ] Add Schedule Pickup button
  - [ ] Add Print Label button
  - [ ] Add Track Shipment section
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

### 2.4 Notification Preferences

- [ ] **Task 2.4.1**: Update `src/app/user/settings/notifications/page.tsx`
  - [ ] Add WhatsApp notification toggles
  - [ ] Add email notification toggles
  - [ ] Add notification categories
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

### 2.5 Shop Settings Integration

- [ ] **Task 2.5.1**: Update shop about page

  - [ ] Update `src/app/shops/[slug]/about/page.tsx`
  - [ ] Display accepted payment modes
  - [ ] Display shipping options
  - [ ] Display return policy
  - [ ] Display warranty policy
  - [ ] Add shop tabs navigation
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

- [ ] **Task 2.5.2**: Create `src/components/shop/ShopTabs.tsx`
  - [ ] Add tabs component (Products | Auctions | About | Reviews | Contact)
  - [ ] ✅ Mobile responsive (horizontal scroll)
  - [ ] ✅ Dark mode support

### 2.6 Homepage Enhancements

- [ ] **Task 2.6.1**: Update product sections

  - [ ] Update `src/components/homepage/ProductsSection.tsx`
  - [ ] Update `src/components/homepage/FeaturedProductsSection.tsx`
  - [ ] Update `src/components/homepage/FeaturedAuctionsSection.tsx`
  - [ ] Update `src/components/homepage/FeaturedShopsSection.tsx`
  - [ ] Ensure using `<HorizontalScrollContainer />`
  - [ ] Verify single-row display
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

- [ ] **Task 2.6.2**: Verify homepage sections
  - [ ] Check `src/app/page.tsx` for missing sections
  - [ ] Ensure FeaturedCategoriesSection is rendered
  - [ ] Ensure FeaturedShopsSection is rendered
  - [ ] Debug data loading issues
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

### 2.7 Product/Auction Display Fixes

- [ ] **Task 2.7.1**: Update `src/components/product/ProductImageGallery.tsx`

  - [ ] Fix auto slideshow (cycle through all images)
  - [ ] Fix click to open lightbox
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

- [ ] **Task 2.7.2**: Update `src/components/product/ProductImageModal.tsx`

  - [ ] Remove purchase button from lightbox
  - [ ] Keep only navigation and close buttons
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

- [ ] **Task 2.7.3**: Update `src/components/common/ProductVariantSelector.tsx`

  - [ ] Verify variant rendering
  - [ ] Verify variant selection updates state
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

- [ ] **Task 2.7.4**: Update product similar items
  - [ ] Fix similar items query in `src/app/products/[slug]/page.tsx`
  - [ ] Improve similarity algorithm
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

### 2.8 Filter & Navigation Improvements

- [ ] **Task 2.8.1**: Update `src/components/common/UnifiedFilterSidebar.tsx`

  - [ ] Add search input to each filter section
  - [ ] Add "Expand All" / "Collapse All" buttons
  - [ ] Implement filter search functionality
  - [ ] Save expanded state to localStorage
  - [ ] Verify mobile responsiveness (drawer on mobile)
  - [ ] Verify dark mode

- [ ] **Task 2.8.2**: Update `src/components/common/CollapsibleFilter.tsx`

  - [ ] Add search prop
  - [ ] Implement search filtering
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

- [ ] **Task 2.8.3**: Fix category filters
  - [ ] Debug `src/app/categories/[slug]/page.tsx`
  - [ ] Verify filter state passes to API
  - [ ] Verify Sieve query construction
  - [ ] Verify filtered results render
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

### 2.9 Dark Mode Fixes

- [ ] **Task 2.9.1**: Update category details page

  - [ ] Add dark mode classes to `src/app/categories/[slug]/page.tsx`
  - [ ] Verify all elements support dark mode

- [ ] **Task 2.9.2**: Update shop details page
  - [ ] Add dark mode classes to `src/app/shops/[slug]/page.tsx`
  - [ ] Verify all elements support dark mode

### 2.10 Data Loading Fixes

- [ ] **Task 2.10.1**: Debug reviews API

  - [ ] Check `src/app/api/reviews/route.ts` query logic
  - [ ] Verify Sieve parameters
  - [ ] Check permissions

- [ ] **Task 2.10.2**: Debug category products

  - [ ] Check `src/app/api/products/route.ts` categoryId filter
  - [ ] Verify Sieve query construction

- [ ] **Task 2.10.3**: Debug blog posts

  - [ ] Check `src/app/api/blog/route.ts` query logic
  - [ ] Verify published filter

- [ ] **Task 2.10.4**: Debug category auctions

  - [ ] Check `src/app/api/auctions/route.ts` categoryId filter

- [ ] **Task 2.10.5**: Debug category metrics

  - [ ] Check `src/app/api/categories/[slug]/metrics/route.ts`
  - [ ] Verify aggregation logic

- [ ] **Task 2.10.6**: Debug shop items

  - [ ] Verify shopId filter in products/auctions APIs
  - [ ] Ensure products/auctions have shopId field

- [ ] **Task 2.10.7**: Update auction/product cards
  - [ ] Fix metrics display on cards
  - [ ] Verify mobile responsiveness
  - [ ] Verify dark mode

### 2.11 Responsive Scaling

- [ ] **Task 2.11.1**: Update `src/components/common/HorizontalScrollContainer.tsx`

  - [ ] Add window resize recalculation
  - [ ] Update visible items count on resize
  - [ ] Adjust scroll position on resize

- [ ] **Task 2.11.2**: Update layout components
  - [ ] Add max-width constraints
  - [ ] Use container queries where applicable
  - [ ] Ensure grids recalculate on resize

### 2.12 Pagination Migration

- [ ] **Task 2.12.1**: Migrate admin list pages to useResourceList

  - [ ] Update admin users page
  - [ ] Update admin products page
  - [ ] Update admin auctions page
  - [ ] Update admin orders page
  - [ ] Update admin shops page

- [ ] **Task 2.12.2**: Migrate seller list pages to useResourceList

  - [ ] Update seller products page
  - [ ] Update seller auctions page
  - [ ] Update seller orders page

- [ ] **Task 2.12.3**: Migrate user list pages to useResourceList

  - [ ] Update user orders page
  - [ ] Update user wishlist page
  - [ ] Update user viewing history page

- [ ] **Task 2.12.4**: Remove cursor pagination support
  - [ ] Remove cursor pagination code from all pages
  - [ ] Keep only Sieve pagination

---

## 🔧 PHASE 3: FIX TYPESCRIPT ERRORS (Priority 3)

**Goal**: Ensure type safety across entire codebase

### 3.1 Initial TypeScript Check

- [ ] **Task 3.1.1**: Run initial TypeScript check
  ```bash
  npx tsc --noEmit
  ```
  - [ ] Document all errors in a file
  - [ ] Categorize errors by type
  - [ ] Prioritize critical errors

### 3.2 Fix New Code TypeScript Errors

- [ ] **Task 3.2.1**: Fix payment gateway config errors

  - [ ] Verify all interfaces are properly typed
  - [ ] Fix any type mismatches
  - [ ] Run `npx tsc --noEmit` to verify

- [ ] **Task 3.2.2**: Fix address service errors

  - [ ] Verify return types
  - [ ] Fix promise types
  - [ ] Fix cache types
  - [ ] Run `npx tsc --noEmit` to verify

- [ ] **Task 3.2.3**: Fix payment service errors

  - [ ] Verify all method signatures
  - [ ] Fix gateway-specific types
  - [ ] Run `npx tsc --noEmit` to verify

- [ ] **Task 3.2.4**: Fix API route errors

  - [ ] Verify NextRequest/NextResponse types
  - [ ] Fix request body types
  - [ ] Fix response types
  - [ ] Run `npx tsc --noEmit` to verify

- [ ] **Task 3.2.5**: Fix component prop errors

  - [ ] Fix AddressInput prop types
  - [ ] Fix GatewayConfigModal prop types
  - [ ] Fix all new component prop types
  - [ ] Run `npx tsc --noEmit` to verify

- [ ] **Task 3.2.6**: 🔥 Fix Firebase Functions TypeScript Errors
  - [ ] Run `npx tsc --noEmit` in `functions/` directory
  - [ ] Fix webhook handler types
  - [ ] Fix Firestore Admin SDK types
  - [ ] Fix Firebase Functions config types
  - [ ] Fix notification trigger types
  - [ ] Verify `functions/tsconfig.json` is properly configured
  - [ ] Ensure Firebase Admin SDK types are installed

### 3.3 Fix Integration TypeScript Errors

- [ ] **Task 3.3.1**: Fix checkout page errors

  - [ ] Fix address state types
  - [ ] Fix gateway types
  - [ ] Fix payment handler types
  - [ ] Run `npx tsc --noEmit` to verify

- [ ] **Task 3.3.2**: Fix shop settings errors

  - [ ] Fix settings state types
  - [ ] Fix tab types
  - [ ] Run `npx tsc --noEmit` to verify

- [ ] **Task 3.3.3**: Fix filter component errors

  - [ ] Fix filter state types
  - [ ] Fix search types
  - [ ] Run `npx tsc --noEmit` to verify

- [ ] **Task 3.3.4**: Fix homepage errors
  - [ ] Fix section component types
  - [ ] Fix data types
  - [ ] Run `npx tsc --noEmit` to verify

### 3.4 Fix Existing TypeScript Errors

- [ ] **Task 3.4.1**: Fix any type assertions

  - [ ] Replace `any` with proper types
  - [ ] Add type guards where needed
  - [ ] Run `npx tsc --noEmit` to verify

- [ ] **Task 3.4.2**: Fix missing type definitions

  - [ ] Add missing interface definitions
  - [ ] Add missing type exports
  - [ ] Run `npx tsc --noEmit` to verify

- [ ] **Task 3.4.3**: Fix strict mode errors
  - [ ] Fix null/undefined checks
  - [ ] Fix optional chaining issues
  - [ ] Run `npx tsc --noEmit` to verify

### 3.5 Final TypeScript Validation

- [ ] **Task 3.5.1**: Run final TypeScript check

  ```bash
  npx tsc --noEmit
  ```

  - [ ] Verify zero errors
  - [ ] Document any remaining warnings
  - [ ] Create issues for any suppressed errors

- [ ] **Task 3.5.2**: Run build check

  ```bash
  npm run build
  ```

  - [ ] Verify successful build
  - [ ] Fix any build-time errors
  - [ ] Document build warnings

- [ ] **Task 3.5.3**: 🔥 Validate Firebase Functions Build
  ```bash
  cd functions
  npm run build
  ```
  - [ ] Verify successful build
  - [ ] Fix any Firebase Functions errors
  - [ ] Test functions locally with Firebase Emulators
  - [ ] Deploy to Firebase (staging first, then production)

---

## 📊 Progress Tracking

### Phase 1: Create New Components

- **Total Tasks**: 70+
- **Completed**: 0
- **In Progress**: 0
- **Blocked**: 0

### Phase 2: Integration

- **Total Tasks**: 60+
- **Completed**: 0
- **In Progress**: 0
- **Blocked**: 0

### Phase 3: TypeScript Fixes

- **Total Tasks**: 15+
- **Completed**: 0
- **In Progress**: 0
- **Blocked**: 0

### Overall Progress

- **Total Tasks**: 145+
- **Completed**: 0 (0%)
- **Estimated Time**: 4-6 weeks (with team)

---

## 🎯 Quick Start Guide

1. **Start with Phase 1**: Create all new components and services
2. **Mobile & Dark Mode**: Test each component immediately after creation
3. **Run TypeScript**: Check types as you create each file: `npx tsc --noEmit`
4. **Move to Phase 2**: Only after Phase 1 is complete
5. **Integration Testing**: Test each integration thoroughly
6. **Final Phase 3**: Fix all remaining TypeScript errors
7. **Build**: Verify with `npm run build`

---

## ✅ Definition of Done (for each task)

- [ ] Code written and committed
- [ ] Mobile responsive verified
- [ ] Dark mode verified
- [ ] TypeScript errors checked (`npx tsc --noEmit`)
- [ ] Component documented (if new)
- [ ] Unit tests written (if applicable)
- [ ] Peer reviewed
- [ ] QA tested
- [ ] 🔥 **Firebase Integration Checklist** (if applicable):
  - [ ] Uses Firebase Admin SDK for Firestore (backend only)
  - [ ] Uses Firebase Functions config for secrets (not hardcoded)
  - [ ] Implements proper error logging to Firebase Functions logs
  - [ ] Uses Firestore triggers instead of polling where applicable
  - [ ] Stores files in Firebase Storage with proper access rules
  - [ ] Tested locally with Firebase Emulators before deployment
  - [ ] Deployed to staging environment first
  - [ ] Monitoring enabled in Firebase Console

---

## 📚 Related Documentation

- **Integration Guide**: `/docs/INTEGRATION-AND-ENHANCEMENTS-GUIDE.md` - Technical specifications and implementation details
- **AI Agent Guide**: `/TDD/AI-AGENT-GUIDE.md` - Existing patterns and components reference
- **Project README**: `/README.md` - Project overview and setup instructions

---

**Last Updated**: December 5, 2025  
**Maintainer**: Development Team  
**Status**: Active Development
