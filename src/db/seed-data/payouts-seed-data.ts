/**
 * Payouts Seed Data
 * Sample seller payout requests across all statuses
 */

import type { PayoutDocument } from "@/db/schema";
import { PAYOUT_FIELDS, DEFAULT_PLATFORM_FEE_RATE } from "@/db/schema";

export const payoutsSeedData: Partial<PayoutDocument>[] = [
  // ── TechHub Electronics ───────────────────────────────────────────────

  // Completed payout — January batch (delivered iphone + samsung orders)
  {
    id: "payout-techhub-jan-2026-completed",
    sellerId: "user-techhub-electronics-electron",
    sellerName: "TechHub Electronics",
    sellerEmail: "techhub@letitrip.in",
    amount: 247521.05,
    grossAmount: 259929.0, // 134900 + 124999 + other orders
    platformFee: 12407.95,
    platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
    currency: "INR",
    status: PAYOUT_FIELDS.STATUS_VALUES.COMPLETED,
    paymentMethod: "bank_transfer",
    bankAccount: {
      accountHolderName: "TechHub Electronics Pvt Ltd",
      accountNumberMasked: "****4892",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
    },
    notes: "January 2026 payout — iphone + samsung + pixel orders",
    adminNote: "Verified and transferred. Ref: TXN-2026-01-3847",
    orderIds: [
      "order-1-20260115-xk7m9p",
      "order-1-20260120-b4n8q3",
      "order-1-20260128-t9u3v7",
      "order-1-20260128-s4t7u1",
    ],
    requestedAt: new Date("2026-02-01T09:00:00Z"),
    processedAt: new Date("2026-02-05T14:30:00Z"),
    createdAt: new Date("2026-02-01T09:00:00Z"),
    updatedAt: new Date("2026-02-05T14:30:00Z"),
  },

  // Processing payout — February batch
  {
    id: "payout-techhub-feb-2026-processing",
    sellerId: "user-techhub-electronics-electron",
    sellerName: "TechHub Electronics",
    sellerEmail: "techhub@letitrip.in",
    amount: 75619.0,
    grossAmount: 79599.0,
    platformFee: 3980.0,
    platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
    currency: "INR",
    status: PAYOUT_FIELDS.STATUS_VALUES.PROCESSING,
    paymentMethod: "bank_transfer",
    bankAccount: {
      accountHolderName: "TechHub Electronics Pvt Ltd",
      accountNumberMasked: "****4892",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
    },
    notes: "February 2026 payout — pixel + additional orders",
    adminNote: "Bank transfer initiated. ETA 2 business days.",
    orderIds: [
      "order-1-20260205-h2k6m4",
      "order-1-20260208-k2l4n8",
      "order-1-20260209-d6f2h1",
    ],
    requestedAt: new Date("2026-02-15T10:00:00Z"),
    createdAt: new Date("2026-02-15T10:00:00Z"),
    updatedAt: new Date("2026-02-20T09:00:00Z"),
  },

  // ── Fashion Boutique ──────────────────────────────────────────────────

  // Completed payout — UPI
  {
    id: "payout-fashionboutique-jan-2026-completed",
    sellerId: "user-fashion-boutique-fashionb",
    sellerName: "Fashion Boutique",
    sellerEmail: "fashion@letitrip.in",
    amount: 13491.0,
    grossAmount: 14201.0,
    platformFee: 710.05,
    platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
    currency: "INR",
    status: PAYOUT_FIELDS.STATUS_VALUES.COMPLETED,
    paymentMethod: "upi",
    upiId: "fashionboutique@okaxis",
    notes: "January payout — shirts + kurta orders",
    adminNote: "UPI transfer successful. Ref: UPI-2026-02-7721",
    orderIds: [
      "order-2-20260125-r5t9w1",
      "order-3-20260206-m3n7p5",
      "order-3-20260208-v1w7x2",
    ],
    requestedAt: new Date("2026-02-02T11:00:00Z"),
    processedAt: new Date("2026-02-04T16:00:00Z"),
    createdAt: new Date("2026-02-02T11:00:00Z"),
    updatedAt: new Date("2026-02-04T16:00:00Z"),
  },

  // Pending payout
  {
    id: "payout-fashionboutique-feb-2026-pending",
    sellerId: "user-fashion-boutique-fashionb",
    sellerName: "Fashion Boutique",
    sellerEmail: "fashion@letitrip.in",
    amount: 85465.5,
    grossAmount: 89963.68,
    platformFee: 4498.18,
    platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
    currency: "INR",
    status: PAYOUT_FIELDS.STATUS_VALUES.PENDING,
    paymentMethod: "upi",
    upiId: "fashionboutique@okaxis",
    notes: "February 2026 payout batch",
    orderIds: [
      "order-confirmed-2-20260216-fp7r1v",
      "order-confirmed-3-20260215-gx2s5u",
      "order-shipped-2-20260213-jq8v4a",
      "order-shipped-3-20260212-kt1w6b",
    ],
    requestedAt: new Date("2026-02-25T09:00:00Z"),
    createdAt: new Date("2026-02-25T09:00:00Z"),
    updatedAt: new Date("2026-02-25T09:00:00Z"),
  },

  // ── Home Essentials ───────────────────────────────────────────────────

  // Failed payout (bank rejected)
  {
    id: "payout-homeessentials-jan-2026-failed",
    sellerId: "user-home-essentials-homeesse",
    sellerName: "Home Essentials",
    sellerEmail: "home@letitrip.in",
    amount: 47975.0,
    grossAmount: 50500.0,
    platformFee: 2525.0,
    platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
    currency: "INR",
    status: PAYOUT_FIELDS.STATUS_VALUES.FAILED,
    paymentMethod: "bank_transfer",
    bankAccount: {
      accountHolderName: "Home Essentials Store",
      accountNumberMasked: "****7203",
      ifscCode: "SBIN0003456",
      bankName: "State Bank of India",
    },
    notes: "January 2026 payout",
    adminNote:
      "Bank transfer rejected — IFSC code mismatch. Seller has been notified to update banking details.",
    orderIds: ["order-5-20260201-w8y2a6", "order-1-20260208-z1x5c9"],
    requestedAt: new Date("2026-02-03T10:30:00Z"),
    processedAt: new Date("2026-02-07T11:00:00Z"),
    createdAt: new Date("2026-02-03T10:30:00Z"),
    updatedAt: new Date("2026-02-07T11:00:00Z"),
  },

  // Pending payout — Home Essentials (re-requested after fixing bank details)
  {
    id: "payout-homeessentials-feb-2026-pending",
    sellerId: "user-home-essentials-homeesse",
    sellerName: "Home Essentials",
    sellerEmail: "home@letitrip.in",
    amount: 47975.0,
    grossAmount: 50500.0,
    platformFee: 2525.0,
    platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
    currency: "INR",
    status: PAYOUT_FIELDS.STATUS_VALUES.PENDING,
    paymentMethod: "bank_transfer",
    bankAccount: {
      accountHolderName: "Home Essentials Store",
      accountNumberMasked: "****7203",
      ifscCode: "SBIN0004567",
      bankName: "State Bank of India",
    },
    notes: "Re-submitted with corrected IFSC code",
    orderIds: ["order-5-20260201-w8y2a6", "order-1-20260208-z1x5c9"],
    requestedAt: new Date("2026-02-22T14:00:00Z"),
    createdAt: new Date("2026-02-22T14:00:00Z"),
    updatedAt: new Date("2026-02-22T14:00:00Z"),
  },

  // ── Home Essentials (was Sports Zone) ───────────────────────────────────

  {
    id: "payout-sportszone-jan-2026-completed",
    sellerId: "user-home-essentials-homeesse",
    sellerName: "Home Essentials",
    sellerEmail: "home@letitrip.in",
    amount: 22610.5,
    grossAmount: 23800.53,
    platformFee: 1190.03,
    platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
    currency: "INR",
    status: PAYOUT_FIELDS.STATUS_VALUES.COMPLETED,
    paymentMethod: "upi",
    upiId: "homeessentials@paytm",
    notes: "January payout for fitness + home orders",
    adminNote: "UPI credited. Ref: UPI-2026-02-8834",
    orderIds: [
      "order-confirmed-1-20260217-ck4t8w",
      "order-shipped-1-20260214-hn5u9z",
    ],
    requestedAt: new Date("2026-02-05T08:00:00Z"),
    processedAt: new Date("2026-02-07T10:00:00Z"),
    createdAt: new Date("2026-02-05T08:00:00Z"),
    updatedAt: new Date("2026-02-07T10:00:00Z"),
  },
];
