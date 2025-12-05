# Epic 041: Phase 2 Frontend Integration

> **Status**: Planning  
> **Priority**: HIGH  
> **Category**: Integration  
> **Dependencies**: E039 (Phase 1 Backend Infrastructure)  
> **Created**: December 6, 2025  
> **Last Updated**: December 6, 2025

---

## 📋 Overview

Phase 2 focuses on integrating Phase 1 backend infrastructure (payment gateways, shipping, WhatsApp, email) with frontend components. This epic covers UI updates, component enhancements, and end-to-end integration testing.

**Phase 1 Recap** (All Complete ✅):

- Payment Gateway System (6 gateways, webhooks)
- Shipping Automation (Shiprocket integration)
- WhatsApp Notifications (Twilio/Gupshup)
- Email System (Resend/SendGrid, newsletters)
- Address Management (Google Places, Pincode validation)

**Phase 2 Goals**:

- Connect frontend pages to Phase 1 APIs
- Update admin/seller dashboards
- Enhance checkout flow
- Implement notification preferences UI
- Add shipping management UI
- Complete email template management
- Test end-to-end workflows

---

## 🎯 Goals

### Primary Goals

1. ✅ Integrate payment gateway configuration in admin settings
2. ✅ Connect checkout flow to multi-gateway payment system
3. ✅ Implement shipping management UI for sellers
4. ✅ Add notification preferences page for users
5. ✅ Create email template management for admins
6. ✅ Update order tracking with Shiprocket integration
7. ✅ Test all Phase 1 backends end-to-end

### Success Criteria

- [ ] All Phase 1 APIs connected to frontend
- [ ] Admin can configure payment gateways
- [ ] Sellers can schedule pickups
- [ ] Users can set notification preferences
- [ ] Email templates manageable via UI
- [ ] Order tracking shows real-time updates
- [ ] All workflows tested and working
- [ ] Zero TypeScript errors
- [ ] All components < 300 lines
- [ ] Mobile responsive
- [ ] Dark mode support

---

## 📦 Deliverables

### 1. Admin Dashboard Integration

#### 1.1 Payment Gateway Settings Page

**File**: `src/app/admin/settings/payment-gateways/page.tsx`

**Features**:

- List all 6 payment gateways (Razorpay, PayU, Cashfree, Stripe, PayPal, PhonePe)
- Configure gateway credentials (API keys, secrets)
- Enable/disable gateways
- Test gateway connections
- View webhook logs
- Retry failed webhooks

**Components to Reuse**:

- `FormInput` for credentials
- `FormSwitch` for enable/disable
- `Button` for test connection
- `DataTable` for webhook logs
- `Badge` for gateway status

**API Integration**:

- `POST /api/admin/settings/payment-gateways` - Configure gateway
- `GET /api/admin/settings/payment-gateways` - List gateways
- `PUT /api/admin/settings/payment-gateways/:gateway` - Update gateway
- `POST /api/admin/settings/payment-gateways/:gateway/test` - Test connection
- `GET /api/admin/webhooks/payments` - View logs
- `POST /api/admin/webhooks/payments/:id/retry` - Retry webhook

**Estimated Lines**: ~250 lines

---

#### 1.2 Email Template Management Page

**File**: `src/app/admin/email/templates/page.tsx`

**Features**:

- List all email templates
- Create new templates
- Edit existing templates
- Delete templates
- Preview templates
- Test email delivery
- Template variables documentation

**Components to Reuse**:

- `DataTable` for template list
- `FormInput` for name/subject
- `FormTextarea` for content (rich text editor)
- `Modal` for create/edit
- `Badge` for template status

**API Integration**:

- `GET /api/admin/email/templates` - List templates
- `POST /api/admin/email/templates` - Create template
- `PUT /api/admin/email/templates/:id` - Update template
- `DELETE /api/admin/email/templates/:id` - Delete template

**Estimated Lines**: ~280 lines

---

#### 1.3 WhatsApp Configuration Page

**File**: `src/app/admin/settings/whatsapp/page.tsx`

**Features**:

- Configure WhatsApp provider (Twilio/Gupshup)
- Manage message templates
- Test WhatsApp delivery
- View delivery logs
- Analytics (delivery rates)

