// FAQ Data Structure

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// FAQ Categories
export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    icon: "rocket",
    description: "New to Let It Rip? Start here"
  },
  {
    id: "shopping",
    name: "Shopping & Orders",
    icon: "shopping-cart",
    description: "How to buy from Japanese marketplaces"
  },
  {
    id: "auctions",
    name: "Auctions",
    icon: "gavel",
    description: "Bidding and winning auctions"
  },
  {
    id: "payments",
    name: "Payments & Fees",
    icon: "credit-card",
    description: "Payment methods and fee structure"
  },
  {
    id: "shipping",
    name: "Shipping & Delivery",
    icon: "truck",
    description: "International shipping information"
  },
  {
    id: "returns",
    name: "Returns & Refunds",
    icon: "rotate-ccw",
    description: "Return policy and refund process"
  },
  {
    id: "account",
    name: "Account & Security",
    icon: "user",
    description: "Managing your account"
  },
  {
    id: "seller",
    name: "Selling",
    icon: "store",
    description: "For sellers and shop owners"
  }
];

// FAQ Items
export const FAQ_ITEMS: FAQItem[] = [
  // Getting Started
  {
    id: "what-is-letitrip",
    question: "What is Let It Rip?",
    answer: "Let It Rip is an India-based e-commerce platform that brings authentic products from around the world directly to Indian customers. We import from Japan, China, Hong Kong, USA, UK, and other countries. As a seller/reseller, we handle ALL import risks, customs duties, and international shipping - so you don't have to worry about imports. Shop worry-free with delivery across India!",
    category: "getting-started"
  },
  {
    id: "how-to-start",
    question: "How do I get started?",
    answer: "Simply create a free account, browse our curated collection of imported products, add items to your cart, and checkout using UPI, cards, or other Indian payment methods. We've already imported these items or will handle the import process for you. Most items ship within India in 3-7 days, pre-order items may take 15-25 days for import and delivery.",
    category: "getting-started"
  },
  {
    id: "create-account",
    question: "Do I need an account to shop?",
    answer: "Yes, you need to create an account to place orders. However, you can browse products without an account. Creating an account is free and takes less than a minute. You must be 18+ years old to register.",
    category: "getting-started"
  },
  {
    id: "india-shipping",
    question: "Do you ship to all parts of India?",
    answer: "Yes! We ship to all major cities (Delhi, Mumbai, Bangalore, Kolkata, Chennai, etc.), Tier 2/3 cities, and most rural areas across India. Since we're based in India and ship domestically, delivery is fast and reliable. We use trusted carriers like Bluedart, Delhivery, India Post, and DTDC. Pin code verification is done at checkout.",
    category: "getting-started"
  },
  {
    id: "import-source",
    question: "Which countries do you import from?",
    answer: "We import authentic products from Japan, China, Hong Kong, USA, UK, and other countries. We source collectibles, electronics, fashion, beauty products, and more from trusted international marketplaces and suppliers. As the importer, we handle all customs, duties, and shipping risks - you just shop and enjoy!",
    category: "getting-started"
  },

  // Shopping & Orders
  {
    id: "how-to-order",
    question: "How do I place an order?",
    answer: "Browse products, add items to your cart, proceed to checkout, enter your shipping address, select a payment method, and confirm your order. You'll receive an order confirmation email immediately.",
    category: "shopping"
  },
  {
    id: "track-order",
    question: "How can I track my order?",
    answer: "Log into your account, go to 'My Orders', and click on the order you want to track. You'll see the current status and tracking number once the item is shipped.",
    category: "shopping"
  },
  {
    id: "cancel-order",
    question: "Can I cancel my order?",
    answer: "Yes, you can cancel an order before it's shipped. Go to 'My Orders', select the order, and click 'Cancel Order'. Refunds are processed within 5-7 business days.",
    category: "shopping"
  },
  {
    id: "order-status",
    question: "What do the different order statuses mean?",
    answer: "Pending: Order received. Processing: Preparing for shipment (in-stock) or arranging import (pre-order). Shipped: On the way to you within India. Out for Delivery: Final delivery stage. Delivered: Order received. Cancelled: Order cancelled. Refunded: Payment returned. For pre-order items, you may see 'Importing' status while we bring the item to India.",
    category: "shopping"
  },
  {
    id: "invoice-gst",
    question: "Will I receive an invoice with GST?",
    answer: "Yes, you'll receive a tax invoice for your purchase. If the seller is GST-registered, GST will be shown separately. For imported items, customs duty receipt will be provided by the courier. You can download invoices from 'My Orders' page.",
    category: "shopping"
  },

  // Auctions
  {
    id: "how-auctions-work",
    question: "How do auctions work?",
    answer: "Browse live auctions, place a bid higher than the current bid, and wait for the auction to end. If you're the highest bidder when time runs out, you win! You'll be notified and can proceed to payment.",
    category: "auctions"
  },
  {
    id: "place-bid",
    question: "How do I place a bid?",
    answer: "Go to an auction page, enter your bid amount (must be higher than current bid), and click 'Place Bid'. You'll receive notifications if you're outbid.",
    category: "auctions"
  },
  {
    id: "won-auction",
    question: "What happens if I win an auction?",
    answer: "You'll receive an email notification. The item will be added to your 'Won Auctions' where you must complete payment within 48 hours using UPI, cards, or other Indian payment methods. After payment, the item will be processed and shipped from Japan like a regular order.",
    category: "auctions"
  },
  {
    id: "outbid",
    question: "What if I get outbid?",
    answer: "You'll receive instant email and SMS notification when someone places a higher bid. You can return to the auction and place a new higher bid (minimum ₹50 increment). Set up price alerts to get notified before auction ends.",
    category: "auctions"
  },
  {
    id: "reserve-price",
    question: "What is a reserve price?",
    answer: "Some auctions have a reserve price - the minimum amount the seller will accept. If bidding doesn't reach the reserve price by auction end, the item won't be sold. Reserve prices are hidden but you'll be notified if your bid meets the reserve.",
    category: "auctions"
  },
  {
    id: "auction-refund",
    question: "Can I get a refund if I win an auction?",
    answer: "All auction sales are final unless the item is significantly not as described or damaged in shipping. You MUST record unboxing video for auction purchases. Minor quality issues on 'as-is' auction items cannot be returned. Read auction descriptions carefully before bidding.",
    category: "auctions"
  },

  // Payments & Fees
  {
    id: "payment-methods",
    question: "What payment methods do you accept in India?",
    answer: "We accept all popular Indian payment methods via Razorpay: UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking (all major banks), Wallets (Paytm, PhonePe, Amazon Pay, Mobikwik), and EMI options on orders above ₹10,000. All transactions are secure and encrypted.",
    category: "payments"
  },
  {
    id: "cod-available",
    question: "Do you offer Cash on Delivery (COD)?",
    answer: "COD is available on select in-stock items! Since we're based in India and handle imports ourselves, we can offer COD on items already in our inventory. Pre-order items (that need to be imported) require advance payment. COD availability is clearly shown at checkout. COD charges: ₹50-100 depending on order value.",
    category: "payments"
  },
  {
    id: "fees-structure",
    question: "What are the fees?",
    answer: "We charge a service fee (5-15% depending on category) and international shipping fees (₹800-6,000 depending on weight and method). The total cost including all fees is shown in Indian Rupees (₹) at checkout before you confirm. No hidden charges!",
    category: "payments"
  },
  {
    id: "currency",
    question: "What currency are prices shown in?",
    answer: "All prices are displayed in Indian Rupees (₹). We handle the currency conversion from Japanese Yen automatically at competitive exchange rates updated daily.",
    category: "payments"
  },
  {
    id: "coupons",
    question: "Can I use coupons or discount codes?",
    answer: "Yes! Enter your coupon code at checkout. Some shops offer exclusive coupons. Check the 'Coupons' page for available discounts. Coupons can save you 5-20% on select products.",
    category: "payments"
  },
  {
    id: "upi-instant",
    question: "Is UPI payment instant?",
    answer: "Yes! UPI payments through GPay, PhonePe, Paytm, or BHIM are confirmed instantly. Your order will be processed immediately after successful UPI payment. This is the fastest payment method available.",
    category: "payments"
  },
  {
    id: "emi-available",
    question: "Can I buy on EMI?",
    answer: "Yes! EMI is available on orders above ₹10,000 through select banks and Razorpay EMI. You can choose 3, 6, 9, or 12-month EMI plans at checkout. Interest rates vary by bank and tenure.",
    category: "payments"
  },

  // Shipping & Delivery
  {
    id: "shipping-time",
    question: "How long does shipping take within India?",
    answer: "For IN-STOCK items: 3-7 days delivery across India (we ship from our warehouse within India). For PRE-ORDER items: 15-25 days total (includes 10-18 days for international import + customs clearance + 3-7 days domestic delivery). Delivery time depends on your location and product availability status shown on product page.",
    category: "shipping"
  },
  {
    id: "shipping-cost",
    question: "How much is shipping within India?",
    answer: "Domestic shipping rates: Standard (₹40-150, 5-7 days), Express (₹100-300, 2-4 days), Free Shipping on orders above ₹999. Exact costs calculated at checkout based on weight, dimensions, and pin code. Since we ship from within India, shipping is much faster and cheaper than international rates!",
    category: "shipping"
  },
  {
    id: "countries",
    question: "Do you ship only within India?",
    answer: "Yes, we currently ship only within India. We are an India-based seller focused on providing the best experience for Indian customers with domestic shipping, Indian payment methods, local customer support, and no customs hassles for you. We handle all international imports ourselves.",
    category: "shipping"
  },
  {
    id: "customs",
    question: "Do I need to pay customs duties?",
    answer: "NO! Since we are the importer and ship from within India, you don't pay any customs duties. All import duties, taxes, and customs clearance are handled by us before the product reaches our warehouse. The price you see is the final price you pay (plus domestic shipping). No hidden import charges!",
    category: "shipping"
  },
  {
    id: "stock-status",
    question: "What's the difference between in-stock and pre-order items?",
    answer: "IN-STOCK: Already in our India warehouse, ships in 1-2 days, delivers in 3-7 days. PRE-ORDER: Needs to be imported, we handle the international shipping and customs, delivers in 15-25 days. Pre-order items are clearly marked with estimated delivery date. You save money as we bulk import and handle all import risks!",
    category: "shipping"
  },
  {
    id: "tracking",
    question: "Can I track my package?",
    answer: "Yes! You'll receive a tracking number via SMS and email once shipped. Track in real-time from 'My Orders' page. For in-stock items, tracking activates within 24-48 hours. For pre-order items, you'll see 'Importing' status first, then tracking activates once item reaches India and ships from our warehouse.",
    category: "shipping"
  },
  {
    id: "delivery-issues",
    question: "What if I'm not home for delivery?",
    answer: "Courier will attempt delivery 2-3 times and leave a notice with contact number. You can reschedule delivery, provide alternate address, or pick up from nearest courier office. Keep your phone number updated as couriers will call before delivery. For COD orders, payment must be made on delivery.",
    category: "shipping"
  },

  // Returns & Refunds
  {
    id: "return-policy",
    question: "What is your return policy?",
    answer: "Most items can be returned within 30 days of delivery. IMPORTANT: You MUST record an unboxing video (continuous take, sealed package visible, same-day timestamp) and take 5-10 timestamp photos on delivery day. Without this documentation, returns will be automatically rejected. This protects both you and us for imported high-value products.",
    category: "returns"
  },
  {
    id: "unboxing-video",
    question: "Why is unboxing video mandatory?",
    answer: "Since we import products internationally and deal with high-value collectibles/electronics, the unboxing video helps identify when/where damage occurred, prevents fraud, and is required by our shipping insurance. Enable camera timestamp before delivery and record the entire opening process from sealed package to product reveal. This is industry standard for imported goods.",
    category: "returns"
  },
  {
    id: "how-to-return",
    question: "How do I return an item?",
    answer: "Go to 'My Orders', select order, click 'Return Item', upload unboxing video (max 500MB, MP4/MOV) and timestamp photos (5-10 images, JPG/PNG). We review in 24-48 hours. If approved, ship back to our India warehouse address (provided in email). Return shipping within India: ₹100-300. We pay shipping if item is damaged/defective/wrong. You pay for buyer's remorse returns.",
    category: "returns"
  },
  {
    id: "refund-time",
    question: "How long do refunds take to Indian payment methods?",
    answer: "Refund processing time varies by method: UPI (1-3 days, usually instant), Credit/Debit Cards (5-7 days), Net Banking (3-5 days), Wallets (1-3 days), COD (bank transfer in 5-7 days), Let It Rip Wallet (instant). Total timeline including return shipping and inspection is 7-12 days. Refunds are issued to original payment method.",
    category: "returns"
  },
  {
    id: "damaged-item",
    question: "What if my item arrives damaged?",
    answer: "Report within 48 hours with unboxing video showing damage. Provide same-day timestamp photos of damaged item and outer packaging. We'll arrange free return pickup (we pay shipping) and full refund or replacement. All packages are insured. Contact returns@letitrip.com or WhatsApp support immediately for priority resolution.",
    category: "returns"
  },
  {
    id: "exchange-option",
    question: "Can I exchange an item instead of return?",
    answer: "Yes! If you want a different size, color, or variant of the same product, select 'Exchange' when creating return request. Exchanges are processed faster than returns (7-10 days). We'll ship the replacement once we receive the original item back. Exchange shipping is free for in-stock items.",
    category: "returns"
  },

  // Account & Security
  {
    id: "forgot-password",
    question: "I forgot my password. What do I do?",
    answer: "Click 'Forgot Password' on the login page, enter your email, and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
    category: "account"
  },
  {
    id: "change-email",
    question: "Can I change my email address?",
    answer: "Yes, go to 'Account Settings', click 'Change Email', enter your new email, and verify it using the OTP sent to the new address.",
    category: "account"
  },
  {
    id: "data-security",
    question: "Is my personal information secure?",
    answer: "Yes, we use industry-standard encryption (SSL/TLS) to protect your data. We comply with IT Act 2000 and data protection laws. Payment processing is handled by Razorpay (PCI-DSS certified). We never store your full UPI PIN, card CVV, or net banking passwords.",
    category: "account"
  },
  {
    id: "delete-account",
    question: "How do I delete my account?",
    answer: "Go to 'Account Settings', scroll to the bottom, and click 'Delete Account'. This action is permanent and will delete all your data as per Indian data protection laws. Complete any pending orders before deleting. Deletion takes 7-30 days to fully process.",
    category: "account"
  },
  {
    id: "kyc-verification",
    question: "Do I need to verify my identity (KYC)?",
    answer: "For regular shopping, basic registration is enough. However, for high-value purchases (₹50,000+), selling, or withdrawing to bank account, you may need to verify with Aadhaar OTP or PAN card as per RBI and Indian regulations. This prevents fraud and ensures secure transactions.",
    category: "account"
  },

  // Selling
  {
    id: "become-seller",
    question: "How do I become a seller?",
    answer: "Create an account, go to the seller dashboard, and create your shop. You'll need to provide business information (GST if applicable), bank/UPI details for payouts, and verify your identity with Aadhaar or PAN. Regular users can create 1 shop; admin accounts have unlimited shops.",
    category: "seller"
  },
  {
    id: "seller-fees",
    question: "What are the seller fees?",
    answer: "We charge a commission on each sale: 5-10% for most categories, up to 15% for electronics. GST (18%) is applicable on the commission. You'll see the exact fee structure when setting up your shop. No monthly subscription fees!",
    category: "seller"
  },
  {
    id: "seller-payouts",
    question: "How do I receive payments as a seller in India?",
    answer: "Payments are held for 7-14 days after delivery (to allow for returns). You can request payout to your bank account via NEFT/RTGS or directly to UPI. Minimum payout is ₹500. Payouts are processed within 3-5 business days. TDS may be deducted as per Indian tax laws.",
    category: "seller"
  },
  {
    id: "max-auctions",
    question: "How many auctions can I create?",
    answer: "Regular sellers can have up to 5 active auctions per shop at a time. Admin accounts have no limit. You can create more auctions after previous ones end. Each auction must have a minimum bid increment of ₹50.",
    category: "seller"
  },
  {
    id: "seller-cod",
    question: "Can I offer COD as a seller?",
    answer: "Yes, verified sellers can enable COD on their products if they accept the risk of non-payment. You must be a seller for 3+ months with good ratings (4.5+). COD orders are shown separately in your dashboard. We recommend only offering COD for lower-value items (under ₹5,000).",
    category: "seller"
  },
];

// Get FAQs by category
export function getFAQsByCategory(categoryId: string): FAQItem[] {
  return FAQ_ITEMS.filter(item => item.category === categoryId);
}

// Get all categories with item counts
export function getCategoriesWithCounts() {
  return FAQ_CATEGORIES.map(category => ({
    ...category,
    itemCount: FAQ_ITEMS.filter(item => item.category === category.id).length
  }));
}

// Search FAQs
export function searchFAQs(query: string): FAQItem[] {
  const lowerQuery = query.toLowerCase();
  return FAQ_ITEMS.filter(
    item =>
      item.question.toLowerCase().includes(lowerQuery) ||
      item.answer.toLowerCase().includes(lowerQuery)
  );
}
