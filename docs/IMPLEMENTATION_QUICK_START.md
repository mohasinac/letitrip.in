# 🚀 Implementation Quick Start Guide

This guide will help you get started with implementing the e-commerce features quickly.

---

## 📋 Prerequisites

Before starting, ensure you have:

1. ✅ Next.js 16 project running
2. ✅ Firebase configured
3. ✅ Authentication system working
4. ✅ Basic product/seller/order structure
5. ✅ Razorpay account (test mode)
6. ✅ PayPal developer account (optional)
7. ✅ Exchange rate API key (free tier)

---

## 🎯 Today's Goal: Working E-Commerce Website

**Realistic Scope for 1 Day:**

- Core shopping features (cart, wishlist)
- Basic checkout flow
- Payment integration (test mode)
- Order creation
- Basic order tracking

**What to defer for later sessions:**

- Advanced features (variants, recommendations)
- Shiprocket integration
- Review system
- Advanced search/filters
- Polish and optimization

---

## 🏃 Quick Implementation Path (8-10 hours)

### Phase 1: Foundation (2 hours)

**Files to create:**

```
src/
├── contexts/
│   ├── CurrencyContext.tsx      ← NEW
│   ├── CartContext.tsx           ← NEW
│   └── WishlistContext.tsx       ← NEW
├── types/
│   └── cart.ts                   ← NEW
└── lib/
    ├── currency/
    │   └── converter.ts          ← NEW
    └── cart/
        └── utils.ts              ← NEW
```

**Action Items:**

1. Create CurrencyContext with basic INR/USD support
2. Create CartContext with localStorage persistence
3. Create WishlistContext
4. Add contexts to layout.tsx

---

### Phase 2: Cart & Wishlist UI (2 hours)

**Files to create:**

```
src/
├── components/
│   ├── cart/
│   │   ├── FloatingCart.tsx      ← NEW
│   │   ├── CartDrawer.tsx        ← NEW
│   │   └── CartItem.tsx          ← NEW
│   └── wishlist/
│       └── WishlistButton.tsx    ← NEW
└── app/
    ├── cart/
    │   └── page.tsx              ← NEW
    └── wishlist/
        └── page.tsx              ← NEW
```

**Action Items:**

1. Create floating cart button (bottom-right)
2. Create cart drawer component
3. Add cart page with full functionality
4. Create wishlist button for products
5. Add wishlist page
6. Update product cards to include cart/wishlist buttons

---

### Phase 3: Checkout Flow (2 hours)

**Files to create:**

```
src/
├── app/
│   ├── checkout/
│   │   └── page.tsx              ← NEW
│   ├── profile/
│   │   ├── layout.tsx            ← NEW (sidebar)
│   │   └── addresses/
│   │       └── page.tsx          ← NEW
│   └── api/
│       ├── addresses/
│       │   └── route.ts          ← NEW
│       ├── checkout/
│       │   └── validate/
│       │       └── route.ts      ← NEW
│       └── cart/
│           └── route.ts          ← NEW
└── components/
    ├── checkout/
    │   ├── AddressSelector.tsx   ← NEW
    │   ├── OrderSummary.tsx      ← NEW
    │   └── PaymentMethod.tsx     ← NEW
    └── profile/
        └── AddressManager.tsx    ← NEW
```

**Action Items:**

1. Create address management (CRUD)
2. Create checkout page with 3 sections
3. Add API routes for address operations
4. Create address selector component
5. Create order summary component

---

### Phase 4: Payment Integration (2 hours)

**Files to create:**

```
src/
├── app/api/
│   ├── payment/
│   │   ├── razorpay/
│   │   │   ├── create/route.ts   ← NEW
│   │   │   ├── verify/route.ts   ← NEW
│   │   │   └── webhook/route.ts  ← NEW
│   │   └── paypal/
│   │       ├── create/route.ts   ← NEW
│   │       └── capture/route.ts  ← NEW
│   └── orders/
│       ├── create/route.ts       ← NEW
│       └── [id]/route.ts         ← NEW
├── lib/
│   └── payment/
│       ├── razorpay.ts           ← NEW
│       └── paypal.ts             ← NEW
└── components/
    └── payment/
        ├── RazorpayButton.tsx    ← NEW
        └── PayPalButton.tsx      ← NEW
```

**Action Items:**

1. Set up Razorpay SDK
2. Create payment order endpoint
3. Create payment verification endpoint
4. Add Razorpay button to checkout
5. Set up PayPal SDK (optional)
6. Create order creation API
7. Handle payment success/failure

---

### Phase 5: Order Management (2 hours)

**Files to update:**

```
src/app/
├── profile/
│   └── orders/
│       ├── page.tsx              ← UPDATE
│       └── [id]/page.tsx         ← UPDATE
├── seller/orders/
│   └── [id]/page.tsx             ← UPDATE
└── api/
    └── seller/orders/
        └── [id]/
            ├── accept/route.ts   ← NEW
            └── reject/route.ts   ← NEW
```

**Action Items:**

1. Update user orders page
2. Add order detail view for users
3. Update seller order acceptance flow
4. Add order status timeline
5. Create basic tracking view

---

## 📝 Step-by-Step Implementation

### Step 1: Currency System (30 minutes)

**1.1 Create Currency Context:**

```typescript
// src/contexts/CurrencyContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  convertPrice: (price: number) => number;
  formatPrice: (price: number) => string;
  exchangeRates: Record<string, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState("INR");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("preferred_currency");
    if (saved) setCurrencyState(saved);
  }, []);

  // Fetch exchange rates
  useEffect(() => {
    // TODO: Fetch from API
    // For now using static rates
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("preferred_currency", newCurrency);
  };

  const convertPrice = (price: number): number => {
    const rate = exchangeRates[currency] || 1;
    const converted = price * rate;
    return Math.ceil(converted); // Round to nearest higher value
  };

  const formatPrice = (price: number): string => {
    const converted = convertPrice(price);
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(converted);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        exchangeRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context)
    throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
};
```

