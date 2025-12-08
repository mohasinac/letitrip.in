/**
 * USER TRANSFORMATION TESTS
 * Tests for FE/BE transformation functions
 */

import { Timestamp } from "firebase/firestore";
import { UserBE, UserListItemBE } from "../../backend/user.types";
import {
  UserPreferencesFormFE,
  UserProfileFormFE,
} from "../../frontend/user.types";
import {
  toBEBanUserRequest,
  toBEChangeRoleRequest,
  toBEUpdateUserRequest,
  toBEUserPreferencesUpdate,
  toBEUserProfileUpdate,
  toFEUser,
  toFEUserCard,
  toFEUserCards,
  toFEUsers,
} from "../user.transforms";

describe("User Transformations", () => {
  const mockTimestamp = Timestamp.fromDate(new Date("2024-01-15T10:00:00Z"));
  const mockRecentTimestamp = Timestamp.fromDate(
    new Date(Date.now() - 3600000)
  ); // 1 hour ago

  const mockUserBE: UserBE = {
    id: "user-123",
    uid: "uid-123",
    email: "john.doe@example.com",
    displayName: "John Doe",
    photoURL: "https://example.com/photo.jpg",
    phoneNumber: "+919876543210",
    role: "user",
    status: "active",
    firstName: "John",
    lastName: "Doe",
    bio: "Test user bio",
    location: "Mumbai, India",
    emailVerified: true,
    phoneVerified: true,
    shopId: null,
    shopName: null,
    shopSlug: null,
    totalOrders: 5,
    totalSpent: 25000,
    totalSales: 0,
    totalProducts: 0,
    totalAuctions: 0,
    rating: 4.5,
    reviewCount: 10,
    notifications: {
      email: true,
      push: true,
      sms: false,
      orderUpdates: true,
      promotions: false,
      newsletter: true,
    },
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
    lastLoginAt: mockRecentTimestamp,
    metadata: {},
  };

  describe("toFEUser", () => {
    it("should transform backend user to frontend user", () => {
      const result = toFEUser(mockUserBE);

      expect(result.id).toBe("user-123");
      expect(result.uid).toBe("uid-123");
      expect(result.email).toBe("john.doe@example.com");
      expect(result.fullName).toBe("John Doe");
      expect(result.initials).toBe("JD");
      expect(result.isVerified).toBe(true);
      expect(result.hasShop).toBe(false);
    });

    it("should format prices correctly", () => {
      const result = toFEUser(mockUserBE);

      expect(result.formattedTotalSpent).toContain("25,000");
      expect(result.formattedTotalSales).toContain("0");
    });

    it("should calculate rating display correctly", () => {
      const result = toFEUser(mockUserBE);

      expect(result.ratingStars).toBe(4.5);
      expect(result.ratingDisplay).toContain("4.5");
      expect(result.ratingDisplay).toContain("10 reviews");
    });

    it("should handle no reviews", () => {
      const userNoReviews: UserBE = {
        ...mockUserBE,
        rating: 0,
        reviewCount: 0,
      };

      const result = toFEUser(userNoReviews);

      expect(result.ratingDisplay).toBe("No reviews");
    });

    it("should generate correct user initials from first and last name", () => {
      const result = toFEUser(mockUserBE);

      expect(result.initials).toBe("JD");
    });

    it("should generate initials from display name when first/last name missing", () => {
      const userNoName: UserBE = {
        ...mockUserBE,
        firstName: null,
        lastName: null,
        displayName: "Test User",
      };

      const result = toFEUser(userNoName);

      expect(result.initials).toBe("TU");
    });

    it("should generate single initial from single word display name", () => {
      const userSingleName: UserBE = {
        ...mockUserBE,
        firstName: null,
        lastName: null,
        displayName: "John",
      };

      const result = toFEUser(userSingleName);

      expect(result.initials).toBe("J");
    });

    it("should default to 'U' when no name available", () => {
      const userNoDisplayName: UserBE = {
        ...mockUserBE,
        firstName: null,
        lastName: null,
        displayName: null,
      };

      const result = toFEUser(userNoDisplayName);

      expect(result.initials).toBe("U");
    });

    it("should set correct status flags", () => {
      const result = toFEUser(mockUserBE);

      expect(result.isActive).toBe(true);
      expect(result.isBlocked).toBe(false);
      expect(result.isSuspended).toBe(false);
    });

    it("should set correct role flags", () => {
      const result = toFEUser(mockUserBE);

      expect(result.isAdmin).toBe(false);
      expect(result.isSeller).toBe(false);
      expect(result.isUser).toBe(true);
    });

    it("should generate correct badges for verified user", () => {
      const result = toFEUser(mockUserBE);

      expect(result.badges).toContain("Verified");
    });

    it("should generate Active Buyer badge for users with 10+ orders", () => {
      const activeUser: UserBE = {
        ...mockUserBE,
        totalOrders: 15,
      };

      const result = toFEUser(activeUser);

      expect(result.badges).toContain("Active Buyer");
    });

    it("should generate seller badges correctly", () => {
      const seller: UserBE = {
        ...mockUserBE,
        role: "seller",
        rating: 4.7,
        reviewCount: 60,
        totalSales: 150000,
      };

      const result = toFEUser(seller);

      expect(result.badges).toContain("Top Seller");
      expect(result.badges).toContain("High Volume");
      expect(result.isSeller).toBe(true);
    });

    it("should generate admin badge", () => {
      const admin: UserBE = {
        ...mockUserBE,
        role: "admin",
      };

      const result = toFEUser(admin);

      expect(result.badges).toContain("Admin");
      expect(result.isAdmin).toBe(true);
    });

    it("should generate New badge for users within 30 days", () => {
      const newUser: UserBE = {
        ...mockUserBE,
        createdAt: Timestamp.fromDate(
          new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        ), // 15 days ago
      };

      const result = toFEUser(newUser);

      expect(result.badges).toContain("New");
    });

    it("should handle null dates gracefully", () => {
      const userNullDates: UserBE = {
        ...mockUserBE,
        lastLoginAt: null,
      };

      const result = toFEUser(userNullDates);

      expect(result.lastLoginDisplay).toBe("Never");
      expect(result.lastLoginAt).toBeNull();
    });

    it("should format member since correctly", () => {
      const result = toFEUser(mockUserBE);

      expect(result.memberSince).toContain("Member since");
      expect(result.memberSince).toContain("Jan 2024");
    });

    it("should calculate account age correctly", () => {
      const result = toFEUser(mockUserBE);

      expect(result.accountAge).toBeTruthy();
      expect(typeof result.accountAge).toBe("string");
    });

    it("should format last login as relative time", () => {
      const result = toFEUser(mockUserBE);

      expect(result.lastLoginDisplay).toContain("hour");
    });

    it("should handle seller with shop details", () => {
      const seller: UserBE = {
        ...mockUserBE,
        role: "seller",
        shopId: "shop-123",
        shopName: "Test Shop",
        shopSlug: "test-shop",
        totalProducts: 50,
        totalAuctions: 10,
      };

      const result = toFEUser(seller);

      expect(result.hasShop).toBe(true);
      expect(result.shopId).toBe("shop-123");
      expect(result.shopName).toBe("Test Shop");
      expect(result.shopSlug).toBe("test-shop");
      expect(result.totalProducts).toBe(50);
      expect(result.totalAuctions).toBe(10);
    });

    it("should maintain notification preferences", () => {
      const result = toFEUser(mockUserBE);

      expect(result.notifications.email).toBe(true);
      expect(result.notifications.push).toBe(true);
      expect(result.notifications.sms).toBe(false);
      expect(result.notifications.orderUpdates).toBe(true);
      expect(result.notifications.promotions).toBe(false);
      expect(result.notifications.newsletter).toBe(true);
    });

    it("should round rating to nearest 0.5", () => {
      const user: UserBE = {
        ...mockUserBE,
        rating: 4.7,
      };

      const result = toFEUser(user);

      expect(result.ratingStars).toBe(4.5);
    });

    it("should handle ISO string dates", () => {
      const userISODates: UserBE = {
        ...mockUserBE,
        createdAt: "2024-01-15T10:00:00Z" as any,
        updatedAt: "2024-01-15T10:00:00Z" as any,
        lastLoginAt: new Date().toISOString() as any,
      };

      const result = toFEUser(userISODates);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.lastLoginAt).toBeInstanceOf(Date);
    });
  });

  describe("toFEUserCard", () => {
    const mockUserListItemBE: UserListItemBE = {
      id: "user-123",
      uid: "uid-123",
      email: "john.doe@example.com",
      displayName: "John Doe",
      photoURL: "https://example.com/photo.jpg",
      role: "user",
      status: "active",
      emailVerified: true,
      createdAt: mockTimestamp,
    };

    it("should transform backend user list item to frontend card", () => {
      const result = toFEUserCard(mockUserListItemBE);

      expect(result.id).toBe("user-123");
      expect(result.email).toBe("john.doe@example.com");
      expect(result.fullName).toBe("John Doe");
      expect(result.initials).toBe("JD");
    });

    it("should set verified badge when email is verified", () => {
      const result = toFEUserCard(mockUserListItemBE);

      expect(result.badges).toContain("Verified");
      expect(result.isVerified).toBe(true);
    });

    it("should not set verified badge when email is not verified", () => {
      const unverifiedUser: UserListItemBE = {
        ...mockUserListItemBE,
        emailVerified: false,
      };

      const result = toFEUserCard(unverifiedUser);

      expect(result.badges).not.toContain("Verified");
      expect(result.isVerified).toBe(false);
    });

    it("should set default rating to 0 with 'No reviews' display", () => {
      const result = toFEUserCard(mockUserListItemBE);

      expect(result.rating).toBe(0);
      expect(result.ratingDisplay).toBe("No reviews");
    });

    it("should generate full name from display name", () => {
      const result = toFEUserCard(mockUserListItemBE);

      expect(result.fullName).toBe("John Doe");
    });

    it("should generate full name from email when display name is null", () => {
      const userNoDisplayName: UserListItemBE = {
        ...mockUserListItemBE,
        displayName: null,
      };

      const result = toFEUserCard(userNoDisplayName);

      expect(result.fullName).toBe("john.doe");
    });
  });

  describe("toBEUserProfileUpdate", () => {
    it("should transform profile form to backend update request", () => {
      const formData: UserProfileFormFE = {
        displayName: "John Smith",
        firstName: "John",
        lastName: "Smith",
        phoneNumber: "+919999999999",
        bio: "Updated bio",
        location: "Delhi, India",
        photoURL: "https://example.com/new-photo.jpg",
      };

      const result = toBEUserProfileUpdate(formData);

      expect(result.displayName).toBe("John Smith");
      expect(result.firstName).toBe("John");
      expect(result.lastName).toBe("Smith");
      expect(result.phoneNumber).toBe("+919999999999");
      expect(result.bio).toBe("Updated bio");
      expect(result.location).toBe("Delhi, India");
      expect(result.photoURL).toBe("https://example.com/new-photo.jpg");
    });

    it("should handle undefined values correctly", () => {
      const formData: UserProfileFormFE = {
        displayName: "John Smith",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        bio: "",
        location: "",
        photoURL: "",
      };

      const result = toBEUserProfileUpdate(formData);

      expect(result.displayName).toBe("John Smith");
      expect(result.firstName).toBeUndefined();
      expect(result.lastName).toBeUndefined();
      expect(result.phoneNumber).toBeUndefined();
      expect(result.bio).toBeUndefined();
      expect(result.location).toBeUndefined();
      expect(result.photoURL).toBeUndefined();
    });
  });

  describe("toBEUserPreferencesUpdate", () => {
    it("should transform preferences form to backend update request", () => {
      const formData: UserPreferencesFormFE = {
        notifications: {
          email: true,
          push: false,
          sms: true,
          orderUpdates: true,
          promotions: true,
          newsletter: false,
        },
      };

      const result = toBEUserPreferencesUpdate(formData);

      expect(result.notifications).toEqual(formData.notifications);
    });
  });

  describe("toFEUsers (batch)", () => {
    it("should transform array of backend users to frontend users", () => {
      const users: UserBE[] = [
        mockUserBE,
        { ...mockUserBE, id: "user-456", email: "jane@example.com" },
      ];

      const result = toFEUsers(users);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("user-123");
      expect(result[1].id).toBe("user-456");
    });

    it("should handle empty array", () => {
      const result = toFEUsers([]);

      expect(result).toEqual([]);
    });
  });

  describe("toFEUserCards (batch)", () => {
    it("should transform array of backend user list items to frontend cards", () => {
      const users: UserListItemBE[] = [
        {
          id: "user-123",
          uid: "uid-123",
          email: "john@example.com",
          displayName: "John",
          photoURL: null,
          role: "user",
          status: "active",
          emailVerified: true,
          createdAt: mockTimestamp,
        },
        {
          id: "user-456",
          uid: "uid-456",
          email: "jane@example.com",
          displayName: "Jane",
          photoURL: null,
          role: "user",
          status: "active",
          emailVerified: false,
          createdAt: mockTimestamp,
        },
      ];

      const result = toFEUserCards(users);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("user-123");
      expect(result[1].id).toBe("user-456");
    });
  });

  describe("toBEUpdateUserRequest", () => {
    it("should transform user profile form to update request", () => {
      const formData: UserProfileFormFE = {
        displayName: "Updated Name",
        firstName: "Updated",
        lastName: "Name",
        phoneNumber: "+919999999999",
        bio: "New bio",
        location: "Bangalore, India",
        photoURL: "https://example.com/photo.jpg",
      };

      const result = toBEUpdateUserRequest(formData);

      expect(result).toEqual({
        displayName: "Updated Name",
        firstName: "Updated",
        lastName: "Name",
        phoneNumber: "+919999999999",
        bio: "New bio",
        location: "Bangalore, India",
        photoURL: "https://example.com/photo.jpg",
      });
    });
  });

  describe("toBEBanUserRequest", () => {
    it("should create ban request with reason", () => {
      const result = toBEBanUserRequest(true, "Violated terms of service");

      expect(result.isBanned).toBe(true);
      expect(result.banReason).toBe("Violated terms of service");
    });

    it("should create unban request without reason", () => {
      const result = toBEBanUserRequest(false);

      expect(result.isBanned).toBe(false);
      expect(result.banReason).toBeUndefined();
    });
  });

  describe("toBEChangeRoleRequest", () => {
    it("should create change role request with notes", () => {
      const result = toBEChangeRoleRequest(
        "seller",
        "Approved seller application"
      );

      expect(result.role).toBe("seller");
      expect(result.notes).toBe("Approved seller application");
    });

    it("should create change role request without notes", () => {
      const result = toBEChangeRoleRequest("admin");

      expect(result.role).toBe("admin");
      expect(result.notes).toBeUndefined();
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle user with minimal data", () => {
      const minimalUser: UserBE = {
        id: "user-min",
        uid: "uid-min",
        email: "minimal@example.com",
        displayName: null,
        photoURL: null,
        phoneNumber: null,
        role: "user",
        status: "active",
        firstName: null,
        lastName: null,
        bio: null,
        location: null,
        emailVerified: false,
        phoneVerified: false,
        shopId: null,
        shopName: null,
        shopSlug: null,
        totalOrders: 0,
        totalSpent: 0,
        totalSales: 0,
        totalProducts: 0,
        totalAuctions: 0,
        rating: 0,
        reviewCount: 0,
        notifications: {
          email: false,
          push: false,
          sms: false,
          orderUpdates: false,
          promotions: false,
          newsletter: false,
        },
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
        lastLoginAt: null,
        metadata: {},
      };

      const result = toFEUser(minimalUser);

      expect(result.id).toBe("user-min");
      expect(result.fullName).toBe("minimal");
      expect(result.isVerified).toBe(false);
      expect(result.hasShop).toBe(false);
    });

    it("should handle blocked user status", () => {
      const blockedUser: UserBE = {
        ...mockUserBE,
        status: "blocked",
      };

      const result = toFEUser(blockedUser);

      expect(result.isActive).toBe(false);
      expect(result.isBlocked).toBe(true);
      expect(result.isSuspended).toBe(false);
    });

    it("should handle suspended user status", () => {
      const suspendedUser: UserBE = {
        ...mockUserBE,
        status: "suspended",
      };

      const result = toFEUser(suspendedUser);

      expect(result.isActive).toBe(false);
      expect(result.isBlocked).toBe(false);
      expect(result.isSuspended).toBe(true);
    });

    it("should format large monetary values correctly", () => {
      const richUser: UserBE = {
        ...mockUserBE,
        totalSpent: 1250000,
        totalSales: 3456789,
      };

      const result = toFEUser(richUser);

      expect(result.formattedTotalSpent).toContain("12,50,000");
      expect(result.formattedTotalSales).toContain("34,56,789");
    });
  });
});