**Components to Reuse**:

- `FormSelect` for provider selection
- `FormInput` for credentials
- `DataTable` for templates
- `Button` for test delivery

**API Integration**:

- `POST /api/admin/settings/whatsapp` - Configure provider
- `GET /api/admin/settings/whatsapp/templates` - List templates
- `POST /api/admin/settings/whatsapp/test` - Test delivery
- `GET /api/admin/whatsapp-logs` - View logs

**Estimated Lines**: ~230 lines

---

#### 1.4 Shipping Management Dashboard

**File**: `src/app/admin/shipments/page.tsx`

**Features**:

- List all shipments (all shops)
- Filter by status/carrier/shop
- View tracking details
- Cancel shipments (admin override)
- Shipping analytics (delivery rates)

**Components to Reuse**:

- `DataTable` for shipments list
- `Badge` for shipment status
- `Modal` for tracking details
- `FilterBar` for filters

**API Integration**:

- `GET /api/admin/shipments` - List all shipments
- `GET /api/admin/shipments/:id` - Get details
- `POST /api/admin/shipments/:id/cancel` - Cancel shipment

**Estimated Lines**: ~260 lines

---

### 2. Seller Dashboard Integration

#### 2.1 Shipping Management Page

**File**: `src/app/seller/shipments/page.tsx`

**Features**:

- List own shop shipments
- Schedule manual pickups
- View tracking updates
- Download shipping labels
- Shipment analytics

**Components to Reuse**:

- `DataTable` for shipments
- `Button` for schedule pickup
- `Badge` for status
- `Timeline` for tracking events

**API Integration**:

- `GET /api/seller/shipments` - List own shipments
- `POST /api/seller/shipments/schedule-pickup` - Schedule pickup
- `GET /api/seller/shipments/:id` - Get details

**Estimated Lines**: ~240 lines

---

#### 2.2 Order Management Enhancement

**File**: `src/app/seller/orders/page.tsx` (UPDATE EXISTING)

**Enhancements**:

- Auto-pickup scheduling indicator
- Tracking info display
- Notification status indicators
- Bulk pickup scheduling

**Components to Add**:

- Shipping status badge
- Auto-pickup toggle
- Tracking timeline

**API Integration**:

- Enhanced order details with shipping info
- Bulk pickup scheduling API

**Estimated Lines**: +80 lines to existing

---

### 3. User Features Integration

#### 3.1 Notification Preferences Page

**File**: `src/app/user/settings/notifications/page.tsx`

**Features**:

- Email notification preferences
  - Order updates
  - Auction alerts
  - Price drops
  - Promotions
  - Newsletter subscription
- WhatsApp notification preferences
  - Order updates
  - Auction alerts
  - Price drops
- In-app notification preferences
  - All notification types
- Push notification preferences (future)

**Components to Reuse**:

- `FormSwitch` for each preference
- `Card` for grouping by channel
- `Button` for save

**API Integration**:

- `GET /api/user/notification-preferences` - Get preferences
- `PUT /api/user/notification-preferences` - Update preferences

**Estimated Lines**: ~200 lines

---

#### 3.2 Address Management Enhancement

**File**: `src/app/user/addresses/page.tsx` (UPDATE EXISTING)

**Enhancements**:

- Google Places autocomplete integration
- Pincode auto-fill (city/state)
- Default address selection (shipping/billing)
- Address validation indicators

**Components to Add**:

- AddressAutocomplete component
- PincodeInput with validation
- DefaultAddressBadge

**API Integration**:

- `GET /api/addresses/autocomplete` - Address suggestions
- `GET /api/addresses/place-details` - Place details
- `GET /api/addresses/pincode/:pincode` - Pincode validation
- `POST /api/user/addresses/:id/set-default` - Set default

**Estimated Lines**: +120 lines to existing

---

#### 3.3 Order Tracking Enhancement

**File**: `src/app/user/orders/[id]/page.tsx` (UPDATE EXISTING)

**Enhancements**:

- Real-time tracking updates
- Tracking timeline with events
- Carrier link integration
- Delivery ETA display
- Notification history for order

**Components to Add**:

- TrackingTimeline component
- DeliveryETA component
- NotificationHistory component

**API Integration**:

- Enhanced order details with tracking
- Tracking event history

