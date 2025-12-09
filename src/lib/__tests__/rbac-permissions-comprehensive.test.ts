/**
 * Comprehensive RBAC Permissions Test Suite
 *
 * Tests role-based access control for resource permissions across all user roles.
 * Covers read/write/delete operations, data filtering, ownership checks, and role hierarchy.
 *
 * Testing Focus:
 * - canReadResource(): Public vs private resources, role-based access
 * - canWriteResource(): Create/update permissions per role and resource type
 * - canDeleteResource(): Delete permissions with ownership validation
 * - filterDataByRole(): Data visibility based on role and resource status
 * - isResourceOwner(): Ownership detection via multiple fields
 * - getRoleLevel(): Role hierarchy numeric values
 * - hasRole(): Role requirement checks with hierarchy
 * - hasAnyRole(): Multi-role permission checks
 * - canCreateResource(): Alias for create action
 * - canUpdateResource(): Alias for update action
 *
 * Role Hierarchy:
 * - admin (100): Full access to everything
 * - seller (50): Manage own shop, products, orders
 * - user (10): Create orders, reviews, tickets
 * - guest (0): View public content only
 *
 * Resource Types Tested:
 * - Public: hero_slides, categories, products, auctions, shops
 * - Special: reviews (approval-based), coupons (auth-required)
 * - Private: orders, tickets, payouts, users
 */

import {
  canCreateResource,
  canDeleteResource,
  canReadResource,
  canUpdateResource,
  canWriteResource,
  filterDataByRole,
  getRoleLevel,
  hasAnyRole,
  hasRole,
  isResourceOwner,
  type AuthUser,
  type ResourceType,
  type UserRole,
} from "../rbac-permissions";

