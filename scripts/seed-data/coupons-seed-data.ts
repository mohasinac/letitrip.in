/**
 * Coupons Seed Data
 * Various types of discount coupons
 */

import type { CouponDocument } from "@/db/schema";

export const couponsSeedData: Partial<CouponDocument>[] = [
  // Percentage discount coupons
  {
    id: "coupon-WELCOME10",
    code: "WELCOME10",
    name: "Welcome Discount",
    description: "10% off first order",
    type: "percentage",
    discount: {
      value: 10,
      maxDiscount: 1000,
      minPurchase: 500,
    },
    usage: {
      totalLimit: 1000,
      perUserLimit: 1,
      currentUsage: 245,
    },
    validity: {
      startDate: new Date("2024-01-01T00:00:00Z"),
      endDate: new Date("2026-12-31T23:59:59Z"),
      isActive: true,
    },
    restrictions: {
      firstTimeUserOnly: true,
      combineWithSellerCoupons: false,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2026-02-09T00:00:00Z"),
    stats: {
      totalUses: 245,
      totalRevenue: 1225000,
      totalDiscount: 122500,
    },
  },
  {
    id: "coupon-SAVE20",
    code: "SAVE20",
    name: "20% Off Sitewide",
    description: "20% off all products",
    type: "percentage",
    discount: {
      value: 20,
      maxDiscount: 5000,
      minPurchase: 2000,
    },
    usage: {
      totalLimit: 500,
      perUserLimit: 2,
      currentUsage: 178,
    },
    validity: {
      startDate: new Date("2026-02-01T00:00:00Z"),
      endDate: new Date("2026-02-28T23:59:59Z"),
      isActive: true,
    },
    restrictions: {
      firstTimeUserOnly: false,
      combineWithSellerCoupons: false,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-01-25T00:00:00Z"),
    updatedAt: new Date("2026-02-09T00:00:00Z"),
    stats: {
      totalUses: 178,
      totalRevenue: 3560000,
      totalDiscount: 712000,
    },
  },
  {
    id: "coupon-FREESHIP",
    code: "ELECTRONICS15",
    name: "Electronics Sale",
    description: "15% off electronics",
    type: "percentage",
    discount: {
      value: 15,
      maxDiscount: 3000,
      minPurchase: 5000,
    },
    usage: {
      totalLimit: 300,
      perUserLimit: 1,
      currentUsage: 89,
    },
    validity: {
      startDate: new Date("2026-02-05T00:00:00Z"),
      endDate: new Date("2026-02-20T23:59:59Z"),
      isActive: true,
    },
    restrictions: {
      applicableCategories: ["category-electronics"],
      firstTimeUserOnly: false,
      combineWithSellerCoupons: true,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-02-01T00:00:00Z"),
    updatedAt: new Date("2026-02-09T00:00:00Z"),
    stats: {
      totalUses: 89,
      totalRevenue: 4450000,
      totalDiscount: 667500,
    },
  },

  // Fixed amount discount coupons
  {
    id: "coupon-FIRSTBUY",
    code: "FLAT500",
    name: "Flat ₹500 Off",
    description: "Flat ₹500 off above ₹3000",
    type: "fixed",
    discount: {
      value: 500,
      minPurchase: 3000,
    },
    usage: {
      totalLimit: 1000,
      perUserLimit: 3,
      currentUsage: 412,
    },
    validity: {
      startDate: new Date("2026-01-15T00:00:00Z"),
      endDate: new Date("2026-03-31T23:59:59Z"),
      isActive: true,
    },
    restrictions: {
      firstTimeUserOnly: false,
      combineWithSellerCoupons: true,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-01-10T00:00:00Z"),
    updatedAt: new Date("2026-02-09T00:00:00Z"),
    stats: {
      totalUses: 412,
      totalRevenue: 2060000,
      totalDiscount: 206000,
    },
  },
  {
    id: "coupon-FLASH50",
    code: "MEGA1000",
    name: "Mega Discount",
    description: "₹1000 off above ₹10000",
    type: "fixed",
    discount: {
      value: 1000,
      minPurchase: 10000,
    },
    usage: {
      totalLimit: 200,
      perUserLimit: 1,
      currentUsage: 56,
    },
    validity: {
      startDate: new Date("2026-02-01T00:00:00Z"),
      endDate: new Date("2026-02-15T23:59:59Z"),
      isActive: true,
    },
    restrictions: {
      firstTimeUserOnly: false,
      combineWithSellerCoupons: false,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-01-28T00:00:00Z"),
    updatedAt: new Date("2026-02-09T00:00:00Z"),
    stats: {
      totalUses: 56,
      totalRevenue: 840000,
      totalDiscount: 56000,
    },
  },

  // Free shipping coupon
  {
    id: "coupon-TECHSALE100",
    code: "FREESHIP",
    name: "Free Shipping",
    description: "Free shipping all orders",
    type: "free_shipping",
    discount: {
      value: 0,
      minPurchase: 0,
    },
    usage: {
      totalLimit: 5000,
      perUserLimit: 10,
      currentUsage: 1234,
    },
    validity: {
      startDate: new Date("2026-01-01T00:00:00Z"),
      endDate: new Date("2026-12-31T23:59:59Z"),
      isActive: true,
    },
    restrictions: {
      firstTimeUserOnly: false,
      combineWithSellerCoupons: true,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2025-12-15T00:00:00Z"),
    updatedAt: new Date("2026-02-09T00:00:00Z"),
    stats: {
      totalUses: 1234,
      totalRevenue: 6170000,
      totalDiscount: 123400,
    },
  },

  // Buy X Get Y coupon
  {
    id: "coupon-FASHION15",
    code: "BUY2GET1",
    name: "Buy 2 Get 1 Free",
    description: "Buy 2 get 1 free on fashion",
    type: "buy_x_get_y",
    discount: {
      value: 0,
      minPurchase: 0,
    },
    bxgy: {
      buyQuantity: 2,
      getQuantity: 1,
      applicableCategories: [
        "category-fashion",
        "category-mens-fashion-fashion",
        "category-womens-fashion-fashion",
      ],
    },
    usage: {
      totalLimit: 100,
      perUserLimit: 1,
      currentUsage: 34,
    },
    validity: {
      startDate: new Date("2026-02-01T00:00:00Z"),
      endDate: new Date("2026-02-28T23:59:59Z"),
      isActive: true,
    },
    restrictions: {
      applicableCategories: [
        "category-fashion",
        "category-mens-fashion-fashion",
        "category-womens-fashion-fashion",
      ],
      firstTimeUserOnly: false,
      combineWithSellerCoupons: false,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-01-25T00:00:00Z"),
    updatedAt: new Date("2026-02-09T00:00:00Z"),
    stats: {
      totalUses: 34,
      totalRevenue: 204000,
      totalDiscount: 68000,
    },
  },

  // Product-specific coupon
  {
    id: "coupon-HOME200",
    code: "IPHONE100",
    name: "iPhone Discount",
    description: "₹10000 off iPhone 15 Pro Max",
    type: "fixed",
    discount: {
      value: 10000,
      minPurchase: 130000,
    },
    usage: {
      totalLimit: 50,
      perUserLimit: 1,
      currentUsage: 12,
    },
    validity: {
      startDate: new Date("2026-02-05T00:00:00Z"),
      endDate: new Date("2026-02-15T23:59:59Z"),
      isActive: true,
    },
    restrictions: {
      applicableProducts: [
        "product-iphone-15-pro-max-smartphones-new-techhub-electronics-1",
      ],
      firstTimeUserOnly: false,
      combineWithSellerCoupons: false,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-02-01T00:00:00Z"),
    updatedAt: new Date("2026-02-09T00:00:00Z"),
    stats: {
      totalUses: 12,
      totalRevenue: 1618800,
      totalDiscount: 120000,
    },
  },

  // Inactive/Expired coupon
  {
    id: "coupon-SPORTS10",
    code: "NEWYEAR25",
    name: "New Year Sale",
    description: "25% off all - New Year",
    type: "percentage",
    discount: {
      value: 25,
      maxDiscount: 5000,
      minPurchase: 1000,
    },
    usage: {
      totalLimit: 500,
      perUserLimit: 1,
      currentUsage: 487,
    },
    validity: {
      startDate: new Date("2026-01-01T00:00:00Z"),
      endDate: new Date("2026-01-07T23:59:59Z"),
      isActive: false,
    },
    restrictions: {
      firstTimeUserOnly: false,
      combineWithSellerCoupons: false,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2025-12-25T00:00:00Z"),
    updatedAt: new Date("2026-01-08T00:00:00Z"),
    stats: {
      totalUses: 487,
      totalRevenue: 9740000,
      totalDiscount: 2435000,
    },
  },

  // Seller-specific coupon
  {
    id: "coupon-WINTERSALE",
    code: "TECHHUB15",
    name: "TechHub Special",
    description: "15% off TechHub products",
    type: "percentage",
    discount: {
      value: 15,
      maxDiscount: 2500,
      minPurchase: 2000,
    },
    usage: {
      totalLimit: 200,
      perUserLimit: 2,
      currentUsage: 67,
    },
    validity: {
      startDate: new Date("2026-02-01T00:00:00Z"),
      endDate: new Date("2026-02-29T23:59:59Z"),
      isActive: true,
    },
    restrictions: {
      applicableSellers: ["user-techhub-electronics-electron"],
      firstTimeUserOnly: false,
      combineWithSellerCoupons: false,
    },
    createdBy: "user-admin-user-admin",
    createdAt: new Date("2026-01-28T00:00:00Z"),
    updatedAt: new Date("2026-02-09T00:00:00Z"),
    stats: {
      totalUses: 67,
      totalRevenue: 1340000,
      totalDiscount: 201000,
    },
  },
];