**Estimated Lines**: +150 lines to existing

---

### 4. Checkout Flow Integration

#### 4.1 Payment Gateway Selection

**File**: `src/app/checkout/page.tsx` (UPDATE EXISTING)

**Enhancements**:

- Dynamic payment method loading (enabled gateways only)
- Gateway-specific payment forms
- UPI payment flow (PhonePe, Google Pay, etc.)
- Card payment flow (all gateways)
- Wallet payment flow
- COD with availability check

**Components to Add**:

- PaymentGatewaySelector component
- UPIPaymentForm component
- CardPaymentForm component
- WalletPaymentForm component

**API Integration**:

- `GET /api/payment-methods` - List enabled gateways
- Gateway-specific payment creation
- Payment verification

**Estimated Lines**: +200 lines to existing

---

#### 4.2 Order Confirmation Enhancement

**File**: `src/app/checkout/success/page.tsx` (UPDATE EXISTING)

**Enhancements**:

- Show notification status (email/WhatsApp sent)
- Display expected shipping date
- Tracking number (if already assigned)
- Notification preference reminder

**Components to Add**:

- NotificationStatus component
- ShippingInfo component

**Estimated Lines**: +80 lines to existing

---

### 5. New Standalone Components

#### 5.1 PaymentGatewayConfig Component

**File**: `src/components/admin/PaymentGatewayConfig.tsx`

**Purpose**: Reusable component for configuring any payment gateway

**Props**:

```typescript
interface PaymentGatewayConfigProps {
  gateway: "razorpay" | "payu" | "cashfree" | "stripe" | "paypal" | "phonepe";
  config?: GatewayConfig;
  onSave: (config: GatewayConfig) => Promise<void>;
  onTest: () => Promise<boolean>;
}
```

**Features**:

- Gateway-specific fields
- Credential validation
- Test connection button
- Enable/disable toggle

**Estimated Lines**: ~180 lines

---

#### 5.2 EmailTemplateEditor Component

**File**: `src/components/admin/EmailTemplateEditor.tsx`

**Purpose**: Rich text editor for email templates

**Props**:

```typescript
interface EmailTemplateEditorProps {
  template?: EmailTemplate;
  onSave: (template: EmailTemplate) => Promise<void>;
  onPreview: (template: EmailTemplate) => void;
}
```

**Features**:

- Rich text editor (Tiptap or similar)
- Variable insertion helper
- Preview mode
- Template validation

**Estimated Lines**: ~250 lines

---

#### 5.3 ShipmentTracker Component

**File**: `src/components/orders/ShipmentTracker.tsx`

**Purpose**: Display shipment tracking timeline

**Props**:

```typescript
interface ShipmentTrackerProps {
  shipmentId: string;
  showDetails?: boolean;
  compact?: boolean;
}
```

**Features**:

- Timeline view of tracking events
- Current location display
- ETA calculation
- Carrier link

**Estimated Lines**: ~160 lines

---

#### 5.4 NotificationPreferenceCard Component

**File**: `src/components/user/NotificationPreferenceCard.tsx`

**Purpose**: Card for managing notification preferences per channel

**Props**:

```typescript
interface NotificationPreferenceCardProps {
  channel: "email" | "whatsapp" | "inApp" | "push";
  preferences: NotificationPreferences;
  onChange: (prefs: NotificationPreferences) => void;
}
```

**Features**:

- Toggle switches for each notification type
- Channel icon and description
- Save indicator

**Estimated Lines**: ~120 lines

---

#### 5.5 AddressAutocomplete Component

**File**: `src/components/user/AddressAutocomplete.tsx`

**Purpose**: Google Places autocomplete for address input

**Props**:

```typescript
interface AddressAutocompleteProps {
  value: string;
  onChange: (address: AddressDetails) => void;
  placeholder?: string;
}
```

**Features**:

- Debounced search
- Prediction dropdown
- Auto-fill address fields
- Loading states

**Estimated Lines**: ~140 lines

---

## 🔗 Integration Points

### Frontend → Backend API Calls

