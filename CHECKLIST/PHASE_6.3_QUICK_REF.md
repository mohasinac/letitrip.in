# Phase 6.3: Checkout Flow - Quick Reference

**Last Updated:** November 8, 2025

---

## 📦 File Locations

```
src/
├── app/
│   ├── api/checkout/
│   │   ├── create-order/route.ts      # Order creation API
│   │   └── verify-payment/route.ts    # Payment verification API
│   └── checkout/
│       └── page.tsx                   # Main checkout page
├── components/checkout/
│   ├── AddressSelector.tsx            # Address selection UI
│   ├── AddressForm.tsx                # Address form modal
│   └── PaymentMethod.tsx              # Payment method selector
└── services/
    ├── address.service.ts             # Address CRUD
    └── checkout.service.ts            # Checkout operations
```

---

## 🚀 Usage

### Navigate to Checkout

```tsx
// From cart page
<button onClick={() => router.push("/checkout")}>Proceed to Checkout</button>;

// From product page (with add to cart first)
await cartService.addItem({ productId, quantity, variant });
router.push("/checkout");
```

### Address Management

```tsx
import { addressService } from "@/services/address.service";

// Get all addresses
const addresses = await addressService.getAll();

// Create address
await addressService.create({
  name: "John Doe",
  phone: "9876543210",
  line1: "Flat 123, Building A",
  line2: "Street Name",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  country: "India",
  isDefault: true,
});

// Update address
await addressService.update(addressId, { isDefault: true });

// Delete address
await addressService.delete(addressId);
```

### Place Order

```tsx
import { checkoutService } from "@/services/checkout.service";

// Create order
const order = await checkoutService.createOrder({
  shippingAddressId: "addr_123",
  billingAddressId: "addr_123", // Optional, defaults to shipping
  paymentMethod: "razorpay", // or 'cod'
  couponCode: "SAVE10", // Optional
  notes: "Please call before delivery", // Optional
});

// For Razorpay, initialize payment
const razorpay = new window.Razorpay({
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: order.currency,
  order_id: order.razorpay_order_id,
  handler: async (response) => {
    await checkoutService.verifyPayment({
      order_id: order.order_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    });
    // Redirect to order success page
  },
});
razorpay.open();
```

---

## 📊 Data Flow

### Order Creation

```
1. User submits checkout form
   ↓
2. POST /api/checkout/create-order
   ↓
3. Validate cart items (stock, status)
   ↓
4. Validate addresses (ownership)
   ↓
5. Calculate totals (subtotal, shipping, tax, discount)
   ↓
6. Apply coupon (if provided)
   ↓
7. Create order document in Firestore
   ↓
8. If COD: Update stock, clear cart, return success
   ↓
9. If Razorpay: Generate order_id, return for payment
   ↓
10. Return order details to client
```

### Payment Verification (Razorpay)

```
1. User completes payment in Razorpay modal
   ↓
2. Razorpay sends response to handler
   ↓
3. POST /api/checkout/verify-payment
   ↓
4. Verify signature (HMAC SHA256)
   ↓
5. If valid: Update order status to 'paid'
   ↓
6. Update product stock (batch operation)
   ↓
7. Clear user cart (batch operation)
   ↓
8. Update coupon usage count
   ↓
9. Return success, redirect to order page
   ↓
10. If invalid: Log fraud attempt, mark payment failed
```

---

## 🔧 Configuration

### Environment Variables

```env
# Required for Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# Optional: Configure in code
FREE_SHIPPING_THRESHOLD=5000  # In rupees
TAX_RATE=0.18                 # 18% GST
SHIPPING_FEE=100              # In rupees
```

### Payment Methods

```typescript
// In checkout/page.tsx
const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">(
  "razorpay"
);

// To add new payment method:
// 1. Update type: 'razorpay' | 'cod' | 'wallet'
// 2. Add radio option in PaymentMethod component
// 3. Handle in create-order API route
```

---

## 🎨 Styling

### Checkout Steps

```tsx
// Steps configuration
const steps = [
  { id: "address", label: "Shipping", icon: MapPin },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: FileText },
];

// Add custom step
steps.push({
  id: "confirmation",
  label: "Confirm",
  icon: CheckCircle,
});
```

### Address Selector

```tsx
// Customize selected state
className={`
  border-2 rounded-lg cursor-pointer transition-all
  ${selected ? 'border-primary bg-primary/5' : 'border-gray-200'}
`}

// Customize default badge
<span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
  Default
</span>
```

---

## 🔐 Security

### Payment Signature Verification

