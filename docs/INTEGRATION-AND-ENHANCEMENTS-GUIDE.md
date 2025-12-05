# Integration and Enhancements Implementation Guide

> **Created**: December 5, 2025  
> **Priority**: HIGH  
> **Status**: Implementation Required  
> **Related**: E021 (System Configuration), E027 (Design System & Theming)

---

## ⚠️ CRITICAL IMPLEMENTATION GUIDELINES

### Code Reusability & Component First Approach

**BEFORE writing ANY new code:**

1. ✅ **CHECK for existing components** in `src/components/`
2. ✅ **USE existing hooks** from `src/hooks/`
3. ✅ **UPDATE existing files** instead of creating duplicates
4. ✅ **REUSE service methods** from `src/services/`
5. ✅ **EXTEND existing utilities** in `src/lib/`

### Component Hierarchy (USE IN THIS ORDER)

1. **Existing Components** - Search before creating

   - Check `src/components/common/` for reusable UI components
   - Check `src/components/forms/` for form components
   - Check `src/components/admin/`, `src/components/seller/` for feature-specific components

2. **Existing Hooks** - Always use if available

   - `useLoadingState` for data fetching
   - `useDebounce` for search/filters
   - `useFilters` for list filtering
   - See `/TDD/AI-AGENT-GUIDE.md` for complete list

3. **Existing Services** - Never duplicate API logic

   - Use `src/services/*.service.ts` for all API calls
   - Add methods to existing services instead of creating new ones

4. **When to Create NEW Code** (ONLY if absolutely necessary):
   - ❌ Component doesn't exist AND can't be composed from existing ones
   - ❌ Hook doesn't exist AND pattern is reusable
   - ❌ Service doesn't exist AND API pattern is unique
   - ❌ Utility function is genuinely new logic

### Example: DON'T vs DO

```typescript
// ❌ DON'T: Create new payment form component
export function NewPaymentForm() { ... }

// ✅ DO: Use existing FormField components
import { FormField, FormInput, FormSelect } from '@/components/forms';
// Then compose your form

// ❌ DON'T: Create new loading state management
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
// ... 30 lines of try-catch-finally

// ✅ DO: Use existing useLoadingState hook
import { useLoadingState } from '@/hooks/useLoadingState';
const { isLoading, error, execute } = useLoadingState();

// ❌ DON'T: Create new address service
class NewAddressService { ... }

// ✅ DO: Extend existing address service
// Update src/services/address.service.ts with new methods

// ❌ DON'T: Create duplicate form input
export function CustomInput() { ... }

// ✅ DO: Use and extend existing FormInput
import { FormInput } from '@/components/forms';
// Add props if needed via PR to existing component
```

### File Modification Protocol

1. **Search First**: Use `grep_search` or `semantic_search` to find existing code
2. **Read Existing**: Use `read_file` to understand current implementation
3. **Update, Don't Replace**: Use `replace_string_in_file` to modify existing files
4. **Create Only When Necessary**: Only use `create_file` if genuinely new
5. **Document Changes**: Update component props/types if extending

### Integration Checklist

Before implementing any task in this guide:

- [ ] Searched for existing similar components
- [ ] Checked if existing hooks can be used
- [ ] Verified if service method exists
- [ ] Reviewed AI-AGENT-GUIDE.md for patterns
- [ ] Confirmed new file is absolutely necessary
- [ ] Planned to reuse existing UI components

**Remember**: Every new file adds maintenance burden. Reuse maximizes consistency and reduces bugs.

---

## 📋 Table of Contents

