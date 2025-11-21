/**
 * Tests for rbac-permissions.ts
 * Testing role-based access control permissions
 */

import { describe, it, expect } from "@jest/globals";
import {
  canReadResource,
  canWriteResource,
  canDeleteResource,
  filterDataByRole,
  isResourceOwner,
  getRoleLevel,
  hasRole,
  hasAnyRole,
} from "./rbac-permissions";

describe("RBAC Permissions", () => {
  describe("canReadResource", () => {
    it("should allow admin to read any resource", () => {
      const user = {
        uid: "admin1",
        email: "admin@test.com",
        role: "admin" as const,
      };
      expect(canReadResource(user, "products", { status: "active" })).toBe(
        true
      );
    });

    it("should allow seller to read their own products", () => {
      const user = {
        uid: "seller1",
        email: "seller@test.com",
        role: "seller" as const,
        shopId: "shop1",
      };
      expect(
        canReadResource(user, "products", { shopId: "shop1", status: "active" })
      ).toBe(true);
    });

    it("should deny seller to read other seller's products", () => {
      const user = {
        uid: "seller1",
        email: "seller@test.com",
        role: "seller" as const,
        shopId: "shop1",
      };
      expect(
        canReadResource(user, "products", { shopId: "shop2", status: "active" })
      ).toBe(true); // Public data
      expect(canReadResource(user, "orders", { shopId: "shop2" })).toBe(false); // Private data
    });

    it("should allow user to read public resources", () => {
      const user = {
        uid: "user1",
        email: "user@test.com",
        role: "user" as const,
      };
      expect(canReadResource(user, "products", { status: "active" })).toBe(
        true
      );
    });

    it("should deny guest to read private resources", () => {
      expect(canReadResource(null, "orders", { userId: "user1" })).toBe(false);
    });
  });

  describe("canWriteResource", () => {
    it("should allow admin to write any resource", () => {
      const user = {
        uid: "admin1",
        email: "admin@test.com",
        role: "admin" as const,
      };
      expect(canWriteResource(user, "products")).toBe(true);
    });

    it("should allow seller to create products", () => {
      const user = {
        uid: "seller1",
        email: "seller@test.com",
        role: "seller" as const,
        shopId: "shop1",
      };
      expect(canWriteResource(user, "products", "create")).toBe(true);
    });

    it("should allow seller to update their own products", () => {
      const user = {
        uid: "seller1",
        email: "seller@test.com",
        role: "seller" as const,
        shopId: "shop1",
      };
      expect(
        canWriteResource(user, "products", "update", { shopId: "shop1" })
      ).toBe(true);
    });

    it("should deny seller to update other seller's products", () => {
      const user = {
        uid: "seller1",
        email: "seller@test.com",
        role: "seller" as const,
        shopId: "shop1",
      };
      expect(
        canWriteResource(user, "products", "update", { shopId: "shop2" })
      ).toBe(false);
    });

    it("should deny user to write products", () => {
      const user = {
        uid: "user1",
        email: "user@test.com",
        role: "user" as const,
      };
      expect(canWriteResource(user, "products")).toBe(false);
    });
  });

  describe("canDeleteResource", () => {
    it("should allow admin to delete any resource", () => {
      const user = {
        uid: "admin1",
        email: "admin@test.com",
        role: "admin" as const,
      };
      expect(canDeleteResource(user, "products", { id: "prod1" })).toBe(true);
    });

    it("should allow seller to delete their own products", () => {
      const user = {
        uid: "seller1",
        email: "seller@test.com",
        role: "seller" as const,
        shopId: "shop1",
      };
      expect(canDeleteResource(user, "products", { shopId: "shop1" })).toBe(
        true
      );
    });

    it("should deny seller to delete other seller's products", () => {
      const user = {
        uid: "seller1",
        email: "seller@test.com",
        role: "seller" as const,
        shopId: "shop1",
      };
      expect(canDeleteResource(user, "products", { shopId: "shop2" })).toBe(
        false
      );
    });
  });

  describe("isResourceOwner", () => {
    it("should return true when user owns resource", () => {
      const user = {
        uid: "user1",
        email: "user@test.com",
        role: "user" as const,
      };
      expect(isResourceOwner(user, { userId: "user1" })).toBe(true);
      expect(isResourceOwner(user, { createdBy: "user1" })).toBe(true);
      expect(isResourceOwner(user, { ownerId: "user1" })).toBe(true);
    });

    it("should return true when seller owns resource via shopId", () => {
      const user = {
        uid: "seller1",
        email: "seller@test.com",
        role: "seller" as const,
        shopId: "shop1",
      };
      expect(isResourceOwner(user, { shopId: "shop1" })).toBe(true);
    });

    it("should return false when user does not own resource", () => {
      const user = {
        uid: "user1",
        email: "user@test.com",
        role: "user" as const,
      };
      expect(isResourceOwner(user, { userId: "user2" })).toBe(false);
      expect(isResourceOwner(user, { shopId: "shop2" })).toBe(false);
    });
  });

  describe("getRoleLevel", () => {
    it("should return correct level for admin", () => {
      expect(getRoleLevel("admin")).toBe(100);
    });

    it("should return correct level for seller", () => {
      expect(getRoleLevel("seller")).toBe(50);
    });

    it("should return correct level for user", () => {
      expect(getRoleLevel("user")).toBe(10);
    });

    it("should return correct level for guest", () => {
      expect(getRoleLevel("guest")).toBe(0);
    });
  });

  describe("hasRole", () => {
    it("should return true when user has exact role", () => {
      const user = {
        uid: "user1",
        email: "user@test.com",
        role: "admin" as const,
      };
      expect(hasRole(user, "admin")).toBe(true);
    });

    it("should return false when user has different role", () => {
      const user = {
        uid: "user1",
        email: "user@test.com",
        role: "user" as const,
      };
      expect(hasRole(user, "admin")).toBe(false);
    });

    it("should return true for guest role when no user", () => {
      expect(hasRole(null, "guest")).toBe(true);
      expect(hasRole(null, "admin")).toBe(false);
    });
  });

  describe("hasAnyRole", () => {
    it("should return true when user has one of the roles", () => {
      const user = {
        uid: "user1",
        email: "user@test.com",
        role: "admin" as const,
      };
      expect(hasAnyRole(user, ["admin", "seller"])).toBe(true);
    });

    it("should return false when user has none of the roles", () => {
      const user = {
        uid: "user1",
        email: "user@test.com",
        role: "user" as const,
      };
      expect(hasAnyRole(user, ["admin", "seller"])).toBe(false);
    });

    it("should return true for guest role when no user", () => {
      expect(hasAnyRole(null, ["guest", "user"])).toBe(true);
      expect(hasAnyRole(null, ["admin", "seller"])).toBe(false);
    });
  });

  describe("filterDataByRole", () => {
    it("should return all data for admin", () => {
      const user = {
        uid: "admin1",
        email: "admin@test.com",
        role: "admin" as const,
      };
      const data = [
        { id: "1", shopId: "shop1", status: "active" },
        { id: "2", shopId: "shop2", status: "draft" },
      ];
      const result = filterDataByRole(user, "products", data);
      expect(result).toEqual(data);
    });

    it("should filter data for seller to show only their resources and public", () => {
      const user = {
        uid: "seller1",
        email: "seller@test.com",
        role: "seller" as const,
        shopId: "shop1",
      };
      const data = [
        { id: "1", shopId: "shop1", status: "active" },
        { id: "2", shopId: "shop2", status: "active" },
        { id: "3", shopId: "shop1", status: "draft" },
        { id: "4", shopId: "shop3", status: "draft" },
      ];
      const result = filterDataByRole(user, "products", data);
      expect(result).toEqual([
        { id: "1", shopId: "shop1", status: "active" },
        { id: "2", shopId: "shop2", status: "active" },
        { id: "3", shopId: "shop1", status: "draft" },
      ]);
    });

    it("should filter data for user to show only their resources and public", () => {
      const user = {
        uid: "user1",
        email: "user@test.com",
        role: "user" as const,
      };
      const data = [
        { id: "1", userId: "user1", status: "active" },
        { id: "2", userId: "user2", status: "active" },
        { id: "3", userId: "user1", status: "draft" },
        { id: "4", userId: "user3", status: "draft" },
      ];
      const result = filterDataByRole(user, "orders", data);
      expect(result).toEqual([
        { id: "1", userId: "user1", status: "active" },
        { id: "2", userId: "user2", status: "active" },
        { id: "3", userId: "user1", status: "draft" },
      ]);
    });

    it("should return only public data when no user", () => {
      const data = [
        { id: "1", status: "active" },
        { id: "2", status: "draft" },
        { id: "3", isActive: true },
        { id: "4", isActive: false },
      ];
      const result = filterDataByRole(null, "products", data);
      expect(result).toEqual([
        { id: "1", status: "active" },
        { id: "3", isActive: true },
      ]);
    });
  });
});