**1.2 Add to Layout:**

```typescript
// src/app/layout.tsx
import { CurrencyProvider } from "@/contexts/CurrencyContext";

// Wrap children with CurrencyProvider
<CurrencyProvider>{children}</CurrencyProvider>;
```

**1.3 Add Currency Selector to Navbar:**

```typescript
// src/components/layout/CurrencySelector.tsx
"use client";

import { useCurrency } from "@/contexts/CurrencyContext";

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  const currencies = ["INR", "USD", "EUR", "GBP"];

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      className="bg-transparent border border-border rounded px-2 py-1 text-sm"
    >
      {currencies.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
```

---

### Step 2: Cart System (1 hour)

**2.1 Create Cart Types:**

```typescript
// src/types/cart.ts
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number; // in INR
  quantity: number;
  stock: number;
  sellerId: string;
  sellerName: string;
  sku?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}
```

**2.2 Create Cart Context:**

```typescript
// src/contexts/CartContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "@/types/cart";
import toast from "react-hot-toast";

interface CartContextType {
  items: CartItem[];
  addItem: (product: any, quantity: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product: any, quantity: number) => {
    const existing = items.find((item) => item.productId === product.id);

    if (existing) {
      updateQuantity(existing.id, existing.quantity + quantity);
    } else {
      const newItem: CartItem = {
        id: `cart_${Date.now()}`,
        productId: product.id,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        quantity,
        stock: product.stock,
        sellerId: product.sellerId,
        sellerName: product.sellerName || "Unknown Seller",
        sku: product.sku,
      };
      setItems([...items, newItem]);
      toast.success("Added to cart");
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(
      items.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
    toast.success("Removed from cart");
  };

  const clearCart = () => {
    setItems([]);
    toast.success("Cart cleared");
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
```

**2.3 Create Floating Cart:**

```typescript
// src/components/cart/FloatingCart.tsx
"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import CartDrawer from "./CartDrawer";

export default function FloatingCart() {
  const { itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow z-50"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-error text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
```

**2.4 Add FloatingCart to Layout:**

```typescript
// src/components/layout/ModernLayout.tsx
import FloatingCart from "@/components/cart/FloatingCart";

// Add before closing body tag
<FloatingCart />;
```

---

### Step 3: Checkout Page (1 hour)

**3.1 Create Checkout Page:**

```typescript
// src/app/checkout/page.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AddressSelector from "@/components/checkout/AddressSelector";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentMethod from "@/components/checkout/PaymentMethod";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal } = useCart();
  const router = useRouter();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  if (!user) {
    router.push("/login?redirect=/checkout");
    return null;
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address */}
          <AddressSelector
            selectedAddress={selectedAddress}
            onSelect={setSelectedAddress}
          />

          {/* Step 2: Payment Method */}
          <PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} />
        </div>

        <div>
          {/* Order Summary */}
          <OrderSummary
            items={items}
            subtotal={subtotal}
            selectedAddress={selectedAddress}
            paymentMethod={paymentMethod}
          />
        </div>
      </div>
    </div>
  );
}
```

---

### Step 4: Payment Integration (1 hour)

**4.1 Create Payment API:**

```typescript
// src/app/api/payment/razorpay/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, receipt } = await req.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: currency || "INR",
      receipt,
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**4.2 Create Order API:**

```typescript
// src/app/api/orders/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/admin";
import { verifyAuth } from "@/lib/auth/verify";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Create order in database
    const orderRef = db.collection("orders").doc();
    const order = {
      id: orderRef.id,
      orderNumber: `ORD${Date.now()}`,
      userId: user.uid,
      ...data,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
    };

    await orderRef.set(order);

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 🎨 UI Components Quick Reference

### Button Colors

- Primary: Add to Cart
- Success: Place Order
- Warning: Pending
- Error: Remove
- Info: View Details

### Common Patterns

```typescript
// Loading State
{
  isLoading && <LoadingSpinner />;
}

// Empty State
{
  items.length === 0 && <EmptyCart />;
}

// Error State
{
  error && <ErrorMessage error={error} />;
}
```

---

## 🧪 Testing Checklist

After each phase:

- [ ] Component renders without errors
- [ ] Data persists correctly
- [ ] Loading states work
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Accessibility (keyboard navigation)

---

## 🚨 Common Issues & Solutions

### Issue: Currency not updating

**Solution:** Check if CurrencyProvider is wrapping the component

### Issue: Cart items disappearing

**Solution:** Check localStorage persistence and useEffect dependencies

### Issue: Payment failing

**Solution:** Verify Razorpay keys and test mode settings

### Issue: Order not creating

**Solution:** Check Firebase permissions and API route authentication

---

## 📚 Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Razorpay Docs](https://razorpay.com/docs/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎯 End of Day Goal

By end of day, you should have:

✅ Working cart system
✅ Floating cart button
✅ Cart page
✅ Wishlist basic functionality
✅ Checkout page
✅ Address management
✅ Payment integration (test mode)
✅ Order creation
✅ Basic order viewing

---

## 📞 Next Session Topics

1. Review system
2. Advanced search & filters
3. Product recommendations
4. Shiprocket integration
5. Seller order management
6. Email notifications
7. Performance optimization

---

Good luck with the implementation! 🚀

Remember: **Working > Perfect**. Get it working first, then optimize!
