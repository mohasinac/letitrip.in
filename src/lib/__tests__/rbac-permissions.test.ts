import {
  canCreateResource,
  canDeleteResource,
  canReadResource,
  canUpdateResource,
  canWriteResource,
  type AuthUser,
  type ResourceType,
} from "../rbac-permissions";

describe("RBAC Permissions", () => {
  const adminUser: AuthUser = {
    uid: "admin1",
    email: "admin@test.com",
    role: "admin",
  };

  const sellerUser: AuthUser = {
    uid: "seller1",
    email: "seller@test.com",
    role: "seller",
    shopId: "shop123",
  };

  const regularUser: AuthUser = {
    uid: "user1",
    email: "user@test.com",
    role: "user",
  };

  describe("canReadResource", () => {
    describe("public resources", () => {
      it("should allow admin to read everything", () => {
        expect(canReadResource(adminUser, "products")).toBe(true);
        expect(
          canReadResource(adminUser, "products", { status: "draft" })
        ).toBe(true);
      });

      it("should allow sellers to read own items", () => {
        expect(
          canReadResource(sellerUser, "products", { shopId: "shop123" })
        ).toBe(true);
        expect(
          canReadResource(sellerUser, "products", {
            shopId: "shop123",
            status: "draft",
          })
        ).toBe(true);
      });

      it("should not allow sellers to read other shop items", () => {
        expect(
          canReadResource(sellerUser, "products", {
            shopId: "other-shop",
            status: "draft",
          })
        ).toBe(false);
      });

      it("should allow everyone to read active items", () => {
        expect(
          canReadResource(regularUser, "products", { status: "active" })
        ).toBe(true);
        expect(canReadResource(null, "products", { status: "active" })).toBe(
          true
        );
      });

      it("should not allow regular users to read inactive items", () => {
        expect(
          canReadResource(regularUser, "products", { status: "draft" })
        ).toBe(false);
        expect(canReadResource(null, "products", { status: "draft" })).toBe(
          false
        );
      });
    });

    describe("reviews", () => {
      it("should allow admin to read all reviews", () => {
        expect(
          canReadResource(adminUser, "reviews", { status: "pending" })
        ).toBe(true);
      });

      it("should allow sellers to read reviews for their products", () => {
        expect(
          canReadResource(sellerUser, "reviews", { shopId: "shop123" })
        ).toBe(true);
      });

      it("should allow everyone to read approved reviews", () => {
        expect(
          canReadResource(regularUser, "reviews", { status: "approved" })
        ).toBe(true);
        expect(canReadResource(null, "reviews", { status: "approved" })).toBe(
          true
        );
      });

      it("should allow users to read own reviews", () => {
        expect(
          canReadResource(regularUser, "reviews", { userId: "user1" })
        ).toBe(true);
      });

      it("should not allow users to read other pending reviews", () => {
        expect(
          canReadResource(regularUser, "reviews", {
            userId: "other-user",
            status: "pending",
          })
        ).toBe(false);
      });
    });

    describe("orders", () => {
      it("should allow admin to read all orders", () => {
        expect(canReadResource(adminUser, "orders")).toBe(true);
      });

      it("should allow sellers to read own shop orders", () => {
        expect(
          canReadResource(sellerUser, "orders", { shopId: "shop123" })
        ).toBe(true);
      });

      it("should allow users to read own orders", () => {
        expect(
          canReadResource(regularUser, "orders", { userId: "user1" })
        ).toBe(true);
      });

      it("should not allow users to read other users orders", () => {
        expect(
          canReadResource(regularUser, "orders", { userId: "other-user" })
        ).toBe(false);
      });
    });
  });

  describe("canWriteResource", () => {
    it("should allow admin to write any resource", () => {
      expect(canWriteResource(adminUser, "products")).toBe(true);
      expect(canWriteResource(adminUser, "categories")).toBe(true);
    });

    it("should allow sellers to create products", () => {
      expect(canWriteResource(sellerUser, "products", "create")).toBe(true);
    });

    it("should allow sellers to update own products", () => {
      expect(
        canWriteResource(sellerUser, "products", "update", {
          shopId: "shop123",
        })
      ).toBe(true);
    });

    it("should not allow sellers to update other shop products", () => {
      expect(
        canWriteResource(sellerUser, "products", "update", {
          shopId: "other-shop",
        })
      ).toBe(false);
    });

    it("should not allow regular users to write shop resources", () => {
      expect(canWriteResource(regularUser, "products")).toBe(false);
    });

    it("should require authentication", () => {
      expect(canWriteResource(null, "products")).toBe(false);
    });
  });

  describe("canCreateResource", () => {
    it("should allow admin to create any resource", () => {
      expect(canCreateResource(adminUser, "products")).toBe(true);
      expect(canCreateResource(adminUser, "shops")).toBe(true);
    });

    it("should allow sellers to create products", () => {
      expect(canCreateResource(sellerUser, "products")).toBe(true);
    });

    it("should not allow regular users to create products", () => {
      expect(canCreateResource(regularUser, "products")).toBe(false);
    });

    it("should require authentication", () => {
      expect(canCreateResource(null, "products")).toBe(false);
    });
  });

  describe("canUpdateResource", () => {
    it("should allow admin to update any resource", () => {
      expect(canUpdateResource(adminUser, "products")).toBe(true);
    });

    it("should allow sellers to update own resources", () => {
      expect(
        canUpdateResource(sellerUser, "products", { shopId: "shop123" })
      ).toBe(true);
    });

    it("should not allow sellers to update other shop resources", () => {
      expect(
        canUpdateResource(sellerUser, "products", { shopId: "other-shop" })
      ).toBe(false);
    });

    it("should not allow regular users to update products", () => {
      expect(canUpdateResource(regularUser, "products")).toBe(false);
    });

    it("should require authentication", () => {
      expect(canUpdateResource(null, "products")).toBe(false);
    });
  });

  describe("canDeleteResource", () => {
    it("should allow admin to delete any resource", () => {
      expect(canDeleteResource(adminUser, "products")).toBe(true);
      expect(canDeleteResource(adminUser, "orders")).toBe(true);
    });

    it("should allow sellers to delete own resources", () => {
      expect(
        canDeleteResource(sellerUser, "products", { shopId: "shop123" })
      ).toBe(true);
    });

    it("should not allow sellers to delete other shop resources", () => {
      expect(
        canDeleteResource(sellerUser, "products", { shopId: "other-shop" })
      ).toBe(false);
    });

    it("should not allow regular users to delete most resources", () => {
      expect(canDeleteResource(regularUser, "products")).toBe(false);
      expect(canDeleteResource(regularUser, "shops")).toBe(false);
    });

    it("should require authentication", () => {
      expect(canDeleteResource(null, "products")).toBe(false);
    });
  });

  describe("role hierarchy", () => {
    it("admin should have all permissions", () => {
      const resources: ResourceType[] = [
        "products",
        "orders",
        "shops",
        "categories",
        "coupons",
        "reviews",
      ];

      resources.forEach((resource) => {
        expect(canReadResource(adminUser, resource)).toBe(true);
        expect(canWriteResource(adminUser, resource)).toBe(true);
        expect(canDeleteResource(adminUser, resource)).toBe(true);
      });
    });

    it("seller should have limited permissions", () => {
      expect(canCreateResource(sellerUser, "products")).toBe(true);
      expect(canCreateResource(sellerUser, "categories")).toBe(false);
      expect(canDeleteResource(sellerUser, "users")).toBe(false);
    });

    it("user should have minimal permissions", () => {
      expect(
        canReadResource(regularUser, "products", { status: "active" })
      ).toBe(true);
      expect(canWriteResource(regularUser, "products")).toBe(false);
      expect(canDeleteResource(regularUser, "products")).toBe(false);
    });

    it("guest should have read-only access to public resources", () => {
      expect(canReadResource(null, "products", { status: "active" })).toBe(
        true
      );
      expect(canWriteResource(null, "products")).toBe(false);
      expect(canDeleteResource(null, "products")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle missing shopId for seller", () => {
      const sellerWithoutShop: AuthUser = {
        uid: "seller2",
        email: "seller2@test.com",
        role: "seller",
      };

      expect(
        canUpdateResource(sellerWithoutShop, "products", {
          shopId: "shop123",
        })
      ).toBe(false);
    });

    it("should handle null data", () => {
      expect(canReadResource(adminUser, "products", null)).toBe(true);
      expect(canReadResource(regularUser, "products", null)).toBe(false);
    });

    it("should handle undefined data", () => {
      expect(canReadResource(adminUser, "products", undefined)).toBe(true);
      expect(canReadResource(regularUser, "products", undefined)).toBe(false);
    });
  });
});