describe("RBAC Permissions - Comprehensive Test Suite", () => {
  // Test user fixtures
  const adminUser: AuthUser = {
    uid: "admin-123",
    email: "admin@test.com",
    role: "admin",
  };

  const sellerUser: AuthUser = {
    uid: "seller-456",
    email: "seller@test.com",
    role: "seller",
    shopId: "shop-789",
  };

  const regularUser: AuthUser = {
    uid: "user-101",
    email: "user@test.com",
    role: "user",
  };

  const guestUser: AuthUser = {
    uid: "guest-999",
    email: "guest@test.com",
    role: "guest",
  };

  describe("canReadResource() - Read Permission Checks", () => {
    describe("public resources (hero_slides, categories, products, auctions, shops)", () => {
      const publicResourceTypes: ResourceType[] = [
        "hero_slides",
        "categories",
        "products",
        "auctions",
        "shops",
      ];

      publicResourceTypes.forEach((resourceType) => {
        describe(`${resourceType}`, () => {
          it("admin can read everything", () => {
            const inactiveData = { status: "draft", shopId: "other-shop" };
            expect(canReadResource(adminUser, resourceType, inactiveData)).toBe(
              true
            );
          });

          it("seller can read own items regardless of status", () => {
            const draftData = { status: "draft", shopId: "shop-789" };
            expect(canReadResource(sellerUser, resourceType, draftData)).toBe(
              true
            );
          });

          it("seller cannot read other seller's draft items", () => {
            const otherData = { status: "draft", shopId: "other-shop" };
            expect(canReadResource(sellerUser, resourceType, otherData)).toBe(
              false
            );
          });

          it("anyone can read active items", () => {
            const activeData = { status: "active" };
            expect(canReadResource(null, resourceType, activeData)).toBe(true);
            expect(canReadResource(guestUser, resourceType, activeData)).toBe(
              true
            );
            expect(canReadResource(regularUser, resourceType, activeData)).toBe(
              true
            );
          });

          it("anyone can read published items", () => {
            const publishedData = { status: "published" };
            expect(canReadResource(null, resourceType, publishedData)).toBe(
              true
            );
          });

          it("anyone can read items with isActive=true", () => {
            const isActiveData = { isActive: true };
            expect(canReadResource(null, resourceType, isActiveData)).toBe(
              true
            );
          });

          it("guests cannot read draft/inactive items", () => {
            const draftData = { status: "draft" };
            expect(canReadResource(null, resourceType, draftData)).toBe(false);
          });
        });
      });
    });

    describe("reviews - special approval-based access", () => {
      it("admin can read all reviews", () => {
        const pendingReview = { status: "pending", shopId: "shop-789" };
        expect(canReadResource(adminUser, "reviews", pendingReview)).toBe(true);
      });

      it("seller can read reviews for their products", () => {
        const ownReview = { status: "pending", shopId: "shop-789" };
        expect(canReadResource(sellerUser, "reviews", ownReview)).toBe(true);
      });

      it("seller cannot read reviews for other shops", () => {
        const otherReview = { status: "pending", shopId: "other-shop" };
        expect(canReadResource(sellerUser, "reviews", otherReview)).toBe(false);
      });

      it("anyone can read approved reviews", () => {
        const approvedReview = { status: "approved" };
        expect(canReadResource(null, "reviews", approvedReview)).toBe(true);
        expect(canReadResource(guestUser, "reviews", approvedReview)).toBe(
          true
        );
      });

      it("user can read own reviews (any status)", () => {
        const ownReview = { status: "pending", userId: "user-101" };
        expect(canReadResource(regularUser, "reviews", ownReview)).toBe(true);
      });

      it("user can read own reviews via createdBy field", () => {
        const ownReview = { status: "pending", createdBy: "user-101" };
        expect(canReadResource(regularUser, "reviews", ownReview)).toBe(true);
      });

      it("user cannot read other users' pending reviews", () => {
        const otherReview = { status: "pending", userId: "other-user" };
        expect(canReadResource(regularUser, "reviews", otherReview)).toBe(
          false
        );
      });

      it("guest cannot read pending reviews", () => {
        const pendingReview = { status: "pending" };
        expect(canReadResource(null, "reviews", pendingReview)).toBe(false);
      });
    });

    describe("coupons - auth-required access", () => {
      it("admin can read all coupons", () => {
        const inactiveCoupon = { status: "inactive", shopId: "shop-789" };
        expect(canReadResource(adminUser, "coupons", inactiveCoupon)).toBe(
          true
        );
      });

      it("seller can read own coupons via shopId", () => {
        const ownCoupon = { status: "inactive", shopId: "shop-789" };
        expect(canReadResource(sellerUser, "coupons", ownCoupon)).toBe(true);
      });

      it("seller can read own coupons via createdBy", () => {
        const ownCoupon = { status: "inactive", createdBy: "seller-456" };
        expect(canReadResource(sellerUser, "coupons", ownCoupon)).toBe(true);
      });

      it("authenticated user can read active coupons", () => {
        const activeCoupon = { status: "active" };
        expect(canReadResource(regularUser, "coupons", activeCoupon)).toBe(
          true
        );
      });

      it("seller can read active coupons from other shops", () => {
        const otherCoupon = { status: "active", shopId: "other-shop" };
        expect(canReadResource(sellerUser, "coupons", otherCoupon)).toBe(true);
      });

      it("guest cannot read any coupons", () => {
        const activeCoupon = { status: "active" };
        expect(canReadResource(guestUser, "coupons", activeCoupon)).toBe(false);
      });

      it("null user cannot read coupons", () => {
        const activeCoupon = { status: "active" };
        expect(canReadResource(null, "coupons", activeCoupon)).toBe(false);
      });

      it("user cannot read inactive coupons from other shops", () => {
        const inactiveCoupon = { status: "inactive", shopId: "other-shop" };
        expect(canReadResource(regularUser, "coupons", inactiveCoupon)).toBe(
          false
        );
      });
    });

    describe("private resources (orders, tickets, payouts)", () => {
      it("null user cannot read private resources", () => {
        expect(canReadResource(null, "orders", { userId: "user-101" })).toBe(
          false
        );
        expect(canReadResource(null, "tickets", { userId: "user-101" })).toBe(
          false
        );
        expect(canReadResource(null, "payouts", { shopId: "shop-789" })).toBe(
          false
        );
      });

      it("admin can read all private resources", () => {
        expect(canReadResource(adminUser, "orders", { userId: "other" })).toBe(
          true
        );
        expect(canReadResource(adminUser, "tickets", { userId: "other" })).toBe(
          true
        );
        expect(canReadResource(adminUser, "payouts", { shopId: "other" })).toBe(
          true
        );
      });

      describe("orders", () => {
        it("seller can read orders for their shop", () => {
          const shopOrder = { userId: "other", shopId: "shop-789" };
          expect(canReadResource(sellerUser, "orders", shopOrder)).toBe(true);
        });

        it("seller cannot read orders from other shops", () => {
          const otherOrder = { userId: "other", shopId: "other-shop" };
          expect(canReadResource(sellerUser, "orders", otherOrder)).toBe(false);
        });

        it("user can read own orders via userId", () => {
          const ownOrder = { userId: "user-101", shopId: "shop-789" };
          expect(canReadResource(regularUser, "orders", ownOrder)).toBe(true);
        });

        it("user can read own orders via createdBy", () => {
          const ownOrder = { createdBy: "user-101", shopId: "shop-789" };
          expect(canReadResource(regularUser, "orders", ownOrder)).toBe(true);
        });

        it("user cannot read other users' orders", () => {
          const otherOrder = { userId: "other", shopId: "shop-789" };
          expect(canReadResource(regularUser, "orders", otherOrder)).toBe(
            false
          );
        });
      });

      describe("tickets", () => {
        it("seller can read tickets for their shop", () => {
          const shopTicket = { userId: "other", shopId: "shop-789" };
          expect(canReadResource(sellerUser, "tickets", shopTicket)).toBe(true);
        });

        it("seller can read tickets they created", () => {
          const ownTicket = { createdBy: "seller-456", shopId: "other" };
          expect(canReadResource(sellerUser, "tickets", ownTicket)).toBe(true);
        });

        it("seller can read tickets via userId", () => {
          const ticketAsUser = { userId: "seller-456", shopId: "other" };
          expect(canReadResource(sellerUser, "tickets", ticketAsUser)).toBe(
            true
          );
        });

        it("user can read own tickets", () => {
          const ownTicket = { userId: "user-101", shopId: "shop-789" };
          expect(canReadResource(regularUser, "tickets", ownTicket)).toBe(true);
        });

        it("user cannot read other users' tickets", () => {
          const otherTicket = { userId: "other", shopId: "shop-789" };
          expect(canReadResource(regularUser, "tickets", otherTicket)).toBe(
            false
          );
        });
      });

      describe("payouts", () => {
        it("seller can read payouts for their shop", () => {
          const shopPayout = { shopId: "shop-789", amount: 1000 };
          expect(canReadResource(sellerUser, "payouts", shopPayout)).toBe(true);
        });

        it("seller cannot read payouts for other shops", () => {
          const otherPayout = { shopId: "other-shop", amount: 1000 };
          expect(canReadResource(sellerUser, "payouts", otherPayout)).toBe(
            false
          );
        });

        it("regular user cannot read any payouts", () => {
          const payout = { shopId: "shop-789", amount: 1000 };
          expect(canReadResource(regularUser, "payouts", payout)).toBe(false);
        });
      });
    });

    describe("users resource - profile access", () => {
      it("user can read own profile via uid", () => {
        const ownProfile = { uid: "user-101", name: "Test User" };
        expect(canReadResource(regularUser, "users", ownProfile)).toBe(true);
      });

      it("user can read own profile via id", () => {
        const ownProfile = { id: "user-101", name: "Test User" };
        expect(canReadResource(regularUser, "users", ownProfile)).toBe(true);
      });

      it("user cannot read other users' profiles", () => {
        const otherProfile = { uid: "other-user", name: "Other User" };
        expect(canReadResource(regularUser, "users", otherProfile)).toBe(false);
      });

      it("admin can read any user profile", () => {
        const anyProfile = { uid: "any-user", name: "Any User" };
        expect(canReadResource(adminUser, "users", anyProfile)).toBe(true);
      });

      it("null user cannot read profiles", () => {
        const profile = { uid: "user-101", name: "Test User" };
        expect(canReadResource(null, "users", profile)).toBe(false);
      });
    });

    describe("edge cases", () => {
      it("handles missing data parameter", () => {
        expect(canReadResource(adminUser, "products")).toBe(true);
        expect(canReadResource(null, "products")).toBe(false);
      });

      it("handles data with no status field", () => {
        const noStatus = { shopId: "shop-789" };
        expect(canReadResource(sellerUser, "products", noStatus)).toBe(true);
        expect(canReadResource(null, "products", noStatus)).toBe(false);
      });

      it("handles null user correctly", () => {
        expect(canReadResource(null, "orders", { userId: "user-101" })).toBe(
          false
        );
      });

      it("handles guest user for public resources", () => {
        const activeProduct = { status: "active" };
        expect(canReadResource(guestUser, "products", activeProduct)).toBe(
          true
        );
      });
    });
  });

  describe("canWriteResource() - Create/Update Permission Checks", () => {
    describe("null user - no permissions", () => {
      it("cannot create any resource", () => {
        expect(canWriteResource(null, "products", "create")).toBe(false);
        expect(canWriteResource(null, "orders", "create")).toBe(false);
      });

      it("cannot update any resource", () => {
        expect(canWriteResource(null, "products", "update", {})).toBe(false);
      });
    });

    describe("admin - full permissions", () => {
      it("can create any resource", () => {
        const resourceTypes: ResourceType[] = [
          "products",
          "auctions",
          "orders",
          "shops",
          "coupons",
          "tickets",
          "reviews",
          "payouts",
        ];
        resourceTypes.forEach((type) => {
          expect(canWriteResource(adminUser, type, "create")).toBe(true);
        });
      });

      it("can update any resource", () => {
        const data = { shopId: "other-shop", userId: "other-user" };
        expect(canWriteResource(adminUser, "products", "update", data)).toBe(
          true
        );
      });
    });

    describe("seller permissions", () => {
      describe("products, auctions, coupons", () => {
        const sellerResources: ResourceType[] = [
          "products",
          "auctions",
          "coupons",
        ];

        sellerResources.forEach((resourceType) => {
          describe(`${resourceType}`, () => {
            it("can create new items", () => {
              expect(canWriteResource(sellerUser, resourceType, "create")).toBe(
                true
              );
            });

            it("can update own items via shopId", () => {
              const ownData = { shopId: "shop-789" };
              expect(
                canWriteResource(sellerUser, resourceType, "update", ownData)
              ).toBe(true);
            });

            it("can update own items via createdBy", () => {
              const ownData = { createdBy: "seller-456" };
              expect(
                canWriteResource(sellerUser, resourceType, "update", ownData)
              ).toBe(true);
            });

            it("cannot update other sellers' items", () => {
              const otherData = { shopId: "other-shop" };
              expect(
                canWriteResource(sellerUser, resourceType, "update", otherData)
              ).toBe(false);
            });
          });
        });
      });

      describe("shops", () => {
        it("can create shop if they don't have one", () => {
          const sellerWithoutShop: AuthUser = {
            ...sellerUser,
            shopId: undefined,
          };
          expect(canWriteResource(sellerWithoutShop, "shops", "create")).toBe(
            true
          );
        });

        it("cannot create shop if they already have one", () => {
          expect(canWriteResource(sellerUser, "shops", "create")).toBe(false);
        });

        it("can update own shop via id", () => {
          const ownShop = { id: "shop-789" };
          expect(canWriteResource(sellerUser, "shops", "update", ownShop)).toBe(
            true
          );
        });

        it("can update own shop via ownerId", () => {
          const ownShop = { ownerId: "seller-456" };
          expect(canWriteResource(sellerUser, "shops", "update", ownShop)).toBe(
            true
          );
        });

        it("cannot update other shops", () => {
          const otherShop = { id: "other-shop" };
          expect(
            canWriteResource(sellerUser, "shops", "update", otherShop)
          ).toBe(false);
        });
      });

      describe("orders", () => {
        it("can create orders (as a buyer)", () => {
          expect(canWriteResource(sellerUser, "orders", "create")).toBe(true);
        });

        it("can update orders for their shop", () => {
          const shopOrder = { shopId: "shop-789", status: "processing" };
          expect(
            canWriteResource(sellerUser, "orders", "update", shopOrder)
          ).toBe(true);
        });

        it("cannot update orders for other shops", () => {
          const otherOrder = { shopId: "other-shop", status: "processing" };
          expect(
            canWriteResource(sellerUser, "orders", "update", otherOrder)
          ).toBe(false);
        });
      });

      describe("payouts", () => {
        it("can create payout requests", () => {
          expect(canWriteResource(sellerUser, "payouts", "create")).toBe(true);
        });

        it("can update own pending payouts", () => {
          const pendingPayout = { shopId: "shop-789", status: "pending" };
          expect(
            canWriteResource(sellerUser, "payouts", "update", pendingPayout)
          ).toBe(true);
        });

        it("cannot approve payouts (admin only)", () => {
          const approvedPayout = { shopId: "shop-789", status: "approved" };
          expect(
            canWriteResource(sellerUser, "payouts", "update", approvedPayout)
          ).toBe(false);
        });

        it("cannot reject payouts (admin only)", () => {
          const rejectedPayout = { shopId: "shop-789", status: "rejected" };
          expect(
            canWriteResource(sellerUser, "payouts", "update", rejectedPayout)
          ).toBe(false);
        });

        it("cannot update other shops' payouts", () => {
          const otherPayout = { shopId: "other-shop", status: "pending" };
          expect(
            canWriteResource(sellerUser, "payouts", "update", otherPayout)
          ).toBe(false);
        });
      });

      describe("tickets", () => {
        it("can create tickets", () => {
          expect(canWriteResource(sellerUser, "tickets", "create")).toBe(true);
        });

        it("can update tickets for their shop", () => {
          const shopTicket = { shopId: "shop-789" };
          expect(
            canWriteResource(sellerUser, "tickets", "update", shopTicket)
          ).toBe(true);
        });

        it("can update tickets they created", () => {
          const ownTicket = { createdBy: "seller-456" };
          expect(
            canWriteResource(sellerUser, "tickets", "update", ownTicket)
          ).toBe(true);
        });

        it("cannot update other tickets", () => {
          const otherTicket = { shopId: "other-shop", createdBy: "other" };
          expect(
            canWriteResource(sellerUser, "tickets", "update", otherTicket)
          ).toBe(false);
        });
      });

      it("cannot write to hero_slides, categories, reviews, users", () => {
        expect(canWriteResource(sellerUser, "hero_slides", "create")).toBe(
          false
        );
        expect(canWriteResource(sellerUser, "categories", "create")).toBe(
          false
        );
        expect(canWriteResource(sellerUser, "reviews", "create")).toBe(false);
      });
    });

    describe("user permissions", () => {
      describe("tickets and reviews", () => {
        const userWritableResources: ResourceType[] = ["tickets", "reviews"];

        userWritableResources.forEach((resourceType) => {
          describe(`${resourceType}`, () => {
            it("can create", () => {
              expect(
                canWriteResource(regularUser, resourceType, "create")
              ).toBe(true);
            });

            it("can update own items via userId", () => {
              const ownData = { userId: "user-101" };
              expect(
                canWriteResource(regularUser, resourceType, "update", ownData)
              ).toBe(true);
            });

            it("can update own items via createdBy", () => {
              const ownData = { createdBy: "user-101" };
              expect(
                canWriteResource(regularUser, resourceType, "update", ownData)
              ).toBe(true);
            });

            it("cannot update other users' items", () => {
              const otherData = { userId: "other-user" };
              expect(
                canWriteResource(regularUser, resourceType, "update", otherData)
              ).toBe(false);
            });
          });
        });
      });

      describe("orders", () => {
        it("can create orders", () => {
          expect(canWriteResource(regularUser, "orders", "create")).toBe(true);
        });

        it("cannot update order status", () => {
          const ownOrder = { userId: "user-101", status: "pending" };
          expect(
            canWriteResource(regularUser, "orders", "update", ownOrder)
          ).toBe(false);
        });

        it("cannot update any order", () => {
          const order = { userId: "user-101" };
          expect(canWriteResource(regularUser, "orders", "update", order)).toBe(
            false
          );
        });
      });

      describe("users (profile)", () => {
        it("can update own profile via uid", () => {
          const ownProfile = { uid: "user-101" };
          expect(
            canWriteResource(regularUser, "users", "update", ownProfile)
          ).toBe(true);
        });

        it("can update own profile via id", () => {
          const ownProfile = { id: "user-101" };
          expect(
            canWriteResource(regularUser, "users", "update", ownProfile)
          ).toBe(true);
        });

        it("cannot update other profiles", () => {
          const otherProfile = { uid: "other-user" };
          expect(
            canWriteResource(regularUser, "users", "update", otherProfile)
          ).toBe(false);
        });

        it("cannot create user profiles", () => {
          expect(canWriteResource(regularUser, "users", "create")).toBe(false);
        });
      });

      it("cannot write to products, auctions, shops, coupons, payouts", () => {
        expect(canWriteResource(regularUser, "products", "create")).toBe(false);
        expect(canWriteResource(regularUser, "auctions", "create")).toBe(false);
        expect(canWriteResource(regularUser, "shops", "create")).toBe(false);
        expect(canWriteResource(regularUser, "coupons", "create")).toBe(false);
        expect(canWriteResource(regularUser, "payouts", "create")).toBe(false);
      });
    });

    describe("guest - no write permissions", () => {
      it("cannot create any resource", () => {
        expect(canWriteResource(guestUser, "products", "create")).toBe(false);
        expect(canWriteResource(guestUser, "tickets", "create")).toBe(false);
        expect(canWriteResource(guestUser, "reviews", "create")).toBe(false);
      });

      it("cannot update any resource", () => {
        const data = { userId: "guest-999" };
        expect(canWriteResource(guestUser, "tickets", "update", data)).toBe(
          false
        );
      });
    });
  });

  describe("canDeleteResource() - Delete Permission Checks", () => {
    it("null user cannot delete anything", () => {
      expect(canDeleteResource(null, "products", {})).toBe(false);
    });

    describe("admin - full delete permissions", () => {
      it("can delete any resource", () => {
        const data = { shopId: "other-shop", userId: "other-user" };
        expect(canDeleteResource(adminUser, "products", data)).toBe(true);
        expect(canDeleteResource(adminUser, "orders", data)).toBe(true);
        expect(canDeleteResource(adminUser, "tickets", data)).toBe(true);
      });
    });

    describe("seller delete permissions", () => {
      it("can delete own products via shopId", () => {
        const ownProduct = { shopId: "shop-789" };
        expect(canDeleteResource(sellerUser, "products", ownProduct)).toBe(
          true
        );
      });

      it("can delete own products via createdBy", () => {
        const ownProduct = { createdBy: "seller-456" };
        expect(canDeleteResource(sellerUser, "products", ownProduct)).toBe(
          true
        );
      });

      it("can delete own auctions", () => {
        const ownAuction = { shopId: "shop-789" };
        expect(canDeleteResource(sellerUser, "auctions", ownAuction)).toBe(
          true
        );
      });

      it("can delete own coupons", () => {
        const ownCoupon = { shopId: "shop-789" };
        expect(canDeleteResource(sellerUser, "coupons", ownCoupon)).toBe(true);
      });

      it("cannot delete other sellers' products", () => {
        const otherProduct = { shopId: "other-shop" };
        expect(canDeleteResource(sellerUser, "products", otherProduct)).toBe(
          false
        );
      });

      it("can cancel orders for their shop", () => {
        const shopOrder = { shopId: "shop-789", userId: "user-101" };
        expect(canDeleteResource(sellerUser, "orders", shopOrder)).toBe(true);
      });

      it("cannot delete orders from other shops", () => {
        const otherOrder = { shopId: "other-shop" };
        expect(canDeleteResource(sellerUser, "orders", otherOrder)).toBe(false);
      });

      it("cannot delete tickets, reviews, or users", () => {
        expect(
          canDeleteResource(sellerUser, "tickets", { shopId: "shop-789" })
        ).toBe(false);
        expect(
          canDeleteResource(sellerUser, "reviews", { shopId: "shop-789" })
        ).toBe(false);
        expect(
          canDeleteResource(sellerUser, "users", { uid: "seller-456" })
        ).toBe(false);
      });
    });

    describe("user delete permissions", () => {
      it("can delete own tickets", () => {
        const ownTicket = { userId: "user-101" };
        expect(canDeleteResource(regularUser, "tickets", ownTicket)).toBe(true);
      });

      it("can delete own reviews", () => {
        const ownReview = { userId: "user-101" };
        expect(canDeleteResource(regularUser, "reviews", ownReview)).toBe(true);
      });

      it("cannot delete other users' tickets", () => {
        const otherTicket = { userId: "other-user" };
        expect(canDeleteResource(regularUser, "tickets", otherTicket)).toBe(
          false
        );
      });

      it("can cancel own pending orders", () => {
        const pendingOrder = { userId: "user-101", status: "pending" };
        expect(canDeleteResource(regularUser, "orders", pendingOrder)).toBe(
          true
        );
      });

      it("cannot cancel orders in other statuses", () => {
        const processingOrder = { userId: "user-101", status: "processing" };
        expect(canDeleteResource(regularUser, "orders", processingOrder)).toBe(
          false
        );
      });

      it("cannot delete other users' orders", () => {
        const otherOrder = { userId: "other-user", status: "pending" };
        expect(canDeleteResource(regularUser, "orders", otherOrder)).toBe(
          false
        );
      });

      it("cannot delete products, shops, or coupons", () => {
        expect(canDeleteResource(regularUser, "products", {})).toBe(false);
        expect(canDeleteResource(regularUser, "shops", {})).toBe(false);
        expect(canDeleteResource(regularUser, "coupons", {})).toBe(false);
      });
    });

    describe("guest - no delete permissions", () => {
      it("cannot delete anything", () => {
        expect(canDeleteResource(guestUser, "tickets", {})).toBe(false);
        expect(canDeleteResource(guestUser, "reviews", {})).toBe(false);
        expect(canDeleteResource(guestUser, "products", {})).toBe(false);
      });
    });
  });

  describe("filterDataByRole() - Data Filtering", () => {
    const testData = [
      { id: "1", status: "active", shopId: "shop-789", userId: "user-101" },
      { id: "2", status: "draft", shopId: "shop-789", userId: "seller-456" },
      { id: "3", status: "published", shopId: "other-shop", userId: "other" },
      { id: "4", status: "inactive", shopId: "other-shop", userId: "other" },
      { id: "5", isActive: true, shopId: "shop-abc", userId: "user-xyz" },
      { id: "6", status: "pending", shopId: "shop-789", createdBy: "user-101" },
    ];

    it("admin sees everything", () => {
      const filtered = filterDataByRole(adminUser, "products", testData);
      expect(filtered).toHaveLength(6);
      expect(filtered).toEqual(testData);
    });

    it("null user sees only public data (active/published/isActive)", () => {
      const filtered = filterDataByRole(null, "products", testData);
      expect(filtered).toHaveLength(3);
      expect(filtered.map((item) => item.id)).toEqual(["1", "3", "5"]);
    });

    it("seller sees own items + public items", () => {
      const filtered = filterDataByRole(sellerUser, "products", testData);
      // Own: 1, 2, 6 (shopId=shop-789)
      // Public: 3, 5
      expect(filtered).toHaveLength(5);
      expect(filtered.map((item) => item.id)).toEqual([
        "1",
        "2",
        "3",
        "5",
        "6",
      ]);
    });

    it("seller sees items via createdBy", () => {
      const dataWithCreatedBy = [
        { id: "1", status: "draft", createdBy: "seller-456" },
        { id: "2", status: "draft", createdBy: "other" },
      ];
      const filtered = filterDataByRole(
        sellerUser,
        "products",
        dataWithCreatedBy
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("user sees own items + public items", () => {
      const filtered = filterDataByRole(regularUser, "products", testData);
      // Own: 1, 6 (userId or createdBy = user-101)
      // Public: 3, 5
      expect(filtered).toHaveLength(4);
      expect(filtered.map((item) => item.id)).toEqual(["1", "3", "5", "6"]);
    });

    it("user sees items via createdBy", () => {
      const dataWithCreatedBy = [
        { id: "1", status: "pending", createdBy: "user-101" },
        { id: "2", status: "pending", createdBy: "other" },
        { id: "3", status: "active", createdBy: "other" },
      ];
      const filtered = filterDataByRole(
        regularUser,
        "tickets",
        dataWithCreatedBy
      );
      expect(filtered).toHaveLength(2);
      expect(filtered.map((item) => item.id)).toEqual(["1", "3"]);
    });

    it("handles empty array", () => {
      expect(filterDataByRole(adminUser, "products", [])).toEqual([]);
      expect(filterDataByRole(null, "products", [])).toEqual([]);
    });

    it("handles data without status fields", () => {
      const noStatusData = [
        { id: "1", shopId: "shop-789" },
        { id: "2", shopId: "other-shop" },
      ];
      const filtered = filterDataByRole(sellerUser, "products", noStatusData);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });
  });

  describe("isResourceOwner() - Ownership Detection", () => {
    it("returns false for null user", () => {
      expect(isResourceOwner(null, { userId: "user-101" })).toBe(false);
    });

    it("detects ownership via userId", () => {
      const data = { userId: "user-101", name: "Test" };
      expect(isResourceOwner(regularUser, data)).toBe(true);
    });

    it("detects ownership via createdBy", () => {
      const data = { createdBy: "user-101", name: "Test" };
      expect(isResourceOwner(regularUser, data)).toBe(true);
    });

    it("detects ownership via ownerId", () => {
      const data = { ownerId: "seller-456", name: "Test" };
      expect(isResourceOwner(sellerUser, data)).toBe(true);
    });

    it("detects ownership via shopId for sellers", () => {
      const data = { shopId: "shop-789", name: "Test" };
      expect(isResourceOwner(sellerUser, data)).toBe(true);
    });

    it("does not detect shopId ownership for non-sellers", () => {
      const data = { shopId: "shop-789", name: "Test" };
      expect(isResourceOwner(regularUser, data)).toBe(false);
    });

    it("returns false for non-owned resources", () => {
      const data = {
        userId: "other-user",
        createdBy: "other",
        shopId: "other",
      };
      expect(isResourceOwner(regularUser, data)).toBe(false);
      expect(isResourceOwner(sellerUser, data)).toBe(false);
    });

    it("handles missing data fields", () => {
      const emptyData = {};
      expect(isResourceOwner(regularUser, emptyData)).toBe(false);
    });

    it("handles null/undefined data", () => {
      expect(isResourceOwner(regularUser, null)).toBe(false);
      expect(isResourceOwner(regularUser, undefined)).toBe(false);
    });
  });

  describe("getRoleLevel() - Role Hierarchy", () => {
    it("returns correct level for admin", () => {
      expect(getRoleLevel("admin")).toBe(100);
    });

    it("returns correct level for seller", () => {
      expect(getRoleLevel("seller")).toBe(50);
    });

    it("returns correct level for user", () => {
      expect(getRoleLevel("user")).toBe(10);
    });

    it("returns correct level for guest", () => {
      expect(getRoleLevel("guest")).toBe(0);
    });

    it("maintains hierarchy order", () => {
      expect(getRoleLevel("admin")).toBeGreaterThan(getRoleLevel("seller"));
      expect(getRoleLevel("seller")).toBeGreaterThan(getRoleLevel("user"));
      expect(getRoleLevel("user")).toBeGreaterThan(getRoleLevel("guest"));
    });

    it("returns 0 for invalid role", () => {
      // NOTE: TypeScript prevents this, but test runtime behavior
      expect(getRoleLevel("invalid" as UserRole)).toBe(0);
    });
  });

  describe("hasRole() - Role Requirement Checks", () => {
    it("admin has all roles", () => {
      expect(hasRole(adminUser, "admin")).toBe(true);
      expect(hasRole(adminUser, "seller")).toBe(true);
      expect(hasRole(adminUser, "user")).toBe(true);
      expect(hasRole(adminUser, "guest")).toBe(true);
    });

    it("seller has seller, user, and guest roles", () => {
      expect(hasRole(sellerUser, "admin")).toBe(false);
      expect(hasRole(sellerUser, "seller")).toBe(true);
      expect(hasRole(sellerUser, "user")).toBe(true);
      expect(hasRole(sellerUser, "guest")).toBe(true);
    });

    it("user has user and guest roles", () => {
      expect(hasRole(regularUser, "admin")).toBe(false);
      expect(hasRole(regularUser, "seller")).toBe(false);
      expect(hasRole(regularUser, "user")).toBe(true);
      expect(hasRole(regularUser, "guest")).toBe(true);
    });

    it("guest has only guest role", () => {
      expect(hasRole(guestUser, "admin")).toBe(false);
      expect(hasRole(guestUser, "seller")).toBe(false);
      expect(hasRole(guestUser, "user")).toBe(false);
      expect(hasRole(guestUser, "guest")).toBe(true);
    });

    it("null user only has guest role", () => {
      expect(hasRole(null, "admin")).toBe(false);
      expect(hasRole(null, "seller")).toBe(false);
      expect(hasRole(null, "user")).toBe(false);
      expect(hasRole(null, "guest")).toBe(true);
    });
  });

  describe("hasAnyRole() - Multi-Role Checks", () => {
    it("admin matches any role list", () => {
      expect(hasAnyRole(adminUser, ["admin"])).toBe(true);
      expect(hasAnyRole(adminUser, ["seller", "admin"])).toBe(true);
      expect(hasAnyRole(adminUser, ["user", "seller"])).toBe(false);
    });

    it("seller matches seller role", () => {
      expect(hasAnyRole(sellerUser, ["admin"])).toBe(false);
      expect(hasAnyRole(sellerUser, ["seller"])).toBe(true);
      expect(hasAnyRole(sellerUser, ["admin", "seller"])).toBe(true);
      expect(hasAnyRole(sellerUser, ["user", "guest"])).toBe(false);
    });

    it("user matches user role", () => {
      expect(hasAnyRole(regularUser, ["admin", "seller"])).toBe(false);
      expect(hasAnyRole(regularUser, ["user"])).toBe(true);
      expect(hasAnyRole(regularUser, ["user", "seller"])).toBe(true);
    });

    it("guest matches guest role", () => {
      expect(hasAnyRole(guestUser, ["admin", "seller", "user"])).toBe(false);
      expect(hasAnyRole(guestUser, ["guest"])).toBe(true);
    });

    it("null user only matches guest", () => {
      expect(hasAnyRole(null, ["admin", "seller", "user"])).toBe(false);
      expect(hasAnyRole(null, ["guest"])).toBe(true);
      expect(hasAnyRole(null, ["user", "guest"])).toBe(true);
    });

    it("handles empty role array", () => {
      expect(hasAnyRole(adminUser, [])).toBe(false);
      expect(hasAnyRole(null, [])).toBe(false);
    });

    it("handles multiple matching roles", () => {
      expect(hasAnyRole(sellerUser, ["seller", "user", "guest"])).toBe(true);
    });
  });

  describe("canCreateResource() - Create Alias", () => {
    it("is alias for canWriteResource with create action", () => {
      // Admin can create
      expect(canCreateResource(adminUser, "products")).toBe(true);
      expect(canWriteResource(adminUser, "products", "create")).toBe(true);

      // Seller can create products
      expect(canCreateResource(sellerUser, "products")).toBe(true);
      expect(canWriteResource(sellerUser, "products", "create")).toBe(true);

      // User cannot create products
      expect(canCreateResource(regularUser, "products")).toBe(false);
      expect(canWriteResource(regularUser, "products", "create")).toBe(false);

      // User can create tickets
      expect(canCreateResource(regularUser, "tickets")).toBe(true);
      expect(canWriteResource(regularUser, "tickets", "create")).toBe(true);
    });

    it("matches canWriteResource for all resource types", () => {
      const resourceTypes: ResourceType[] = [
        "products",
        "auctions",
        "orders",
        "tickets",
        "reviews",
        "coupons",
      ];

      resourceTypes.forEach((type) => {
        expect(canCreateResource(adminUser, type)).toBe(
          canWriteResource(adminUser, type, "create")
        );
        expect(canCreateResource(sellerUser, type)).toBe(
          canWriteResource(sellerUser, type, "create")
        );
        expect(canCreateResource(regularUser, type)).toBe(
          canWriteResource(regularUser, type, "create")
        );
      });
    });
  });

  describe("canUpdateResource() - Update Alias", () => {
    it("is alias for canWriteResource with update action", () => {
      const ownProduct = { shopId: "shop-789" };

      // Admin can update
      expect(canUpdateResource(adminUser, "products", ownProduct)).toBe(true);
      expect(
        canWriteResource(adminUser, "products", "update", ownProduct)
      ).toBe(true);

      // Seller can update own product
      expect(canUpdateResource(sellerUser, "products", ownProduct)).toBe(true);
      expect(
        canWriteResource(sellerUser, "products", "update", ownProduct)
      ).toBe(true);

      // User cannot update products
      expect(canUpdateResource(regularUser, "products", ownProduct)).toBe(
        false
      );
      expect(
        canWriteResource(regularUser, "products", "update", ownProduct)
      ).toBe(false);
    });

    it("matches canWriteResource for all scenarios", () => {
      const ownData = { userId: "user-101" };
      const otherData = { userId: "other-user" };

      // User can update own tickets
      expect(canUpdateResource(regularUser, "tickets", ownData)).toBe(true);
      expect(canWriteResource(regularUser, "tickets", "update", ownData)).toBe(
        true
      );

      // User cannot update other tickets
      expect(canUpdateResource(regularUser, "tickets", otherData)).toBe(false);
      expect(
        canWriteResource(regularUser, "tickets", "update", otherData)
      ).toBe(false);
    });

    it("requires data parameter for ownership checks", () => {
      // Without data, seller cannot update products
      expect(canUpdateResource(sellerUser, "products")).toBe(false);
      expect(canWriteResource(sellerUser, "products", "update")).toBe(false);

      // With data showing ownership, can update
      expect(
        canUpdateResource(sellerUser, "products", { shopId: "shop-789" })
      ).toBe(true);
    });
  });

  describe("integration scenarios - real-world use cases", () => {
    it("seller product management flow", () => {
      // Create product
      expect(canCreateResource(sellerUser, "products")).toBe(true);

      // Read own draft product
      const draftProduct = { shopId: "shop-789", status: "draft" };
      expect(canReadResource(sellerUser, "products", draftProduct)).toBe(true);

      // Update own product
      expect(canUpdateResource(sellerUser, "products", draftProduct)).toBe(
        true
      );

      // Delete own product
      expect(canDeleteResource(sellerUser, "products", draftProduct)).toBe(
        true
      );

      // Cannot manage other seller's products
      const otherProduct = { shopId: "other-shop", status: "draft" };
      expect(canReadResource(sellerUser, "products", otherProduct)).toBe(false);
      expect(canUpdateResource(sellerUser, "products", otherProduct)).toBe(
        false
      );
      expect(canDeleteResource(sellerUser, "products", otherProduct)).toBe(
        false
      );
    });

    it("user order lifecycle", () => {
      // Create order
      expect(canCreateResource(regularUser, "orders")).toBe(true);

      // Read own order
      const ownOrder = { userId: "user-101", status: "pending" };
      expect(canReadResource(regularUser, "orders", ownOrder)).toBe(true);

      // Cannot update order status
      expect(canUpdateResource(regularUser, "orders", ownOrder)).toBe(false);

      // Can cancel pending order
      expect(canDeleteResource(regularUser, "orders", ownOrder)).toBe(true);

      // Cannot cancel processing order
      const processingOrder = { userId: "user-101", status: "processing" };
      expect(canDeleteResource(regularUser, "orders", processingOrder)).toBe(
        false
      );
    });

    it("review submission and approval flow", () => {
      // User creates review
      expect(canCreateResource(regularUser, "reviews")).toBe(true);

      const pendingReview = {
        userId: "user-101",
        shopId: "shop-789",
        status: "pending",
      };

      // User can read own pending review
      expect(canReadResource(regularUser, "reviews", pendingReview)).toBe(true);

      // Seller can read review for their shop
      expect(canReadResource(sellerUser, "reviews", pendingReview)).toBe(true);

      // Guest cannot read pending review
      expect(canReadResource(null, "reviews", pendingReview)).toBe(false);

      // Once approved, everyone can read
      const approvedReview = { ...pendingReview, status: "approved" };
      expect(canReadResource(null, "reviews", approvedReview)).toBe(true);

      // User can update own review
      expect(canUpdateResource(regularUser, "reviews", pendingReview)).toBe(
        true
      );

      // User can delete own review
      expect(canDeleteResource(regularUser, "reviews", pendingReview)).toBe(
        true
      );
    });

    it("admin oversight capabilities", () => {
      // Admin can read everything
      expect(
        canReadResource(adminUser, "products", {
          status: "draft",
          shopId: "any-shop",
        })
      ).toBe(true);
      expect(canReadResource(adminUser, "orders", { userId: "any-user" })).toBe(
        true
      );
      expect(
        canReadResource(adminUser, "payouts", { shopId: "any-shop" })
      ).toBe(true);

      // Admin can create anything
      expect(canCreateResource(adminUser, "hero_slides")).toBe(true);
      expect(canCreateResource(adminUser, "categories")).toBe(true);

      // Admin can update anything
      expect(
        canUpdateResource(adminUser, "products", { shopId: "any-shop" })
      ).toBe(true);
      expect(
        canUpdateResource(adminUser, "payouts", {
          shopId: "any-shop",
          status: "approved",
        })
      ).toBe(true);

      // Admin can delete anything
      expect(
        canDeleteResource(adminUser, "products", { shopId: "any-shop" })
      ).toBe(true);
    });

    it("coupon visibility by role", () => {
      const activeCoupon = { status: "active", shopId: "shop-789" };
      const inactiveCoupon = { status: "inactive", shopId: "shop-789" };

      // Seller can see own coupons (any status)
      expect(canReadResource(sellerUser, "coupons", activeCoupon)).toBe(true);
      expect(canReadResource(sellerUser, "coupons", inactiveCoupon)).toBe(true);

      // User can see active coupons
      expect(canReadResource(regularUser, "coupons", activeCoupon)).toBe(true);
      expect(canReadResource(regularUser, "coupons", inactiveCoupon)).toBe(
        false
      );

      // Guest cannot see any coupons
      expect(canReadResource(null, "coupons", activeCoupon)).toBe(false);
    });

    it("data filtering for product listings", () => {
      const products = [
        { id: "1", status: "active", shopId: "shop-789" },
        { id: "2", status: "draft", shopId: "shop-789" },
        { id: "3", status: "active", shopId: "other-shop" },
        { id: "4", status: "draft", shopId: "other-shop" },
      ];

      // Seller sees own (all) + other active
      const sellerView = filterDataByRole(sellerUser, "products", products);
      expect(sellerView.map((p) => p.id)).toEqual(["1", "2", "3"]);

      // User sees only active
      const userView = filterDataByRole(regularUser, "products", products);
      expect(userView.map((p) => p.id)).toEqual(["1", "3"]);

      // Guest sees only active
      const guestView = filterDataByRole(null, "products", products);
      expect(guestView.map((p) => p.id)).toEqual(["1", "3"]);

      // Admin sees all
      const adminView = filterDataByRole(adminUser, "products", products);
      expect(adminView).toHaveLength(4);
    });
  });
});