| Frontend Page           | Backend API                                    | Phase 1 File                                         |
| ----------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| Admin Payment Settings  | POST /api/admin/settings/payment-gateways      | src/app/api/admin/settings/payment-gateways/route.ts |
| Admin Email Templates   | GET/POST/PUT/DELETE /api/admin/email/templates | src/app/api/email/templates/route.ts                 |
| Admin WhatsApp Settings | POST /api/admin/settings/whatsapp              | Not yet created (Phase 2)                            |
| Admin Shipments         | GET /api/admin/shipments                       | Not yet created (Phase 2)                            |
| Seller Shipments        | GET/POST /api/seller/shipments                 | Not yet created (Phase 2)                            |
| User Notifications      | PUT /api/user/notification-preferences         | Not yet created (Phase 2)                            |
| User Addresses          | GET /api/addresses/autocomplete                | Not yet created (Phase 2)                            |
| Checkout Payment        | Gateway-specific APIs                          | Via Firebase Functions                               |

### Firebase Functions → Frontend Notifications

| Firebase Function             | Triggers Frontend Update   | Method             |
| ----------------------------- | -------------------------- | ------------------ |
| sendOrderEmail                | Email sent confirmation    | Firestore listener |
| sendOrderWhatsAppNotification | WhatsApp sent confirmation | Firestore listener |
| schedulePickup                | Shipment created           | Firestore listener |
| trackShipment                 | Tracking updated           | Firestore listener |
| Payment Webhooks              | Payment status updated     | Firestore listener |

---

## 📊 Implementation Statistics

### New Files to Create

| Type       | Count  | Total Lines (Est.) |
| ---------- | ------ | ------------------ |
| Pages      | 4      | ~920 lines         |
| Components | 5      | ~850 lines         |
| API Routes | 6      | ~900 lines         |
| Services   | 2      | ~400 lines         |
| **Total**  | **17** | **~3,070 lines**   |

### Existing Files to Update

| File                              | Changes              | Lines Added (Est.) |
| --------------------------------- | -------------------- | ------------------ |
| src/app/seller/orders/page.tsx    | Shipping integration | +80                |
| src/app/user/addresses/page.tsx   | Autocomplete         | +120               |
| src/app/user/orders/[id]/page.tsx | Tracking             | +150               |
| src/app/checkout/page.tsx         | Payment gateways     | +200               |
| src/app/checkout/success/page.tsx | Notifications        | +80                |
| **Total**                         | **5 files**          | **+630 lines**     |

### Phase 1 Backend (Already Complete)

| Category         | Files  | Lines     | Status |
| ---------------- | ------ | --------- | ------ |
| Payment Gateways | 7      | 3,768     | ✅     |
| Payment Webhooks | 6      | 1,066     | ✅     |
| Shipping         | 4      | 768       | ✅     |
| WhatsApp         | 4      | 685       | ✅     |
| Email            | 4      | 745       | ✅     |
| Address APIs     | 3      | 1,043     | ✅     |
| **Total**        | **28** | **8,075** | **✅** |

---

## ✅ Quality Checklist

### Code Quality

- [ ] All new files < 300 lines
- [ ] Zero TypeScript errors
- [ ] ESLint warnings resolved
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Empty states implemented

### UI/UX

- [ ] Mobile responsive (all breakpoints)
- [ ] Dark mode support
- [ ] Touch-friendly (48px+ targets)
- [ ] Loading skeletons
- [ ] Error messages clear
- [ ] Success feedback
- [ ] Keyboard navigation

### Integration

- [ ] All APIs called correctly
- [ ] Authentication handled
- [ ] RBAC enforced
- [ ] Environment variables used
- [ ] No hardcoded values
- [ ] Error responses handled
- [ ] Success responses handled

### Testing

- [ ] Unit tests for components
- [ ] Integration tests for APIs
- [ ] E2E tests for workflows
- [ ] Payment flow tested (all gateways)
- [ ] Shipping flow tested
- [ ] Notification flow tested
- [ ] Address autocomplete tested

---

## 🧪 Testing Plan

### 1. Payment Gateway Integration Testing

**Test Cases**:

- [ ] Admin can configure Razorpay
- [ ] Admin can configure PayU
- [ ] Admin can configure Cashfree
- [ ] Admin can configure Stripe
- [ ] Admin can configure PayPal
- [ ] Admin can configure PhonePe
- [ ] Test connection works for each gateway
- [ ] Enable/disable gateway works
- [ ] Webhook logs display correctly
- [ ] Retry failed webhook works

