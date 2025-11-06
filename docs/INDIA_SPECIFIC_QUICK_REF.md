# India-Specific Features Quick Reference

**Platform:** Let It Rip E-commerce  
**Market:** India (importing from Japan)  
**Last Updated:** November 7, 2025

---

## 🇮🇳 Payment Methods (via Razorpay)

### Available Payment Options

| Method                  | Provider                             | Processing Time | Notes                        |
| ----------------------- | ------------------------------------ | --------------- | ---------------------------- |
| **UPI**                 | GPay, PhonePe, Paytm, BHIM           | Instant         | Most popular in India        |
| **Credit Card**         | Visa, Mastercard, Amex, RuPay        | 2-3 days        | Secure, PCI-DSS              |
| **Debit Card**          | Visa, Mastercard, RuPay              | 2-3 days        | Widely used                  |
| **Net Banking**         | All major banks                      | Instant-24hrs   | Direct bank transfer         |
| **Wallets**             | Paytm, PhonePe, Amazon Pay, Mobikwik | Instant         | Popular for small amounts    |
| **EMI**                 | Banks, Razorpay                      | Same as card    | Available on orders ₹10,000+ |
| **International Cards** | Visa, Mastercard                     | 2-3 days        | Currency conversion applied  |

### COD (Cash on Delivery)

**Default Policy:** ❌ **NOT AVAILABLE**

**Why?**

- We must purchase products from Japan marketplace before shipping
- Payment must be secured upfront for international transactions
- High risk of non-payment on delivery

**Exception:**

- ✅ Some verified sellers may offer COD (shop-specific)
- ✅ Will be clearly shown at checkout if available
- ✅ Seller accepts the risk of non-payment

---

## 💰 Refund Processing Time (India)

| Payment Method        | Refund Time       | Notes                        |
| --------------------- | ----------------- | ---------------------------- |
| **UPI**               | 1-3 business days | Usually instant-24hrs        |
| **Credit Card**       | 5-7 business days | Bank processing time         |
| **Debit Card**        | 5-7 business days | Bank processing time         |
| **Net Banking**       | 3-5 business days | Direct to account            |
| **Wallets**           | 1-3 business days | Fast processing              |
| **Let It Rip Wallet** | Instant           | Can use for future purchases |

**Note:** Refunds issued to original payment method by default.

---

## 🚢 Shipping (Japan to India)

### Delivery Timeline

| Method       | Duration   | Tracking | Signature | Cost Range   |
| ------------ | ---------- | -------- | --------- | ------------ |
| **Standard** | 12-21 days | Full     | Yes       | ₹800-6,000   |
| **Express**  | 7-10 days  | Full     | Yes       | ₹1,500-8,000 |
| **Economy**  | 21-30 days | Basic    | No        | ₹500-4,000   |

### Process (7 Steps)

1. **Order Placed** → Payment confirmed
2. **Purchase from Japan** → We buy item (1-3 days)
3. **Domestic Shipping (Japan)** → To our warehouse (2-5 days)
4. **Quality Check** → Inspection (1-2 days)
5. **International Shipping** → Japan to India (5-14 days)
6. **Customs Clearance** → Indian customs (1-5 days)
7. **Final Delivery** → To your address (1-3 days)

### Carriers

**International:**

- DHL Express (5-7 days)
- FedEx International (5-7 days)
- Japan Post EMS (7-10 days)
- Japan Post Airmail (10-14 days)

**Domestic (India):**

- India Post
- Bluedart
- Delhivery
- DHL/FedEx Direct

### Serviceable Areas

- ✅ All major cities (Delhi, Mumbai, Bangalore, etc.)
- ✅ Tier 2/3 cities (most districts)
- ✅ Rural areas (subject to courier availability)
- ❌ PO Boxes, military bases (restricted)

---

## 💸 Customs & Import Duties

### Buyer Pays All Customs Charges

**Duty Structure:**

| Component                    | Rate     | Calculation Base           |
| ---------------------------- | -------- | -------------------------- |
| **Basic Customs Duty (BCD)** | 0-35%    | Product category dependent |
| **GST**                      | 18%      | (Product + Shipping + BCD) |
| **Social Welfare Surcharge** | 10%      | On BCD (if applicable)     |
| **Handling Fee**             | ₹100-500 | Charged by courier         |

### Example Calculation

**Product:** Gaming Console worth ₹30,000  
**Shipping:** ₹3,000  
**BCD (Electronics):** 20%

```
Product Value: ₹30,000
Shipping: ₹3,000
Total CIF: ₹33,000

BCD (20%): ₹6,600
GST Base: ₹33,000 + ₹6,600 = ₹39,600
GST (18%): ₹7,128
Social Welfare (10% of BCD): ₹660
Handling: ₹200

Total Customs: ₹14,588
Grand Total: ₹30,000 + ₹3,000 + ₹14,588 = ₹47,588
```

### Duty-Free Exemptions

**May qualify if:**

- Total value under ₹50,000 (INR)
- Item for personal use (not commercial)
- Marked as "gift" under $100 (discretionary)

⚠️ **Note:** Exemptions are at customs officer's discretion. No guarantee.

### Payment Methods for Customs

1. **Pay to Courier** (COD for duties) - Most common
2. **Online Pre-payment** - Some couriers allow
3. **Direct to Customs** - For India Post shipments