```typescript
// In verify-payment API route
const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

if (generatedSignature !== razorpay_signature) {
  // Log fraud attempt
  console.error('Payment signature mismatch');
  // Mark payment as failed
  await orderDoc.ref.update({ payment_status: 'failed' });
  return error response;
}
```

### Address Ownership Validation

```typescript
// In create-order API route
const address = await Collections.addresses().doc(addressId).get();
const addressData = address.data();

if (addressData.user_id !== user.id) {
  return NextResponse.json({ error: "Invalid address" }, { status: 403 });
}
```

---

## 📝 API Reference

### POST /api/checkout/create-order

**Request Body:**

```json
{
  "shippingAddressId": "addr_123",
  "billingAddressId": "addr_123", // Optional
  "paymentMethod": "razorpay", // or "cod"
  "couponCode": "SAVE10", // Optional
  "notes": "Delivery instructions" // Optional
}
```

**Response (Razorpay):**

```json
{
  "success": true,
  "order_id": "doc_id_from_firestore",
  "order_number": "ORD-1699999999-ABCD1234",
  "razorpay_order_id": "order_xxxxxxxxxxxx",
  "amount": 150000, // In paise (₹1500.00)
  "currency": "INR"
}
```

**Response (COD):**

```json
{
  "success": true,
  "order_id": "doc_id_from_firestore",
  "order_number": "ORD-1699999999-ABCD1234",
  "razorpay_order_id": null,
  "amount": 150000,
  "currency": "INR"
}
```

### POST /api/checkout/verify-payment

**Request Body:**

```json
{
  "order_id": "doc_id_from_firestore",
  "razorpay_order_id": "order_xxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxx",
  "razorpay_signature": "signature_hash"
}
```

**Response:**

```json
{
  "success": true,
  "order_id": "doc_id_from_firestore",
  "order_number": "ORD-1699999999-ABCD1234",
  "payment_status": "paid"
}
```

---

## 🐛 Common Issues

### Issue: Razorpay modal not opening

**Solution:** Ensure Razorpay script is loaded:

```tsx
// In checkout page
<script src="https://checkout.razorpay.com/v1/checkout.js" async />
```

### Issue: Address not selectable

**Solution:** Check address has user_id matching current user:

```typescript
// In address API
const addresses = await Collections.addresses()
  .where("user_id", "==", user.id)
  .get();
```

### Issue: Order creation fails with stock error

**Solution:** Validate stock before adding to cart:

```typescript
// In add to cart
const product = await Collections.products().doc(productId).get();
if (product.data().stock_count < quantity) {
  throw new Error("Insufficient stock");
}
```

### Issue: Coupon not applied

**Solution:** Check coupon validation conditions:

- Status must be 'active'
- Current date between valid_from and valid_until
- Subtotal must meet min_purchase requirement
- Usage count must be less than usage_limit

---

## 🎯 Testing Checklist

### Manual Testing

- [ ] Guest user redirected to login
- [ ] Empty cart redirects to cart page
- [ ] Address selection works
- [ ] Add new address works
- [ ] Edit address pre-fills data
- [ ] Delete address shows confirmation
- [ ] "Same as shipping" checkbox works
- [ ] Payment method selection works
- [ ] Review step shows all items
- [ ] Delivery notes input saves
- [ ] COD order completes successfully
- [ ] Razorpay modal opens
- [ ] Razorpay payment succeeds
- [ ] Payment failure handled gracefully
- [ ] Stock updated after order
- [ ] Cart cleared after order
- [ ] Coupon usage incremented
- [ ] Order confirmation page shows

### API Testing

```bash
# Test order creation (COD)
curl -X POST http://localhost:3000/api/checkout/create-order \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION" \
  -d '{
    "shippingAddressId": "addr_123",
    "paymentMethod": "cod"
  }'

# Test payment verification
curl -X POST http://localhost:3000/api/checkout/verify-payment \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION" \
  -d '{
    "order_id": "order_123",
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature"
  }'
```

---

## 📚 Related Documentation

- [Phase 6.2: Shopping Cart](./PHASE_6.2_COMPLETION.md)
- [Phase 6.4: Order Tracking](./PENDING_TASKS.md#phase-64-order-tracking)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Address Schema](../src/types/index.ts)
- [Order Schema](../src/types/index.ts)

---

**Quick Links:**

- [Create Order API](../src/app/api/checkout/create-order/route.ts)
- [Verify Payment API](../src/app/api/checkout/verify-payment/route.ts)
- [Checkout Page](../src/app/checkout/page.tsx)
- [Address Service](../src/services/address.service.ts)
- [Checkout Service](../src/services/checkout.service.ts)
