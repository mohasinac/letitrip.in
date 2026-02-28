/**
 * Notifications Seed Data
 * Sample in-app notifications for various users and event types
 */

import type { NotificationDocument } from "@/db/schema";
import { NOTIFICATION_FIELDS } from "@/db/schema";

export const notificationsSeedData: Partial<NotificationDocument>[] = [
  // ── John Doe — various notification types ─────────────────────────────

  // Welcome notification
  {
    id: "notif-welcome-john-20240215",
    userId: "user-john-doe-johndoe",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.WELCOME,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.NORMAL,
    title: "Welcome to LetItRip, John! 🎉",
    message:
      "Thanks for joining. Browse thousands of outdoor gear listings, place bids on unique items, and earn trust points by leaving helpful reviews.",
    actionUrl: "/products",
    actionLabel: "Start Exploring",
    isRead: true,
    readAt: new Date("2024-02-15T10:00:00Z"),
    createdAt: new Date("2024-02-15T08:30:00Z"),
    updatedAt: new Date("2024-02-15T10:00:00Z"),
  },

  // Order placed
  {
    id: "notif-order-placed-john-order1",
    userId: "user-john-doe-johndoe",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.ORDER_PLACED,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.HIGH,
    title: "Order Placed Successfully",
    message:
      "Your order for iPhone 15 Pro Max (₹1,34,900) has been placed. Estimated delivery: 18 Jan 2026.",
    actionUrl: "/user/orders/order-1-20260115-xk7m9p",
    actionLabel: "View Order",
    isRead: true,
    readAt: new Date("2026-01-15T11:00:00Z"),
    relatedId: "order-1-20260115-xk7m9p",
    relatedType: "order",
    createdAt: new Date("2026-01-15T10:30:00Z"),
    updatedAt: new Date("2026-01-15T11:00:00Z"),
  },

  // Order shipped
  {
    id: "notif-order-shipped-john-order1",
    userId: "user-john-doe-johndoe",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.ORDER_SHIPPED,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.HIGH,
    title: "Your Order Has Been Shipped!",
    message:
      "iPhone 15 Pro Max is on its way! Tracking: TRACK123456789. Expected delivery 18 Jan 2026.",
    actionUrl: "/user/orders/order-1-20260115-xk7m9p",
    actionLabel: "Track Order",
    isRead: true,
    readAt: new Date("2026-01-16T09:00:00Z"),
    relatedId: "order-1-20260115-xk7m9p",
    relatedType: "order",
    createdAt: new Date("2026-01-16T08:00:00Z"),
    updatedAt: new Date("2026-01-16T09:00:00Z"),
  },

  // Order delivered
  {
    id: "notif-order-delivered-john-order1",
    userId: "user-john-doe-johndoe",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.ORDER_DELIVERED,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.NORMAL,
    title: "Order Delivered — Please Leave a Review",
    message:
      "Your iPhone 15 Pro Max has been delivered. Enjoying it? Leave a review and help other buyers make the right choice.",
    actionUrl:
      "/products/product-iphone-15-pro-max-smartphones-new-techhub-electronics-1",
    actionLabel: "Write a Review",
    isRead: true,
    readAt: new Date("2026-01-18T16:00:00Z"),
    relatedId: "order-1-20260115-xk7m9p",
    relatedType: "order",
    createdAt: new Date("2026-01-18T14:30:00Z"),
    updatedAt: new Date("2026-01-18T16:00:00Z"),
  },

  // Review approved
  {
    id: "notif-review-approved-john-iphone",
    userId: "user-john-doe-johndoe",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.REVIEW_APPROVED,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.LOW,
    title: "Your Review Has Been Approved",
    message:
      "Your review of iPhone 15 Pro Max is now live. 24 community members have marked it as helpful!",
    actionUrl:
      "/products/product-iphone-15-pro-max-smartphones-new-techhub-electronics-1#reviews",
    actionLabel: "View Review",
    isRead: true,
    readAt: new Date("2026-01-21T09:30:00Z"),
    relatedId: "review-iphone-15-pro-max-john-20260120",
    relatedType: "review",
    createdAt: new Date("2026-01-20T12:00:00Z"),
    updatedAt: new Date("2026-01-21T09:30:00Z"),
  },

  // Bid outbid
  {
    id: "notif-bid-outbid-john-vintage-camera",
    userId: "user-john-doe-johndoe",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.BID_OUTBID,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.HIGH,
    title: "You've Been Outbid!",
    message:
      "Someone placed a higher bid (₹16,500) on Vintage Canon AE-1 Film Camera. Bid again to stay in the race!",
    actionUrl:
      "/products/auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    actionLabel: "Place a New Bid",
    isRead: true,
    readAt: new Date("2026-01-21T09:20:00Z"),
    relatedId:
      "auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    relatedType: "product",
    createdAt: new Date("2026-01-21T09:15:00Z"),
    updatedAt: new Date("2026-01-21T09:20:00Z"),
  },

  // Promotion — unread
  {
    id: "notif-promotion-john-holi-2026",
    userId: "user-john-doe-johndoe",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.PROMOTION,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.LOW,
    title: "Holi Special — Extra 15% Off 🎨",
    message:
      "Use code HOLI15 on any order over ₹999 until 15 March 2026. Don't miss out!",
    actionUrl: "/products",
    actionLabel: "Shop Now",
    isRead: false,
    relatedId: "event-holi-offer-2026-offer",
    relatedType: "product",
    createdAt: new Date("2026-03-01T08:00:00Z"),
    updatedAt: new Date("2026-03-01T08:00:00Z"),
  },

  // ── Jane Smith ────────────────────────────────────────────────────────

  {
    id: "notif-welcome-jane-20240310",
    userId: "user-jane-smith-janes",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.WELCOME,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.NORMAL,
    title: "Welcome to LetItRip, Jane! 🎉",
    message:
      "Your account is all set. Start discovering great deals on outdoor gear, fashion, and more.",
    actionUrl: "/products",
    actionLabel: "Start Shopping",
    isRead: true,
    readAt: new Date("2024-03-10T10:15:00Z"),
    createdAt: new Date("2024-03-10T10:00:00Z"),
    updatedAt: new Date("2024-03-10T10:15:00Z"),
  },

  {
    id: "notif-order-delivered-jane-order2",
    userId: "user-jane-smith-janes",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.ORDER_DELIVERED,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.NORMAL,
    title: "Order Delivered — Please Leave a Review",
    message:
      "Your Samsung Galaxy S24 Ultra has been delivered. Share your experience with the community!",
    actionUrl:
      "/products/product-samsung-galaxy-s24-ultra-smartphones-new-techhub-electronics-1",
    actionLabel: "Write a Review",
    isRead: true,
    readAt: new Date("2026-01-24T10:00:00Z"),
    relatedId: "order-1-20260120-b4n8q3",
    relatedType: "order",
    createdAt: new Date("2026-01-23T16:45:00Z"),
    updatedAt: new Date("2026-01-24T10:00:00Z"),
  },

  // Bid won
  {
    id: "notif-bid-won-jane-vintage-camera",
    userId: "user-jane-smith-janes",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.BID_WON,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.HIGH,
    title: "You Won the Auction! 🏆",
    message:
      "Congratulations! You won Vintage Canon AE-1 Film Camera with a bid of ₹19,500. Please complete payment within 24 hours.",
    actionUrl:
      "/products/auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    actionLabel: "Complete Payment",
    isRead: false,
    relatedId:
      "auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    relatedType: "bid",
    createdAt: new Date("2026-02-05T18:00:00Z"),
    updatedAt: new Date("2026-02-05T18:00:00Z"),
  },

  // ── Mike Johnson ─────────────────────────────────────────────────────

  {
    id: "notif-welcome-mike-20240405",
    userId: "user-mike-johnson-mikejohn",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.WELCOME,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.NORMAL,
    title: "Welcome to LetItRip, Mike! 🎉",
    message: "You're all set! Explore our outdoor gear, electronics, and more.",
    actionUrl: "/products",
    actionLabel: "Start Exploring",
    isRead: true,
    readAt: new Date("2024-04-05T10:00:00Z"),
    createdAt: new Date("2024-04-05T09:15:00Z"),
    updatedAt: new Date("2024-04-05T10:00:00Z"),
  },

  {
    id: "notif-bid-lost-mike-vintage-camera",
    userId: "user-mike-johnson-mikejohn",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.BID_LOST,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.NORMAL,
    title: "Auction Ended — Better Luck Next Time",
    message:
      "The auction for Vintage Canon AE-1 Film Camera has ended. Your highest bid was ₹17,500. Check out similar items!",
    actionUrl: "/products?category=cameras",
    actionLabel: "Browse Similar",
    isRead: false,
    relatedId:
      "auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    relatedType: "bid",
    createdAt: new Date("2026-02-05T18:00:00Z"),
    updatedAt: new Date("2026-02-05T18:00:00Z"),
  },

  // System notification (admin-level)
  {
    id: "notif-system-maintenance-mike",
    userId: "user-mike-johnson-mikejohn",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.SYSTEM,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.LOW,
    title: "Scheduled Maintenance — 2 Mar 2026 2–4 AM IST",
    message:
      "LetItRip will be unavailable for scheduled maintenance on 2 March between 2 AM and 4 AM IST. Apologies for any inconvenience.",
    isRead: false,
    createdAt: new Date("2026-02-27T10:00:00Z"),
    updatedAt: new Date("2026-02-27T10:00:00Z"),
  },

  // ── TechHub Electronics (Seller) ──────────────────────────────────────

  {
    id: "notif-order-confirmed-techhub-order1",
    userId: "user-techhub-electronics-electron",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.ORDER_CONFIRMED,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.HIGH,
    title: "New Order Received",
    message:
      "You have a new order for iPhone 15 Pro Max (Qty: 1, ₹1,34,900). Ship within 24 hours to maintain your seller rating.",
    actionUrl: "/seller/orders/order-1-20260115-xk7m9p",
    actionLabel: "View Order",
    isRead: true,
    readAt: new Date("2026-01-15T11:00:00Z"),
    relatedId: "order-1-20260115-xk7m9p",
    relatedType: "order",
    createdAt: new Date("2026-01-15T10:35:00Z"),
    updatedAt: new Date("2026-01-15T11:00:00Z"),
  },

  {
    id: "notif-product-available-priya",
    userId: "user-priya-sharma-priya",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.PRODUCT_AVAILABLE,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.NORMAL,
    title: "Back in Stock: iPhone 15 Pro Max",
    message:
      "Good news! iPhone 15 Pro Max is back in stock. Quantities are limited — grab yours before it sells out again.",
    actionUrl:
      "/products/product-iphone-15-pro-max-smartphones-new-techhub-electronics-1",
    actionLabel: "Buy Now",
    isRead: false,
    relatedId:
      "product-iphone-15-pro-max-smartphones-new-techhub-electronics-1",
    relatedType: "product",
    createdAt: new Date("2026-02-20T09:00:00Z"),
    updatedAt: new Date("2026-02-20T09:00:00Z"),
  },

  // ── order_cancelled — Jane Smith's order was cancelled ──────────────────
  // Tests: cancellation notification template, cancelled-order badge in notification list
  {
    id: "notif-order-cancelled-jane-20260210",
    userId: "user-jane-smith-janes",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.ORDER_CANCELLED,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.HIGH,
    title: "Order Cancelled",
    message:
      'Your order for Apple iPad Pro 11" M2 (₹89,900) has been cancelled as requested. Refund will be credited to your original payment method within 5–7 working days.',
    actionUrl: "/user/orders/order-cancelled-1-20260210-lv4x7c",
    actionLabel: "View Cancelled Order",
    isRead: true,
    readAt: new Date("2026-02-10T15:00:00Z"),
    relatedId: "order-cancelled-1-20260210-lv4x7c",
    relatedType: "order",
    createdAt: new Date("2026-02-10T14:30:00Z"),
    updatedAt: new Date("2026-02-10T15:00:00Z"),
  },

  // ── bid_placed — Meera placed a bid on the Leica ─────────────────────────
  // Tests: bid placement confirmation notification, bid summary data in payload
  {
    id: "notif-bid-placed-meera-leica-20260219",
    userId: "user-meera-nair-meera",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.BID_PLACED,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.NORMAL,
    title: "Bid Placed Successfully",
    message:
      "Your bid of ₹97,500 on Vintage Leica M6 Film Camera has been placed. You are currently the highest bidder. Auction ends 5 Mar 2026.",
    actionUrl: "/products/product-vintage-leica-camera-auction-artisan-1",
    actionLabel: "View Auction",
    isRead: true,
    readAt: new Date("2026-02-19T09:00:00Z"),
    relatedId: "product-vintage-leica-camera-auction-artisan-1",
    relatedType: "product",
    createdAt: new Date("2026-02-19T08:30:00Z"),
    updatedAt: new Date("2026-02-19T09:00:00Z"),
  },

  // ── review_replied — seller replied to John's review ────────────────────
  // Tests: review-reply notification, deep link to the review thread
  {
    id: "notif-review-replied-john-iphone-20260202",
    userId: "user-john-doe-johndoe",
    type: NOTIFICATION_FIELDS.TYPE_VALUES.REVIEW_REPLIED,
    priority: NOTIFICATION_FIELDS.PRIORITY_VALUES.LOW,
    title: "TechHub Electronics Replied to Your Review",
    message:
      'TechHub Electronics replied to your review of iPhone 15 Pro Max: "Thank you for your wonderful feedback, John! We\'re glad the camera is exceeding expectations."',
    actionUrl:
      "/products/product-iphone-15-pro-max-smartphones-new-techhub-electronics-1#reviews",
    actionLabel: "View Reply",
    isRead: false,
    relatedId: "review-john-iphone15-5star-001",
    relatedType: "review",
    createdAt: new Date("2026-02-02T09:30:00Z"),
    updatedAt: new Date("2026-02-02T09:30:00Z"),
  },
];