**E2E Flow**:

1. Admin enables Razorpay with valid credentials
2. User checks out with Razorpay
3. Payment succeeds
4. Webhook received and processed
5. Order status updated
6. Email notification sent
7. WhatsApp notification sent

---

### 2. Shipping Integration Testing

**Test Cases**:

- [ ] Seller can schedule pickup manually
- [ ] Auto-pickup triggers on order processing
- [ ] Shipment created in Shiprocket
- [ ] AWB number generated
- [ ] Tracking info updated
- [ ] Customer notified via email
- [ ] Customer notified via WhatsApp
- [ ] Admin can view all shipments
- [ ] Seller can view own shipments

**E2E Flow**:

1. Customer places order
2. Seller marks as processing
3. Auto-pickup scheduled (Firebase Function)
4. Shiprocket creates shipment
5. AWB number saved to order
6. Tracking updates fetched
7. Customer receives tracking link
8. Shipment delivered
9. Order status updated to delivered

---

### 3. Notification Preferences Testing

**Test Cases**:

- [ ] User can view current preferences
- [ ] User can update email preferences
- [ ] User can update WhatsApp preferences
- [ ] User can update in-app preferences
- [ ] Preferences saved correctly
- [ ] Preferences respected for future notifications
- [ ] Unsubscribe from newsletter works
- [ ] Opt-out from WhatsApp works

**E2E Flow**:

1. User opens notification preferences
2. Disables email order updates
3. Enables WhatsApp order updates
4. Saves preferences
5. Places new order
6. No email notification sent
7. WhatsApp notification sent

---

### 4. Address Autocomplete Testing

**Test Cases**:

- [ ] Address suggestions appear on typing
- [ ] Selecting suggestion fills address fields
- [ ] Pincode validation works
- [ ] Invalid pincode shows error
- [ ] City/state auto-filled from pincode
- [ ] Default address can be set
- [ ] Address saves correctly

**E2E Flow**:

1. User opens add address form
2. Types "123 Main" in address field
3. Google Places suggestions appear
4. User selects suggestion
5. All fields auto-filled
6. User enters pincode
7. City/state auto-filled
8. User sets as default shipping
9. Address saved

---

## 📝 Implementation Order

### Phase 2.1: Admin Payment & Email Management (Week 1)

**Priority**: CRITICAL

1. ✅ Create payment gateway settings page
2. ✅ Implement PaymentGatewayConfig component
3. ✅ Create email template management page
4. ✅ Implement EmailTemplateEditor component
5. ✅ Test payment gateway configuration
6. ✅ Test email template CRUD

**Deliverables**:

- Admin can configure all 6 payment gateways
- Admin can manage email templates
- All APIs connected and working

---

### Phase 2.2: Seller Shipping Management (Week 2)

**Priority**: HIGH

1. ✅ Create seller shipments page
2. ✅ Implement ShipmentTracker component
3. ✅ Create manual pickup scheduling API
4. ✅ Update seller orders page with shipping info
5. ✅ Test auto-pickup scheduling
6. ✅ Test tracking updates

**Deliverables**:

- Sellers can view and manage shipments
- Auto-pickup scheduling works
- Tracking updates display correctly

---

### Phase 2.3: User Notification & Address Features (Week 3)

**Priority**: HIGH

1. ✅ Create notification preferences page
2. ✅ Implement NotificationPreferenceCard component
3. ✅ Create address autocomplete API
4. ✅ Implement AddressAutocomplete component
5. ✅ Update address management page
6. ✅ Test notification preferences
7. ✅ Test address autocomplete

**Deliverables**:

- Users can manage notification preferences
- Address autocomplete works with Google Places
- Pincode validation works

---

### Phase 2.4: Checkout Payment Integration (Week 4)

**Priority**: CRITICAL

1. ✅ Update checkout page with dynamic payment methods
2. ✅ Implement gateway-specific payment forms
3. ✅ Test payment flow for all 6 gateways
4. ✅ Update order confirmation page
5. ✅ Test end-to-end checkout
6. ✅ Test payment webhooks

**Deliverables**:

