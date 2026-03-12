/**
 * Static FAQ Data
 *
 * All 102 FAQs across 7 categories, embedded statically so the FAQ page
 * and homepage FAQ section require no API or database calls.
 *
 * Categories: general (20), shipping (15), returns (12), payment (18),
 *             account (10), products (15), sellers (12)
 */

import type { FAQCategoryKey } from "./faq";
import { FAQ_TRANSLATIONS_HI } from "./faq-data-hi";

export interface StaticFAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategoryKey;
  tags: string[];
  isPinned: boolean;
  priority: number;
  order: number;
  stats: { views: number; helpful: number; notHelpful: number };
}

export const STATIC_FAQS: StaticFAQItem[] = [
  // ============================================
  // GENERAL (20 FAQs)
  // ============================================
  {
    id: "what-is-letitrip",
    question: "What is LetItRip?",
    answer:
      "LetItRip is a multi-seller e-commerce and auction platform where you can buy products, participate in auctions, and discover great deals from verified sellers across India.",
    category: "general",
    isPinned: true,
    order: 1,
    priority: 10,
    tags: ["about", "platform", "introduction"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "contact-customer-support",
    question: "How do I contact customer support?",
    answer:
      "You can reach our customer support team via email or call us. We are available Monday to Saturday, 9 AM to 6 PM IST.",
    category: "general",
    isPinned: false,
    order: 2,
    priority: 9,
    tags: ["support", "contact", "help"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "free-shipping-policy",
    question: "Is there free shipping on all orders?",
    answer:
      "No, we do not offer blanket free shipping. Shipping costs depend on the seller, product, and delivery location. Some sellers may offer free shipping on specific products - check the product description for details.",
    category: "general",
    isPinned: false,
    order: 3,
    priority: 8,
    tags: ["shipping", "delivery", "costs"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "free-returns-policy",
    question: "Do you offer free returns?",
    answer:
      "No, we do not have a blanket free returns policy. Return policies vary by seller and product. Check the product description for specific return terms, including any return shipping costs.",
    category: "general",
    isPinned: false,
    order: 4,
    priority: 8,
    tags: ["returns", "refunds", "policy"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "payment-methods-accepted",
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, digital wallets (Paytm, PhonePe, Google Pay), and EMI options on select purchases.",
    category: "general",
    isPinned: false,
    order: 5,
    priority: 7,
    tags: ["payment", "methods", "cards"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "track-my-order",
    question: "How do I track my order?",
    answer:
      'Once your order is shipped, you\'ll receive a tracking number via email and SMS. You can also track your order in the "My Orders" section of your account.',
    category: "general",
    isPinned: false,
    order: 6,
    priority: 7,
    tags: ["tracking", "orders", "delivery"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "cancel-order",
    question: "Can I cancel my order?",
    answer:
      "Yes, you can cancel your order before it is shipped. Once shipped, cancellation is not possible, but you may initiate a return after delivery.",
    category: "general",
    isPinned: false,
    order: 7,
    priority: 6,
    tags: ["cancel", "orders", "refund"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "product-authenticity",
    question: "Are products on LetItRip authentic?",
    answer:
      "Yes, all sellers on our platform are verified, and we have strict quality control measures. Products are sourced directly from sellers and checked for authenticity.",
    category: "general",
    isPinned: false,
    order: 8,
    priority: 8,
    tags: ["authentic", "quality", "trust"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "refund-policy",
    question: "What is your refund policy?",
    answer:
      "Refunds are processed within 5-7 business days after we receive and inspect the returned product. The amount will be credited to your original payment method.",
    category: "general",
    isPinned: false,
    order: 9,
    priority: 6,
    tags: ["refund", "returns", "money back"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "international-shipping",
    question: "Do you ship internationally?",
    answer:
      "Currently, we only ship within India. International shipping is not available at this time.",
    category: "general",
    isPinned: false,
    order: 10,
    priority: 5,
    tags: ["shipping", "international", "delivery"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "report-order-problem",
    question: "How do I report a problem with my order?",
    answer:
      'Go to "My Orders", select the order, and click "Report Issue". You can also contact customer support with your order number.',
    category: "general",
    isPinned: false,
    order: 11,
    priority: 6,
    tags: ["issues", "support", "help"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "business-hours",
    question: "What are your business hours?",
    answer:
      "Our customer support is available Monday to Saturday, 9:00 AM to 6:00 PM IST. Orders can be placed 24/7 on our website.",
    category: "general",
    isPinned: false,
    order: 12,
    priority: 4,
    tags: ["hours", "support", "timing"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "data-security",
    question: "How secure is my personal information?",
    answer:
      "We use industry-standard SSL encryption and comply with Indian data protection laws. Your personal and payment information is securely stored and never shared with third parties without consent.",
    category: "general",
    isPinned: false,
    order: 13,
    priority: 7,
    tags: ["security", "privacy", "data"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "modify-order",
    question: "Can I modify my order after placing it?",
    answer:
      "Orders can be modified within 1 hour of placement by contacting customer support. After that, you may need to cancel and place a new order.",
    category: "general",
    isPinned: false,
    order: 14,
    priority: 5,
    tags: ["modify", "orders", "changes"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "mobile-app",
    question: "Do you have a mobile app?",
    answer:
      "Currently, LetItRip is available as a mobile-optimized website. A dedicated mobile app is coming soon for iOS and Android.",
    category: "general",
    isPinned: false,
    order: 15,
    priority: 4,
    tags: ["app", "mobile", "download"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "company-location",
    question: "Where is LetItRip located?",
    answer:
      "Our headquarters is located in India. We serve customers across the country.",
    category: "general",
    isPinned: false,
    order: 16,
    priority: 3,
    tags: ["location", "address", "office"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "gift-cards",
    question: "Can I purchase gift cards?",
    answer:
      "Yes, gift cards are available in denominations of ₹500, ₹1000, ₹2000, and ₹5000. They can be purchased and sent via email to recipients.",
    category: "general",
    isPinned: false,
    order: 17,
    priority: 5,
    tags: ["gift cards", "vouchers", "gifts"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "privacy-policy-info",
    question: "What is your privacy policy?",
    answer:
      "Our privacy policy details how we collect, use, and protect your personal information. You can read the full policy on our Privacy Policy page.",
    category: "general",
    isPinned: false,
    order: 18,
    priority: 6,
    tags: ["privacy", "policy", "data"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "bulk-discounts",
    question: "Do you offer bulk discounts?",
    answer:
      "Yes, bulk purchase discounts are available for orders above 10 units. Contact our sales team for bulk pricing.",
    category: "general",
    isPinned: false,
    order: 19,
    priority: 4,
    tags: ["bulk", "discounts", "wholesale"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "loyalty-program",
    question: "Do you have a loyalty or rewards program?",
    answer:
      "Yes, we reward repeat buyers with cashback points, exclusive member discounts, and early access to sales. Points are earned on every verified purchase.",
    category: "general",
    isPinned: false,
    order: 20,
    priority: 5,
    tags: ["loyalty", "rewards", "points"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },

  // ============================================
  // SHIPPING (15 FAQs)
  // ============================================
  {
    id: "shipping-time",
    question: "How long does shipping take?",
    answer:
      "Shipping typically takes 3-7 business days depending on your location. Metro cities receive deliveries faster, while remote areas may take longer.",
    category: "shipping",
    isPinned: false,
    order: 1,
    priority: 9,
    tags: ["shipping", "delivery", "time"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "shipping-charges",
    question: "What are the shipping charges?",
    answer:
      "Shipping charges vary by seller, product weight, and delivery location. Exact charges are displayed at checkout before payment. Some sellers offer free shipping on specific products.",
    category: "shipping",
    isPinned: false,
    order: 2,
    priority: 8,
    tags: ["shipping", "charges", "cost"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "express-shipping",
    question: "Do you offer express shipping?",
    answer:
      "Yes, express shipping is available in select cities for an additional charge. Deliveries within 1-2 business days. Check availability at checkout.",
    category: "shipping",
    isPinned: false,
    order: 3,
    priority: 7,
    tags: ["express", "fast shipping", "delivery"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "change-delivery-address",
    question: "Can I change my delivery address after placing an order?",
    answer:
      "Yes, you can change your delivery address within 2 hours of placing the order. Contact customer support immediately for assistance.",
    category: "shipping",
    isPinned: false,
    order: 4,
    priority: 6,
    tags: ["address", "change", "delivery"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "missed-delivery",
    question: "What happens if I'm not home for delivery?",
    answer:
      "The delivery partner will attempt delivery 3 times. If you're unavailable, they'll leave a note. You can also schedule a redelivery or pick up from the nearest collection point.",
    category: "shipping",
    isPinned: false,
    order: 5,
    priority: 6,
    tags: ["delivery", "missed", "redelivery"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "po-box-shipping",
    question: "Do you ship to PO boxes?",
    answer:
      "No, we do not ship to PO boxes. Please provide a physical address with landmark for successful delivery.",
    category: "shipping",
    isPinned: false,
    order: 6,
    priority: 5,
    tags: ["PO box", "delivery", "address"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "signature-required-delivery",
    question: "Is signature required for delivery?",
    answer:
      "Yes, all deliveries require a signature for security. Someone 18+ must be present to receive and sign for the package.",
    category: "shipping",
    isPinned: false,
    order: 7,
    priority: 5,
    tags: ["signature", "delivery", "security"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "real-time-tracking",
    question: "Can I track my shipment in real-time?",
    answer:
      "Yes, once shipped, you'll receive a tracking link via SMS and email. The tracking page shows real-time location updates and estimated delivery time.",
    category: "shipping",
    isPinned: false,
    order: 8,
    priority: 7,
    tags: ["tracking", "real-time", "delivery"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "damaged-package",
    question: "What if my package is damaged during shipping?",
    answer:
      "If your package arrives damaged, take photos and refuse delivery if possible. Contact us immediately within 24 hours for a replacement or refund.",
    category: "shipping",
    isPinned: false,
    order: 9,
    priority: 6,
    tags: ["damaged", "package", "refund"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "scheduled-delivery",
    question: "Can I schedule a specific delivery date?",
    answer:
      "Scheduled delivery is available for select pin codes. Choose your preferred date at checkout if available in your area.",
    category: "shipping",
    isPinned: false,
    order: 10,
    priority: 4,
    tags: ["scheduled", "delivery", "date"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "courier-partners",
    question: "What courier services do you use?",
    answer:
      "We partner with India Post, BlueDart, Delhivery, DTDC, and other reliable courier services based on your location and product type.",
    category: "shipping",
    isPinned: false,
    order: 11,
    priority: 4,
    tags: ["courier", "delivery partners", "shipping"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "weekend-delivery",
    question: "Is weekend delivery available?",
    answer:
      "Yes, we deliver on Saturdays. Sunday delivery is available in select metro cities for an additional charge.",
    category: "shipping",
    isPinned: false,
    order: 12,
    priority: 5,
    tags: ["weekend", "saturday", "sunday"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "shipping-weight-limit",
    question: "What is the weight limit for shipments?",
    answer:
      "Individual packages are limited to 30kg. For heavier items, sellers may split orders into multiple shipments.",
    category: "shipping",
    isPinned: false,
    order: 13,
    priority: 3,
    tags: ["weight", "limit", "heavy items"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "cash-on-delivery",
    question: "Do you offer cash on delivery (COD)?",
    answer:
      "Yes, COD is available for orders up to ₹50,000. A nominal COD handling fee may apply depending on the seller.",
    category: "shipping",
    isPinned: false,
    order: 14,
    priority: 7,
    tags: ["COD", "cash on delivery", "payment"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "multiple-items-shipping",
    question: "Can items from the same order be shipped separately?",
    answer:
      "Yes, if your cart contains items from multiple sellers, each seller ships their items separately. You will receive tracking info for each shipment.",
    category: "shipping",
    isPinned: false,
    order: 15,
    priority: 5,
    tags: ["multiple", "sellers", "separate shipments"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },

  // ============================================
  // RETURNS (12 FAQs)
  // ============================================
  {
    id: "return-policy",
    question: "What is your return policy?",
    answer:
      "Returns are accepted within 7-14 days of delivery depending on the product category. Items must be unused, in original packaging with tags. Return shipping costs may apply unless mentioned otherwise by the seller.",
    category: "returns",
    isPinned: false,
    order: 1,
    priority: 9,
    tags: ["returns", "policy", "refund"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "initiate-return",
    question: "How do I initiate a return?",
    answer:
      'Go to "My Orders", select the product, click "Return Item", choose a reason, and submit. You\'ll receive return instructions via email within 24 hours.',
    category: "returns",
    isPinned: false,
    order: 2,
    priority: 8,
    tags: ["return", "process", "how to"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "return-shipping-cost",
    question: "Who pays for return shipping?",
    answer:
      "Return shipping costs depend on the seller's policy and reason for return. If the product is defective or wrong item, seller covers shipping. For change of mind, customer may bear return costs.",
    category: "returns",
    isPinned: false,
    order: 3,
    priority: 8,
    tags: ["return shipping", "cost", "charges"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "refund-processing-time",
    question: "When will I receive my refund?",
    answer:
      "Refunds are processed within 5-7 business days after the returned item is received and inspected. The amount is credited to your original payment method.",
    category: "returns",
    isPinned: false,
    order: 4,
    priority: 7,
    tags: ["refund", "timing", "processing"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "product-exchange",
    question: "Can I exchange an item instead of returning it?",
    answer:
      'Yes, exchanges are available for size or color variations if the same product is in stock. Select "Exchange" option when initiating the return.',
    category: "returns",
    isPinned: false,
    order: 5,
    priority: 6,
    tags: ["exchange", "swap", "size"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "non-returnable-items",
    question: "What items cannot be returned?",
    answer:
      'Non-returnable items include: personal care products, innerwear, food items, customized products, and items marked as "non-returnable" on the product page.',
    category: "returns",
    isPinned: false,
    order: 6,
    priority: 7,
    tags: ["non-returnable", "exceptions", "policy"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "return-packaging-requirements",
    question: "Do I need the original packaging for returns?",
    answer:
      "Yes, items must be returned in original packaging with all tags, labels, and accessories intact. Damaged packaging may result in partial refund or rejection.",
    category: "returns",
    isPinned: false,
    order: 7,
    priority: 6,
    tags: ["packaging", "condition", "requirements"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "defective-product-return",
    question: "What if I receive a defective product?",
    answer:
      "Contact us immediately with photos of the defect. We'll arrange a free return pickup and provide a full refund or replacement.",
    category: "returns",
    isPinned: false,
    order: 8,
    priority: 8,
    tags: ["defective", "damaged", "quality"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "gift-return",
    question: "Can I return a gift?",
    answer:
      "Yes, gifts can be returned within the standard return period. Refunds will be issued as store credit or to the original purchaser's payment method.",
    category: "returns",
    isPinned: false,
    order: 9,
    priority: 5,
    tags: ["gifts", "return", "refund"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "track-return",
    question: "How do I track my return?",
    answer:
      'Once your return is picked up, you\'ll receive a tracking number via email. Track the return status in "My Orders" section under "Returns & Refunds".',
    category: "returns",
    isPinned: false,
    order: 10,
    priority: 5,
    tags: ["return tracking", "status", "updates"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "rejected-return",
    question: "What if my return is rejected?",
    answer:
      "If your return is rejected due to policy violation or item condition, we'll notify you via email with the reason. The item will be shipped back to you at your expense.",
    category: "returns",
    isPinned: false,
    order: 11,
    priority: 4,
    tags: ["rejected", "return", "policy"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "sale-items-return",
    question: "Can I return sale or clearance items?",
    answer:
      'Sale and clearance items follow the same return policy unless marked as "final sale" or "non-returnable" on the product page.',
    category: "returns",
    isPinned: false,
    order: 12,
    priority: 5,
    tags: ["sale", "clearance", "final sale"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },

  // ============================================
  // PAYMENT (18 FAQs)
  // ============================================
  {
    id: "payment-methods",
    question: "What payment methods are accepted?",
    answer:
      "We accept UPI (Google Pay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking, digital wallets, and EMI options on select purchases.",
    category: "payment",
    isPinned: false,
    order: 1,
    priority: 9,
    tags: ["payment", "methods", "options"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "credit-card-security",
    question: "Is it safe to use my credit card on LetItRip?",
    answer:
      "Yes, absolutely. We use industry-standard SSL encryption and PCI DSS compliant payment gateways. Your card details are never stored on our servers.",
    category: "payment",
    isPinned: false,
    order: 2,
    priority: 8,
    tags: ["security", "credit card", "safe"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "emi-options",
    question: "Do you offer EMI options?",
    answer:
      "Yes, EMI is available on orders above ₹3,000 for 3, 6, 9, and 12 months. Select EMI at checkout and choose your preferred bank and tenure.",
    category: "payment",
    isPinned: false,
    order: 3,
    priority: 7,
    tags: ["EMI", "installments", "payment"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "cancellation-refund-policy",
    question: "What is your cancellation and refund policy?",
    answer:
      "Orders can be cancelled before shipping. Refunds are processed within 5-7 business days to your original payment method after cancellation or return approval.",
    category: "payment",
    isPinned: false,
    order: 4,
    priority: 7,
    tags: ["cancellation", "refund", "policy"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "multiple-payment-methods",
    question: "Can I use multiple payment methods for one order?",
    answer:
      "No, currently only one payment method can be used per order. You can split orders and use different payment methods for each.",
    category: "payment",
    isPinned: false,
    order: 5,
    priority: 5,
    tags: ["multiple payments", "split", "order"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "payment-declined",
    question: "Why was my payment declined?",
    answer:
      "Payments can be declined due to insufficient funds, incorrect card details, bank security blocks, or payment gateway issues. Contact your bank or try another payment method.",
    category: "payment",
    isPinned: false,
    order: 6,
    priority: 6,
    tags: ["declined", "failed", "payment"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "payment-receipt",
    question: "Will I receive a payment receipt?",
    answer:
      'Yes, a payment confirmation and invoice are sent to your email immediately after successful payment. You can also download invoices from "My Orders".',
    category: "payment",
    isPinned: false,
    order: 7,
    priority: 5,
    tags: ["receipt", "invoice", "confirmation"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "international-credit-cards",
    question: "Do you accept international credit cards?",
    answer:
      "Yes, we accept international Visa, Mastercard, and American Express cards. Currency conversion charges may apply by your card issuer.",
    category: "payment",
    isPinned: false,
    order: 8,
    priority: 4,
    tags: ["international", "credit card", "foreign"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "save-card-details",
    question: "Can I save my card for future purchases?",
    answer:
      "Yes, you can securely save your card details in your account for faster checkout. All saved cards are tokenized and encrypted per RBI guidelines.",
    category: "payment",
    isPinned: false,
    order: 9,
    priority: 5,
    tags: ["save card", "tokenization", "security"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "double-charged",
    question: "What if I'm charged twice for one order?",
    answer:
      "Double charges are rare but can occur due to payment gateway delays. Contact us immediately. The duplicate charge is automatically refunded within 7-10 business days.",
    category: "payment",
    isPinned: false,
    order: 10,
    priority: 6,
    tags: ["double charge", "refund", "error"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "paypal-payment",
    question: "Do you accept PayPal?",
    answer:
      "Currently, we do not accept PayPal. We accept UPI, cards, net banking, and digital wallets for Indian transactions.",
    category: "payment",
    isPinned: false,
    order: 11,
    priority: 3,
    tags: ["PayPal", "payment", "methods"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "hidden-charges",
    question: "Are there any hidden charges?",
    answer:
      "No, all charges including product price, shipping, taxes, and any additional fees are clearly displayed at checkout before payment. No hidden charges.",
    category: "payment",
    isPinned: false,
    order: 12,
    priority: 6,
    tags: ["charges", "fees", "transparency"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "tax-invoice",
    question: "Can I get a tax invoice for my purchase?",
    answer:
      'Yes, GST invoice is automatically generated and sent via email after order confirmation. You can also download it from "My Orders" section.',
    category: "payment",
    isPinned: false,
    order: 13,
    priority: 5,
    tags: ["tax", "invoice", "GST"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "chargeback-policy",
    question: "What is your policy on chargebacks?",
    answer:
      "Chargebacks should be initiated only after contacting our support team. Unauthorized chargebacks may result in account suspension and legal action.",
    category: "payment",
    isPinned: false,
    order: 14,
    priority: 4,
    tags: ["chargeback", "dispute", "policy"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "payment-refund-timeline",
    question: "How long does it take for refunds to process?",
    answer:
      "Refunds are processed within 5-7 business days after return approval. It may take additional 3-5 days for your bank to credit the amount.",
    category: "payment",
    isPinned: false,
    order: 15,
    priority: 7,
    tags: ["refund", "processing", "time"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "gift-card-payment",
    question: "Can I pay using a gift card or voucher?",
    answer:
      'Yes, you can apply gift cards, promo codes, or vouchers at checkout. Enter the code in the "Apply Coupon" field before payment.',
    category: "payment",
    isPinned: false,
    order: 16,
    priority: 5,
    tags: ["gift card", "voucher", "coupon"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "failed-payment-deduction",
    question: "What happens if payment fails but money is deducted?",
    answer:
      "If payment fails but amount is debited, the transaction is automatically reversed within 5-7 business days. Contact your bank if not credited within this time.",
    category: "payment",
    isPinned: false,
    order: 17,
    priority: 6,
    tags: ["failed payment", "deducted", "refund"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "transaction-fees",
    question: "Do you charge any transaction fees?",
    answer:
      "No transaction fees for UPI, cards, or net banking. COD orders may have a nominal handling charge. All charges are shown at checkout.",
    category: "payment",
    isPinned: false,
    order: 18,
    priority: 4,
    tags: ["fees", "transaction", "charges"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },

  // ============================================
  // ACCOUNT (10 FAQs)
  // ============================================
  {
    id: "create-account",
    question: "How do I create an account?",
    answer:
      'Click "Sign Up" in the top menu, enter your email and password, or sign up with Google/Apple. Verify your email to complete registration.',
    category: "account",
    isPinned: false,
    order: 1,
    priority: 8,
    tags: ["signup", "registration", "account"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "reset-password",
    question: "I forgot my password. How do I reset it?",
    answer:
      'Click "Forgot Password" on the login page, enter your email, and click "Reset Password". You\'ll receive a reset link via email within 5 minutes.',
    category: "account",
    isPinned: false,
    order: 2,
    priority: 7,
    tags: ["password", "reset", "forgot"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "change-email-address",
    question: "Can I change my email address?",
    answer:
      'Yes, go to "Account Settings" → "Security" → "Change Email". Enter your new email and verify it. Your login email will be updated.',
    category: "account",
    isPinned: false,
    order: 3,
    priority: 6,
    tags: ["email", "change", "account"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "update-profile",
    question: "How do I update my profile information?",
    answer:
      'Go to "My Profile" → "Edit Profile". You can update your name, phone number, and profile picture. Click "Save Changes" to update.',
    category: "account",
    isPinned: false,
    order: 4,
    priority: 6,
    tags: ["profile", "update", "edit"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "multiple-addresses",
    question: "Can I have multiple delivery addresses?",
    answer:
      'Yes, you can save multiple delivery addresses in "My Addresses". Set one as default for faster checkout or select different addresses for each order.',
    category: "account",
    isPinned: false,
    order: 5,
    priority: 6,
    tags: ["addresses", "delivery", "multiple"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "delete-account",
    question: "How do I delete my account?",
    answer:
      'Go to "Account Settings" → "Delete Account". Enter your password and confirm deletion. Note: This action is permanent and cannot be undone.',
    category: "account",
    isPinned: false,
    order: 6,
    priority: 5,
    tags: ["delete", "account", "remove"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "email-verification",
    question: "Why do I need to verify my email?",
    answer:
      "Email verification ensures account security, enables password reset, and allows us to send order updates and important notifications.",
    category: "account",
    isPinned: false,
    order: 7,
    priority: 5,
    tags: ["verification", "email", "security"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "link-social-accounts",
    question: "Can I link my social media accounts?",
    answer:
      'Yes, you can link Google and Apple accounts in "Account Settings" → "Connected Accounts" for easier login and social features.',
    category: "account",
    isPinned: false,
    order: 8,
    priority: 4,
    tags: ["social", "Google", "Apple"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "email-preferences",
    question: "How do I manage my email preferences?",
    answer:
      'Go to "Account Settings" → "Email Preferences" to choose which emails you want to receive: order updates, promotions, and more.',
    category: "account",
    isPinned: false,
    order: 9,
    priority: 4,
    tags: ["email", "preferences", "notifications"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "account-compromised",
    question: "What if my account is hacked or compromised?",
    answer:
      "Immediately reset your password and contact customer support. We'll secure your account, review unauthorized activities, and help recover your account.",
    category: "account",
    isPinned: false,
    order: 10,
    priority: 7,
    tags: ["security", "hacked", "compromised"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },

  // ============================================
  // PRODUCTS (15 FAQs)
  // ============================================
  {
    id: "search-products",
    question: "How do I search for products?",
    answer:
      "Use the search bar at the top, enter keywords, brands, or product names. You can also filter by category, price range, ratings, and more from the left sidebar.",
    category: "products",
    isPinned: false,
    order: 1,
    priority: 7,
    tags: ["search", "find", "products"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "product-auctions",
    question: "How do product auctions work?",
    answer:
      "Select an auction item, place your bid above the current bid. Bidding closes at the auction end time. Highest bidder wins and receives payment instructions via email.",
    category: "products",
    isPinned: false,
    order: 2,
    priority: 8,
    tags: ["auction", "bidding", "win"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "save-products-wishlist",
    question: "Can I save products to view later?",
    answer:
      'Yes, click the heart icon on any product to add it to your Wishlist. Access your saved items anytime from "My Wishlist" in your account.',
    category: "products",
    isPinned: false,
    order: 3,
    priority: 6,
    tags: ["wishlist", "save", "favorites"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "product-stock-availability",
    question: "How do I know if a product is in stock?",
    answer:
      'In-stock products show "Add to Cart" button. Out-of-stock items display "Out of Stock" with option to get notified when available.',
    category: "products",
    isPinned: false,
    order: 4,
    priority: 6,
    tags: ["stock", "availability", "inventory"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "product-ratings",
    question: "What do product ratings mean?",
    answer:
      "Ratings are 1-5 stars based on verified customer reviews. 5 stars = excellent, 1 star = poor. Read reviews for detailed feedback on quality, fit, and value.",
    category: "products",
    isPinned: false,
    order: 5,
    priority: 5,
    tags: ["ratings", "reviews", "stars"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "write-product-review",
    question: "Can I write a product review?",
    answer:
      'Yes, after receiving your order, go to "My Orders", select the product, and click "Write Review". Share your experience to help other buyers.',
    category: "products",
    isPinned: false,
    order: 6,
    priority: 5,
    tags: ["reviews", "write", "feedback"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "promoted-products",
    question: "What are promoted products?",
    answer:
      "Promoted products are highlighted listings that sellers pay to advertise. They appear at the top of search results and category pages for better visibility.",
    category: "products",
    isPinned: false,
    order: 7,
    priority: 4,
    tags: ["promoted", "ads", "sponsored"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "compare-products",
    question: "How do I compare products?",
    answer:
      'Click "Compare" on up to 4 products in the same category. A comparison table shows features, prices, ratings, and specifications side-by-side.',
    category: "products",
    isPinned: false,
    order: 8,
    priority: 5,
    tags: ["compare", "products", "features"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "product-warranty",
    question: "What is the warranty on products?",
    answer:
      "Warranty varies by product and seller. Check the product description for warranty terms. Some items come with manufacturer warranty, others with seller warranty.",
    category: "products",
    isPinned: false,
    order: 9,
    priority: 6,
    tags: ["warranty", "guarantee", "coverage"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "request-product",
    question: "Can I request a product not listed?",
    answer:
      "Yes, use the \"Request Product\" form in the Help section. Provide product details and we'll work with sellers to list it if there's sufficient demand.",
    category: "products",
    isPinned: false,
    order: 10,
    priority: 4,
    tags: ["request", "product", "availability"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "product-photos-accuracy",
    question: "Are product photos accurate?",
    answer:
      "We require sellers to use actual product photos. However, slight variations in color may occur due to screen settings. Check product description for details.",
    category: "products",
    isPinned: false,
    order: 11,
    priority: 5,
    tags: ["photos", "images", "accuracy"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "product-categories",
    question: "What are the product categories?",
    answer:
      "Browse categories: Electronics, Fashion, Home & Kitchen, Beauty & Personal Care, Sports & Fitness, Books & Media, Toys & Games, and more. Each category has subcategories for easy navigation.",
    category: "products",
    isPinned: false,
    order: 12,
    priority: 4,
    tags: ["categories", "browse", "navigation"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "new-products",
    question: "How often do you add new products?",
    answer:
      'New products are added daily by our sellers. Check "New Arrivals" section or enable notifications for specific categories to stay updated.',
    category: "products",
    isPinned: false,
    order: 13,
    priority: 4,
    tags: ["new", "arrivals", "updates"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "report-product-listing",
    question: "Can I report a product listing?",
    answer:
      'Yes, if you find inappropriate, counterfeit, or misleading listings, click "Report Product" on the product page or contact our support team with details.',
    category: "products",
    isPinned: false,
    order: 14,
    priority: 5,
    tags: ["report", "listing", "inappropriate"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "product-recommendations",
    question: "Do you offer product recommendations?",
    answer:
      'Yes, we provide personalized recommendations based on your browsing history, purchases, and preferences. See "Recommended for You" on the homepage.',
    category: "products",
    isPinned: false,
    order: 15,
    priority: 5,
    tags: ["recommendations", "personalized", "suggestions"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },

  // ============================================
  // SELLERS (12 FAQs)
  // ============================================
  {
    id: "become-seller",
    question: "How do I become a seller on LetItRip?",
    answer:
      'Click "Become a Seller" in the footer, complete the registration form with business details, submit required documents (PAN, GST, bank details), and wait for verification (2-3 business days).',
    category: "sellers",
    isPinned: false,
    order: 1,
    priority: 8,
    tags: ["seller", "registration", "become seller"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "seller-fees",
    question: "What are the seller fees?",
    answer:
      "We charge a commission of 10-15% per sale depending on the product category. There are no listing fees, monthly charges, or hidden costs.",
    category: "sellers",
    isPinned: false,
    order: 2,
    priority: 7,
    tags: ["fees", "commission", "charges"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "list-products",
    question: "How do I list products?",
    answer:
      'Log in to Seller Dashboard, click "Add Product", fill in details (title, description, price, images, specifications), set shipping options, and publish. Your listing goes live immediately after review.',
    category: "sellers",
    isPinned: false,
    order: 3,
    priority: 7,
    tags: ["listing", "products", "add"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "seller-payments",
    question: "When do I receive payments?",
    answer:
      "Payments are released 7 days after delivery confirmation or 14 days after shipping, whichever is earlier. Funds are transferred to your registered bank account.",
    category: "sellers",
    isPinned: false,
    order: 4,
    priority: 8,
    tags: ["payments", "payout", "seller"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "promote-products",
    question: "Can I promote my products?",
    answer:
      'Yes, use the "Promote Product" feature in Seller Dashboard. Promoted listings appear at top of search results. Pricing starts at ₹10/day per product.',
    category: "sellers",
    isPinned: false,
    order: 5,
    priority: 6,
    tags: ["promotion", "advertising", "sponsored"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "seller-documents",
    question: "What documents do I need to register as a seller?",
    answer:
      "Required: PAN card, GST certificate (if applicable), bank account details, business address proof, and identity proof (Aadhaar/Passport/Driving License).",
    category: "sellers",
    isPinned: false,
    order: 6,
    priority: 7,
    tags: ["documents", "registration", "verification"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "manage-inventory",
    question: "How do I manage inventory?",
    answer:
      'Use Seller Dashboard → "Inventory Management" to update stock levels, set low-stock alerts, and bulk upload inventory via CSV files.',
    category: "sellers",
    isPinned: false,
    order: 7,
    priority: 6,
    tags: ["inventory", "stock", "management"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "seller-rating",
    question: "What is seller rating and how does it work?",
    answer:
      "Seller rating (1-5 stars) is based on customer reviews, order fulfillment speed, product quality, and customer service. High ratings improve visibility.",
    category: "sellers",
    isPinned: false,
    order: 8,
    priority: 5,
    tags: ["rating", "reviews", "seller performance"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "seller-discounts",
    question: "Can I offer discounts and coupons?",
    answer:
      'Yes, create discount codes in Seller Dashboard → "Promotions". Set percentage/fixed discounts, minimum order values, expiry dates, and usage limits.',
    category: "sellers",
    isPinned: false,
    order: 9,
    priority: 5,
    tags: ["discounts", "coupons", "promotions"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "seller-returns",
    question: "How do I handle returns and refunds?",
    answer:
      "Returns are managed in Seller Dashboard. When a return is requested, review the reason, approve/reject within 24 hours, and arrange pickup. Refunds are processed after inspection.",
    category: "sellers",
    isPinned: false,
    order: 10,
    priority: 6,
    tags: ["returns", "refunds", "seller"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "listing-guidelines",
    question: "What are the product listing guidelines?",
    answer:
      "Use clear photos, accurate descriptions, competitive pricing, correct category, and include all specifications. Prohibited: counterfeit goods, illegal items, misleading information.",
    category: "sellers",
    isPinned: false,
    order: 11,
    priority: 6,
    tags: ["guidelines", "policies", "listing"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "international-selling",
    question: "Can I sell internationally?",
    answer:
      "Currently, LetItRip only supports domestic sales within India. International selling may be available in the future.",
    category: "sellers",
    isPinned: false,
    order: 12,
    priority: 4,
    tags: ["international", "selling", "export"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },

  // ============================================
  // AUCTIONS (10 FAQs)
  // ============================================
  {
    id: "how-auctions-work",
    question: "How do auctions work on LetItRip?",
    answer:
      "Sellers list products as auctions with a starting bid. You place a bid that must be higher than the current highest bid. When the auction ends, the highest bidder wins and is required to complete the purchase.",
    category: "auctions",
    isPinned: true,
    order: 1,
    priority: 10,
    tags: ["auctions", "bidding", "how-to"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "auction-do-i-have-to-pay",
    question: "Do I have to pay if I win an auction?",
    answer:
      "Yes. Winning an auction is a binding commitment to purchase. If you win, you will be required to complete payment within 24 hours. Failure to pay may result in account suspension.",
    category: "auctions",
    isPinned: true,
    order: 2,
    priority: 10,
    tags: ["auctions", "payment", "winner"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "auction-can-i-cancel",
    question: "Can I cancel a bid I placed?",
    answer:
      "Bids are generally non-cancellable once placed. In rare exceptional circumstances (e.g. a seller changes the product description significantly), contact our support team before the auction ends.",
    category: "auctions",
    isPinned: false,
    order: 3,
    priority: 9,
    tags: ["auctions", "cancel", "bid"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "auction-outbid",
    question: "What happens when I get outbid?",
    answer:
      "You will receive a notification when someone places a higher bid. You can return and place a new bid if you wish to continue competing.",
    category: "auctions",
    isPinned: false,
    order: 4,
    priority: 8,
    tags: ["auctions", "outbid", "notification"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "auction-reserve-price",
    question: "What is a reserve price?",
    answer:
      "Some auctions have a hidden reserve price — the minimum the seller is willing to accept. If no bid meets the reserve price, the seller is not obligated to sell. The product page will indicate if a reserve applies.",
    category: "auctions",
    isPinned: false,
    order: 5,
    priority: 7,
    tags: ["auctions", "reserve", "price"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "auction-coupons",
    question: "Can I use a coupon on an auction purchase?",
    answer:
      "Only coupons specifically created for auctions (marked 'Auction Only') can be applied to auction items. Standard store coupons and platform-wide coupons do not apply to auction purchases. Pre-order items are never eligible for coupons.",
    category: "auctions",
    isPinned: false,
    order: 6,
    priority: 8,
    tags: ["auctions", "coupons", "discount"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "auction-shipping",
    question: "Who handles shipping for auction items?",
    answer:
      "The seller who listed the auction item is responsible for shipping once payment is confirmed. Shipping fees and timelines are specified on the auction product page.",
    category: "auctions",
    isPinned: false,
    order: 7,
    priority: 7,
    tags: ["auctions", "shipping", "delivery"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "auction-snipe-protection",
    question: "Is there protection against last-second sniping?",
    answer:
      "Yes. If a bid is placed in the final 2 minutes of an auction, the auction end time is automatically extended by 2 minutes to give all bidders a fair chance to respond.",
    category: "auctions",
    isPinned: false,
    order: 8,
    priority: 6,
    tags: ["auctions", "snipe", "anti-sniping"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "auction-return-policy",
    question: "Can I return an item I won at auction?",
    answer:
      "Returns for auction items follow the seller's stated return policy. Please check the auction listing before bidding. If the item arrives significantly not as described, contact support immediately.",
    category: "auctions",
    isPinned: false,
    order: 9,
    priority: 6,
    tags: ["auctions", "returns", "refund"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "auction-seller-coupons",
    question: "As a seller, can I offer coupons on my auction listings?",
    answer:
      "Yes. In your Seller Dashboard under Coupons, create a coupon and enable the 'Auction Items Only' option. This coupon will only apply to your auction listings — not your regular fixed-price products. Buyers can enter this coupon code at checkout after winning an auction.",
    category: "auctions",
    isPinned: false,
    order: 10,
    priority: 7,
    tags: ["auctions", "seller", "coupons", "discount"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },

  // ============================================
  // PRE-ORDERS (10 FAQs)
  // ============================================
  {
    id: "what-is-preorder",
    question: "What is a pre-order?",
    answer:
      "A pre-order lets you reserve a product before it is produced or available in stock. You pay a deposit upfront (or the full amount, depending on the seller) and receive the product once production is complete.",
    category: "preorders",
    isPinned: true,
    order: 1,
    priority: 10,
    tags: ["pre-order", "deposit", "reserve"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "preorder-deposit",
    question: "How much deposit do I pay for a pre-order?",
    answer:
      "The deposit amount is set by the seller and shown on the product page. It is typically between 10% and 50% of the total price. The balance is collected when the product is ready to ship.",
    category: "preorders",
    isPinned: false,
    order: 2,
    priority: 9,
    tags: ["pre-order", "deposit", "payment"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "preorder-delivery-date",
    question: "When will I receive my pre-order?",
    answer:
      "The estimated delivery date is shown on the product page. Production timelines can change due to manufacturing delays; the seller will notify you of any updates. You can also check your order status in My Orders.",
    category: "preorders",
    isPinned: false,
    order: 3,
    priority: 9,
    tags: ["pre-order", "delivery", "timeline"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "preorder-cancel",
    question: "Can I cancel a pre-order?",
    answer:
      "Cancellation rights depend on the seller's policy, shown on the product page. If the seller allows cancellations, your deposit will be refunded within 5–7 business days. Once production has started, cancellations may not be possible.",
    category: "preorders",
    isPinned: false,
    order: 4,
    priority: 9,
    tags: ["pre-order", "cancel", "refund"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "preorder-no-coupons",
    question: "Can I use a coupon on a pre-order?",
    answer:
      "No. Coupons — including seller coupons and platform-wide discount codes — cannot be applied to pre-order items. Pre-orders have fixed pricing agreed at the time of reservation.",
    category: "preorders",
    isPinned: true,
    order: 5,
    priority: 9,
    tags: ["pre-order", "coupons", "discount"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "preorder-quantity-limit",
    question: "Is there a limit on how many pre-orders I can place?",
    answer:
      "Each pre-order listing may have a maximum quantity per buyer, shown on the product page. This ensures fair access during limited production runs.",
    category: "preorders",
    isPinned: false,
    order: 6,
    priority: 7,
    tags: ["pre-order", "quantity", "limit"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "preorder-production-status",
    question: "How do I track production status?",
    answer:
      "Sellers update the production status in their dashboard (e.g. 'In Production', 'Quality Check', 'Ready to Ship'). You can view the current status on your order detail page under My Orders.",
    category: "preorders",
    isPinned: false,
    order: 7,
    priority: 7,
    tags: ["pre-order", "production", "status"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "preorder-item-delayed",
    question: "What if my pre-order is significantly delayed?",
    answer:
      "If a pre-order is delayed beyond the original estimated date, you will be notified. If the delay exceeds 90 days from the original date, you are entitled to a full refund of any deposit paid.",
    category: "preorders",
    isPinned: false,
    order: 8,
    priority: 8,
    tags: ["pre-order", "delay", "refund"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "preorder-payment-balance",
    question: "When is the remaining balance charged?",
    answer:
      "The balance (total price minus deposit) is charged automatically once the seller marks the order as 'Ready to Ship'. You will receive an email and a notification before the charge is processed.",
    category: "preorders",
    isPinned: false,
    order: 9,
    priority: 7,
    tags: ["pre-order", "balance", "payment"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
  {
    id: "preorder-returns",
    question: "Can I return a pre-order item after delivery?",
    answer:
      "Returns are subject to the seller's return policy. Many pre-order items are custom or made-to-order and may not be eligible for return. Check the product page carefully before ordering.",
    category: "preorders",
    isPinned: false,
    order: 10,
    priority: 6,
    tags: ["pre-order", "returns", "refund"],
    stats: { views: 0, helpful: 0, notHelpful: 0 },
  },
];

/** Returns FAQs for a specific category, sorted by order. */
export function getStaticFaqsByCategory(
  category: FAQCategoryKey,
  limit?: number,
): StaticFAQItem[] {
  const filtered = STATIC_FAQS.filter((f) => f.category === category).sort(
    (a, b) => a.order - b.order,
  );
  return limit ? filtered.slice(0, limit) : filtered;
}

/** Returns all FAQs, optionally limited. */
export function getAllStaticFaqs(limit?: number): StaticFAQItem[] {
  const sorted = [...STATIC_FAQS].sort(
    (a, b) => b.priority - a.priority || a.order - b.order,
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

/** Returns all unique FAQ categories present in the data. */
export function getStaticFaqCategoryCounts(): Record<FAQCategoryKey, number> {
  const counts: Record<FAQCategoryKey, number> = {
    general: 0,
    products: 0,
    shipping: 0,
    returns: 0,
    payment: 0,
    account: 0,
    sellers: 0,
    auctions: 0,
    preorders: 0,
  };
  STATIC_FAQS.forEach((f) => {
    if (f.category in counts) counts[f.category]++;
  });
  return counts;
}

/**
 * Returns the localised question and answer for a FAQ item.
 * Falls back to the English (canonical) text when no translation exists for the given locale.
 */
export function getLocalizedFaqText(
  faq: StaticFAQItem,
  locale: string,
): { question: string; answer: string } {
  if (locale === "hi") {
    const hi = FAQ_TRANSLATIONS_HI[faq.id];
    if (hi) return hi;
  }
  return { question: faq.question, answer: faq.answer };
}