1. [Payment Gateway Integrations](#1-payment-gateway-integrations)
2. [Shipping Integration](#2-shipping-integration-shiprocket)
3. [WhatsApp Integration](#3-whatsapp-integration)
4. [Email Integration](#4-email-integration)
5. [UI/UX Enhancements](#5-uiux-enhancements)
6. [Security Improvements](#6-security-improvements)
7. [Shop Settings & Configuration](#7-shop-settings--configuration)
8. [Product Display Fixes](#8-product-display-fixes)
9. [Filter & Navigation Improvements](#9-filter--navigation-improvements)
10. [Dark Mode Fixes](#10-dark-mode-fixes)
11. [Data Loading Issues](#11-data-loading-issues)
12. [Product & Auction Details Enhancements](#12-product--auction-details-enhancements)
13. [Seller Configuration Options](#13-seller-configuration-options)
14. [Auction System Improvements](#14-auction-system-improvements)
15. [Dropdown Enhancements](#15-dropdown-enhancements)
16. [Validation & Input Improvements](#16-validation--input-improvements)
17. [Media Upload Enhancement](#17-media-upload-enhancement)
18. [Product & Auction Creation Improvements](#18-product--auction-creation-improvements)
19. [Category System Enhancements](#19-category-system-enhancements)
20. [Admin Features & Settings](#20-admin-features--settings)
21. [Shop Verification & Management](#21-shop-verification--management)
22. [User Experience Improvements](#22-user-experience-improvements)
23. [Cart & Checkout Fixes](#23-cart--checkout-fixes)
24. [Admin Navigation & UI](#24-admin-navigation--ui)
25. [Support System Enhancements](#25-support-system-enhancements)
26. [Critical Bug Fixes](#26-critical-bug-fixes)

---

## 1. Payment Gateway Integrations

### 1.1 Razorpay Settings and Integration

#### Current Status

- ✅ Basic Razorpay types defined in `src/types/backend/riplimit.types.ts`
- ✅ Settings service has Razorpay configuration structure
- ⚠️ Full integration not implemented

#### Implementation Tasks

**Task 1.1.1: Admin Settings UI**

- **File**: `src/app/admin/settings/payment/page.tsx`
- **Action**: Enhance existing payment settings page
- **Components**:
  ```tsx
  - Razorpay Configuration Section
    - Enable/Disable Toggle
    - API Key ID (Input with validation)
    - API Key Secret (Password input, encrypted)
    - Webhook Secret (Password input)
    - Test Mode Toggle
    - Auto-capture Toggle
    - Payment Methods Selection (UPI, Cards, Netbanking, Wallets)
  ```

**Task 1.1.2: Backend Service**

- **File**: `src/services/payment.service.ts` (CREATE NEW)
- **Methods**:

  ```typescript
  class PaymentService {
    // Razorpay
    createRazorpayOrder(
      amount: number,
      currency: string,
      orderId: string
    ): Promise<RazorpayOrder>;
    verifyRazorpayPayment(
      orderId: string,
      paymentId: string,
      signature: string
    ): Promise<boolean>;
    captureRazorpayPayment(
      paymentId: string,
      amount: number
    ): Promise<RazorpayPayment>;
    refundRazorpayPayment(
      paymentId: string,
      amount?: number
    ): Promise<RazorpayRefund>;

    // Generic
    getPaymentMethods(): Promise<PaymentMethod[]>;
    getPaymentStatus(orderId: string): Promise<PaymentStatus>;
  }
  ```

**Task 1.1.3: API Routes**

- **Create**: `src/app/api/payments/razorpay/order/route.ts` (POST)
- **Create**: `src/app/api/payments/razorpay/verify/route.ts` (POST)
- **Create**: `src/app/api/payments/razorpay/capture/route.ts` (POST)
- **Create**: `src/app/api/payments/razorpay/refund/route.ts` (POST)
- **Create**: `src/app/api/payments/razorpay/webhook/route.ts` (POST)

**Task 1.1.4: Checkout Integration**

- **File**: `src/app/checkout/page.tsx`
- **Action**: Add Razorpay payment option
- **Script**: Load Razorpay SDK dynamically
- **Handler**: Process payment response and verify

**Task 1.1.5: Database Schema**

```typescript
// Collection: payment_transactions
interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  gateway: "razorpay" | "payu" | "cod";
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";

  // Razorpay specific
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  metadata: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Task 1.1.6: Environment Variables**

```env
# Add to .env.local
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

---

### 1.2 PayU Integration (Alternative Gateway - India)

**Follow similar pattern as Razorpay:**

- Admin settings UI
- Backend service methods
- API routes
- Checkout integration
- Webhook handling

---

### 1.3 PayPal Integration (International Payments)

#### Current Status

- ❌ No PayPal integration
- ⚠️ Required for international customers (non-Indian pincodes)

#### Implementation Tasks

**Task 1.3.1: Admin Settings UI**

- **File**: `src/app/admin/settings/payment/page.tsx`
- **Action**: Add PayPal configuration section
- **Components**:

  ```tsx
  // PayPal Settings Section
  <SettingsSection title="PayPal Configuration (International)">
    <FormField label="PayPal Client ID" required>
      <FormInput
        type="text"
        value={settings.paypal?.clientId}
        onChange={(e) => updateSetting("paypal.clientId", e.target.value)}
        placeholder="AXXXXXXxxxxxx"
      />
    </FormField>

    <FormField label="PayPal Secret Key" required>
      <FormInput
        type="password"
        value={settings.paypal?.secretKey}
        onChange={(e) => updateSetting("paypal.secretKey", e.target.value)}
      />
    </FormField>

    <FormField label="PayPal Webhook ID">
      <FormInput
        type="text"
        value={settings.paypal?.webhookId}
        onChange={(e) => updateSetting("paypal.webhookId", e.target.value)}
      />
    </FormField>

    <FormField label="Environment">
      <FormSelect
        value={settings.paypal?.environment || "sandbox"}
        onChange={(e) => updateSetting("paypal.environment", e.target.value)}
      >
        <option value="sandbox">Sandbox (Testing)</option>
        <option value="live">Live (Production)</option>
      </FormSelect>
    </FormField>

    <FormField label="Supported Currencies">
      <TagInput
        value={
          settings.paypal?.supportedCurrencies || [
            "USD",
            "EUR",
            "GBP",
            "AUD",
            "CAD",
          ]
        }
        onChange={(tags) => updateSetting("paypal.supportedCurrencies", tags)}
        placeholder="Add currency code (e.g., USD)"
      />
    </FormField>

    <FormField label="Enable for International Orders">
      <FormCheckbox
        checked={settings.paypal?.enabled}
        onChange={(e) => updateSetting("paypal.enabled", e.target.checked)}
        label="Automatically enable PayPal for non-Indian pincodes"
      />
    </FormField>
  </SettingsSection>
  ```

**Task 1.3.2: Backend Service**

- **File**: `src/services/payment.service.ts` (UPDATE)
- **Methods**:

  ```typescript
  // PayPal-specific methods
  async createPayPalOrder(orderData: {
    amount: number;
    currency: string;
    orderId: string;
    items: Array<{
      name: string;
      quantity: number;
      unitAmount: number;
    }>;
    shippingAddress: Address;
  }): Promise<{ orderId: string; approvalUrl: string }> {
    const settings = await this.getPayPalSettings();

    const response = await fetch(`${settings.apiUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getPayPalAccessToken()}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderData.orderId,
          amount: {
            currency_code: orderData.currency,
            value: orderData.amount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: orderData.currency,
                value: this.calculateItemTotal(orderData.items),
              },
            },
          },
          items: orderData.items.map(item => ({
            name: item.name,
            quantity: item.quantity.toString(),
            unit_amount: {
              currency_code: orderData.currency,
              value: item.unitAmount.toFixed(2),
            },
          })),
          shipping: {
            address: {
              address_line_1: orderData.shippingAddress.line1,
              address_line_2: orderData.shippingAddress.line2,
              admin_area_2: orderData.shippingAddress.city,
              admin_area_1: orderData.shippingAddress.state,
              postal_code: orderData.shippingAddress.postalCode,
              country_code: orderData.shippingAddress.country,
            },
          },
        }],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
          brand_name: 'JustForView',
          shipping_preference: 'SET_PROVIDED_ADDRESS',
        },
      }),
    });

    const order = await response.json();

    return {
      orderId: order.id,
      approvalUrl: order.links.find((link: any) => link.rel === 'approve')?.href,
    };
  }

  async capturePayPalOrder(paypalOrderId: string): Promise<PaymentResult> {
    const settings = await this.getPayPalSettings();

    const response = await fetch(
      `${settings.apiUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getPayPalAccessToken()}`,
        },
      }
    );

    const capture = await response.json();

    if (capture.status === 'COMPLETED') {
      return {
        success: true,
        transactionId: capture.purchase_units[0].payments.captures[0].id,
        amount: parseFloat(capture.purchase_units[0].payments.captures[0].amount.value),
        currency: capture.purchase_units[0].payments.captures[0].amount.currency_code,
        paymentMethod: 'paypal',
      };
    }

    throw new Error('PayPal payment capture failed');
  }

  async refundPayPalPayment(captureId: string, amount?: number): Promise<void> {
    const settings = await this.getPayPalSettings();

    const refundData: any = {
      note_to_payer: 'Refund for your order',
    };

    if (amount) {
      refundData.amount = {
        value: amount.toFixed(2),
        currency_code: 'USD', // Get from original transaction
      };
    }

    await fetch(`${settings.apiUrl}/v2/payments/captures/${captureId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getPayPalAccessToken()}`,
      },
      body: JSON.stringify(refundData),
    });
  }

  async verifyPayPalWebhook(
    webhookId: string,
    headers: Record<string, string>,
    body: any
  ): Promise<boolean> {
    const settings = await this.getPayPalSettings();

    const response = await fetch(
      `${settings.apiUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getPayPalAccessToken()}`,
        },
        body: JSON.stringify({
          transmission_id: headers['paypal-transmission-id'],
          transmission_time: headers['paypal-transmission-time'],
          cert_url: headers['paypal-cert-url'],
          auth_algo: headers['paypal-auth-algo'],
          transmission_sig: headers['paypal-transmission-sig'],
          webhook_id: webhookId,
          webhook_event: body,
        }),
      }
    );

    const result = await response.json();
    return result.verification_status === 'SUCCESS';
  }

  private async getPayPalAccessToken(): Promise<string> {
    const settings = await this.getPayPalSettings();
    const auth = Buffer.from(`${settings.clientId}:${settings.secretKey}`).toString('base64');

    const response = await fetch(`${settings.apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
  }

  async getCurrencyForCountry(countryCode: string): Promise<string> {
    // Map country codes to currencies
    const currencyMap: Record<string, string> = {
      'US': 'USD',
      'GB': 'GBP',
      'EU': 'EUR',
      'AU': 'AUD',
      'CA': 'CAD',
      'SG': 'SGD',
      'AE': 'AED',
      // Add more as needed
    };

    return currencyMap[countryCode] || 'USD';
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    // Integrate with currency conversion API (e.g., exchangerate-api.com)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );
    const data = await response.json();
    const rate = data.rates[toCurrency];

    return amount * rate;
  }
  ```

**Task 1.3.3: API Routes**

- **Create**: `src/app/api/payments/paypal/order/route.ts` (POST)

  ```typescript
  export async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const { orderId, currency } = body;

      // Get order details
      const order = await ordersService.getById(orderId);

      // Verify address is international
      if (!isInternationalAddress(order.shippingAddress)) {
        return NextResponse.json(
          { error: "PayPal is only available for international orders" },
          { status: 400 }
        );
      }

      // Create PayPal order
      const paypalOrder = await paymentService.createPayPalOrder({
        amount: order.total,
        currency:
          currency ||
          (await paymentService.getCurrencyForCountry(
            order.shippingAddress.country
          )),
        orderId: order.id,
        items: order.items,
        shippingAddress: order.shippingAddress,
      });

      return NextResponse.json(paypalOrder);
    } catch (error) {
      logError(error, { context: "PayPal order creation" });
      return NextResponse.json(
        { error: "Failed to create PayPal order" },
        { status: 500 }
      );
    }
  }
  ```

- **Create**: `src/app/api/payments/paypal/capture/route.ts` (POST)

  ```typescript
  export async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const { paypalOrderId, orderId } = body;

      // Capture PayPal payment
      const result = await paymentService.capturePayPalOrder(paypalOrderId);

      // Update order status
      await ordersService.updatePaymentStatus(orderId, {
        status: "paid",
        transactionId: result.transactionId,
        paymentMethod: "paypal",
        amount: result.amount,
        currency: result.currency,
        paidAt: new Date(),
      });

      return NextResponse.json(result);
    } catch (error) {
      logError(error, { context: "PayPal capture" });
      return NextResponse.json(
        { error: "Failed to capture PayPal payment" },
        { status: 500 }
      );
    }
  }
  ```

- **Create**: `src/app/api/payments/paypal/refund/route.ts` (POST)
- **Create**: `src/app/api/payments/paypal/webhook/route.ts` (POST)

  ```typescript
  export async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const headers = Object.fromEntries(request.headers.entries());

      // Verify webhook signature
      const isValid = await paymentService.verifyPayPalWebhook(
        process.env.PAYPAL_WEBHOOK_ID!,
        headers,
        body
      );

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }

      // Handle webhook events
      switch (body.event_type) {
        case "PAYMENT.CAPTURE.COMPLETED":
          await handlePaymentCompleted(body.resource);
          break;
        case "PAYMENT.CAPTURE.REFUNDED":
          await handlePaymentRefunded(body.resource);
          break;
        case "PAYMENT.CAPTURE.DENIED":
          await handlePaymentDenied(body.resource);
          break;
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      logError(error, { context: "PayPal webhook" });
      return NextResponse.json(
        { error: "Webhook processing failed" },
        { status: 500 }
      );
    }
  }
  ```

**Task 1.3.4: Checkout Integration**

- **File**: `src/app/checkout/page.tsx`
- **Action**: Add PayPal payment option for international addresses
- **Logic**:

  ```tsx
  // Detect if address is international
  const isInternational = shippingAddress?.country !== "IN";

  // Show PayPal option only for international orders
  {
    isInternational && (
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === "paypal"}
              onChange={() => setPaymentMethod("paypal")}
              className="mr-2"
            />
            <span className="font-medium">PayPal</span>
          </label>
          <img src="/images/paypal-logo.png" alt="PayPal" className="h-6" />
        </div>

        {paymentMethod === "paypal" && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You will be redirected to PayPal to complete your payment
              securely.
            </p>

            {/* Currency selector */}
            <FormField label="Payment Currency">
              <FormSelect
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </FormSelect>
            </FormField>

            {/* Show converted amount */}
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm">
                Total: <Price amount={totalINR} /> (₹) ≈ {convertedAmount}{" "}
                {currency}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                * Exchange rate updated in real-time
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Payment handler
  const handlePayPalPayment = async () => {
    try {
      setProcessing(true);

      // Create PayPal order
      const response = await fetch("/api/payments/paypal/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          currency: currency,
        }),
      });

      const { orderId, approvalUrl } = await response.json();

      // Redirect to PayPal
      window.location.href = approvalUrl;
    } catch (error) {
      toast.error("Failed to initiate PayPal payment");
      setProcessing(false);
    }
  };
  ```

**Task 1.3.5: Success Page Handler**

- **File**: `src/app/checkout/success/page.tsx`
- **Action**: Handle PayPal return

  ```tsx
  useEffect(() => {
    const capturePayPalPayment = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const paypalOrderId = searchParams.get("token");
      const orderId = searchParams.get("orderId");

      if (paypalOrderId && orderId) {
        try {
          await fetch("/api/payments/paypal/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paypalOrderId, orderId }),
          });

          toast.success("Payment successful!");
          router.push(`/orders/${orderId}`);
        } catch (error) {
          toast.error("Payment capture failed");
        }
      }
    };

    capturePayPalPayment();
  }, []);
  ```

**Task 1.3.6: Database Schema**

```typescript
// Update payment_transactions collection
interface PaymentTransaction {
  id: string;
  orderId: string;
  gateway: "razorpay" | "payu" | "paypal" | "cod";
  transactionId: string;
  amount: number;
  currency: string; // NEW: 'INR', 'USD', 'EUR', etc.
  amountInINR?: number; // NEW: Converted amount for reporting
  exchangeRate?: number; // NEW: Rate used for conversion
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  paymentMethod?: string; // 'card', 'netbanking', 'upi', 'paypal', 'wallet'
  payerEmail?: string; // NEW: PayPal payer email
  payerId?: string; // NEW: PayPal payer ID
  metadata?: {
    gatewayOrderId?: string;
    gatewaySignature?: string;
    errorCode?: string;
    errorDescription?: string;
    paypalOrderId?: string; // NEW
    paypalCaptureId?: string; // NEW
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Task 1.3.7: Shop Settings Integration**

- **File**: `src/app/seller/shops/[slug]/settings/page.tsx`
- **Action**: Add international payment toggle

  ```tsx
  <FormField label="Accept International Payments">
    <FormCheckbox
      checked={shopSettings.acceptInternationalPayments}
      onChange={(e) =>
        updateSetting("acceptInternationalPayments", e.target.checked)
      }
      label="Enable PayPal for orders outside India"
    />
  </FormField>;

  {
    shopSettings.acceptInternationalPayments && (
      <>
        <FormField label="Supported Countries">
          <TagInput
            value={shopSettings.internationalCountries || []}
            onChange={(tags) => updateSetting("internationalCountries", tags)}
            placeholder="Enter country code (e.g., US, GB, AU)"
          />
        </FormField>

        <FormField label="International Shipping Markup">
          <FormInput
            type="number"
            value={shopSettings.internationalShippingMarkup || 0}
            onChange={(e) =>
              updateSetting(
                "internationalShippingMarkup",
                parseFloat(e.target.value)
              )
            }
            suffix="%"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Additional percentage added to base shipping cost for international
            orders
          </p>
        </FormField>
      </>
    );
  }
  ```

**Task 1.3.8: Address Validation**

- **File**: `src/lib/validators/address.validator.ts` (CREATE NEW)

  ```typescript
  export function isInternationalAddress(address: Address): boolean {
    return address.country !== "IN" && address.country !== "India";
  }

  export function isPayPalEligibleCountry(countryCode: string): boolean {
    const eligibleCountries = [
      "US",
      "GB",
      "CA",
      "AU",
      "NZ",
      "SG",
      "AE",
      "EU",
      // Add more PayPal-supported countries
    ];
    return eligibleCountries.includes(countryCode);
  }

  export function validateInternationalAddress(address: Address): string[] {
    const errors: string[] = [];

    if (!address.country || address.country.length !== 2) {
      errors.push("Valid 2-letter country code required");
    }

    if (!address.postalCode) {
      errors.push("Postal/ZIP code required for international shipping");
    }

    if (!address.state) {
      errors.push("State/Province required for international shipping");
    }

    return errors;
  }
  ```

**Task 1.3.9: Environment Variables**

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=AXXXXXXxxxxxx
PAYPAL_SECRET_KEY=EXXXXXXxxxxxx
PAYPAL_WEBHOOK_ID=WH-XXXXXXXXXXXXX
PAYPAL_ENVIRONMENT=sandbox # or 'live'
PAYPAL_API_URL=https://api-m.sandbox.paypal.com # or https://api-m.paypal.com

# Currency Conversion API
EXCHANGE_RATE_API_KEY=xxxxx

# Public variables
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AXXXXXXxxxxxx
```

**Task 1.3.10: Admin Dashboard - Payment Analytics**

- **File**: `src/app/admin/analytics/payments/page.tsx`
- **Features**:
  - Payment gateway breakdown (Razorpay vs PayU vs PayPal)
  - Currency-wise revenue (INR, USD, EUR, etc.)
  - International vs domestic payment split
  - Average order value by country
  - PayPal transaction fees analysis
  - Currency conversion loss/gain tracking

---

### 1.4 Third-Party Payment Gateway Integration System

#### Overview

Flexible system allowing admins to enable/configure multiple payment gateways from a centralized settings panel. Supports both pre-built integrations and custom gateway configurations.

#### Current Status

- ❌ No unified gateway management system
- ⚠️ Need extensible architecture for adding new gateways

#### Implementation Tasks

**Task 1.4.1: Payment Gateway Registry**

- **File**: `src/config/payment-gateways.config.ts` (CREATE NEW)
- **Purpose**: Central registry of all supported payment gateways

```typescript
export interface PaymentGatewayConfig {
  id: string;
  name: string;
  displayName: string;
  logo: string;
  description: string;
  type: "domestic" | "international" | "both";
  supportedCurrencies: string[];
  supportedCountries: string[];
  supportedPaymentMethods: string[];
  fees: {
    fixed?: number;
    percentage?: number;
    currency: string;
  };
  features: {
    refunds: boolean;
    partialRefunds: boolean;
    recurring: boolean;
    webhooks: boolean;
    instantSettlement: boolean;
  };
  configFields: PaymentGatewayConfigField[];
  status: "active" | "beta" | "deprecated";
  documentation: string;
}

export interface PaymentGatewayConfigField {
  key: string;
  label: string;
  type: "text" | "password" | "select" | "toggle" | "multiselect";
  required: boolean;
  placeholder?: string;
  description?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
  isSecret?: boolean; // Encrypt in database
}

// Pre-configured gateways
export const PAYMENT_GATEWAYS: Record<string, PaymentGatewayConfig> = {
  razorpay: {
    id: "razorpay",
    name: "Razorpay",
    displayName: "Razorpay",
    logo: "/images/gateways/razorpay.png",
    description:
      "Leading payment gateway in India with UPI, Cards, Netbanking, and Wallets",
    type: "domestic",
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    supportedPaymentMethods: ["card", "upi", "netbanking", "wallet"],
    fees: { percentage: 2, currency: "INR" },
    features: {
      refunds: true,
      partialRefunds: true,
      recurring: true,
      webhooks: true,
      instantSettlement: false,
    },
    configFields: [
      {
        key: "keyId",
        label: "Key ID",
        type: "text",
        required: true,
        placeholder: "rzp_test_xxxxx",
        validation: { pattern: "^rzp_(test|live)_[A-Za-z0-9]+$" },
      },
      {
        key: "keySecret",
        label: "Key Secret",
        type: "password",
        required: true,
        isSecret: true,
      },
      {
        key: "webhookSecret",
        label: "Webhook Secret",
        type: "password",
        required: false,
        isSecret: true,
      },
      {
        key: "autoCapture",
        label: "Auto Capture Payments",
        type: "toggle",
        required: false,
        defaultValue: true,
      },
      {
        key: "paymentMethods",
        label: "Enabled Payment Methods",
        type: "multiselect",
        required: true,
        options: [
          { value: "card", label: "Debit/Credit Cards" },
          { value: "upi", label: "UPI" },
          { value: "netbanking", label: "Net Banking" },
          { value: "wallet", label: "Wallets" },
        ],
        defaultValue: ["card", "upi", "netbanking"],
      },
    ],
    status: "active",
    documentation: "https://razorpay.com/docs/api",
  },

  payu: {
    id: "payu",
    name: "PayU",
    displayName: "PayU India",
    logo: "/images/gateways/payu.png",
    description:
      "Popular payment gateway in India with wide payment method support",
    type: "domestic",
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    supportedPaymentMethods: ["card", "upi", "netbanking", "wallet", "emi"],
    fees: { percentage: 2.5, currency: "INR" },
    features: {
      refunds: true,
      partialRefunds: true,
      recurring: true,
      webhooks: true,
      instantSettlement: false,
    },
    configFields: [
      {
        key: "merchantKey",
        label: "Merchant Key",
        type: "text",
        required: true,
      },
      {
        key: "merchantSalt",
        label: "Merchant Salt",
        type: "password",
        required: true,
        isSecret: true,
      },
      {
        key: "environment",
        label: "Environment",
        type: "select",
        required: true,
        options: [
          { value: "test", label: "Test" },
          { value: "production", label: "Production" },
        ],
        defaultValue: "test",
      },
    ],
    status: "active",
    documentation: "https://docs.payu.in",
  },

  paypal: {
    id: "paypal",
    name: "PayPal",
    displayName: "PayPal",
    logo: "/images/gateways/paypal.png",
    description: "Global payment platform for international transactions",
    type: "international",
    supportedCurrencies: ["USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED"],
    supportedCountries: ["*"], // All countries
    supportedPaymentMethods: ["paypal", "card"],
    fees: { percentage: 3.9, fixed: 0.3, currency: "USD" },
    features: {
      refunds: true,
      partialRefunds: true,
      recurring: true,
      webhooks: true,
      instantSettlement: false,
    },
    configFields: [
      {
        key: "clientId",
        label: "Client ID",
        type: "text",
        required: true,
        placeholder: "AXXXXXXxxxxxx",
      },
      {
        key: "clientSecret",
        label: "Client Secret",
        type: "password",
        required: true,
        isSecret: true,
      },
      {
        key: "webhookId",
        label: "Webhook ID",
        type: "text",
        required: false,
      },
      {
        key: "environment",
        label: "Environment",
        type: "select",
        required: true,
        options: [
          { value: "sandbox", label: "Sandbox" },
          { value: "live", label: "Live" },
        ],
        defaultValue: "sandbox",
      },
    ],
    status: "active",
    documentation: "https://developer.paypal.com/docs",
  },

  stripe: {
    id: "stripe",
    name: "Stripe",
    displayName: "Stripe",
    logo: "/images/gateways/stripe.png",
    description: "Global payment infrastructure for internet businesses",
    type: "both",
    supportedCurrencies: ["INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD"],
    supportedCountries: ["*"],
    supportedPaymentMethods: ["card", "wallet", "bank_transfer", "upi"],
    fees: { percentage: 2.9, fixed: 0.3, currency: "USD" },
    features: {
      refunds: true,
      partialRefunds: true,
      recurring: true,
      webhooks: true,
      instantSettlement: false,
    },
    configFields: [
      {
        key: "publishableKey",
        label: "Publishable Key",
        type: "text",
        required: true,
        placeholder: "pk_test_xxxxx",
      },
      {
        key: "secretKey",
        label: "Secret Key",
        type: "password",
        required: true,
        isSecret: true,
      },
      {
        key: "webhookSecret",
        label: "Webhook Signing Secret",
        type: "password",
        required: false,
        isSecret: true,
      },
    ],
    status: "active",
    documentation: "https://stripe.com/docs/api",
  },

  instamojo: {
    id: "instamojo",
    name: "Instamojo",
    displayName: "Instamojo",
    logo: "/images/gateways/instamojo.png",
    description: "Simple payment gateway for Indian businesses",
    type: "domestic",
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    supportedPaymentMethods: ["card", "upi", "netbanking", "wallet"],
    fees: { percentage: 2, fixed: 3, currency: "INR" },
    features: {
      refunds: true,
      partialRefunds: false,
      recurring: false,
      webhooks: true,
      instantSettlement: false,
    },
    configFields: [
      {
        key: "apiKey",
        label: "API Key",
        type: "text",
        required: true,
      },
      {
        key: "authToken",
        label: "Auth Token",
        type: "password",
        required: true,
        isSecret: true,
      },
      {
        key: "environment",
        label: "Environment",
        type: "select",
        required: true,
        options: [
          { value: "test", label: "Test" },
          { value: "production", label: "Production" },
        ],
        defaultValue: "test",
      },
    ],
    status: "active",
    documentation: "https://docs.instamojo.com",
  },

  ccavenue: {
    id: "ccavenue",
    name: "CCAvenue",
    displayName: "CCAvenue",
    logo: "/images/gateways/ccavenue.png",
    description: "One of India's largest payment gateways",
    type: "domestic",
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    supportedPaymentMethods: ["card", "upi", "netbanking", "wallet"],
    fees: { percentage: 2.5, currency: "INR" },
    features: {
      refunds: true,
      partialRefunds: true,
      recurring: true,
      webhooks: true,
      instantSettlement: false,
    },
    configFields: [
      {
        key: "merchantId",
        label: "Merchant ID",
        type: "text",
        required: true,
      },
      {
        key: "accessCode",
        label: "Access Code",
        type: "text",
        required: true,
      },
      {
        key: "workingKey",
        label: "Working Key",
        type: "password",
        required: true,
        isSecret: true,
      },
    ],
    status: "active",
    documentation: "https://www.ccavenue.com/integration_kit.jsp",
  },

  phonepe: {
    id: "phonepe",
    name: "PhonePe",
    displayName: "PhonePe Payment Gateway",
    logo: "/images/gateways/phonepe.png",
    description: "UPI-focused payment gateway by PhonePe",
    type: "domestic",
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    supportedPaymentMethods: ["upi", "card", "netbanking"],
    fees: { percentage: 1.5, currency: "INR" },
    features: {
      refunds: true,
      partialRefunds: true,
      recurring: false,
      webhooks: true,
      instantSettlement: true,
    },
    configFields: [
      {
        key: "merchantId",
        label: "Merchant ID",
        type: "text",
        required: true,
      },
      {
        key: "saltKey",
        label: "Salt Key",
        type: "password",
        required: true,
        isSecret: true,
      },
      {
        key: "saltIndex",
        label: "Salt Index",
        type: "text",
        required: true,
      },
    ],
    status: "active",
    documentation: "https://developer.phonepe.com/docs",
  },

  cashfree: {
    id: "cashfree",
    name: "Cashfree",
    displayName: "Cashfree Payments",
    logo: "/images/gateways/cashfree.png",
    description: "Payment and banking APIs for India",
    type: "domestic",
    supportedCurrencies: ["INR"],
    supportedCountries: ["IN"],
    supportedPaymentMethods: ["card", "upi", "netbanking", "wallet"],
    fees: { percentage: 1.99, currency: "INR" },
    features: {
      refunds: true,
      partialRefunds: true,
      recurring: true,
      webhooks: true,
      instantSettlement: true,
    },
    configFields: [
      {
        key: "appId",
        label: "App ID",
        type: "text",
        required: true,
      },
      {
        key: "secretKey",
        label: "Secret Key",
        type: "password",
        required: true,
        isSecret: true,
      },
      {
        key: "environment",
        label: "Environment",
        type: "select",
        required: true,
        options: [
          { value: "sandbox", label: "Sandbox" },
          { value: "production", label: "Production" },
        ],
        defaultValue: "sandbox",
      },
    ],
    status: "active",
    documentation: "https://docs.cashfree.com",
  },
};

// Helper functions
export function getGatewayById(id: string): PaymentGatewayConfig | undefined {
  return PAYMENT_GATEWAYS[id];
}

export function getGatewaysByType(
  type: "domestic" | "international" | "both"
): PaymentGatewayConfig[] {
  return Object.values(PAYMENT_GATEWAYS).filter(
    (gateway) => gateway.type === type || gateway.type === "both"
  );
}

export function getGatewaysByCurrency(
  currency: string
): PaymentGatewayConfig[] {
  return Object.values(PAYMENT_GATEWAYS).filter(
    (gateway) =>
      gateway.supportedCurrencies.includes(currency) ||
      gateway.supportedCurrencies.includes("*")
  );
}

export function getGatewaysByCountry(
  countryCode: string
): PaymentGatewayConfig[] {
  return Object.values(PAYMENT_GATEWAYS).filter(
    (gateway) =>
      gateway.supportedCountries.includes(countryCode) ||
      gateway.supportedCountries.includes("*")
  );
}
```

**Task 1.4.2: Admin Gateway Management UI**

- **File**: `src/app/admin/settings/payment-gateways/page.tsx` (CREATE NEW)
- **Purpose**: Central dashboard for managing all payment gateways

```tsx
"use client";

import { useState, useEffect } from "react";
import { useLoadingState } from "@/hooks/useLoadingState";
import { PAYMENT_GATEWAYS } from "@/config/payment-gateways.config";
import {
  FormField,
  FormInput,
  FormSelect,
  FormCheckbox,
} from "@/components/forms";
import { toast } from "react-hot-toast";

export default function PaymentGatewaysSettingsPage() {
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [gatewayConfigs, setGatewayConfigs] = useState<Record<string, any>>({});

  const {
    data: enabledGateways,
    isLoading,
    execute,
  } = useLoadingState<string[]>({
    initialData: [],
  });

  useEffect(() => {
    execute(async () => {
      const response = await fetch("/api/admin/settings/payment-gateways");
      const data = await response.json();
      setGatewayConfigs(data.configs || {});
      return data.enabled || [];
    });
  }, []);

  const handleToggleGateway = async (gatewayId: string, enabled: boolean) => {
    try {
      await fetch("/api/admin/settings/payment-gateways/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatewayId, enabled }),
      });

      toast.success(
        `${PAYMENT_GATEWAYS[gatewayId].displayName} ${
          enabled ? "enabled" : "disabled"
        }`
      );
      execute(async () => {
        const response = await fetch("/api/admin/settings/payment-gateways");
        const data = await response.json();
        return data.enabled || [];
      });
    } catch (error) {
      toast.error("Failed to update gateway status");
    }
  };

  const handleSaveConfig = async (gatewayId: string, config: any) => {
    try {
      await fetch("/api/admin/settings/payment-gateways/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatewayId, config }),
      });

      toast.success("Configuration saved successfully");
      setSelectedGateway(null);
    } catch (error) {
      toast.error("Failed to save configuration");
    }
  };

  const handleTestConnection = async (gatewayId: string) => {
    try {
      const response = await fetch(
        "/api/admin/settings/payment-gateways/test",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gatewayId }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Connection test successful!");
      } else {
        toast.error(`Connection test failed: ${result.error}`);
      }
    } catch (error) {
      toast.error("Connection test failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Gateways
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure and manage payment gateway integrations
          </p>
        </div>

        <button
          onClick={() => setSelectedGateway("custom")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Custom Gateway
        </button>
      </div>

      {/* Gateway Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(PAYMENT_GATEWAYS).map((gateway) => {
          const isEnabled = enabledGateways.includes(gateway.id);
          const isConfigured = gatewayConfigs[gateway.id]?.configured;

          return (
            <div
              key={gateway.id}
              className="border rounded-lg p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              {/* Gateway Logo & Name */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={gateway.logo}
                    alt={gateway.displayName}
                    className="h-10 w-10 object-contain"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {gateway.displayName}
                    </h3>
                    {gateway.status === "beta" && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Beta
                      </span>
                    )}
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) =>
                      handleToggleGateway(gateway.id, e.target.checked)
                    }
                    className="sr-only peer"
                    disabled={!isConfigured}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {gateway.description}
              </p>

              {/* Metadata */}
              <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center justify-between">
                  <span>Type:</span>
                  <span className="font-medium capitalize">{gateway.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Currencies:</span>
                  <span className="font-medium">
                    {gateway.supportedCurrencies.slice(0, 3).join(", ")}
                    {gateway.supportedCurrencies.length > 3 && " +more"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fees:</span>
                  <span className="font-medium">
                    {gateway.fees.percentage}%
                    {gateway.fees.fixed &&
                      ` + ${gateway.fees.fixed} ${gateway.fees.currency}`}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              {!isConfigured && (
                <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ Not configured
                </div>
              )}

              {isConfigured && isEnabled && (
                <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs text-green-800 dark:text-green-200">
                  ✅ Active & Configured
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedGateway(gateway.id)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Configure
                </button>

                {isConfigured && (
                  <button
                    onClick={() => handleTestConnection(gateway.id)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Test
                  </button>
                )}
              </div>

              {/* Documentation Link */}
              <a
                href={gateway.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline text-center"
              >
                View Documentation →
              </a>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {selectedGateway && (
        <GatewayConfigModal
          gatewayId={selectedGateway}
          initialConfig={gatewayConfigs[selectedGateway]}
          onSave={handleSaveConfig}
          onClose={() => setSelectedGateway(null)}
        />
      )}
    </div>
  );
}
```

**Task 1.4.3: Gateway Configuration Modal**

- **Component**: `GatewayConfigModal` (in same file or separate)

```tsx
function GatewayConfigModal({
  gatewayId,
  initialConfig,
  onSave,
  onClose,
}: {
  gatewayId: string;
  initialConfig: any;
  onSave: (gatewayId: string, config: any) => void;
  onClose: () => void;
}) {
  const gateway = PAYMENT_GATEWAYS[gatewayId];
  const [config, setConfig] = useState(initialConfig || {});

  if (!gateway) return null;

  const handleFieldChange = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Configure {gateway.displayName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {gateway.configFields.map((field) => {
            switch (field.type) {
              case "text":
              case "password":
                return (
                  <FormField
                    key={field.key}
                    label={field.label}
                    required={field.required}
                  >
                    <FormInput
                      type={field.type}
                      value={config[field.key] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.key, e.target.value)
                      }
                      placeholder={field.placeholder}
                    />
                    {field.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {field.description}
                      </p>
                    )}
                  </FormField>
                );

              case "select":
                return (
                  <FormField
                    key={field.key}
                    label={field.label}
                    required={field.required}
                  >
                    <FormSelect
                      value={config[field.key] || field.defaultValue}
                      onChange={(e) =>
                        handleFieldChange(field.key, e.target.value)
                      }
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </FormSelect>
                  </FormField>
                );

              case "toggle":
                return (
                  <FormField key={field.key} label={field.label}>
                    <FormCheckbox
                      checked={config[field.key] ?? field.defaultValue}
                      onChange={(e) =>
                        handleFieldChange(field.key, e.target.checked)
                      }
                      label={field.description || ""}
                    />
                  </FormField>
                );

              case "multiselect":
                return (
                  <FormField
                    key={field.key}
                    label={field.label}
                    required={field.required}
                  >
                    <div className="space-y-2">
                      {field.options?.map((option) => (
                        <FormCheckbox
                          key={option.value}
                          checked={(config[field.key] || []).includes(
                            option.value
                          )}
                          onChange={(e) => {
                            const current = config[field.key] || [];
                            const updated = e.target.checked
                              ? [...current, option.value]
                              : current.filter(
                                  (v: string) => v !== option.value
                                );
                            handleFieldChange(field.key, updated);
                          }}
                          label={option.label}
                        />
                      ))}
                    </div>
                  </FormField>
                );

              default:
                return null;
            }
          })}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(gatewayId, config)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Task 1.4.4: Backend API Routes**

- **Create**: `src/app/api/admin/settings/payment-gateways/route.ts` (GET)

```typescript
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settingsDoc = await adminDb
      .collection(COLLECTIONS.SETTINGS)
      .doc("payment-gateways")
      .get();

    const settings = settingsDoc.data() || {
      enabled: [],
      configs: {},
    };

    return NextResponse.json(settings);
  } catch (error) {
    logError(error, { context: "Get payment gateways" });
    return NextResponse.json(
      { error: "Failed to fetch gateways" },
      { status: 500 }
    );
  }
}
```

- **Create**: `src/app/api/admin/settings/payment-gateways/toggle/route.ts` (POST)
- **Create**: `src/app/api/admin/settings/payment-gateways/config/route.ts` (POST)
- **Create**: `src/app/api/admin/settings/payment-gateways/test/route.ts` (POST)

```typescript
// Test gateway connection
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { gatewayId } = await request.json();
    const gateway = PAYMENT_GATEWAYS[gatewayId];

    if (!gateway) {
      return NextResponse.json({ error: "Invalid gateway" }, { status: 400 });
    }

    // Get gateway config
    const configDoc = await adminDb
      .collection(COLLECTIONS.SETTINGS)
      .doc("payment-gateways")
      .get();

    const gatewayConfig = configDoc.data()?.configs?.[gatewayId];

    if (!gatewayConfig) {
      return NextResponse.json(
        { error: "Gateway not configured" },
        { status: 400 }
      );
    }

    // Test connection based on gateway type
    const testResult = await testGatewayConnection(gatewayId, gatewayConfig);

    return NextResponse.json({
      success: testResult.success,
      error: testResult.error,
    });
  } catch (error) {
    logError(error, { context: "Test payment gateway" });
    return NextResponse.json(
      { error: "Connection test failed" },
      { status: 500 }
    );
  }
}

async function testGatewayConnection(
  gatewayId: string,
  config: any
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (gatewayId) {
      case "razorpay":
        // Test Razorpay connection
        const razorpay = new Razorpay({
          key_id: config.keyId,
          key_secret: config.keySecret,
        });
        await razorpay.payments.fetch("dummy"); // This will fail but validates credentials
        return { success: true };

      case "paypal":
        // Test PayPal connection
        const token = await getPayPalAccessToken(config);
        return { success: !!token };

      case "stripe":
        // Test Stripe connection
        const stripe = new Stripe(config.secretKey);
        await stripe.balance.retrieve();
        return { success: true };

      default:
        return { success: false, error: "Gateway test not implemented" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

**Task 1.4.5: Dynamic Checkout Integration**

- **File**: `src/app/checkout/page.tsx`
- **Action**: Dynamically load enabled gateways

```tsx
const [availableGateways, setAvailableGateways] = useState<
  PaymentGatewayConfig[]
>([]);

useEffect(() => {
  const loadGateways = async () => {
    // Determine if order is domestic or international
    const isDomestic = shippingAddress?.country === "IN";
    const currency = isDomestic
      ? "INR"
      : await getCurrencyForCountry(shippingAddress?.country);

    // Fetch enabled gateways
    const response = await fetch("/api/payments/available-gateways", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country: shippingAddress?.country,
        currency,
        amount: totalAmount,
      }),
    });

    const gateways = await response.json();
    setAvailableGateways(gateways);
  };

  if (shippingAddress) {
    loadGateways();
  }
}, [shippingAddress, totalAmount]);

// Render payment options
{
  availableGateways.map((gateway) => (
    <div key={gateway.id} className="border rounded-lg p-4">
      <label className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="radio"
            name="paymentMethod"
            value={gateway.id}
            checked={selectedGateway === gateway.id}
            onChange={() => setSelectedGateway(gateway.id)}
            className="mr-2"
          />
          <img src={gateway.logo} alt={gateway.displayName} className="h-6" />
          <span className="font-medium">{gateway.displayName}</span>
        </div>

        {/* Show supported payment methods */}
        <div className="flex space-x-2">
          {gateway.supportedPaymentMethods.slice(0, 3).map((method) => (
            <span
              key={method}
              className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
            >
              {method.toUpperCase()}
            </span>
          ))}
        </div>
      </label>

      {/* Show fees */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-6">
        Processing fee: {gateway.fees.percentage}%
        {gateway.fees.fixed &&
          ` + ${gateway.fees.fixed} ${gateway.fees.currency}`}
      </p>
    </div>
  ));
}
```

**Task 1.4.6: Gateway Service Abstraction**

- **File**: `src/services/payment-gateway.service.ts` (CREATE NEW)
- **Purpose**: Abstract gateway-specific logic

```typescript
class PaymentGatewayService {
  async createOrder(
    gatewayId: string,
    orderData: {
      amount: number;
      currency: string;
      orderId: string;
      customer: any;
    }
  ): Promise<any> {
    const gateway = PAYMENT_GATEWAYS[gatewayId];

    if (!gateway) {
      throw new Error("Invalid gateway");
    }

    // Route to gateway-specific implementation
    switch (gatewayId) {
      case "razorpay":
        return this.createRazorpayOrder(orderData);
      case "paypal":
        return this.createPayPalOrder(orderData);
      case "stripe":
        return this.createStripeOrder(orderData);
      case "phonepe":
        return this.createPhonePeOrder(orderData);
      case "cashfree":
        return this.createCashfreeOrder(orderData);
      default:
        throw new Error("Gateway not implemented");
    }
  }

  async verifyPayment(gatewayId: string, paymentData: any): Promise<boolean> {
    switch (gatewayId) {
      case "razorpay":
        return this.verifyRazorpayPayment(paymentData);
      case "paypal":
        return this.verifyPayPalPayment(paymentData);
      case "stripe":
        return this.verifyStripePayment(paymentData);
      default:
        throw new Error("Gateway verification not implemented");
    }
  }

  async refundPayment(
    gatewayId: string,
    transactionId: string,
    amount?: number
  ): Promise<void> {
    switch (gatewayId) {
      case "razorpay":
        return this.refundRazorpayPayment(transactionId, amount);
      case "paypal":
        return this.refundPayPalPayment(transactionId, amount);
      case "stripe":
        return this.refundStripePayment(transactionId, amount);
      default:
        throw new Error("Gateway refund not implemented");
    }
  }

  // Gateway-specific implementations
  private async createRazorpayOrder(orderData: any): Promise<any> {
    // Razorpay-specific logic
  }

  private async createPayPalOrder(orderData: any): Promise<any> {
    // PayPal-specific logic
  }

  private async createStripeOrder(orderData: any): Promise<any> {
    // Stripe-specific logic
  }

  private async createPhonePeOrder(orderData: any): Promise<any> {
    // PhonePe-specific logic
  }

  private async createCashfreeOrder(orderData: any): Promise<any> {
    // Cashfree-specific logic
  }

  // Add more gateway-specific methods as needed
}

export const paymentGatewayService = new PaymentGatewayService();
```

**Task 1.4.7: Database Schema**

```typescript
// Collection: settings/payment-gateways
interface PaymentGatewaySettings {
  enabled: string[]; // Array of enabled gateway IDs
  configs: Record<
    string,
    {
      configured: boolean;
      config: Record<string, any>; // Gateway-specific config
      lastTested?: Timestamp;
      lastTestResult?: {
        success: boolean;
        error?: string;
      };
    }
  >;
  updatedAt: Timestamp;
  updatedBy: string;
}
```

**Task 1.4.8: Environment Variables**

```env
# All gateway credentials stored in database (encrypted)
# Only non-secret public keys in .env

NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AXXXXXXxxxxxx

# Encryption key for storing gateway secrets
GATEWAY_SECRETS_ENCRYPTION_KEY=xxxxx
```

**Task 1.4.9: Gateway Selection Logic**

- **File**: `src/lib/payment-gateway-selector.ts` (CREATE NEW)

```typescript
export async function selectBestGateway(criteria: {
  country: string;
  currency: string;
  amount: number;
  paymentMethod?: string;
}): Promise<PaymentGatewayConfig | null> {
  // Get enabled gateways from settings
  const response = await fetch("/api/admin/settings/payment-gateways");
  const settings = await response.json();
  const enabledGatewayIds = settings.enabled || [];

  // Filter gateways based on criteria
  const availableGateways = enabledGatewayIds
    .map((id: string) => PAYMENT_GATEWAYS[id])
    .filter((gateway: PaymentGatewayConfig) => {
      // Check country support
      if (
        !gateway.supportedCountries.includes("*") &&
        !gateway.supportedCountries.includes(criteria.country)
      ) {
        return false;
      }

      // Check currency support
      if (!gateway.supportedCurrencies.includes(criteria.currency)) {
        return false;
      }

      // Check payment method support
      if (
        criteria.paymentMethod &&
        !gateway.supportedPaymentMethods.includes(criteria.paymentMethod)
      ) {
        return false;
      }

      return true;
    });

  if (availableGateways.length === 0) {
    return null;
  }

  // Sort by fees (lowest first)
  availableGateways.sort((a, b) => {
    const feeA = calculateFee(a, criteria.amount);
    const feeB = calculateFee(b, criteria.amount);
    return feeA - feeB;
  });

  // Return gateway with lowest fees
  return availableGateways[0];
}

function calculateFee(gateway: PaymentGatewayConfig, amount: number): number {
  const percentageFee = (amount * (gateway.fees.percentage || 0)) / 100;
  const fixedFee = gateway.fees.fixed || 0;
  return percentageFee + fixedFee;
}
```

---

## 1.5 Address API Integration (Third-Party)

#### Overview

Integration with third-party address APIs for dynamic country, state, and city loading based on user input (pincode/zip code). Supports both Indian and international addresses with automatic data population.

#### Current Status

- ❌ No address API integration
- ⚠️ Static country/state dropdowns
- ⚠️ No address validation

#### Implementation Tasks

**Task 1.5.1: Address API Configuration**

- **File**: `src/config/address-api.config.ts` (CREATE NEW)

```typescript
export interface AddressAPIProvider {
  id: string;
  name: string;
  type: "india" | "international" | "both";
  endpoints: {
    countries?: string;
    states?: string;
    cities?: string;
    postalLookup?: string;
    validateAddress?: string;
  };
  apiKey?: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  features: {
    postalCodeLookup: boolean;
    reverseGeocode: boolean;
    addressValidation: boolean;
    autoComplete: boolean;
  };
}

export const ADDRESS_API_PROVIDERS: Record<string, AddressAPIProvider> = {
  // For Indian Addresses
  postalpincode: {
    id: "postalpincode",
    name: "Postal Pincode API",
    type: "india",
    endpoints: {
      postalLookup: "https://api.postalpincode.in/pincode/{pincode}",
    },
    features: {
      postalCodeLookup: true,
      reverseGeocode: false,
      addressValidation: false,
      autoComplete: false,
    },
  },

  indiapost: {
    id: "indiapost",
    name: "India Post PIN Code API",
    type: "india",
    endpoints: {
      postalLookup:
        "https://api.data.gov.in/resource/6176ee09-3d56-4a3b-8115-21841576b2f6",
    },
    apiKey: process.env.INDIA_POST_API_KEY,
    features: {
      postalCodeLookup: true,
      reverseGeocode: false,
      addressValidation: false,
      autoComplete: false,
    },
  },

  // For International Addresses
  zippopotamus: {
    id: "zippopotamus",
    name: "Zippopotam.us",
    type: "international",
    endpoints: {
      postalLookup: "https://api.zippopotam.us/{countryCode}/{postalCode}",
    },
    features: {
      postalCodeLookup: true,
      reverseGeocode: false,
      addressValidation: false,
      autoComplete: false,
    },
  },

  googleplaces: {
    id: "googleplaces",
    name: "Google Places API",
    type: "both",
    endpoints: {
      postalLookup: "https://maps.googleapis.com/maps/api/geocode/json",
      autoComplete:
        "https://maps.googleapis.com/maps/api/place/autocomplete/json",
      validateAddress:
        "https://addressvalidation.googleapis.com/v1:validateAddress",
    },
    apiKey: process.env.GOOGLE_PLACES_API_KEY,
    rateLimit: {
      requestsPerMinute: 100,
      requestsPerDay: 25000,
    },
    features: {
      postalCodeLookup: true,
      reverseGeocode: true,
      addressValidation: true,
      autoComplete: true,
    },
  },

  positionstack: {
    id: "positionstack",
    name: "PositionStack",
    type: "both",
    endpoints: {
      postalLookup: "http://api.positionstack.com/v1/forward",
      reverseGeocode: "http://api.positionstack.com/v1/reverse",
    },
    apiKey: process.env.POSITIONSTACK_API_KEY,
    rateLimit: {
      requestsPerMinute: 100,
      requestsPerDay: 25000,
    },
    features: {
      postalCodeLookup: true,
      reverseGeocode: true,
      addressValidation: false,
      autoComplete: false,
    },
  },

  geonames: {
    id: "geonames",
    name: "GeoNames",
    type: "international",
    endpoints: {
      countries: "http://api.geonames.org/countryInfoJSON",
      states: "http://api.geonames.org/childrenJSON",
      cities: "http://api.geonames.org/searchJSON",
      postalLookup: "http://api.geonames.org/postalCodeLookupJSON",
    },
    apiKey: process.env.GEONAMES_USERNAME,
    features: {
      postalCodeLookup: true,
      reverseGeocode: true,
      addressValidation: false,
      autoComplete: true,
    },
  },

  restcountries: {
    id: "restcountries",
    name: "REST Countries",
    type: "international",
    endpoints: {
      countries: "https://restcountries.com/v3.1/all",
    },
    features: {
      postalCodeLookup: false,
      reverseGeocode: false,
      addressValidation: false,
      autoComplete: false,
    },
  },
};

export interface CountryData {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  currency: string;
  phoneCode: string;
  postalCodeFormat?: RegExp;
  postalCodeExample?: string;
}

export interface StateData {
  code: string;
  name: string;
  countryCode: string;
}

export interface CityData {
  name: string;
  stateCode: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
}

export interface PostalLookupResult {
  postalCode: string;
  country: string;
  countryCode: string;
  state: string;
  stateCode?: string;
  city: string;
  district?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}
```

**Task 1.5.2: Address Service**

- **File**: `src/services/address.service.ts` (CREATE NEW)

```typescript
import {
  ADDRESS_API_PROVIDERS,
  PostalLookupResult,
  CountryData,
  StateData,
} from "@/config/address-api.config";
import { logError } from "@/lib/firebase-error-logger";

class AddressService {
  private cache: Map<string, any> = new Map();
  private cacheDuration = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Lookup address details by postal/pin code
   */
  async lookupByPostalCode(
    postalCode: string,
    countryCode: string = "IN"
  ): Promise<PostalLookupResult | null> {
    const cacheKey = `postal:${countryCode}:${postalCode}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }

    try {
      let result: PostalLookupResult | null = null;

      if (countryCode === "IN") {
        // Use Indian-specific APIs
        result = await this.lookupIndianPincode(postalCode);
      } else {
        // Use international APIs
        result = await this.lookupInternationalPostalCode(
          postalCode,
          countryCode
        );
      }

      // Cache result
      if (result) {
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      }

      return result;
    } catch (error) {
      logError(error, {
        context: "Address lookup by postal code",
        postalCode,
        countryCode,
      });
      return null;
    }
  }

  /**
   * Lookup Indian PIN code
   */
  private async lookupIndianPincode(
    pincode: string
  ): Promise<PostalLookupResult | null> {
    try {
      // Try Postal Pincode API first (free, no API key required)
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();

      if (data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];

        return {
          postalCode: pincode,
          country: "India",
          countryCode: "IN",
          state: postOffice.State,
          stateCode: this.getIndianStateCode(postOffice.State),
          city: postOffice.District,
          district: postOffice.District,
          area: postOffice.Name,
        };
      }

      // Fallback to India Post API if available
      if (process.env.INDIA_POST_API_KEY) {
        return await this.lookupIndiaPostAPI(pincode);
      }

      return null;
    } catch (error) {
      logError(error, { context: "Indian pincode lookup", pincode });
      return null;
    }
  }

  /**
   * Lookup international postal code
   */
  private async lookupInternationalPostalCode(
    postalCode: string,
    countryCode: string
  ): Promise<PostalLookupResult | null> {
    try {
      // Try Zippopotam.us first (free, no API key required)
      const response = await fetch(
        `https://api.zippopotam.us/${countryCode}/${postalCode}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.places?.length > 0) {
          const place = data.places[0];

          return {
            postalCode: postalCode,
            country: data.country,
            countryCode: data["country abbreviation"],
            state: place.state,
            stateCode: place["state abbreviation"],
            city: place["place name"],
            latitude: parseFloat(place.latitude),
            longitude: parseFloat(place.longitude),
          };
        }
      }

      // Fallback to Google Places API if available
      if (process.env.GOOGLE_PLACES_API_KEY) {
        return await this.lookupGooglePlaces(postalCode, countryCode);
      }

      // Fallback to GeoNames API if available
      if (process.env.GEONAMES_USERNAME) {
        return await this.lookupGeoNames(postalCode, countryCode);
      }

      return null;
    } catch (error) {
      logError(error, {
        context: "International postal code lookup",
        postalCode,
        countryCode,
      });
      return null;
    }
  }

  /**
   * Get all countries
   */
  async getCountries(): Promise<CountryData[]> {
    const cacheKey = "countries:all";

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }

    try {
      // Use REST Countries API (free, no API key)
      const response = await fetch("https://restcountries.com/v3.1/all");
      const data = await response.json();

      const countries: CountryData[] = data
        .map((country: any) => ({
          code: country.cca2,
          name: country.name.common,
          currency: Object.keys(country.currencies || {})[0] || "USD",
          phoneCode: country.idd.root + (country.idd.suffixes?.[0] || ""),
        }))
        .sort((a: CountryData, b: CountryData) => a.name.localeCompare(b.name));

      // Cache result
      this.cache.set(cacheKey, { data: countries, timestamp: Date.now() });

      return countries;
    } catch (error) {
      logError(error, { context: "Get countries" });
      // Return fallback minimal list
      return this.getFallbackCountries();
    }
  }

  /**
   * Get states for a country
   */
  async getStates(countryCode: string): Promise<StateData[]> {
    const cacheKey = `states:${countryCode}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }

    try {
      let states: StateData[] = [];

      if (countryCode === "IN") {
        // Return Indian states
        states = this.getIndianStates();
      } else if (countryCode === "US") {
        // Return US states
        states = this.getUSStates();
      } else if (process.env.GEONAMES_USERNAME) {
        // Use GeoNames API for other countries
        states = await this.getGeoNamesStates(countryCode);
      }

      // Cache result
      this.cache.set(cacheKey, { data: states, timestamp: Date.now() });

      return states;
    } catch (error) {
      logError(error, { context: "Get states", countryCode });
      return [];
    }
  }

  /**
   * Validate address
   */
  async validateAddress(address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }): Promise<{ valid: boolean; suggestions?: any[] }> {
    try {
      // Use Google Address Validation API if available
      if (process.env.GOOGLE_PLACES_API_KEY) {
        return await this.validateGoogleAddress(address);
      }

      // Fallback to basic postal code validation
      const result = await this.lookupByPostalCode(
        address.postalCode,
        address.country
      );

      if (!result) {
        return { valid: false };
      }

      // Check if city and state match
      const cityMatch =
        result.city.toLowerCase() === address.city.toLowerCase();
      const stateMatch =
        result.state.toLowerCase() === address.state.toLowerCase();

      return { valid: cityMatch && stateMatch };
    } catch (error) {
      logError(error, { context: "Validate address", address });
      return { valid: false };
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAddressSuggestions(
    query: string,
    countryCode?: string
  ): Promise<any[]> {
    try {
      if (process.env.GOOGLE_PLACES_API_KEY) {
        return await this.getGooglePlacesAutocomplete(query, countryCode);
      }

      return [];
    } catch (error) {
      logError(error, { context: "Get address suggestions", query });
      return [];
    }
  }

  // Helper methods
  private getIndianStateCode(stateName: string): string {
    const stateCodeMap: Record<string, string> = {
      "Andhra Pradesh": "AP",
      "Arunachal Pradesh": "AR",
      Assam: "AS",
      Bihar: "BR",
      Chhattisgarh: "CG",
      Goa: "GA",
      Gujarat: "GJ",
      Haryana: "HR",
      "Himachal Pradesh": "HP",
      Jharkhand: "JH",
      Karnataka: "KA",
      Kerala: "KL",
      "Madhya Pradesh": "MP",
      Maharashtra: "MH",
      Manipur: "MN",
      Meghalaya: "ML",
      Mizoram: "MZ",
      Nagaland: "NL",
      Odisha: "OR",
      Punjab: "PB",
      Rajasthan: "RJ",
      Sikkim: "SK",
      "Tamil Nadu": "TN",
      Telangana: "TG",
      Tripura: "TR",
      "Uttar Pradesh": "UP",
      Uttarakhand: "UK",
      "West Bengal": "WB",
      Delhi: "DL",
    };

    return stateCodeMap[stateName] || "";
  }

  private getIndianStates(): StateData[] {
    return [
      { code: "AP", name: "Andhra Pradesh", countryCode: "IN" },
      { code: "AR", name: "Arunachal Pradesh", countryCode: "IN" },
      { code: "AS", name: "Assam", countryCode: "IN" },
      { code: "BR", name: "Bihar", countryCode: "IN" },
      { code: "CG", name: "Chhattisgarh", countryCode: "IN" },
      { code: "GA", name: "Goa", countryCode: "IN" },
      { code: "GJ", name: "Gujarat", countryCode: "IN" },
      { code: "HR", name: "Haryana", countryCode: "IN" },
      { code: "HP", name: "Himachal Pradesh", countryCode: "IN" },
      { code: "JH", name: "Jharkhand", countryCode: "IN" },
      { code: "KA", name: "Karnataka", countryCode: "IN" },
      { code: "KL", name: "Kerala", countryCode: "IN" },
      { code: "MP", name: "Madhya Pradesh", countryCode: "IN" },
      { code: "MH", name: "Maharashtra", countryCode: "IN" },
      { code: "MN", name: "Manipur", countryCode: "IN" },
      { code: "ML", name: "Meghalaya", countryCode: "IN" },
      { code: "MZ", name: "Mizoram", countryCode: "IN" },
      { code: "NL", name: "Nagaland", countryCode: "IN" },
      { code: "OR", name: "Odisha", countryCode: "IN" },
      { code: "PB", name: "Punjab", countryCode: "IN" },
      { code: "RJ", name: "Rajasthan", countryCode: "IN" },
      { code: "SK", name: "Sikkim", countryCode: "IN" },
      { code: "TN", name: "Tamil Nadu", countryCode: "IN" },
      { code: "TG", name: "Telangana", countryCode: "IN" },
      { code: "TR", name: "Tripura", countryCode: "IN" },
      { code: "UP", name: "Uttar Pradesh", countryCode: "IN" },
      { code: "UK", name: "Uttarakhand", countryCode: "IN" },
      { code: "WB", name: "West Bengal", countryCode: "IN" },
      { code: "DL", name: "Delhi", countryCode: "IN" },
      { code: "AN", name: "Andaman and Nicobar Islands", countryCode: "IN" },
      { code: "CH", name: "Chandigarh", countryCode: "IN" },
      {
        code: "DN",
        name: "Dadra and Nagar Haveli and Daman and Diu",
        countryCode: "IN",
      },
      { code: "JK", name: "Jammu and Kashmir", countryCode: "IN" },
      { code: "LA", name: "Ladakh", countryCode: "IN" },
      { code: "LD", name: "Lakshadweep", countryCode: "IN" },
      { code: "PY", name: "Puducherry", countryCode: "IN" },
    ];
  }

  private getUSStates(): StateData[] {
    return [
      { code: "AL", name: "Alabama", countryCode: "US" },
      { code: "AK", name: "Alaska", countryCode: "US" },
      { code: "AZ", name: "Arizona", countryCode: "US" },
      { code: "AR", name: "Arkansas", countryCode: "US" },
      { code: "CA", name: "California", countryCode: "US" },
      { code: "CO", name: "Colorado", countryCode: "US" },
      { code: "CT", name: "Connecticut", countryCode: "US" },
      { code: "DE", name: "Delaware", countryCode: "US" },
      { code: "FL", name: "Florida", countryCode: "US" },
      { code: "GA", name: "Georgia", countryCode: "US" },
      // ... add all US states
    ];
  }

  private getFallbackCountries(): CountryData[] {
    return [
      { code: "IN", name: "India", currency: "INR", phoneCode: "+91" },
      { code: "US", name: "United States", currency: "USD", phoneCode: "+1" },
      { code: "GB", name: "United Kingdom", currency: "GBP", phoneCode: "+44" },
      { code: "CA", name: "Canada", currency: "CAD", phoneCode: "+1" },
      { code: "AU", name: "Australia", currency: "AUD", phoneCode: "+61" },
      // Add more common countries
    ];
  }

  // Google Places API methods
  private async lookupGooglePlaces(
    postalCode: string,
    countryCode: string
  ): Promise<PostalLookupResult | null> {
    // Implementation for Google Places API
    return null;
  }

  private async validateGoogleAddress(
    address: any
  ): Promise<{ valid: boolean; suggestions?: any[] }> {
    // Implementation for Google Address Validation API
    return { valid: false };
  }

  private async getGooglePlacesAutocomplete(
    query: string,
    countryCode?: string
  ): Promise<any[]> {
    // Implementation for Google Places Autocomplete API
    return [];
  }

  // GeoNames API methods
  private async lookupGeoNames(
    postalCode: string,
    countryCode: string
  ): Promise<PostalLookupResult | null> {
    // Implementation for GeoNames API
    return null;
  }

  private async getGeoNamesStates(countryCode: string): Promise<StateData[]> {
    // Implementation for GeoNames API
    return [];
  }

  // India Post API method
  private async lookupIndiaPostAPI(
    pincode: string
  ): Promise<PostalLookupResult | null> {
    // Implementation for India Post API
    return null;
  }
}

export const addressService = new AddressService();
```

**Task 1.5.3: API Routes**

- **Create**: `src/app/api/address/lookup/route.ts` (POST)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { addressService } from "@/services/address.service";
import { logError } from "@/lib/firebase-error-logger";

export async function POST(request: NextRequest) {
  try {
    const { postalCode, countryCode } = await request.json();

    if (!postalCode) {
      return NextResponse.json(
        { error: "Postal code required" },
        { status: 400 }
      );
    }

    const result = await addressService.lookupByPostalCode(
      postalCode,
      countryCode || "IN"
    );

    if (!result) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logError(error, { context: "Address lookup API" });
    return NextResponse.json(
      { error: "Failed to lookup address" },
      { status: 500 }
    );
  }
}
```

- **Create**: `src/app/api/address/countries/route.ts` (GET)
- **Create**: `src/app/api/address/states/[countryCode]/route.ts` (GET)
- **Create**: `src/app/api/address/validate/route.ts` (POST)
- **Create**: `src/app/api/address/autocomplete/route.ts` (POST)

**Task 1.5.4: Address Input Component**

- **File**: `src/components/forms/AddressInput.tsx` (CREATE NEW)

```tsx
"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { FormField, FormInput, FormSelect } from "@/components/forms";
import { addressService } from "@/services/address.service";
import type {
  CountryData,
  StateData,
  PostalLookupResult,
} from "@/config/address-api.config";

interface AddressInputProps {
  value: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    stateCode?: string;
    postalCode: string;
    country: string;
    countryCode: string;
  };
  onChange: (address: any) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function AddressInput({
  value,
  onChange,
  errors,
  disabled,
}: AddressInputProps) {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [states, setStates] = useState<StateData[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [lookingUpPostal, setLookingUpPostal] = useState(false);

  const debouncedPostalCode = useDebounce(value.postalCode, 500);

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      const countriesList = await addressService.getCountries();
      setCountries(countriesList);
    };
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    const loadStates = async () => {
      if (!value.countryCode) return;

      setLoadingStates(true);
      const statesList = await addressService.getStates(value.countryCode);
      setStates(statesList);
      setLoadingStates(false);
    };

    loadStates();
  }, [value.countryCode]);

  // Lookup address by postal code
  useEffect(() => {
    const lookupPostalCode = async () => {
      if (!debouncedPostalCode || debouncedPostalCode.length < 3) return;

      setLookingUpPostal(true);

      try {
        const result = await fetch("/api/address/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postalCode: debouncedPostalCode,
            countryCode: value.countryCode,
          }),
        });

        if (result.ok) {
          const data: PostalLookupResult = await result.json();

          // Auto-fill city and state
          onChange({
            ...value,
            city: data.city,
            state: data.state,
            stateCode: data.stateCode,
            country: data.country,
            countryCode: data.countryCode,
          });

          // Load states if not already loaded
          if (!states.length) {
            const statesList = await addressService.getStates(data.countryCode);
            setStates(statesList);
          }
        }
      } catch (error) {
        console.error("Failed to lookup postal code:", error);
      } finally {
        setLookingUpPostal(false);
      }
    };

    lookupPostalCode();
  }, [debouncedPostalCode]);

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);

    onChange({
      ...value,
      countryCode,
      country: country?.name || "",
      state: "",
      stateCode: "",
      city: "",
    });
  };

  return (
    <div className="space-y-4">
      {/* Country */}
      <FormField label="Country" required error={errors?.country}>
        <FormSelect
          value={value.countryCode}
          onChange={(e) => handleCountryChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </FormSelect>
      </FormField>

      {/* Postal Code (PIN Code) */}
      <FormField
        label={value.countryCode === "IN" ? "PIN Code" : "Postal Code"}
        required
        error={errors?.postalCode}
      >
        <FormInput
          type="text"
          value={value.postalCode}
          onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
          placeholder={value.countryCode === "IN" ? "110001" : ""}
          disabled={disabled || !value.countryCode}
          suffix={lookingUpPostal ? "🔄" : undefined}
        />
        {!value.countryCode && (
          <p className="text-xs text-gray-500 mt-1">Select country first</p>
        )}
        {lookingUpPostal && (
          <p className="text-xs text-blue-600 mt-1">Looking up address...</p>
        )}
      </FormField>

      {/* State - Only shown after country or postal code is entered */}
      {(value.countryCode || value.postalCode) && (
        <FormField label="State / Province" required error={errors?.state}>
          {loadingStates ? (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="animate-spin">⚙️</span>
              <span>Loading states...</span>
            </div>
          ) : states.length > 0 ? (
            <FormSelect
              value={value.stateCode || value.state}
              onChange={(e) => {
                const selectedState = states.find(
                  (s) => s.code === e.target.value || s.name === e.target.value
                );
                onChange({
                  ...value,
                  state: selectedState?.name || e.target.value,
                  stateCode: selectedState?.code,
                });
              }}
              disabled={disabled}
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </FormSelect>
          ) : (
            <FormInput
              type="text"
              value={value.state}
              onChange={(e) => onChange({ ...value, state: e.target.value })}
              placeholder="Enter state"
              disabled={disabled}
            />
          )}
        </FormField>
      )}

      {/* City */}
      <FormField label="City" required error={errors?.city}>
        <FormInput
          type="text"
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
          placeholder="Enter city"
          disabled={disabled || !value.countryCode}
        />
      </FormField>

      {/* Address Line 1 */}
      <FormField label="Address Line 1" required error={errors?.line1}>
        <FormInput
          type="text"
          value={value.line1}
          onChange={(e) => onChange({ ...value, line1: e.target.value })}
          placeholder="House No., Building Name"
          disabled={disabled}
        />
      </FormField>

      {/* Address Line 2 */}
      <FormField label="Address Line 2 (Optional)" error={errors?.line2}>
        <FormInput
          type="text"
          value={value.line2 || ""}
          onChange={(e) => onChange({ ...value, line2: e.target.value })}
          placeholder="Road Name, Area, Landmark"
          disabled={disabled}
        />
      </FormField>
    </div>
  );
}
```

**Task 1.5.5: Admin Settings for Address API**

- **File**: `src/app/admin/settings/address-api/page.tsx` (CREATE NEW)

```tsx
"use client";

import { useState, useEffect } from "react";
import { ADDRESS_API_PROVIDERS } from "@/config/address-api.config";
import {
  FormField,
  FormInput,
  FormSelect,
  FormCheckbox,
} from "@/components/forms";
import { toast } from "react-hot-toast";

export default function AddressAPISettingsPage() {
  const [settings, setSettings] = useState({
    primaryProvider: "postalpincode",
    fallbackProvider: "zippopotamus",
    enableAutoLookup: true,
    enableValidation: false,
    enableAutocomplete: false,
  });

  const handleSave = async () => {
    try {
      await fetch("/api/admin/settings/address-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      toast.success("Address API settings saved");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Address API Configuration</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <FormField label="Primary Provider (India)">
          <FormSelect
            value={settings.primaryProvider}
            onChange={(e) =>
              setSettings({ ...settings, primaryProvider: e.target.value })
            }
          >
            {Object.values(ADDRESS_API_PROVIDERS)
              .filter((p) => p.type === "india" || p.type === "both")
              .map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
          </FormSelect>
        </FormField>

        <FormField label="Fallback Provider (International)">
          <FormSelect
            value={settings.fallbackProvider}
            onChange={(e) =>
              setSettings({ ...settings, fallbackProvider: e.target.value })
            }
          >
            {Object.values(ADDRESS_API_PROVIDERS)
              .filter((p) => p.type === "international" || p.type === "both")
              .map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
          </FormSelect>
        </FormField>

        <FormField label="Features">
          <FormCheckbox
            checked={settings.enableAutoLookup}
            onChange={(e) =>
              setSettings({ ...settings, enableAutoLookup: e.target.checked })
            }
            label="Enable automatic address lookup by postal code"
          />
          <FormCheckbox
            checked={settings.enableValidation}
            onChange={(e) =>
              setSettings({ ...settings, enableValidation: e.target.checked })
            }
            label="Enable address validation"
          />
          <FormCheckbox
            checked={settings.enableAutocomplete}
            onChange={(e) =>
              setSettings({ ...settings, enableAutocomplete: e.target.checked })
            }
            label="Enable address autocomplete suggestions"
          />
        </FormField>

        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
```

**Task 1.5.6: Environment Variables**

```env
# Address API Keys (optional, free tiers available)
GOOGLE_PLACES_API_KEY=xxxxx
GEONAMES_USERNAME=xxxxx
POSITIONSTACK_API_KEY=xxxxx
INDIA_POST_API_KEY=xxxxx

# Cache settings
ADDRESS_CACHE_DURATION=86400000 # 24 hours in milliseconds
```

**Task 1.5.7: Usage in Checkout/Profile**

- **File**: `src/app/checkout/page.tsx`
- **Action**: Replace manual address fields with `AddressInput` component

```tsx
import { AddressInput } from "@/components/forms/AddressInput";

const [shippingAddress, setShippingAddress] = useState({
  line1: "",
  line2: "",
  city: "",
  state: "",
  stateCode: "",
  postalCode: "",
  country: "",
  countryCode: "IN", // Default to India
});

<AddressInput
  value={shippingAddress}
  onChange={setShippingAddress}
  errors={addressErrors}
/>;
```

---

## 2. Shipping Integration (Shiprocket)

### Current Status

- ⚠️ Demo data generation has mock Shiprocket IDs
- ❌ No actual integration

### Implementation Tasks

**Task 2.1: Admin Settings UI**

- **File**: `src/app/admin/settings/shipping/page.tsx`
- **Action**: Add Shiprocket configuration section
- **Fields**:
  ```tsx
  - Shiprocket API Token
  - Shiprocket Email
  - Pickup Address Configuration
  - Default Courier Selection
  - Auto-fulfill Toggle
  - Weight Slabs Configuration
  - Shipping Rate Calculator
  ```

**Task 2.2: Backend Service**

- **File**: `src/services/shiprocket.service.ts` (CREATE NEW)
- **Methods**:

  ```typescript
  class ShiprocketService {
    // Authentication
    authenticate(): Promise<string>; // Returns auth token

    // Orders
    createOrder(orderData: ShiprocketOrderRequest): Promise<ShiprocketOrder>;
    cancelOrder(orderId: string): Promise<void>;

    // Shipments
    generateAWB(shipmentId: string, courierId: string): Promise<string>;
    createPickup(shipmentId: string): Promise<ShiprocketPickup>;
    trackShipment(awbCode: string): Promise<ShiprocketTracking>;

    // Couriers
    getAvailableCouriers(
      deliveryPostcode: string,
      weight: number
    ): Promise<Courier[]>;
    checkServiceability(
      pickupPostcode: string,
      deliveryPostcode: string
    ): Promise<boolean>;

    // Labels & Documents
    generateLabel(shipmentId: string): Promise<string>; // PDF URL
    generateManifest(shipmentIds: string[]): Promise<string>; // PDF URL
    generateInvoice(orderId: string): Promise<string>; // PDF URL
  }
  ```

**Task 2.3: API Routes**

- **Create**: `src/app/api/shipping/shiprocket/order/route.ts` (POST)
- **Create**: `src/app/api/shipping/shiprocket/track/[awb]/route.ts` (GET)
- **Create**: `src/app/api/shipping/shiprocket/couriers/route.ts` (POST)
- **Create**: `src/app/api/shipping/shiprocket/webhook/route.ts` (POST)

**Task 2.4: Seller Dashboard Integration**

- **File**: `src/app/seller/orders/[id]/page.tsx`
- **Action**: Add shipping workflow
- **Features**:
  - Generate AWB button
  - Select courier dropdown
  - Schedule pickup
  - Print shipping label
  - Track shipment (real-time)

**Task 2.5: Database Schema**

```typescript
// Collection: shipments
interface Shipment {
  id: string;
  orderId: string;
  sellerId: string;
  shopId: string;

  // Shiprocket data
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  awbCode?: string;
  courierId?: string;
  courierName?: string;

  // Status
  status:
    | "pending"
    | "awb_generated"
    | "pickup_scheduled"
    | "in_transit"
    | "delivered"
    | "cancelled";

  // Tracking
  trackingUrl?: string;
  currentLocation?: string;
  estimatedDelivery?: Timestamp;

  // Documents
  labelUrl?: string;
  manifestUrl?: string;
  invoiceUrl?: string;

  // Dimensions & Weight
  weight: number; // kg
  dimensions: { length: number; width: number; height: number }; // cm

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Task 2.6: Environment Variables**

```env
SHIPROCKET_EMAIL=your-email@example.com
SHIPROCKET_PASSWORD=xxxxx
SHIPROCKET_API_URL=https://apiv2.shiprocket.in/v1
```

---

## 3. WhatsApp Integration

### Current Status

- ⚠️ Basic WhatsApp link utility exists in `location.service.ts`
- ❌ No messaging or group integration

### Implementation Tasks

**Task 3.1: WhatsApp Business API Setup**

- **Provider Options**:
  - Twilio WhatsApp API
  - MessageBird WhatsApp API
  - Meta WhatsApp Business API
  - Gupshup WhatsApp API (India-focused)

**Task 3.2: Admin Settings UI**

- **File**: `src/app/admin/settings/whatsapp/page.tsx` (CREATE NEW)
- **Fields**:
  ```tsx
  - WhatsApp Provider Selection
  - API Credentials
  - Phone Number ID
  - Message Templates Management
  - Group Configuration
  - Notification Settings
    - New Event Notifications
    - Sale Notifications
    - Restock Alerts
    - Purchase Confirmations
  ```

**Task 3.3: Backend Service**

- **File**: `src/services/whatsapp.service.ts` (CREATE NEW)
- **Methods**:

  ```typescript
  class WhatsAppService {
    // Direct Messages
    sendMessage(to: string, message: string): Promise<void>;
    sendTemplate(
      to: string,
      templateName: string,
      params: Record<string, string>
    ): Promise<void>;
    sendMedia(to: string, mediaUrl: string, caption?: string): Promise<void>;

    // Group Messages
    sendGroupMessage(groupId: string, message: string): Promise<void>;
    createGroup(name: string, participants: string[]): Promise<string>;
    addToGroup(groupId: string, participants: string[]): Promise<void>;

    // Event-based Notifications
    notifyNewEvent(eventData: Event, subscribers: string[]): Promise<void>;
    notifySale(saleData: Sale, subscribers: string[]): Promise<void>;
    notifyRestock(productData: Product, subscribers: string[]): Promise<void>;
    notifyPurchase(
      orderData: Order,
      buyerPhone: string,
      sellerPhone: string
    ): Promise<void>;

    // Subscriptions
    subscribeToNotifications(
      userId: string,
      phone: string,
      types: NotificationType[]
    ): Promise<void>;
    unsubscribeFromNotifications(
      userId: string,
      types: NotificationType[]
    ): Promise<void>;
  }
  ```

**Task 3.4: Message Templates**

- **File**: `src/constants/whatsapp-templates.ts` (CREATE NEW)

```typescript
export const WHATSAPP_TEMPLATES = {
  NEW_EVENT: {
    name: "new_event_notification",
    template:
      "New event starting soon! {{eventName}} on {{date}}. Check it out: {{link}}",
  },
  SALE: {
    name: "sale_notification",
    template:
      "🎉 SALE ALERT! {{discountPercent}}% off on {{categoryName}}. Shop now: {{link}}",
  },
  RESTOCK: {
    name: "restock_notification",
    template:
      "✅ Back in stock: {{productName}}! Order now before it sells out: {{link}}",
  },
  ORDER_PLACED: {
    name: "order_confirmation",
    template:
      "Order #{{orderId}} confirmed! Your items will be delivered by {{deliveryDate}}. Track: {{trackingLink}}",
  },
  ORDER_SHIPPED: {
    name: "order_shipped",
    template:
      "Your order #{{orderId}} has been shipped! Track: {{trackingLink}}",
  },
  ORDER_DELIVERED: {
    name: "order_delivered",
    template:
      "Order #{{orderId}} delivered! Please rate your experience: {{ratingLink}}",
  },
};
```

**Task 3.5: API Routes**

- **Create**: `src/app/api/whatsapp/send/route.ts` (POST)
- **Create**: `src/app/api/whatsapp/subscribe/route.ts` (POST)
- **Create**: `src/app/api/whatsapp/webhook/route.ts` (POST) - For incoming messages
- **Create**: `src/app/api/whatsapp/groups/route.ts` (GET, POST)

**Task 3.6: User Notification Preferences**

- **File**: `src/app/user/settings/notifications/page.tsx`
- **Action**: Add WhatsApp notification toggles
- **Options**:
  - Order updates
  - Restock alerts
  - Sale notifications
  - Event notifications
  - Marketing messages

**Task 3.7: Database Schema**

```typescript
// Collection: whatsapp_subscriptions
interface WhatsAppSubscription {
  id: string;
  userId: string;
  phone: string;
  verified: boolean;
  subscriptions: {
    orders: boolean;
    restocks: boolean;
    sales: boolean;
    events: boolean;
    marketing: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection: whatsapp_groups
interface WhatsAppGroup {
  id: string;
  groupId: string; // WhatsApp Group ID
  name: string;
  type: "events" | "sales" | "restocks" | "general";
  participants: string[]; // Phone numbers
  createdAt: Timestamp;
}
```

**Task 3.8: Cloud Functions (Firebase Functions)**

- **File**: `functions/src/whatsapp/notifications.ts` (CREATE NEW)
- **Triggers**:
  - onOrderCreate → Send confirmation
  - onOrderStatusUpdate → Send status update
  - onProductRestock → Notify subscribers
  - onSaleCreate → Notify subscribers
  - onEventCreate → Notify subscribers

**Task 3.9: Environment Variables**

```env
WHATSAPP_API_KEY=xxxxx
WHATSAPP_PHONE_NUMBER_ID=xxxxx
WHATSAPP_BUSINESS_ACCOUNT_ID=xxxxx
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
```

---

## 4. Email Integration

### Current Status

- ⚠️ Basic email mentions in settings but no integration
- ❌ No read/write email functionality

### Implementation Tasks

**Task 4.1: Email Service Provider Setup**

- **Provider Options**:
  - SendGrid (Recommended)
  - Amazon SES
  - Mailgun
  - Resend (Modern, developer-friendly)

**Task 4.2: Admin Settings UI**

- **File**: `src/app/admin/settings/email/page.tsx`
- **Action**: Enhance existing page
- **Fields**:
  ```tsx
  - Email Provider Selection
  - SMTP Configuration
    - Host
    - Port
    - Username
    - Password
    - Encryption (TLS/SSL)
  - From Email Address
  - From Name
  - Reply-To Address
  - BCC Admin Toggle
  - Email Templates Editor
  ```

**Task 4.3: Backend Service**

- **File**: `src/services/email.service.ts` (CREATE NEW)
- **Methods**:

  ```typescript
  class EmailService {
    // Send Operations
    sendEmail(
      to: string,
      subject: string,
      html: string,
      text?: string
    ): Promise<void>;
    sendTemplate(
      to: string,
      templateName: string,
      data: Record<string, any>
    ): Promise<void>;
    sendBulkEmail(
      recipients: string[],
      subject: string,
      html: string
    ): Promise<void>;

    // Transactional Emails
    sendOrderConfirmation(order: Order): Promise<void>;
    sendShippingNotification(order: Order, tracking: string): Promise<void>;
    sendInvoice(order: Order, invoiceUrl: string): Promise<void>;
    sendPasswordReset(email: string, resetLink: string): Promise<void>;
    sendVerificationEmail(
      email: string,
      verificationLink: string
    ): Promise<void>;
    sendWelcomeEmail(user: User): Promise<void>;

    // Marketing Emails
    sendNewsletter(subscribers: string[], content: string): Promise<void>;
    sendPromotion(subscribers: string[], promotion: Promotion): Promise<void>;

    // Support Emails
    sendSupportTicketCreated(ticket: SupportTicket): Promise<void>;
    sendSupportTicketReply(
      ticket: SupportTicket,
      message: string
    ): Promise<void>;

    // Read Operations (IMAP)
    fetchEmails(folder: string, limit: number): Promise<Email[]>;
    markAsRead(emailId: string): Promise<void>;
    getEmailContent(emailId: string): Promise<EmailContent>;

    // Inbox Integration
    connectInbox(imapConfig: IMAPConfig): Promise<void>;
    parseIncomingEmail(email: Email): Promise<ParsedEmail>;
  }
  ```

**Task 4.4: Email Templates**

- **Directory**: `src/templates/email/` (CREATE NEW)
- **Templates** (React Email components):
  - `OrderConfirmation.tsx`
  - `ShippingNotification.tsx`
  - `Invoice.tsx`
  - `PasswordReset.tsx`
  - `VerificationEmail.tsx`
  - `Welcome.tsx`
  - `Newsletter.tsx`
  - `Promotion.tsx`
  - `SupportTicket.tsx`

**Task 4.5: API Routes**

- **Create**: `src/app/api/email/send/route.ts` (POST)
- **Create**: `src/app/api/email/templates/route.ts` (GET, POST, PUT)
- **Create**: `src/app/api/email/inbox/route.ts` (GET)
- **Create**: `src/app/api/email/webhook/route.ts` (POST) - For incoming emails

**Task 4.6: Admin Email Dashboard**

- **File**: `src/app/admin/emails/page.tsx` (CREATE NEW)
- **Features**:
  - View sent emails
  - View inbox (support emails)
  - Email analytics (open rate, click rate)
  - Template management
  - Newsletter composer

**Task 4.7: Database Schema**

```typescript
// Collection: email_logs
interface EmailLog {
  id: string;
  to: string[];
  from: string;
  subject: string;
  templateName?: string;
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed";
  provider: string;
  providerId?: string; // SendGrid message ID, etc.
  metadata: Record<string, any>;
  sentAt: Timestamp;
  deliveredAt?: Timestamp;
  openedAt?: Timestamp;
}

// Collection: email_templates
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
  variables: string[]; // e.g., ['userName', 'orderId']
  category: "transactional" | "marketing" | "notification";
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection: email_subscriptions
interface EmailSubscription {
  id: string;
  email: string;
  userId?: string;
  subscriptions: {
    newsletter: boolean;
    promotions: boolean;
    orderUpdates: boolean;
    productUpdates: boolean;
  };
  verified: boolean;
  createdAt: Timestamp;
}
```

**Task 4.8: Environment Variables**

```env
# SendGrid Example
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@justforview.in
EMAIL_FROM_NAME=JustForView

# SMTP (Alternative)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_SECURE=true

# IMAP (For reading emails)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=support@justforview.in
IMAP_PASSWORD=your-app-password
```

---

## 5. UI/UX Enhancements

### 5.1 Horizontal Scroller for Products

**Issue**: Products should display in a single row with horizontal scroll, not wrap to multiple rows

**Current Implementation**: `src/components/common/HorizontalScrollContainer.tsx` exists but may not be used consistently

**Task 5.1.1: Update Homepage Sections**

- **Files to modify**:
  - `src/components/homepage/ProductsSection.tsx`
  - `src/components/homepage/AuctionsSection.tsx`
  - `src/components/homepage/FeaturedCategoriesSection.tsx`
  - `src/components/homepage/FeaturedShopsSection.tsx`

**Task 5.1.2: Ensure Single Row Display**

```tsx
// Example implementation
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";

export function ProductsSection() {
  return (
    <HorizontalScrollContainer
      title="Featured Products"
      viewAllLink="/products"
      itemWidth="280px"
      gap="1rem"
      showArrows={true}
      arrowStyle="compact"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </HorizontalScrollContainer>
  );
}
```

**Task 5.1.3: Update CSS**

- Ensure no flex-wrap
- Ensure overflow-x-auto
- Hide scrollbar on desktop, show on mobile
- Smooth scroll behavior

---

### 5.2 Category and Shop Sections on Homepage

**Issue**: Category and shop sections not visible on homepage

**Task 5.2.1: Verify Component Rendering**

- **File**: `src/app/page.tsx`
- **Check**:
  - Are `FeaturedCategoriesSection` and `FeaturedShopsSection` present?
  - Are they receiving data?
  - Any conditional rendering hiding them?

**Task 5.2.2: Debug Data Loading**

- Check if categories/shops are being fetched
- Verify API routes are working
- Check for errors in console

**Task 5.2.3: Ensure Proper Styling**

- Verify no `display: none` or `visibility: hidden`
- Check z-index conflicts
- Verify responsive breakpoints

---

### 5.3 Common Hook for Pagination and Filtering

**Issue**: Multiple pages use similar pagination/filtering logic with Sieve

**Task 5.3.1: Create Unified Hook**

- **File**: `src/hooks/useResourceList.ts` (CREATE NEW)

```typescript
/**
 * Unified hook for resource lists with Sieve pagination, filtering, and sorting
 * Combines useLoadingState, useFilters, useDebounce
 */
export function useResourceList<T>(options: {
  fetchFn: (params: SieveParams) => Promise<SieveResponse<T>>;
  initialFilters?: Record<string, any>;
  initialSort?: string;
  pageSize?: number;
}) {
  // Combines:
  // - useLoadingState for async operations
  // - useFilters for filter management
  // - useDebounce for search
  // - Sieve pagination logic
  // - URL sync

  return {
    items: T[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
    isLoading: boolean;
    error: Error | null;
    filters: FilterState;
    sortBy: string;
    sortOrder: 'asc' | 'desc';

    // Actions
    setPage: (page: number) => void;
    setFilters: (filters: Record<string, any>) => void;
    setSort: (field: string, order?: 'asc' | 'desc') => void;
    refresh: () => void;
    reset: () => void;
  };
}
```

**Task 5.3.2: Remove Cursor-based Pagination Support**

- Remove all references to cursor pagination
- Keep only Sieve pagination
- Update all list pages to use new hook

**Task 5.3.3: Migrate Existing Pages**

- Admin pages: products, auctions, orders, users, etc.
- Seller pages: products, auctions, orders
- User pages: orders, wishlist, viewing history

---

### 5.4 Responsive Scaling

**Issue**: Website doesn't scale properly when browser window is stretched

**Task 5.4.1: Add Window Resize Handler**

- **File**: `src/hooks/useWindowResize.ts` (CREATE NEW)

```typescript
export function useWindowResize(callback: () => void, delay: number = 100) {
  useEffect(() => {
    const handleResize = debounce(callback, delay);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [callback, delay]);
}
```

**Task 5.4.2: Update HorizontalScrollContainer**

- Add recalculation on window resize
- Update visible items count
- Adjust scroll position

**Task 5.4.3: Update Layout Components**

- Add max-width constraints
- Use container queries where applicable
- Ensure grids recalculate on resize

---

## 6. Security Improvements

### 6.1 Server-Side Payment Security

**Issue**: Payment pages need server-side security

**Task 6.1.1: Move Payment Logic to Server Actions**

- **Create**: `src/app/actions/payment.ts`

```typescript
"use server";

export async function initiatePayment(orderId: string) {
  // Server-side validation
  // Create payment order
  // Return client-safe data only
}

export async function verifyPayment(paymentData: PaymentVerification) {
  // Server-side signature verification
  // Update order status
  // Return success/failure
}
```

**Task 6.1.2: Secure Checkout Flow**

- **File**: `src/app/checkout/page.tsx`
- Use server actions instead of client-side API calls
- Never expose secret keys to client
- Validate all data server-side

---

## 7. Shop Settings & Configuration

### Current Status

- ⚠️ Basic shop CRUD exists
- ❌ No shipping/payment configuration per shop

### 7.1 Shop Settings Page

**Task 7.1.1: Create Shop Settings UI**

- **File**: `src/app/seller/shops/[slug]/settings/page.tsx` (CREATE NEW)
- **Tabs**:
  - General Settings
  - Shipping Settings
  - Payment Settings
  - Policies
  - Team Management

**Task 7.1.2: Shipping Settings Tab**

```tsx
// Shipping Configuration
- Shipping Types Selection (from admin-defined list)
  - Standard Shipping
  - Express Shipping
  - Same Day Delivery
  - Custom (seller can create)
- Cost Configuration per type
- Free Shipping Threshold (optional)
- Delivery Estimates (min-max days)
- Restricted Pincodes
- Packaging Preferences
```

**Task 7.1.3: Payment Settings Tab**

```tsx
// Payment Configuration
- Accepted Payment Modes (from admin list, cannot create new)
  - Online (Razorpay/PayU)
  - COD
  - UPI
  - Cards
  - Netbanking
- COD Availability Toggle
- COD Charge (if applicable)
- Minimum Order Value for COD
- Maximum Order Value for COD
```

**Task 7.1.4: Default Policies**

```tsx
// Default Policies (inherited by products/auctions)
- Default Return Policy (dropdown with create)
- Default Warranty Policy (dropdown with create)
- Default Cancellation Policy
- Default Refund Timeline
```

**Task 7.1.5: Database Schema Update**

```typescript
// Update shops collection
interface Shop {
  // ... existing fields

  settings: {
    shipping: {
      types: {
        id: string;
        name: string;
        cost: number;
        estimatedDays: { min: number; max: number };
        enabled: boolean;
      }[];
      freeShippingThreshold?: number;
      restrictedPincodes: string[];
    };

    payment: {
      modes: ("online" | "cod" | "upi")[];
      codEnabled: boolean;
      codCharge?: number;
      codMinValue?: number;
      codMaxValue?: number;
    };

    policies: {
      defaultReturnPolicyId?: string;
      defaultWarrantyPolicyId?: string;
      defaultCancellationPolicyId?: string;
    };
  };

  // Seller limits
  sellerLimits: {
    maxShopsPerSeller: 3; // Enforced at creation
  };
}
```

**Task 7.1.6: Product/Auction Inheritance**

- When creating product/auction, inherit shop settings
- Allow override at product/auction level
- Show inherited values with "Using shop default" indicator

---

### 7.2 Shop About Page Enhancement

**Task 7.2.1: Update Shop About Page**

- **File**: `src/app/shops/[slug]/about/page.tsx`
- **Display**:
  - Accepted payment modes (icons + labels)
  - Shipping options & costs
  - Delivery estimates
  - Return policy summary
  - Warranty information
  - Contact details

**Task 7.2.2: Add Shop Tabs Navigation**

- **Component**: `src/components/shop/ShopTabs.tsx` (CREATE NEW)

```tsx
// Tabs: Products | Auctions | About | Reviews | Contact
<ShopTabs activeTab="about" shopSlug={shop.slug} />
```

---

## 8. Product Display Fixes

### 8.1 Auto Slideshow Fix

**Issue**: Slideshow only shows first image

**Task 8.1.1: Debug Image Slideshow**

- **File**: `src/components/product/ProductImageGallery.tsx`
- Check if images array is being passed correctly
- Verify autoplay logic
- Check image index state updates

**Task 8.1.2: Fix Click Handler**

- Ensure onClick opens modal/lightbox
- Verify image enlargement functionality

---

### 8.2 Product Variants Display

**Issue**: Product variants not showing up

**Task 8.2.1: Check Variant Data**

- Verify variants are stored in database
- Check if variants are fetched in product query

**Task 8.2.2: Fix Variant Selector**

- **File**: `src/components/common/ProductVariantSelector.tsx`
- Ensure it's being rendered
- Check props being passed
- Verify variant selection updates state

---

### 8.3 Shop Similar Items

**Issue**: Similar items not working properly

**Task 8.3.1: Fix Similar Items Query**

- **File**: `src/app/products/[slug]/page.tsx`
- Check similarity algorithm
- Verify category/tag matching
- Ensure enough items exist for testing

---

### 8.4 Image Inspection

**Issue**: Image inspection still shows purchase button

**Task 8.4.1: Update Image Modal**

- **File**: `src/components/product/ProductImageModal.tsx`
- Remove purchase button from lightbox view
- Only show navigation and close buttons

---

## 9. Filter & Navigation Improvements

### 9.1 Searchable Filters

**Issue**: All filter sections must be searchable

**Task 9.1.1: Update FilterSidebar**

- **File**: `src/components/common/UnifiedFilterSidebar.tsx`
- Add search input to each filter section
- Filter options based on search query
- Use `useDebounce` for search

**Task 9.1.2: Update CollapsibleFilter**

- **File**: `src/components/common/CollapsibleFilter.tsx`
- Add search prop
- Render search input when searchable
- Filter children based on search

---

### 9.2 Collapsible Filters

**Issue**: All filters must be collapsible

**Task 9.2.1: Ensure All Use CollapsibleFilter**

- Wrap all filter sections in `<CollapsibleFilter>`
- Add expand/collapse state
- Save expanded state to localStorage
- Add "Expand All" / "Collapse All" buttons

---

### 9.3 Category Details Page Filters

**Issue**: Filters not working on category details page

**Task 9.3.1: Debug Filter Application**

- **File**: `src/app/categories/[slug]/page.tsx`
- Check if filter state is being passed to API
- Verify Sieve query construction
- Check if filtered results are rendered

---

## 10. Dark Mode Fixes

### 10.1 Category Details Page

**Issue**: Dark mode not properly set

**Task 10.1.1: Add Dark Mode Classes**

- **File**: `src/app/categories/[slug]/page.tsx`
- Add `dark:bg-gray-900` to main container
- Add `dark:text-gray-100` to text elements
- Add `dark:border-gray-700` to borders
- Add `dark:bg-gray-800` to cards

---

### 10.2 Shop Details Page

**Issue**: No proper dark mode support

**Task 10.2.1: Add Dark Mode Classes**

- **File**: `src/app/shops/[slug]/page.tsx`
- Follow same pattern as above
- Ensure all components support dark mode

---

## 11. Data Loading Issues

### 11.1 Reviews Not Loading

**Issue**: Reviews not loading properly

**Task 11.1.1: Debug Reviews API**

- **File**: `src/app/api/reviews/route.ts`
- Check query logic
- Verify Sieve parameters
- Check permissions

**Task 11.1.2: Debug Reviews Component**

- **File**: `src/components/product/ProductReviews.tsx`
- Check if API is being called
- Verify error handling
- Check loading state

---

### 11.2 Category Products Not Loading

**Issue**: Products in category not loading

**Task 11.2.1: Debug Category Products API**

- **File**: `src/app/api/products/route.ts`
- Check categoryId filter
- Verify Sieve query construction
- Check if products have categoryId

---

### 11.3 Blog Posts Not Showing

**Issue**: Blog posts not showing up

**Task 11.3.1: Debug Blog API**

- **File**: `src/app/api/blog/route.ts`
- Check query logic
- Verify published filter
- Check if blog posts exist in database

---

### 11.4 Category Auctions Not Showing

**Issue**: Auctions in category not showing up

**Task 11.4.1: Debug Category Auctions API**

- **File**: `src/app/api/auctions/route.ts`
- Check categoryId filter
- Verify Sieve query
- Check if auctions have categoryId

---

### 11.5 Category Metrics

**Issue**: Category metrics not showing properly

**Task 11.5.1: Debug Metrics Calculation**

- **File**: `src/app/api/categories/[slug]/metrics/route.ts`
- Check aggregation logic
- Verify count queries
- Check if metrics are being passed to frontend

---

### 11.6 Shop Products/Auctions Not Showing

**Issue**: Products and auctions not showing on shop page

**Task 11.6.1: Debug Shop Items API**

- Check `shopId` filter
- Verify query construction
- Ensure products/auctions have `shopId` field

---

### 11.7 Auction/Product Metrics on Cards

**Issue**: Metrics not showing properly on auction/product cards

**Task 11.7.1: Update Card Components**

- **Files**:
  - `src/components/cards/ProductCard.tsx`
  - `src/components/cards/AuctionCard.tsx`
- Ensure metrics are displayed:
  - Views count
  - Likes/Favorites
  - Bid count (auctions)
  - Rating (products)

---

## 12. Product & Auction Details Enhancements

### 12.1 Stock Display Fix

**Issue**: Shows "In Stock" for out-of-stock items

**Task 12.1.1: Fix Stock Logic**

- **File**: `src/components/product/ProductDetails.tsx`
- Check `stock > 0` condition
- Show original price (not sale price) for out-of-stock
- Disable "Add to Cart" button

---

### 12.2 Free Shipping Display

**Issue**: Free shipping shown even if seller doesn't approve

**Task 12.2.1: Conditional Free Shipping Display**

- Only show if `product.freeShipping === true`
- Or if order value > shop's `freeShippingThreshold`
- Remove "Free shipping over ₹X" if not configured

---

### 12.3 Reusable & Configured Code

**Issue**: Product and auction details pages have duplicate code

**Task 12.3.1: Create Shared Components**

- `<ItemHeader>` - Title, price, ratings
- `<ItemImageGallery>` - Images with zoom
- `<ItemDescription>` - Formatted description
- `<ItemSpecifications>` - Table/grid of specs
- `<ItemShipping>` - Shipping info
- `<ItemActions>` - Buy/Bid buttons
- `<ItemReviews>` - Reviews section
- `<ItemSimilar>` - Similar items

---

## 13. Seller Configuration Options

### 13.1 Default Shipping Info

**Task 13.1.1: Shop Settings**

- **File**: `src/app/seller/shops/[slug]/settings/shipping/page.tsx`
- Default shipping method selection
- Default packaging type
- Default pickup location

---

### 13.2 Default Free Shipping Limit

**Task 13.2.1: Shop Settings**

- Input field for free shipping threshold
- Optional toggle
- Applied to all products by default

---

### 13.3 Default Return Policy

**Task 13.3.1: Return Policy Management**

- **File**: `src/app/seller/shops/[slug]/settings/policies/page.tsx`
- Return policy dropdown with create
- Return window (days)
- Return conditions
- Restocking fee
- Who pays return shipping

---

## 14. Auction System Improvements

### 14.1 Live Auctions Filter

**Issue**: Shows all as ended even though 20 are live

**Task 14.1.1: Fix Status Filter**

- **File**: `src/app/api/auctions/route.ts`
- Check status calculation logic
- Verify `startTime` and `endTime` comparison
- Ensure timezone handling is correct

**Task 14.1.2: Fix Client-Side Filtering**

- **File**: `src/app/auctions/page.tsx`
- Verify filter application
- Check if "live" filter is being sent to API

---

### 14.2 Auction Details Page

**Issue**: Doesn't work properly, no live bidding, no winner display

**Task 14.2.1: Live Bidding UI**

- **File**: `src/app/auctions/[slug]/page.tsx`
- Add real-time bid updates (Firebase Realtime Database)
- Show current highest bid
- Show bid count
- Show time remaining (countdown)
- Enable bid placement

**Task 14.2.2: Ended Auction Display**

- Show winning bid amount
- Hide winner name (privacy)
- Show "Auction Ended" badge
- Disable bid placement
- Show final bid count

---

## 15. Dropdown Enhancements

### 15.1 Brand Dropdown with Create

**Task 15.1.1: Create Brand Selector Component**

- **File**: `src/components/common/BrandSelectorWithCreate.tsx` (CREATE NEW)
- Dropdown with search
- "Create New Brand" option
- Admin/Seller only
- Validation: unique name, 2-50 chars

**Task 15.1.2: Database Schema**

```typescript
// Collection: brands
interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  createdBy: string; // userId
  createdByRole: "admin" | "seller";
  approved: boolean; // Admin approval required for seller-created brands
  createdAt: Timestamp;
}
```

---

### 15.2 Condition Dropdown with Create

**Task 15.2.1: Create Condition Selector Component**

- **File**: `src/components/common/ConditionSelectorWithCreate.tsx` (CREATE NEW)
- Predefined conditions:
  - New
  - Like New
  - Good
  - Fair
  - Poor
  - For Parts
- Allow admin/seller to create custom
- Description field for custom conditions

**Task 15.2.2: Database Schema**

```typescript
// Collection: conditions
interface Condition {
  id: string;
  name: string;
  description: string;
  isDefault: boolean; // System-defined
  createdBy?: string;
  createdAt: Timestamp;
}
```

---

### 15.3 Return Policy Dropdown with Create

**Task 15.3.1: Create Return Policy Selector**

- **File**: `src/components/common/ReturnPolicySelectorWithCreate.tsx` (CREATE NEW)
- In shop settings
- Predefined policies:
  - 7-day return
  - 15-day return
  - 30-day return
  - No returns
  - Custom
- Create modal for custom policies

**Task 15.3.2: Database Schema**

```typescript
// Collection: return_policies
interface ReturnPolicy {
  id: string;
  name: string;
  description: string;
  returnWindow: number; // days
  conditions: string[];
  restockingFee: number; // percentage
  shippingPaidBy: "buyer" | "seller" | "split";
  shopId?: string; // null for global, shopId for shop-specific
  isDefault: boolean;
  createdAt: Timestamp;
}
```

---

### 15.4 Warranty Policy Dropdown with Create

**Task 15.4.1: Create Warranty Policy Selector**

- **File**: `src/components/common/WarrantyPolicySelectorWithCreate.tsx` (CREATE NEW)
- Similar to return policy
- Fields:
  - Warranty duration
  - Coverage details
  - Exclusions
  - Claim process

**Task 15.4.2: Database Schema**

```typescript
// Collection: warranty_policies
interface WarrantyPolicy {
  id: string;
  name: string;
  duration: number; // months
  coverage: string[];
  exclusions: string[];
  claimProcess: string;
  shopId?: string;
  isDefault: boolean;
  createdAt: Timestamp;
}
```

---

## 16. Validation & Input Improvements

### 16.1 Weight Input

**Issue**: Weight should allow decimals from 0.001kg to 20kg

**Task 16.1.1: Update Weight Input**

- **File**: `src/components/forms/WeightInput.tsx` (CREATE NEW)

```tsx
<input
  type="number"
  step="0.001"
  min="0.001"
  max="20"
  placeholder="e.g., 0.5"
  // Validation
/>
```

**Task 16.1.2: Add Validation**

```typescript
// In Zod schema
weight: z.number()
  .min(0.001, "Weight must be at least 0.001 kg")
  .max(20, "Weight cannot exceed 20 kg")
  .multipleOf(0.001, "Weight must be in increments of 0.001 kg"),
```

---

### 16.2 Dimensions Input

**Issue**: Dimensions must be in cm from 1cm to 200cm for each axis

**Task 16.2.1: Update Dimensions Input**

- **File**: `src/components/forms/DimensionsInput.tsx` (CREATE NEW)

```tsx
<div className="grid grid-cols-3 gap-4">
  <input type="number" min="1" max="200" placeholder="Length (cm)" />
  <input type="number" min="1" max="200" placeholder="Width (cm)" />
  <input type="number" min="1" max="200" placeholder="Height (cm)" />
</div>
```

**Task 16.2.2: Add Validation**

```typescript
// In Zod schema
dimensions: z.object({
  length: z.number().int().min(1).max(200),
  width: z.number().int().min(1).max(200),
  height: z.number().int().min(1).max(200),
}).refine(
  (dims) => dims.length >= dims.width && dims.width >= dims.height,
  { message: "Dimensions should be in descending order (L ≥ W ≥ H)" }
),
```

---

## 17. Media Upload Enhancement

### 17.1 Use Proper Media Uploader

**Issue**: Current uploader is minimal

**Task 17.1.1: Enhance MediaUpload Component**

- **File**: `src/components/media/MediaUpload.tsx`
- Features:
  - Drag & drop
  - Multiple file selection
  - Preview thumbnails
  - Progress bars per file
  - Validation (file type, size)
  - Reordering (drag to reorder)
  - Crop/resize before upload
  - Compression

**Task 17.1.2: Update useMediaUpload Hook**

- **File**: `src/hooks/useMediaUpload.ts`
- Already exists, ensure it has:
  - Progress tracking
  - Error handling
  - Retry logic
  - Cleanup on unmount

**Task 17.1.3: Add Video Upload Support**

- Validate video formats (MP4, WebM)
- Size limits (e.g., 50MB)
- Generate thumbnail from video
- Show video preview

---

## Implementation Priority

### Phase 1: Critical Integrations (Week 1-2)

1. ✅ Razorpay Integration (Task 1.1)
2. ✅ WhatsApp Integration (Task 3)
3. ✅ Email Integration (Task 4)
4. ✅ Horizontal Scroller Fix (Task 5.1)

### Phase 2: Core Features (Week 3-4)

5. ✅ Shop Settings & Configuration (Task 7)
6. ✅ Common Hook for Pagination (Task 5.3)
7. ✅ Product Display Fixes (Task 8)
8. ✅ Filter Improvements (Task 9)

### Phase 3: Polish & Enhancements (Week 5-6)

9. ✅ Dark Mode Fixes (Task 10)
10. ✅ Data Loading Issues (Task 11)
11. ✅ Auction Improvements (Task 14)
12. ✅ Dropdown Enhancements (Task 15)

### Phase 4: Final Touches (Week 7)

13. ✅ Validation Improvements (Task 16)
14. ✅ Media Upload Enhancement (Task 17)
15. ✅ Shiprocket Integration (Task 2)
16. ✅ Security Improvements (Task 6)

---

## Testing Checklist

### Payment Integration Testing

- [ ] Razorpay order creation
- [ ] Payment verification
- [ ] Webhook handling
- [ ] Refund processing
- [ ] Multiple payment methods

### WhatsApp Integration Testing

- [ ] Send individual messages
- [ ] Send group messages
- [ ] Template messages
- [ ] Event notifications
- [ ] Subscription management

### Email Integration Testing

- [ ] Send transactional emails
- [ ] Email templates render correctly
- [ ] SMTP/API sending works
- [ ] Inbox reading (IMAP)
- [ ] Email logs tracking

### UI/UX Testing

- [ ] Horizontal scrollers work on all breakpoints
- [ ] Categories/shops visible on homepage
- [ ] Responsive scaling on window resize
- [ ] Dark mode consistent across all pages

### Shop Settings Testing

- [ ] Shipping configuration saves
- [ ] Payment modes selection works
- [ ] Default policies applied
- [ ] Product inheritance from shop
- [ ] 3-shop limit enforced

### Product/Auction Testing

- [ ] Image slideshow auto-advances
- [ ] Variants display correctly
- [ ] Similar items show
- [ ] Stock status accurate
- [ ] Metrics display on cards

### Filter Testing

- [ ] All filters searchable
- [ ] All filters collapsible
- [ ] Filters work on category pages
- [ ] URL sync works

### Auction Testing

- [ ] Live auctions filter correctly
- [ ] Real-time bidding works
- [ ] Ended auctions show winner
- [ ] Countdown timer accurate

---

## Constants & Configuration

### New Constants Files to Create

**File**: `src/constants/payment.ts`

```typescript
export const PAYMENT_GATEWAYS = {
  RAZORPAY: "razorpay",
  PAYU: "payu",
  COD: "cod",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;
```

**File**: `src/constants/shipping.ts`

```typescript
export const SHIPPING_PROVIDERS = {
  SHIPROCKET: "shiprocket",
  DELHIVERY: "delhivery",
  BLUEDART: "bluedart",
} as const;

export const SHIPMENT_STATUS = {
  PENDING: "pending",
  AWB_GENERATED: "awb_generated",
  PICKUP_SCHEDULED: "pickup_scheduled",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;
```

**File**: `src/constants/notifications.ts`

```typescript
export const NOTIFICATION_TYPES = {
  ORDER: "order",
  RESTOCK: "restock",
  SALE: "sale",
  EVENT: "event",
  MARKETING: "marketing",
} as const;

export const NOTIFICATION_CHANNELS = {
  EMAIL: "email",
  WHATSAPP: "whatsapp",
  SMS: "sms",
  PUSH: "push",
  IN_APP: "in_app",
} as const;
```

---

## API Endpoints to Create

### Payment APIs

- `POST /api/payments/razorpay/order` - Create order
- `POST /api/payments/razorpay/verify` - Verify payment
- `POST /api/payments/razorpay/capture` - Capture payment
- `POST /api/payments/razorpay/refund` - Process refund
- `POST /api/payments/razorpay/webhook` - Handle webhooks

### Shipping APIs

- `POST /api/shipping/shiprocket/order` - Create shipment
- `GET /api/shipping/shiprocket/track/[awb]` - Track shipment
- `POST /api/shipping/shiprocket/couriers` - Get available couriers
- `POST /api/shipping/shiprocket/webhook` - Handle webhooks

### Communication APIs

- `POST /api/whatsapp/send` - Send WhatsApp message
- `POST /api/whatsapp/subscribe` - Subscribe to notifications
- `POST /api/whatsapp/webhook` - Handle incoming messages
- `POST /api/email/send` - Send email
- `GET /api/email/inbox` - Fetch inbox emails
- `POST /api/email/webhook` - Handle email events

### Shop Settings APIs

- `GET /api/seller/shops/[id]/settings` - Get shop settings
- `PUT /api/seller/shops/[id]/settings` - Update shop settings
- `POST /api/seller/shops/[id]/shipping-types` - Create shipping type
- `GET /api/admin/payment-modes` - Get available payment modes

### Policies APIs

- `GET /api/policies/return` - List return policies
- `POST /api/policies/return` - Create return policy
- `GET /api/policies/warranty` - List warranty policies
- `POST /api/policies/warranty` - Create warranty policy

### Brands & Conditions APIs

- `GET /api/brands` - List brands
- `POST /api/brands` - Create brand
- `GET /api/conditions` - List conditions
- `POST /api/conditions` - Create condition

---

## Environment Variables Summary

```env
# Payment Gateways
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

PAYU_MERCHANT_KEY=xxxxx
PAYU_MERCHANT_SALT=xxxxx

# Shipping
SHIPROCKET_EMAIL=your-email@example.com
SHIPROCKET_PASSWORD=xxxxx
SHIPROCKET_API_URL=https://apiv2.shiprocket.in/v1

# WhatsApp (Twilio example)
WHATSAPP_ACCOUNT_SID=xxxxx
WHATSAPP_AUTH_TOKEN=xxxxx
WHATSAPP_PHONE_NUMBER=whatsapp:+14155238886

# Email (SendGrid example)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@justforview.in
EMAIL_FROM_NAME=JustForView

# IMAP (for reading emails)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=support@justforview.in
IMAP_PASSWORD=your-app-password
```

---

## 18. Product & Auction Creation Improvements

### 18.1 Multiple Category Selection (Leaf Only)

**Issue**: Need to support multiple category selection, but only leaf categories

**Task 18.1.1: Enhanced Category Selector**

- **File**: `src/components/common/CategorySelector.tsx`
- **Update**: Add multi-select support with leaf validation
- **Features**:
  ```tsx
  - Multi-select mode (chips display)
  - Validate only leaf categories can be selected
  - Show error if parent category selected
  - Display category path (Parent > Child > Leaf)
  - Remove non-leaf options from selection
  ```

**Task 18.1.2: Database Schema Update**

```typescript
// Update products/auctions collections
interface Product {
  // ... existing fields
  categoryIds: string[]; // Changed from categoryId to support multiple
  categories: {
    id: string;
    name: string;
    slug: string;
    path: string; // Full path: "Electronics > Phones > Smartphones"
    isLeaf: boolean;
  }[];
}
```

**Task 18.1.3: API Route Updates**

- **Files**:
  - `src/app/api/products/route.ts`
  - `src/app/api/auctions/route.ts`
- **Update**: Support filtering by multiple categories
- **Validation**: Ensure all selected categories are leaf nodes

**Task 18.1.4: Category Validation Helper**

- **File**: `src/lib/category-validation.ts` (CREATE NEW)

```typescript
export function validateLeafCategories(
  categoryIds: string[]
): Promise<ValidationResult> {
  // Check if all categories are leaf nodes
  // Return error with non-leaf categories
}

export function getCategoryPaths(
  categoryIds: string[]
): Promise<CategoryPath[]> {
  // Get full paths for display
}
```

---

### 18.2 Auto-Generate SKU with Barcode

**Issue**: SKU should be auto-generated and displayed as barcode

**Task 18.2.1: SKU Generator Service**

- **File**: `src/services/sku.service.ts` (CREATE NEW)

```typescript
class SKUService {
  // Generate unique SKU
  generateSKU(productData: {
    shopId: string;
    categoryId: string;
    name: string;
  }): Promise<string>;

  // Format: SHOP-CAT-XXXX-YYYY
  // Example: SHP001-ELEC-SMPH-0001

  // Validate SKU uniqueness
  validateSKU(sku: string): Promise<boolean>;

  // Generate barcode image
  generateBarcode(sku: string): Promise<string>; // Returns data URL
}
```

**Task 18.2.2: Barcode Component**

- **File**: `src/components/common/BarcodeDisplay.tsx` (CREATE NEW)

```tsx
import JsBarcode from "jsbarcode";

interface BarcodeDisplayProps {
  sku: string;
  width?: number;
  height?: number;
  format?: "CODE128" | "EAN13" | "UPC";
}

// Display barcode with download option
```

**Task 18.2.3: Product Form Update**

- **File**: `src/components/wizards/product/ProductBasicInfo.tsx`
- **Add**:
  - SKU input (readonly by default)
  - "Generate SKU" button
  - Barcode preview below SKU
  - "Download Barcode" button

**Task 18.2.4: Install Dependencies**

```bash
npm install jsbarcode @types/jsbarcode
```

---

### 18.3 Auto-Generate Slug with Validation

**Issue**: Slug should be auto-generated from name with manual edit option

**Task 18.3.1: Enhanced Slug Input Component**

- **File**: `src/components/common/SlugInput.tsx`
- **Update**: Add auto-generate feature
- **Features**:
  ```tsx
  - "Generate from Name" button
  - Real-time slug preview
  - Slug validation on blur
  - Check for similar slugs
  - Show suggestions if conflict
  - Manual edit always allowed
  ```

**Task 18.3.2: Slug Service Enhancement**

- **File**: `src/services/slug.service.ts` (CREATE NEW or enhance existing)

```typescript
class SlugService {
  // Generate slug from text
  generateSlug(text: string): string;

  // Validate uniqueness
  validateSlug(
    slug: string,
    resourceType: "product" | "auction" | "shop"
  ): Promise<{
    isValid: boolean;
    suggestions?: string[];
  }>;

  // Get similar slugs
  findSimilarSlugs(slug: string, resourceType: string): Promise<string[]>;

  // Make slug unique by adding suffix
  makeUniqueSlug(slug: string, resourceType: string): Promise<string>;
}
```

**Task 18.3.3: Real-time Validation**

- Validate on blur or after 3 seconds of no typing
- Show green checkmark for valid slug
- Show red X with suggestions for invalid
- Auto-suggest with `-2`, `-3` etc. suffix

---

### 18.4 Stock Management

**Issue**: Stock default should be 1, max 100

**Task 18.4.1: Update Stock Input**

- **File**: `src/components/wizards/product/ProductInventory.tsx`
- **Update**:
  ```tsx
  <input
    type="number"
    min="0"
    max="100"
    defaultValue="1"
    // Validation
  />
  ```

**Task 18.4.2: Validation Schema**

```typescript
// In Zod schema
stock: z.number()
  .int("Stock must be a whole number")
  .min(0, "Stock cannot be negative")
  .max(100, "Stock cannot exceed 100")
  .default(1),
```

---

### 18.5 Enhanced Media Upload (1 Video + 5 Images)

**Issue**: Support 1 video with thumbnail + 5 images, with camera support

**Task 18.5.1: Media Upload Configuration**

- **File**: `src/components/wizards/product/ProductMedia.tsx`
- **Update**:
  ```tsx
  const MEDIA_CONFIG = {
    maxImages: 5,
    maxVideos: 1,
    imageFormats: ["image/jpeg", "image/png", "image/webp"],
    videoFormats: ["video/mp4", "video/webm"],
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxVideoSize: 50 * 1024 * 1024, // 50MB
  };
  ```

**Task 18.5.2: Camera Support**

- **Add**: Camera capture option
- **Component**: `<CameraCapture />` (CREATE NEW)

```tsx
// Use browser MediaDevices API
navigator.mediaDevices.getUserMedia({ video: true });
```

**Task 18.5.3: Video Thumbnail Generation**

```typescript
// Automatically generate thumbnail from video
async function generateVideoThumbnail(videoFile: File): Promise<Blob> {
  // Use canvas to extract frame at 1 second
  // Return as image blob
}
```

**Task 18.5.4: Image Adjustments**

- Crop
- Rotate
- Brightness/Contrast
- Compress before upload
- Maintain aspect ratio options

**Task 18.5.5: Firestore Storage**

- Store in `products/{productId}/images/`
- Store in `products/{productId}/videos/`
- Store thumbnails in `products/{productId}/thumbnails/`

---

### 18.6 Rich Text Editor for Descriptions

**Issue**: Use rich text editor with copy-paste support

**Task 18.6.1: Enhance RichTextEditor**

- **File**: `src/components/common/RichTextEditor.tsx`
- **Features**:
  - Bold, Italic, Underline
  - Headings (H1-H6)
  - Lists (ordered, unordered)
  - Links
  - Images (paste support)
  - Code blocks
  - Tables
  - Copy/paste from Word/Google Docs
  - Paste from other generators (preserve formatting)

**Task 18.6.2: Install Enhanced Editor**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
```

**Task 18.6.3: Paste Handler**

```typescript
// Handle paste events
editor.on("paste", (event) => {
  // Clean HTML from external sources
  // Preserve basic formatting
  // Remove unwanted styles/scripts
});
```

---

### 18.7 Feature Toggle (Admin Only)

**Issue**: Featured products/auctions/shops can only be set by admin

**Task 18.7.1: Remove Feature Toggle from Seller Forms**

- **Files**:
  - `src/components/wizards/product/ProductBasicInfo.tsx`
  - `src/components/wizards/auction/AuctionBasicInfo.tsx`
  - `src/app/seller/shops/create/page.tsx`
- **Remove**: Featured checkbox/toggle
- **Set**: `featured: false` by default

**Task 18.7.2: Add to Admin Quick Actions**

- **Files**:
  - `src/app/admin/products/page.tsx`
  - `src/app/admin/auctions/page.tsx`
  - `src/app/admin/shops/page.tsx`
- **Add**: "Toggle Featured" quick action
- **Bulk**: Support bulk feature/unfeature

**Task 18.7.3: API Authorization**

```typescript
// In API routes, check role
if (userRole !== "admin") {
  // Ignore featured field in request
  delete requestData.featured;
}
```

---

### 18.8 Validation Error Display

**Issue**: Validation errors must show below each input

**Task 18.8.1: Update Form Components**

- **Files**: All form input components
- **Pattern**:

```tsx
<div className="form-field">
  <label>Field Name</label>
  <input {...field} className={errors.fieldName ? "border-red-500" : ""} />
  {errors.fieldName && (
    <p className="text-red-500 text-sm mt-1">{errors.fieldName.message}</p>
  )}
</div>
```

**Task 18.8.2: Update FormField Component**

- **File**: `src/components/forms/FormField.tsx`
- **Add**: Error message display prop
- **Update**: Show errors below input by default

**Task 18.8.3: Validation Timing**

- On blur (when user leaves field)
- After 3 seconds of no typing (debounced)
- On form submit

---

### 18.9 Auction-Specific Fixes

**Task 18.9.1: Fix Invalid Date Error**

- **File**: `src/components/wizards/auction/AuctionSchedule.tsx`
- **Check**: Date parsing logic
- **Ensure**: UTC timezone handling
- **Validate**: Start date > current date
- **Validate**: End date > start date

**Task 18.9.2: Default Starting Bid**

- **Update**: Set default to ₹10

```typescript
startingBid: z.number()
  .min(10, "Starting bid must be at least ₹10")
  .default(10),
```

**Task 18.9.3: Remove Extra Auction Type Fields**

- **Issue**: No extra fields needed for different auction types
- **File**: `src/components/wizards/auction/AuctionType.tsx`
- **Keep**: Only basic auction type selection
- **Remove**: Type-specific configuration fields

**Task 18.9.4: Add Condition Dropdown**

- **File**: `src/components/wizards/auction/AuctionBasicInfo.tsx`
- **Add**: `<ConditionSelectorWithCreate />` component
- Same as products

**Task 18.9.5: Use Same Media Config**

- Apply same 1 video + 5 images configuration
- Reuse `<ProductMedia />` or extract to `<ItemMedia />`

---

## 19. Category System Enhancements

### 19.1 Admin Category Page Views

**Issue**: Category admin page needs list, grid, and graph views

**Task 19.1.1: Create Category View Switcher**

- **File**: `src/app/admin/categories/page.tsx`
- **Views**:
  1. List View (table with hierarchy indicators)
  2. Grid View (cards with thumbnails)
  3. Graph View (interactive tree/graph visualization)

**Task 19.1.2: List View**

```tsx
// Indented list showing hierarchy
└─ Electronics
   ├─ Phones
   │  ├─ Smartphones
   │  └─ Feature Phones
   └─ Laptops
```

**Task 19.1.3: Grid View**

```tsx
// Card grid with thumbnails
[Electronics][Fashion][Home][Sports][Books][Toys];
```

**Task 19.1.4: Graph View Component**

- **File**: `src/components/category/CategoryGraph.tsx` (CREATE NEW)
- **Library**: Use React Flow or D3.js

```bash
npm install reactflow
```

**Task 19.1.5: Graph Visualization**

- **Layout**: Draw from center, expand downwards
- **Connections**: Support cross-level links (graph structure)
- **Interactive**: Click to view/edit, drag to rearrange
- **Zoom**: Support zoom in/out

**Task 19.1.6: Quick Actions**

- Create button (floating action button)
- Edit (inline or modal)
- Delete (with confirmation)
- Move to parent
- Duplicate
- Bulk actions (select multiple)

---

### 19.2 Category Hierarchy Database

**Issue**: Store actual hierarchy for efficient fetching

**Task 19.2.1: Enhanced Category Schema**

```typescript
// Collection: categories
interface Category {
  id: string;
  name: string;
  slug: string;

  // Hierarchy
  parentId: string | null;
  parentPath: string[]; // Array of ancestor IDs
  level: number; // 0 for root, 1 for children, etc.
  isLeaf: boolean; // No children
  childrenCount: number;

  // Graph structure (for cross-level links)
  linkedCategories: string[]; // IDs of related categories

  // Display
  order: number; // For sorting within same parent
  icon?: string;
  image?: string;
  description?: string;

  // Metadata
  productCount: number;
  auctionCount: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Task 19.2.2: Firebase Functions for Hierarchy**

- **File**: `functions/src/categories/hierarchy.ts` (CREATE NEW)

```typescript
// Cloud Function to maintain hierarchy
export const updateCategoryHierarchy = functions.firestore
  .document("categories/{categoryId}")
  .onWrite(async (change, context) => {
    // Update parentPath for all descendants
    // Update isLeaf for parent
    // Update childrenCount
  });
```

**Task 19.2.3: API Endpoints**

- `GET /api/categories/tree` - Full tree structure
- `GET /api/categories/[id]/ancestors` - Get parent chain
- `GET /api/categories/[id]/descendants` - Get all children
- `GET /api/categories/leaf` - Get only leaf categories

---

### 19.3 Category Settings (Shared Across Admins)

**Issue**: Categories must be shared across all admins

**Task 19.3.1: No Owner Field**

- Categories are global, not owned by specific admin
- All admins can view/edit
- Track last editor only

**Task 19.3.2: Audit Log**

```typescript
// Collection: category_audit_log
interface CategoryAuditLog {
  id: string;
  categoryId: string;
  adminId: string;
  adminName: string;
  action: "create" | "update" | "delete" | "move";
  changes: Record<string, any>;
  timestamp: Timestamp;
}
```

---

## 20. Admin Features & Settings

### 20.1 Homepage Settings Fixes

**Issue**: Homepage settings fail, hero slides fail

**Task 20.1.1: Debug Homepage Settings API**

- **File**: `src/app/api/admin/homepage-settings/route.ts`
- Check validation errors
- Check permission issues
- Verify Firestore writes

**Task 20.1.2: Debug Hero Slides**

- **File**: `src/app/api/admin/hero-slides/route.ts`
- Check image upload
- Verify slide order
- Check active/inactive toggle

**Task 20.1.3: Shared Settings**

- All admin settings should be global (single document)
- Not per-admin

**Task 20.1.4: Settings Schema**

```typescript
// Collection: admin_settings (single document)
interface AdminSettings {
  homepage: {
    heroSlides: HeroSlide[];
    featuredSections: {
      products: { enabled: boolean; limit: number };
      auctions: { enabled: boolean; limit: number };
      categories: { enabled: boolean; limit: number };
      shops: { enabled: boolean; limit: number };
    };
  };

  general: {
    siteName: string;
    siteTagline: string;
    // ... other settings
  };

  // No user-specific data, shared across all admins
  lastUpdatedBy: string;
  lastUpdatedAt: Timestamp;
}
```

---

### 20.2 General Site Settings

**Issue**: Admin needs general site settings

**Task 20.2.1: General Settings Page**

- **File**: `src/app/admin/settings/general/page.tsx`
- **Fields**:
  - Site Name
  - Site Tagline
  - Site Description
  - Contact Email
  - Support Email
  - Contact Phone
  - Address
  - Logo Upload
  - Favicon Upload
  - Social Media Links
  - Maintenance Mode Toggle
  - Maintenance Message

---

### 20.3 Admin-Specific Shipping Settings

**Issue**: Admin should only set shipping providers, not prices/estimates

**Task 20.3.1: Update Admin Shipping Settings**

- **File**: `src/app/admin/settings/shipping/page.tsx`
- **Admin Can Set**:
  - Available shipping providers (Shiprocket, India Post, DTDC, BlueDart)
  - Enable/disable providers
  - Provider API credentials
  - Global shipping restrictions (countries/regions)
- **Admin Cannot Set**:
  - Shipping prices (shop-specific)
  - Delivery estimates (shop-specific)
  - Free shipping thresholds (shop-specific)

**Task 20.3.2: Shipping Provider Management**

```typescript
// Collection: shipping_providers (admin-managed)
interface ShippingProvider {
  id: string;
  name: string;
  code: "shiprocket" | "india_post" | "dtdc" | "bluedart" | "custom";
  enabled: boolean;
  apiConfig: Record<string, any>;
  supportedRegions: string[];
  features: string[]; // e.g., ['tracking', 'insurance', 'cod']
}
```

---

### 20.4 Resend Verification Emails

**Issue**: Admin should have option to resend verification emails

**Task 20.4.1: Add Resend Button**

- **File**: `src/app/admin/users/[id]/page.tsx`
- **Add**: "Resend Verification Email" button
- **Show**: Only if email not verified

**Task 20.4.2: API Endpoint**

- **Create**: `src/app/api/admin/users/[id]/resend-verification/route.ts`

```typescript
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Check admin permissions
  // Generate new verification link
  // Send email
  // Log action
}
```

**Task 20.4.3: Bulk Resend**

- Add to bulk actions
- Resend to all unverified users

---

## 21. Shop Verification & Management

### 21.1 Shop Verification Requirement

**Issue**: Shops must be verified before creating products

**Task 21.1.1: Verification Status**

```typescript
// Update shops collection
interface Shop {
  // ... existing fields
  verification: {
    status: "pending" | "verified" | "rejected";
    submittedAt?: Timestamp;
    verifiedAt?: Timestamp;
    verifiedBy?: string; // Admin ID
    rejectedAt?: Timestamp;
    rejectionReason?: string;
    documents: {
      gstCertificate?: string; // URL
      businessLicense?: string; // URL
      addressProof?: string; // URL
    };
  };
}
```

**Task 21.1.2: Block Product Creation**

- **Files**:
  - `src/app/seller/products/create/page.tsx`
  - `src/app/seller/auctions/create/page.tsx`
- **Check**: Shop verification status
- **Show**: Verification pending message if not verified

**Task 21.1.3: Verification Flow**

1. Seller submits shop with documents
2. Admin reviews in `src/app/admin/shops/verification/page.tsx`
3. Admin approves/rejects
4. Seller notified via email
5. If approved, can create products

**Task 21.1.4: Admin Verification Page**

- **File**: `src/app/admin/shops/verification/page.tsx` (CREATE NEW)
- **List**: All shops pending verification
- **View**: Documents uploaded
- **Actions**: Approve/Reject with reason

---

### 21.2 Shop Address Selection

**Issue**: Shop can select 1 address from seller's addresses or create new

**Task 21.2.1: Shop Address Selector**

- **File**: `src/components/shop/ShopAddressSelector.tsx` (CREATE NEW)
- **Features**:
  - Radio list of user's saved addresses
  - "Add New Address" button (opens modal)
  - Preview selected address
  - Can only select 1 address per shop

**Task 21.2.2: Update Shop Schema**

```typescript
interface Shop {
  // ... existing fields
  address: {
    addressId: string; // References user's address
    // Denormalized for display
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
  };
}
```

---

### 21.3 Shop Creation Wizard Step Navigation

**Issue**: Shop create page doesn't have option to jump steps

**Task 21.3.1: Add Step Navigation**

- **File**: `src/app/seller/shops/create/page.tsx`
- **Add**: Clickable step indicators at top
- **Allow**: Jump to previous completed steps
- **Block**: Jump to future incomplete steps
- **Show**: Progress indicator

**Task 21.3.2: Fix "Next" Button**

- **Issue**: No next button or step click not working
- **Debug**: Button rendering logic
- **Ensure**: Next button always visible at bottom
- **Ensure**: Step click handlers are attached

**Task 21.3.3: Add "Back" Button**

- Allow going back to previous step
- Don't lose filled data

---

## 22. User Experience Improvements

### 22.1 Address Management

**Task 22.1.1: User Address Page**

- **File**: `src/app/user/profile/addresses/page.tsx` (CREATE NEW)
- **Features**:
  - List all saved addresses
  - Add new address
  - Edit existing
  - Delete address
  - Set default address
  - Address labels (Home, Work, Other)

**Task 22.1.2: Address Popup in Checkout**

- **File**: `src/components/checkout/AddressSelector.tsx`
- **Modes**:
  1. Select from saved addresses
  2. "Add New" opens modal
  3. Set as default checkbox

**Task 22.1.3: Address Creation Component**

- **File**: `src/components/user/AddressForm.tsx`
- **Use**: `<SmartAddressForm />` (already exists)
- **Add**: Save for future checkbox
- **Add**: Set as default checkbox

---

### 22.2 Real-time Validation

**Issue**: Validation must trigger on select or 3 seconds after typing stops

**Task 22.2.1: Implement Debounced Validation**

```typescript
// In form components
const debouncedValidate = useDebounce(async (value) => {
  const result = await validateField(value);
  setFieldError(result.error);
}, 3000);

// On input change
onChange={(e) => {
  setValue(e.target.value);
  debouncedValidate(e.target.value);
}}

// On blur (immediate)
onBlur={async (e) => {
  const result = await validateField(e.target.value);
  setFieldError(result.error);
}}

// On select (immediate)
onSelect={async (value) => {
  const result = await validateField(value);
  setFieldError(result.error);
}}
```

**Task 22.2.2: Apply to All Forms**

- Product creation
- Auction creation
- Shop creation
- User profile
- Settings

---

### 22.3 Favorites & Watchlist Merge

**Issue**: Favorites and watchlist are same, merge them

**Task 22.3.1: Database Migration**

```typescript
// Rename collection: watchlist → favorites (or vice versa)
// Merge data from both collections
// Collection: favorites
interface Favorite {
  id: string;
  userId: string;
  itemId: string;
  itemType: "product" | "auction" | "shop";
  addedAt: Timestamp;
}
```

**Task 22.3.2: Update UI**

- **Files**:
  - `src/app/user/favorites/page.tsx` (rename from watchlist)
  - `src/components/common/FavoriteButton.tsx`
- **Icon**: Heart icon (filled/unfilled)
- **Text**: "Add to Favorites" / "Remove from Favorites"

**Task 22.3.3: Update Service**

- **File**: `src/services/favorites.service.ts`
- Merge watchlist methods if separate

**Task 22.3.4: Update Navigation**

- Remove "Watchlist" from menu
- Keep only "Favorites"

---

### 22.4 Auction History

**Issue**: Auctions not coming in viewing history

**Task 22.4.1: Fix History Tracking**

- **File**: `src/app/auctions/[slug]/page.tsx`
- **Add**: View tracking on page load

```typescript
useEffect(() => {
  viewingHistoryService.trackView(auctionId, "auction");
}, [auctionId]);
```

**Task 22.4.2: Update Viewing History Service**

- **File**: `src/services/viewing-history.service.ts`
- **Ensure**: Supports auction type
- **Schema**:

```typescript
interface ViewingHistory {
  id: string;
  userId: string;
  itemId: string;
  itemType: "product" | "auction";
  viewedAt: Timestamp;
}
```

---

### 22.5 Image Zoom Enhancement

**Issue**: Zoom should support -50% to +100%

**Task 22.5.1: Update Image Viewer**

- **File**: `src/components/product/ProductImageViewer.tsx`
- **Zoom Range**:
  ```typescript
  const MIN_ZOOM = 0.5; // 50% (zoom out)
  const MAX_ZOOM = 2.0; // 200% (zoom in)
  const DEFAULT_ZOOM = 1.0; // 100%
  ```

**Task 22.5.2: Zoom Controls**

- Zoom in button (+)
- Zoom out button (-)
- Reset button (100%)
- Zoom slider
- Mouse wheel support
- Pinch to zoom (mobile)

---

## 23. Cart & Checkout Fixes

### 23.1 Cart Badge Not Showing

**Issue**: Cart badge doesn't show count after adding item

**Task 23.1.1: Debug Cart Context**

- **File**: `src/contexts/CartContext.tsx`
- Check if cart state updates after addToCart
- Verify context provider wraps entire app

**Task 23.1.2: Update Cart Badge**

- **File**: `src/components/layout/Header.tsx` or `src/components/cart/CartIcon.tsx`
- **Ensure**: Reading from cart context
- **Display**: Badge with item count

```tsx
{
  itemCount > 0 && <span className="badge">{itemCount}</span>;
}
```

**Task 23.1.3: Real-time Updates**

- Use context + localStorage
- Sync across tabs
- Update on add/remove/update

---

### 23.2 Empty Cart Display

**Issue**: Cart shows empty even after adding items

**Task 23.2.1: Debug Cart Data**

- **File**: `src/app/cart/page.tsx`
- Check if cart items are fetched
- Verify data persistence (localStorage + Firestore)
- Check user authentication state

**Task 23.2.2: Cart Loading States**

- Show loading skeleton while fetching
- Show empty state if no items
- Show items with quantities

**Task 23.2.3: Cart Persistence**

```typescript
// On add to cart
localStorage.setItem("cart", JSON.stringify(cartItems));

// On page load
const savedCart = localStorage.getItem("cart");
if (savedCart && user) {
  // Merge with server cart
  // Sync to Firestore
}
```

---

## 24. Admin Navigation & UI

### 24.1 Update Admin Navigation

**Issue**: Admin navigation links need proper tabs

**Task 24.1.1: Create Tab Structure**

- **File**: `src/components/admin/AdminNavigation.tsx`
- **Tabs**:

  ```
  Dashboard
  ├─ Overview
  └─ Analytics

  Content
  ├─ Products
  ├─ Auctions
  ├─ Categories
  ├─ Blogs
  └─ Pages

  Commerce
  ├─ Orders
  ├─ Returns
  ├─ Coupons
  └─ Payouts

  Users
  ├─ Customers
  ├─ Sellers
  ├─ Admins
  └─ Support Tickets

  Shops
  ├─ All Shops
  ├─ Verification
  └─ Reviews

  Settings
  ├─ General
  ├─ Email
  ├─ Shipping
  ├─ Payment
  ├─ WhatsApp
  └─ Homepage
  ```

**Task 24.1.2: Active State**

- Highlight current section
- Expand current group
- Breadcrumbs at top

---

### 24.2 Grouped Settings

**Issue**: Settings must be grouped properly

**Task 24.2.1: Settings Layout**

- **File**: `src/app/admin/settings/layout.tsx`
- **Sidebar**: Setting categories
- **Content**: Setting forms

**Task 24.2.2: Setting Groups**

```
General Settings
├─ Site Information
├─ SEO & Meta
└─ Maintenance

Communication
├─ Email Configuration
├─ WhatsApp Integration
└─ SMS Settings

Commerce
├─ Payment Gateways
├─ Shipping Providers
└─ Tax Configuration

Appearance
├─ Theme
├─ Homepage
└─ Hero Slides

Advanced
├─ Security
├─ API Keys
└─ Backups
```

---

## 25. Support System Enhancements

### 25.1 Support Categories

**Issue**: Admin can create support categories

**Task 25.1.1: Support Categories Management**

- **File**: `src/app/admin/support/categories/page.tsx` (CREATE NEW)
- **Features**:
  - List categories
  - Create new category
  - Edit category
  - Delete category
  - Set default category
  - Priority/Order

**Task 25.1.2: Database Schema**

```typescript
// Collection: support_categories
interface SupportCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  order: number;
  active: boolean;
  defaultAssignee?: string; // Admin user ID
  createdAt: Timestamp;
}
```

---

### 25.2 Support Ticket Email Requirement

**Issue**: User must give email for support ticket

**Task 25.2.1: Update Ticket Form**

- **File**: `src/app/support/create/page.tsx`
- **Add**: Email field (required)
- **Pre-fill**: If user logged in
- **Validate**: Email format

**Task 25.2.2: Email Field**

```tsx
<input
  type="email"
  required
  defaultValue={user?.email}
  placeholder="your.email@example.com"
/>
```

---

### 25.3 Shop Support Integration

**Issue**: For shop, email and number are taken from user

**Task 25.3.1: Shop Support Form**

- **File**: `src/app/shops/[slug]/support/page.tsx`
- **Auto-fill**:
  - Email from user profile
  - Phone from user profile
  - Shop details pre-selected

**Task 25.3.2: Support Ticket Schema**

```typescript
interface SupportTicket {
  // ... existing fields
  shopId?: string; // If related to shop
  userEmail: string; // Always required
  userPhone?: string;
}
```

---

### 25.4 Return & Refund Seller Involvement

**Issue**: Return/refund pages should support seller involvement

**Task 25.4.1: Seller Return Dashboard**

- **File**: `src/app/seller/returns/page.tsx`
- **Features**:
  - View return requests
  - Approve/reject returns
  - Mark item received
  - Initiate refund
  - Communication with buyer

**Task 25.4.2: Return Workflow**

1. Buyer requests return
2. Seller notified (email + dashboard)
3. Seller reviews request
4. Seller approves → Provides return address
5. Buyer ships item back
6. Seller receives & inspects
7. Seller approves refund
8. Admin processes payment (or auto-process)

**Task 25.4.3: Return Status**

```typescript
type ReturnStatus =
  | "requested"
  | "seller_review"
  | "approved"
  | "rejected"
  | "item_shipped"
  | "item_received"
  | "refund_initiated"
  | "refund_completed"
  | "closed";
```

---

## 26. Critical Bug Fixes

### 26.1 Users Not Loading

**Issue**: All users are not loading up

**Task 26.1.1: Debug Users API**

- **File**: `src/app/api/admin/users/route.ts`
- Check query limits
- Verify Sieve parameters
- Check pagination logic
- Look for errors in console

**Task 26.1.2: Check User Service**

- **File**: `src/services/users.service.ts`
- Verify API call
- Check response handling

**Task 26.1.3: Increase Limits**

- Check if default limit is too low
- Ensure pagination works
- Add "Load More" or increase page size

---

### 26.2 Resource Not Found Errors

**Issue**: Lots of resource not found errors

**Task 26.2.1: Enable Error Tracking**

- Check browser console for 404s
- Check Network tab for failed requests
- List all failing URLs

**Task 26.2.2: Common Causes**

- Images with incorrect paths
- API routes not matching
- Slug vs ID confusion
- Missing route files

**Task 26.2.3: Fix Strategy**

1. Log all 404 errors
2. Create missing routes
3. Fix incorrect paths
4. Add fallback handling

---

### 26.3 Date Issues

**Issue**: Fix date issues and "filters too big" issues

**Task 26.3.1: Date Handling**

- **Standardize**: Use ISO 8601 format
- **Timezone**: Always store in UTC
- **Display**: Convert to user's timezone
- **Libraries**: Use `date-fns` or `dayjs` consistently

**Task 26.3.2: Date Validation**

```typescript
// Ensure dates are valid before saving
const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};
```

**Task 26.3.3: Filters Too Big Issue**

- **Issue**: URL too long with many filters
- **Solution**: Store filter state in session/localStorage
- **Alternative**: Use POST instead of GET for filtered queries
- **Compress**: Encode filter JSON in URL param

**Task 26.3.4: Filter URL Management**

```typescript
// Compress filters
const compressFilters = (filters: Record<string, any>): string => {
  const json = JSON.stringify(filters);
  return btoa(json); // Base64 encode
};

// Use in URL
const filterParam = compressFilters(appliedFilters);
router.push(`/products?f=${filterParam}`);
```

---

### 26.4 Code Refactoring Analysis

**Issue**: Analyze and refactor similar code

**Task 26.4.1: Identify Duplicate Patterns**

- Product/Auction forms (70% similar)
- List pages (admin/seller/user)
- Card components
- Filter sidebars
- Wizard steps

**Task 26.4.2: Create Abstractions**

- `<ItemForm>` - Base for product/auction
- `<ResourceListPage>` - Generic list with filters
- `<ItemCard>` - Polymorphic card
- `<WizardStep>` - Reusable step wrapper

**Task 26.4.3: Extract Common Logic**

```typescript
// Common hooks
useResourceCRUD<T>(resourceType: string)
useResourceList<T>(resourceType: string)
useResourceForm<T>(resourceType: string)
```

**Task 26.4.4: Reduce Duplication**

- DRY principle
- Single source of truth
- Shared types
- Common utilities

---

### 26.5 Sieve Performance Optimization

**Issue**: Huge lag in response (10+ seconds) for Sieve requests

**Task 26.5.1: Identify Performance Bottlenecks**

- **Files to analyze**:
  - `src/app/api/lib/sieve/middleware.ts`
  - All API routes using Sieve pagination
- **Check**:
  - Firestore query complexity
  - Number of filters applied
  - Missing indexes
  - Data transformation overhead

**Task 26.5.2: Add Firestore Composite Indexes**

- **File**: `firestore.indexes.json`
- **Create indexes for**:
  ```json
  {
    "collectionGroup": "products",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "categoryIds", "arrayConfig": "CONTAINS" },
      { "fieldPath": "featured", "order": "ASCENDING" },
      { "fieldPath": "createdAt", "order": "DESCENDING" }
    ]
  }
  ```
- **Add indexes for common filter combinations**:
  - status + category + price range
  - status + shopId + createdAt
  - status + featured + createdAt
  - categoryIds + price + rating

**Task 26.5.3: Optimize Sieve Query Construction**

- **File**: `src/app/api/lib/sieve/query-builder.ts`
- **Optimizations**:

  ```typescript
  // Use efficient query operations
  // 1. Apply most selective filters first
  // 2. Use 'in' queries for multiple values (max 10)
  // 3. Avoid != and not-in operators
  // 4. Limit array-contains queries

  // Example optimization
  let query = baseQuery;

  // Apply status filter first (most selective)
  if (filters.status) {
    query = query.where("status", "==", filters.status);
  }

  // Then category filter
  if (filters.categoryId) {
    query = query.where("categoryIds", "array-contains", filters.categoryId);
  }

  // Finally sort and paginate
  query = query.orderBy("createdAt", "desc").limit(pageSize);
  ```

**Task 26.5.4: Implement Caching Layer**

- **File**: `src/app/api/lib/cache/redis-cache.ts` (CREATE NEW or use Firebase)

```typescript
// Cache Sieve results for 5 minutes
class SieveCache {
  async get(cacheKey: string): Promise<SieveResponse | null> {
    // Check cache (Redis, Firebase Realtime DB, or in-memory)
  }

  async set(
    cacheKey: string,
    data: SieveResponse,
    ttl: number = 300
  ): Promise<void> {
    // Store with TTL
  }

  generateKey(resource: string, params: SieveParams): string {
    // Create consistent cache key
    return `sieve:${resource}:${JSON.stringify(params)}`;
  }
}
```

**Task 26.5.5: Add Request Debouncing on Client**

```typescript
// In useResourceList hook
const debouncedFetch = useDebounce(async (params: SieveParams) => {
  const result = await fetchData(params);
  setData(result);
}, 500); // Wait 500ms after user stops interacting

// Prevents rapid-fire requests while filtering
```

**Task 26.5.6: Pagination Strategy Optimization**

```typescript
// Use cursor-based pagination for better performance
interface CursorPaginationParams {
  pageSize: number;
  cursor?: string; // Last document ID
}

// Instead of OFFSET which gets slower with large datasets
// Use startAfter(lastDoc) which is O(1)
const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
const nextQuery = baseQuery
  .orderBy("createdAt", "desc")
  .startAfter(lastVisible)
  .limit(pageSize);
```

**Task 26.5.7: Add Response Time Monitoring**

```typescript
// In API routes
const startTime = Date.now();

// ... process request

const duration = Date.now() - startTime;
console.log(`[PERF] Sieve query took ${duration}ms`, {
  resource,
  filters,
  resultCount,
});

// Log slow queries (>1000ms)
if (duration > 1000) {
  logError(new Error("Slow Sieve query"), {
    component: "SieveMiddleware",
    metadata: { duration, resource, filters },
  });
}
```

**Task 26.5.8: Optimize Data Transformation**

```typescript
// Avoid transforming large datasets in API route
// Transform only visible page data
const documents = querySnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));

// Don't fetch unnecessary fields
const query = baseQuery.select(
  "id",
  "name",
  "price",
  "images",
  "status"
  // Exclude large fields like description, specifications
);
```

**Task 26.5.9: Implement Lazy Loading**

```tsx
// On list pages, load in batches
<InfiniteScroll
  dataLength={items.length}
  next={loadMoreItems}
  hasMore={hasMore}
  loader={<LoadingSkeleton />}
>
  {items.map((item) => (
    <ItemCard key={item.id} item={item} />
  ))}
</InfiniteScroll>
```

**Task 26.5.10: Database Query Optimization Checklist**

- [ ] Created composite indexes for common filter combinations
- [ ] Reduced number of filters applied simultaneously
- [ ] Using most selective filters first
- [ ] Avoiding array-contains on large arrays
- [ ] Using cursor pagination instead of offset
- [ ] Caching frequent queries
- [ ] Debouncing client-side requests
- [ ] Loading only required fields
- [ ] Monitoring and logging slow queries
- [ ] Using connection pooling (if applicable)

**Task 26.5.11: Firestore Best Practices**

```typescript
// 1. Denormalize data for read performance
interface Product {
  // Instead of referencing shop by ID
  shopId: string;

  // Include frequently accessed shop data
  shop: {
    id: string;
    name: string;
    logo: string;
  };
}

// 2. Use batch reads for related data
const batch = db.batch();
productIds.forEach((id) => {
  batch.get(db.collection("products").doc(id));
});
const results = await batch.commit();

// 3. Limit array size in documents
// Arrays with 100+ items slow down queries
// Consider separate subcollection instead
```

**Task 26.5.12: Monitor Performance Metrics**

- Set up Firebase Performance Monitoring
- Track Sieve query durations
- Alert on queries > 3 seconds
- Analyze slow query patterns
- Optimize based on actual usage data

---

## Migration Guide

### For Each Task:

1. **Read Existing Code**: Check current implementation
2. **Follow Architecture**: Service → API → Database pattern
3. **Use Existing Patterns**: Constants, hooks, components
4. **Add Tests**: Unit tests for services, integration tests for APIs
5. **Update Documentation**: Add to AI-AGENT-GUIDE if patterns created
6. **Test Dark Mode**: Ensure all new UI supports dark mode
7. **Mobile Responsive**: Test on mobile breakpoints
8. **Error Handling**: Use `logError` and proper error boundaries

### Code Review Checklist:

- [ ] Uses existing hooks (`useLoadingState`, `useDebounce`, `useFilters`)
- [ ] Uses constants (no hardcoded strings)
- [ ] Has dark mode support (`dark:*` classes)
- [ ] Is mobile responsive
- [ ] Has error handling
- [ ] Has loading states
- [ ] Follows TypeScript strict mode
- [ ] Has proper comments/JSDoc
- [ ] File size < 350 lines (split if needed)
- [ ] Uses service layer (not direct DB access)
- [ ] API routes use Zod validation
- [ ] Follows naming conventions

---

## Implementation Priority (Updated)

### Phase 1: Critical Fixes & Performance (Week 1)

1. 🔥 **Sieve performance optimization** (Task 26.5) - **URGENT**
2. ✅ Cart badge not showing (Task 23.1)
3. ✅ Empty cart display (Task 23.2)
4. ✅ Users not loading (Task 26.1)
5. ✅ Resource not found errors (Task 26.2)
6. ✅ Date issues (Task 26.3.1)
7. ✅ Shop creation wizard (Task 21.3)

### Phase 2: Core Features (Week 2-3)

7. ✅ Multiple category selection (Task 18.1)
8. ✅ Auto-generate SKU with barcode (Task 18.2)
9. ✅ Auto-generate slug (Task 18.3)
10. ✅ Enhanced media upload (Task 18.5)
11. ✅ Rich text editor (Task 18.6)
12. ✅ Validation error display (Task 18.8)
13. ✅ Real-time validation (Task 22.2)

### Phase 3: Admin Features (Week 4-5)

14. ✅ Category graph view (Task 19.1)
15. ✅ Category hierarchy (Task 19.2)
16. ✅ Admin navigation tabs (Task 24.1)
17. ✅ Grouped settings (Task 24.2)
18. ✅ Homepage settings fixes (Task 20.1)
19. ✅ Resend verification (Task 20.4)

### Phase 4: Shop Management (Week 6)

20. ✅ Shop verification (Task 21.1)
21. ✅ Shop address selection (Task 21.2)
22. ✅ Seller return dashboard (Task 25.4)
23. ✅ Shipping provider management (Task 20.3)

### Phase 5: UX Improvements (Week 7)

24. ✅ Address management (Task 22.1)
25. ✅ Favorites/watchlist merge (Task 22.3)
26. ✅ Auction history tracking (Task 22.4)
27. ✅ Image zoom enhancement (Task 22.5)
28. ✅ Support categories (Task 25.1)

### Phase 6: Integrations (Week 8+)

29. ✅ Razorpay Integration (Task 1.1)
30. ✅ WhatsApp Integration (Task 3)
31. ✅ Email Integration (Task 4)
32. ✅ Shiprocket Integration (Task 2)

### Phase 7: Polish & Refactoring (Ongoing)

33. ✅ Code refactoring (Task 26.4)
34. ✅ Filter improvements (Task 9)
35. ✅ Dark mode fixes (Task 10)
36. ✅ Mobile responsive updates

---

## Testing Checklist (Updated)

### Product/Auction Creation

- [ ] Multiple categories (leaf only) can be selected
- [ ] SKU auto-generates and shows barcode
- [ ] Slug auto-generates from name
- [ ] Slug validation works (checks duplicates)
- [ ] Stock defaults to 1, max 100 enforced
- [ ] 1 video + 5 images upload works
- [ ] Camera capture works
- [ ] Video thumbnail generates
- [ ] Rich text editor preserves formatting
- [ ] Paste from Word/Google Docs works
- [ ] Featured toggle only shows for admin
- [ ] Validation errors show below inputs
- [ ] Validation triggers on blur/after 3 seconds
- [ ] Auction date validation works
- [ ] Default starting bid is ₹10
- [ ] Condition dropdown works

### Category System

- [ ] List view shows hierarchy
- [ ] Grid view shows cards
- [ ] Graph view renders correctly
- [ ] Graph draws from center
- [ ] Quick actions work (create/edit/delete)
- [ ] Category hierarchy saved correctly
- [ ] Leaf category validation works

### Admin Features

- [ ] Navigation tabs work
- [ ] Settings grouped properly
- [ ] Homepage settings save
- [ ] Hero slides work
- [ ] Resend verification email works
- [ ] All users load correctly
- [ ] Shipping providers management works

### Shop Management

- [ ] Shop verification flow works
- [ ] Product creation blocked if not verified
- [ ] Shop address selector works
- [ ] Can only select 1 address
- [ ] Wizard step navigation works
- [ ] Next button visible and works
- [ ] Can jump to previous steps

### Cart & Checkout

- [ ] Cart badge shows count
- [ ] Cart displays items
- [ ] Address selector in checkout works
- [ ] Can add new address in checkout modal
- [ ] User address page works
- [ ] Can set default address

### User Experience

- [ ] Real-time validation works
- [ ] Favorites replaces watchlist
- [ ] Auction history tracks views
- [ ] Image zoom -50% to +100% works
- [ ] Support ticket requires email
- [ ] Shop support pre-fills user data

### Bug Fixes

- [ ] No resource not found errors
- [ ] Date handling consistent
- [ ] Filters don't make URL too long
- [ ] All users load without errors

### Performance

- [ ] Sieve requests complete in < 1 second
- [ ] Firestore composite indexes created
- [ ] Query optimization applied (most selective filters first)
- [ ] Caching implemented for frequent queries
- [ ] Client-side debouncing works (500ms)
- [ ] Cursor-based pagination implemented
- [ ] Only required fields fetched
- [ ] Response time monitoring active
- [ ] Slow query alerts configured
- [ ] Data denormalization applied where needed

---

## Conclusion

This comprehensive guide now covers all 62+ requirements including:

- Complete integration setup (Razorpay, Shiprocket, WhatsApp, Email)
- Product/Auction creation enhancements
- Category system with graph visualization
- Admin features and settings
- Shop verification and management
- User experience improvements
- Cart and checkout fixes
- Critical bug fixes
- Code refactoring guidelines

Implement systematically, test thoroughly, and maintain code quality throughout.

For questions or clarifications, refer to:

- **AI Agent Guide**: `/TDD/AI-AGENT-GUIDE.md`
- **AI Agent Map**: `/TDD/AI-AGENT-MAP.md`
- **Project README**: `/README.md`

**Remember**: Code quality over speed. Follow existing patterns. Test everything.