⚠️ **Refusing to pay = Package returned to Japan** (fees apply)

---

## 🔄 Return & Refund Requirements

### 🎥 Mandatory Unboxing Video

**Requirements:**

- ✅ Continuous take (no cuts/edits)
- ✅ Sealed package with shipping label visible
- ✅ Entire unboxing process
- ✅ All sides of product shown
- ✅ Timestamp visible on video
- ✅ Same day as delivery
- ✅ Good lighting

**Format:** MP4/MOV, max 500MB

### 📸 Mandatory Timestamp Photos

**Requirements:**

- ✅ 5-10 clear photos minimum
- ✅ All angles of product
- ✅ Visible date/timestamp
- ✅ Same day as delivery
- ✅ Defects clearly shown
- ✅ Include packaging if damaged

**Format:** JPG/PNG

### ⚠️ Without Documentation

**Result:** Automatic rejection of return request

**Why Required?**

- International shipping involves multiple handlers
- High-value collectibles and electronics
- Identifies when/where damage occurred
- Prevents fraudulent claims
- Required for insurance claims

### Return Window

| Issue Type            | Report Within | Return Within | Shipping Paid By |
| --------------------- | ------------- | ------------- | ---------------- |
| **Damaged/Defective** | 48 hours      | 30 days       | Seller           |
| **Wrong Item**        | 48 hours      | 30 days       | Seller           |
| **Buyer's Remorse**   | 30 days       | 30 days       | Buyer            |

### Non-Returnable Items

- Items marked "Final Sale"
- Opened collectibles (TCG packs, blind boxes)
- Digital products
- Custom-made items
- Intimate items (if seal broken)
- Perishables (food, cosmetics after 7 days)
- Items damaged by buyer
- **Items without video/photo documentation**

---

## 📞 Support Contact (India)

### Primary Channels

| Channel            | Details              | Availability          |
| ------------------ | -------------------- | --------------------- |
| **Email**          | support@letitrip.com | 24/7                  |
| **Phone**          | +91-XXXX-XXXXXX      | Mon-Sat, 10AM-7PM IST |
| **WhatsApp**       | +91-XXXX-XXXXXX      | Quick queries         |
| **Support Ticket** | /support/ticket      | 24/7                  |

### Specialized Support

- **Shipping:** shipping@letitrip.com
- **Returns:** returns@letitrip.com
- **Privacy:** privacy@letitrip.com
- **Legal:** legal@letitrip.com
- **Bulk Orders:** bulk@letitrip.com

---

## 🛡️ Compliance & Legal

### Indian Laws

- **Consumer Protection Act, 2019** - Full compliance
- **IT Act, 2000** - Data protection
- **GST Registration** - All transactions GST compliant
- **FEMA** - Foreign exchange regulations followed

### International Compliance

- **GDPR** (EU customers)
- **CCPA** (California customers)
- **PCI-DSS** (Payment security)

---

## 🚫 Prohibited & Restricted Items (India Customs)

### Cannot Import

❌ Weapons, firearms, ammunition  
❌ Illegal drugs and narcotics  
❌ Counterfeit goods  
❌ Obscene materials  
❌ Live animals/plants  
❌ Hazardous chemicals  
❌ Currency notes

### Restricted (Need Permits)

⚠️ Medicines (import license required)  
⚠️ Food products (FSSAI approval)  
⚠️ Cosmetics (drug license)  
⚠️ Electronics with WiFi/Bluetooth (BIS certification)  
⚠️ Satellite phones

---

## 💡 Pro Tips for Indian Buyers

### 1. Reduce Customs Duties

- Keep order value under ₹50,000 for potential exemption
- Consolidate multiple small orders
- Request seller to mark as "gift" (if legitimate)

### 2. Faster Delivery

- Choose express shipping
- Provide complete address with landmark
- Keep phone number updated
- Be available for delivery calls

### 3. Smooth Returns

- **ALWAYS record unboxing video**
- Enable camera timestamp before delivery
- Inspect item immediately on same day
- Report issues within 48 hours
- Keep original packaging for 30 days

### 4. Payment Tips

- Use UPI for instant confirmation
- EMI for orders above ₹10,000
- Check exchange rates before paying
- Save payment receipts

### 5. Track Your Order

- Check "My Orders" page daily
- Enable SMS/email notifications
- Track on courier website with tracking number
- Contact support if stuck in customs >5 days

---

## 📱 Mobile App Features (Coming Soon)

- Push notifications for order updates
- In-app camera for unboxing recording
- Auto-timestamp on photos
- Offline order tracking
- Instant UPI payments
- Quick reorder
- Wishlist sync

---

## 🎯 Quick Stats

- **Average Delivery:** 14-18 days (Standard)
- **Customs Clearance:** 2-3 days (typical)
- **Refund Processing:** 5-7 days (cards)
- **Return Window:** 30 days
- **Seller Response:** 24-48 hours
- **Support Response:** <24 hours

---

**Last Updated:** November 7, 2025  
**Platform:** Let It Rip (justforview.in)  
**Version:** 2.0

---

_For detailed policies, visit:_

- Privacy Policy: /privacy-policy
- Terms of Service: /terms-of-service
- Refund Policy: /refund-policy
- Shipping Policy: /shipping-policy
- FAQ: /faq
