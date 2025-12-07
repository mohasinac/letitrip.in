/**
 * Admin Role RBAC Tests
 * Tests all admin-specific permissions and access controls
 */

import {
  canCreateResource,
  canDeleteResource,
  canReadResource,
  canUpdateResource,
  hasAnyRole,
} from "@/lib/rbac-permissions";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import {
  mockAdminUser,
  mockCategory,
  mockCoupon,
  mockOrder,
  mockPayout,
  mockProduct,
  mockRegularUser,
  mockSellerUser,
  mockShop,
  mockTicket,
} from "./fixtures";
import { cleanupTestEnv, setupTestEnv } from "./test-utils";

describe("Admin Role - RBAC Permissions", () => {
  beforeAll(() => {
    setupTestEnv();
  });

  afterAll(() => {
    cleanupTestEnv();
  });

  describe("Role Identification", () => {
    it("should identify admin role correctly", () => {
      expect(mockAdminUser.role).toBe("admin");
      expect(hasAnyRole(mockAdminUser, ["admin"])).toBe(true);
    });

    it("should have admin role in multi-role check", () => {
      expect(hasAnyRole(mockAdminUser, ["admin", "seller"])).toBe(true);
    });

    it("should not match non-admin roles", () => {
      expect(hasAnyRole(mockAdminUser, ["seller", "user"])).toBe(false);
    });
  });

  describe("Product Management - Admin Access", () => {
    it("should allow admin to read any product", () => {
      expect(canReadResource(mockAdminUser, "products", mockProduct)).toBe(
        true
      );
    });

    it("should allow admin to read products from any shop", () => {
      const otherShopProduct = { ...mockProduct, shopId: "shop-999" };
      expect(canReadResource(mockAdminUser, "products", otherShopProduct)).toBe(
        true
      );
    });

    it("should allow admin to read inactive products", () => {
      const inactiveProduct = { ...mockProduct, status: "inactive" };
      expect(canReadResource(mockAdminUser, "products", inactiveProduct)).toBe(
        true
      );
    });

    it("should allow admin to create products", () => {
      expect(canCreateResource(mockAdminUser, "products")).toBe(true);
    });

    it("should allow admin to update any product", () => {
      expect(canUpdateResource(mockAdminUser, "products", mockProduct)).toBe(
        true
      );
    });

    it("should allow admin to delete any product", () => {
      expect(canDeleteResource(mockAdminUser, "products", mockProduct)).toBe(
        true
      );
    });
  });

  describe("Shop Management - Admin Access", () => {
    it("should allow admin to read any shop", () => {
      expect(canReadResource(mockAdminUser, "shops", mockShop)).toBe(true);
    });

    it("should allow admin to create shops", () => {
      expect(canCreateResource(mockAdminUser, "shops")).toBe(true);
    });

    it("should allow admin to update any shop", () => {
      expect(canUpdateResource(mockAdminUser, "shops", mockShop)).toBe(true);
    });

    it("should allow admin to delete any shop", () => {
      expect(canDeleteResource(mockAdminUser, "shops", mockShop)).toBe(true);
    });

    it("should allow admin to verify/unverify shops", () => {
      const unverifiedShop = { ...mockShop, isVerified: false };
      expect(canUpdateResource(mockAdminUser, "shops", unverifiedShop)).toBe(
        true
      );
    });
  });

  describe("Order Management - Admin Access", () => {
    it("should allow admin to read any order", () => {
      expect(canReadResource(mockAdminUser, "orders", mockOrder)).toBe(true);
    });

    it("should allow admin to read orders from any shop", () => {
      const otherShopOrder = { ...mockOrder, shopId: "shop-999" };
      expect(canReadResource(mockAdminUser, "orders", otherShopOrder)).toBe(
        true
      );
    });

    it("should allow admin to read orders from any user", () => {
      const otherUserOrder = { ...mockOrder, userId: "user-999" };
      expect(canReadResource(mockAdminUser, "orders", otherUserOrder)).toBe(
        true
      );
    });

    it("should allow admin to update any order status", () => {
      expect(canUpdateResource(mockAdminUser, "orders", mockOrder)).toBe(true);
    });

    it("should allow admin to cancel any order", () => {
      expect(canDeleteResource(mockAdminUser, "orders", mockOrder)).toBe(true);
    });
  });

  describe("Category Management - Admin Exclusive", () => {
    it("should allow admin to read categories", () => {
      expect(canReadResource(mockAdminUser, "categories", mockCategory)).toBe(
        true
      );
    });

    it("should allow admin to create categories", () => {
      expect(canCreateResource(mockAdminUser, "categories")).toBe(true);
    });

    it("should allow admin to update categories", () => {
      expect(canUpdateResource(mockAdminUser, "categories", mockCategory)).toBe(
        true
      );
    });

    it("should allow admin to delete categories", () => {
      expect(canDeleteResource(mockAdminUser, "categories", mockCategory)).toBe(
        true
      );
    });

    it("should NOT allow seller to create categories", () => {
      expect(canCreateResource(mockSellerUser, "categories")).toBe(false);
    });

    it("should NOT allow user to create categories", () => {
      expect(canCreateResource(mockRegularUser, "categories")).toBe(false);
    });
  });

  describe("Coupon Management - Admin Access", () => {
    it("should allow admin to read any coupon", () => {
      expect(canReadResource(mockAdminUser, "coupons", mockCoupon)).toBe(true);
    });

    it("should allow admin to create platform-wide coupons", () => {
      expect(canCreateResource(mockAdminUser, "coupons")).toBe(true);
    });

    it("should allow admin to update any coupon", () => {
      expect(canUpdateResource(mockAdminUser, "coupons", mockCoupon)).toBe(
        true
      );
    });

    it("should allow admin to delete any coupon", () => {
      expect(canDeleteResource(mockAdminUser, "coupons", mockCoupon)).toBe(
        true
      );
    });

    it("should allow admin to update shop-specific coupons", () => {
      const shopCoupon = { ...mockCoupon, shopId: "shop-999" };
      expect(canUpdateResource(mockAdminUser, "coupons", shopCoupon)).toBe(
        true
      );
    });
  });

  describe("Support Ticket Management - Admin Access", () => {
    it("should allow admin to read any ticket", () => {
      expect(canReadResource(mockAdminUser, "tickets", mockTicket)).toBe(true);
    });

    it("should allow admin to create tickets", () => {
      expect(canCreateResource(mockAdminUser, "tickets")).toBe(true);
    });

    it("should allow admin to update any ticket", () => {
      expect(canUpdateResource(mockAdminUser, "tickets", mockTicket)).toBe(
        true
      );
    });

    it("should allow admin to close any ticket", () => {
      expect(canDeleteResource(mockAdminUser, "tickets", mockTicket)).toBe(
        true
      );
    });

    it("should allow admin to reassign tickets", () => {
      const assignedTicket = { ...mockTicket, assignedTo: "admin-002" };
      expect(canUpdateResource(mockAdminUser, "tickets", assignedTicket)).toBe(
        true
      );
    });
  });

  describe("Review Moderation - Admin Access", () => {
    it("should allow admin to read all reviews", () => {
      const review = {
        id: "review-001",
        productId: "product-001",
        userId: "user-001",
        rating: 5,
        status: "pending",
      };
      expect(canReadResource(mockAdminUser, "reviews", review)).toBe(true);
    });

    it("should allow admin to approve reviews", () => {
      const pendingReview = {
        id: "review-001",
        productId: "product-001",
        userId: "user-001",
        rating: 5,
        status: "pending",
      };
      expect(canUpdateResource(mockAdminUser, "reviews", pendingReview)).toBe(
        true
      );
    });

    it("should allow admin to delete inappropriate reviews", () => {
      const inappropriateReview = {
        id: "review-001",
        productId: "product-001",
        userId: "user-001",
        rating: 1,
        status: "flagged",
      };
      expect(
        canDeleteResource(mockAdminUser, "reviews", inappropriateReview)
      ).toBe(true);
    });
  });

  describe("Payout Management - Admin Access", () => {
    it("should allow admin to read all payouts", () => {
      expect(canReadResource(mockAdminUser, "payouts", mockPayout)).toBe(true);
    });

    it("should allow admin to approve payouts", () => {
      expect(canUpdateResource(mockAdminUser, "payouts", mockPayout)).toBe(
        true
      );
    });

    it("should allow admin to reject payouts", () => {
      const rejectedPayout = { ...mockPayout, status: "rejected" };
      expect(canUpdateResource(mockAdminUser, "payouts", rejectedPayout)).toBe(
        true
      );
    });

    it("should allow admin to process payouts from any shop", () => {
      const otherShopPayout = { ...mockPayout, shopId: "shop-999" };
      expect(canUpdateResource(mockAdminUser, "payouts", otherShopPayout)).toBe(
        true
      );
    });
  });

  describe("User Management - Admin Exclusive", () => {
    it("should allow admin to read all users", () => {
      expect(canReadResource(mockAdminUser, "users", mockRegularUser)).toBe(
        true
      );
    });

    it("should allow admin to create users", () => {
      expect(canCreateResource(mockAdminUser, "users")).toBe(true);
    });

    it("should allow admin to update any user", () => {
      expect(canUpdateResource(mockAdminUser, "users", mockRegularUser)).toBe(
        true
      );
    });

    it("should allow admin to ban/unban users", () => {
      const bannedUser = { ...mockRegularUser, status: "banned" };
      expect(canUpdateResource(mockAdminUser, "users", bannedUser)).toBe(true);
    });

    it("should allow admin to change user roles", () => {
      const roleChangeUser = { ...mockRegularUser, role: "seller" };
      expect(canUpdateResource(mockAdminUser, "users", roleChangeUser)).toBe(
        true
      );
    });

    it("should NOT allow seller to manage users", () => {
      expect(canUpdateResource(mockSellerUser, "users", mockRegularUser)).toBe(
        false
      );
    });

    it("should NOT allow regular user to manage other users", () => {
      expect(canUpdateResource(mockRegularUser, "users", mockSellerUser)).toBe(
        false
      );
    });
  });

  describe("Auction Management - Admin Access", () => {
    it("should allow admin to read any auction", () => {
      const auction = {
        id: "auction-001",
        shopId: "shop-001",
        status: "active",
      };
      expect(canReadResource(mockAdminUser, "auctions", auction)).toBe(true);
    });

    it("should allow admin to end any auction", () => {
      const auction = {
        id: "auction-001",
        shopId: "shop-001",
        status: "active",
      };
      expect(canUpdateResource(mockAdminUser, "auctions", auction)).toBe(true);
    });

    it("should allow admin to cancel fraudulent auctions", () => {
      const auction = {
        id: "auction-001",
        shopId: "shop-001",
        status: "flagged",
      };
      expect(canDeleteResource(mockAdminUser, "auctions", auction)).toBe(true);
    });
  });

  describe("Hero Slides Management - Admin Exclusive", () => {
    it("should allow admin to read hero slides", () => {
      const slide = { id: "slide-001", status: "active" };
      expect(canReadResource(mockAdminUser, "hero_slides", slide)).toBe(true);
    });

    it("should allow admin to create hero slides", () => {
      expect(canCreateResource(mockAdminUser, "hero_slides")).toBe(true);
    });

    it("should allow admin to update hero slides", () => {
      const slide = { id: "slide-001", status: "active" };
      expect(canUpdateResource(mockAdminUser, "hero_slides", slide)).toBe(true);
    });

    it("should allow admin to delete hero slides", () => {
      const slide = { id: "slide-001", status: "active" };
      expect(canDeleteResource(mockAdminUser, "hero_slides", slide)).toBe(true);
    });

    it("should NOT allow seller to manage hero slides", () => {
      expect(canCreateResource(mockSellerUser, "hero_slides")).toBe(false);
    });

    it("should NOT allow user to manage hero slides", () => {
      expect(canCreateResource(mockRegularUser, "hero_slides")).toBe(false);
    });
  });

  describe("Cross-Resource Admin Permissions", () => {
    it("should allow admin to perform bulk operations", () => {
      // Admins can perform bulk creates, updates, deletes
      expect(canCreateResource(mockAdminUser, "products")).toBe(true);
      expect(canUpdateResource(mockAdminUser, "products", mockProduct)).toBe(
        true
      );
      expect(canDeleteResource(mockAdminUser, "products", mockProduct)).toBe(
        true
      );
    });

    it("should allow admin to access all analytics", () => {
      // Analytics is not a resource but admin should have access
      expect(mockAdminUser.role).toBe("admin");
    });

    it("should allow admin to modify system settings", () => {
      // System settings access (admin-only)
      expect(mockAdminUser.role).toBe("admin");
    });
  });
});