- Checkout supports all 6 payment gateways
- Payment flow works end-to-end
- Order confirmation shows notification status

---

### Phase 2.5: Admin Shipping & WhatsApp (Week 5)

**Priority**: MEDIUM

1. ✅ Create admin shipments page
2. ✅ Create WhatsApp configuration page
3. ✅ Test admin shipment management
4. ✅ Test WhatsApp notifications

**Deliverables**:

- Admin can view/manage all shipments
- Admin can configure WhatsApp provider
- WhatsApp notifications work

---

### Phase 2.6: Integration Testing & Bug Fixes (Week 6)

**Priority**: HIGH

1. ✅ Run all E2E test scenarios
2. ✅ Fix integration bugs
3. ✅ Performance testing
4. ✅ Security audit
5. ✅ Documentation updates

**Deliverables**:

- All Phase 2 features tested and working
- Zero critical bugs
- Documentation complete

---

## 🔐 Security Considerations

### Payment Gateway Credentials

- [ ] All API keys stored encrypted in Firestore
- [ ] Secrets never sent to frontend
- [ ] Admin-only access to configuration
- [ ] Test mode vs production mode separation
- [ ] Webhook signature verification enabled

### Address Data

- [ ] Google Places API key restricted by domain
- [ ] Address data validated before saving
- [ ] PII encryption at rest
- [ ] RBAC enforced (users can only access own addresses)

### Notifications

- [ ] User opt-out respected for all channels
- [ ] Unsubscribe links in marketing emails
- [ ] WhatsApp opt-in required
- [ ] Rate limiting on notification sending

---

## 📚 Related Documentation

- **[E039: Phase 1 Backend Infrastructure](/TDD/epics/E039-phase1-backend-infrastructure.md)** - Backend implementations
- **[API Implementation Roadmap](/TDD/resources/api-implementation-roadmap.md)** - API tracking
- **[RBAC Consolidated](/TDD/rbac/RBAC-CONSOLIDATED.md)** - Permission matrix
- **[Payments API Specs](/TDD/resources/payments/API-SPECS.md)** - Payment APIs
- **[Orders API Specs](/TDD/resources/orders/API-SPECS.md)** - Shipping APIs
- **[Users API Specs](/TDD/resources/users/API-SPECS.md)** - Address APIs
- **[Notifications API Specs](/TDD/resources/notifications/API-SPECS.md)** - Notification APIs
- **[AI Agent Development Guide](/TDD/AI-AGENT-GUIDE.md)** - Architecture patterns

---

## 🚀 Getting Started

### Prerequisites

1. ✅ Phase 1 backend complete (E039)
2. ✅ All Firebase Functions deployed
3. ✅ Environment variables configured
4. ✅ Payment gateway sandbox accounts created
5. ✅ Shiprocket account configured
6. ✅ WhatsApp API accounts created
7. ✅ Email service (Resend/SendGrid) configured

### Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add all Phase 1 credentials

# Start development server
npm run dev

# In separate terminal, start Firebase emulators
cd functions
npm run serve
```

### First Task to Implement

Start with **Phase 2.1, Task 1**: Admin Payment Gateway Settings Page

**File to create**: `src/app/admin/settings/payment-gateways/page.tsx`

**Steps**:

1. Read existing admin settings pages for patterns
2. Reuse existing form components (FormInput, FormSwitch, Button)
3. Connect to Phase 1 API: `POST /api/admin/settings/payment-gateways`
4. Test with Razorpay sandbox credentials
5. Verify zero TypeScript errors
6. Test mobile responsive
7. Test dark mode

---

## 📊 Progress Tracking

### Overall Progress

- [ ] Phase 2.1: Admin Payment & Email Management (0/6 tasks)
- [ ] Phase 2.2: Seller Shipping Management (0/6 tasks)
- [ ] Phase 2.3: User Notification & Address Features (0/7 tasks)
- [ ] Phase 2.4: Checkout Payment Integration (0/6 tasks)
- [ ] Phase 2.5: Admin Shipping & WhatsApp (0/4 tasks)
- [ ] Phase 2.6: Integration Testing & Bug Fixes (0/5 tasks)

**Total**: 0/34 tasks complete (0%)

---

_This epic will be updated as Phase 2 implementation progresses._
