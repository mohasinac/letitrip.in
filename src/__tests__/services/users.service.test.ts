/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from "@/services/api.service";
import { usersService } from "@/services/users.service";

// Mock dependencies
jest.mock("@/services/api.service");

describe("UsersService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;

  const mockUserBE = {
    id: "user123",
    uid: "firebase-uid-123",
    email: "test@example.com",
    displayName: "Test User",
    photoURL: null,
    phoneNumber: null,
    role: "customer",
    status: "active",
    firstName: null,
    lastName: null,
    bio: null,
    location: null,
    emailVerified: true,
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
      email: true,
      push: true,
      orderUpdates: true,
      auctionUpdates: true,
      promotions: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should list users with filters", async () => {
      const mockResponse = {
        data: [mockUserBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await usersService.list({
        role: "customer",
        page: 1,
        limit: 20,
      });

      expect(mockApiService.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("should list users without filters", async () => {
      const mockResponse = {
        data: [mockUserBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await usersService.list();

      expect(result.data).toHaveLength(1);
    });

    it("should handle empty user list", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await usersService.list();

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getById", () => {
    it("should get user by ID", async () => {
      mockApiService.get.mockResolvedValue({ data: mockUserBE });

      const result = await usersService.getById("user123");

      expect(mockApiService.get).toHaveBeenCalledWith("/users/user123");
      expect(result.id).toBe("user123");
    });

    it("should throw error if user not found", async () => {
      const error = new Error("User not found");
      mockApiService.get.mockRejectedValue(error);

      await expect(usersService.getById("invalid")).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("update", () => {
    it("should update user successfully", async () => {
      const updates = {
        name: "Updated Name",
        phoneNumber: "+911234567890",
      };

      mockApiService.patch.mockResolvedValue({
        data: { ...mockUserBE, displayName: "Updated Name" },
      });

      const result = await usersService.update("user123", updates);

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/users/user123",
        expect.objectContaining({
          updates: expect.any(Object),
        })
      );
      expect(result.displayName).toBe("Updated Name");
    });

    it("should throw error on update failure", async () => {
      const error = new Error("Validation error");
      mockApiService.patch.mockRejectedValue(error);

      await expect(
        usersService.update("user123", { name: "" })
      ).rejects.toThrow("Validation error");
    });
  });

  describe("ban", () => {
    it("should ban user", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockUserBE, status: "blocked" },
      });

      const result = await usersService.ban("user123", true, "Violated terms");

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/users/user123/ban",
        expect.any(Object)
      );
      expect(result.isBlocked).toBe(true);
    });

    it("should unban user", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockUserBE, status: "active" },
      });

      const result = await usersService.ban("user123", false);

      expect(result.isActive).toBe(true);
    });

    it("should ban user without reason", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockUserBE, status: "blocked" },
      });

      const result = await usersService.ban("user123", true);

      expect(result.isBlocked).toBe(true);
    });
  });

  describe("changeRole", () => {
    it("should change user role", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockUserBE, role: "seller" },
      });

      const result = await usersService.changeRole(
        "user123",
        "seller",
        "Approved seller application"
      );

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/users/user123/role",
        expect.any(Object)
      );
      expect(result.role).toBe("seller");
    });

    it("should change role without notes", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockUserBE, role: "admin" },
      });

      const result = await usersService.changeRole("user123", "admin");

      expect(result.role).toBe("admin");
    });
  });

  describe("getMe", () => {
    it("should get current user profile", async () => {
      mockApiService.get.mockResolvedValue({ user: mockUserBE });

      const result = await usersService.getMe();

      expect(mockApiService.get).toHaveBeenCalledWith("/user/profile");
      expect(result.id).toBe("user123");
    });

    it("should throw error if not authenticated", async () => {
      const error = new Error("Unauthorized");
      mockApiService.get.mockRejectedValue(error);

      await expect(usersService.getMe()).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateMe", () => {
    it("should update current user profile", async () => {
      const updates = {
        name: "Updated Name",
        phoneNumber: "+911234567890",
      };

      mockApiService.patch.mockResolvedValue({
        user: { ...mockUserBE, displayName: "Updated Name" },
        message: "Profile updated",
      });

      const result = await usersService.updateMe(updates);

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/user/profile",
        expect.any(Object)
      );
      expect(result.displayName).toBe("Updated Name");
    });

    it("should throw error on update failure", async () => {
      const error = new Error("Validation error");
      mockApiService.patch.mockRejectedValue(error);

      await expect(usersService.updateMe({ name: "" })).rejects.toThrow(
        "Validation error"
      );
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      mockApiService.post.mockResolvedValue({
        message: "Password changed successfully",
      });

      const result = await usersService.changePassword({
        currentPassword: "oldPassword123",
        newPassword: "newPassword456",
      });

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/user/change-password",
        {
          currentPassword: "oldPassword123",
          newPassword: "newPassword456",
        }
      );
      expect(result.message).toBe("Password changed successfully");
    });

    it("should throw error on incorrect current password", async () => {
      const error = new Error("Current password is incorrect");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        usersService.changePassword({
          currentPassword: "wrongPassword",
          newPassword: "newPassword456",
        })
      ).rejects.toThrow("Current password is incorrect");
    });
  });

  describe("sendEmailVerification", () => {
    it("should send email verification OTP", async () => {
      mockApiService.post.mockResolvedValue({
        message: "Verification OTP sent",
      });

      const result = await usersService.sendEmailVerification();

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/user/verify-email",
        {}
      );
      expect(result.message).toBe("Verification OTP sent");
    });

    it("should throw error if email already verified", async () => {
      const error = new Error("Email already verified");
      mockApiService.post.mockRejectedValue(error);

      await expect(usersService.sendEmailVerification()).rejects.toThrow(
        "Email already verified"
      );
    });
  });

  describe("verifyEmail", () => {
    it("should verify email with OTP", async () => {
      mockApiService.post.mockResolvedValue({
        message: "Email verified successfully",
      });

      const result = await usersService.verifyEmail({ otp: "123456" });

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/user/verify-email/confirm",
        { otp: "123456" }
      );
      expect(result.message).toBe("Email verified successfully");
    });

    it("should throw error on invalid OTP", async () => {
      const error = new Error("Invalid OTP");
      mockApiService.post.mockRejectedValue(error);

      await expect(usersService.verifyEmail({ otp: "000000" })).rejects.toThrow(
        "Invalid OTP"
      );
    });
  });

  describe("sendMobileVerification", () => {
    it("should send mobile verification OTP", async () => {
      mockApiService.post.mockResolvedValue({
        message: "Verification OTP sent",
      });

      const result = await usersService.sendMobileVerification();

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/user/verify-mobile",
        {}
      );
      expect(result.message).toBe("Verification OTP sent");
    });

    it("should throw error if mobile already verified", async () => {
      const error = new Error("Mobile already verified");
      mockApiService.post.mockRejectedValue(error);

      await expect(usersService.sendMobileVerification()).rejects.toThrow(
        "Mobile already verified"
      );
    });
  });

  describe("verifyMobile", () => {
    it("should verify mobile with OTP", async () => {
      mockApiService.post.mockResolvedValue({
        message: "Mobile verified successfully",
      });

      const result = await usersService.verifyMobile({ otp: "123456" });

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/user/verify-mobile/confirm",
        { otp: "123456" }
      );
      expect(result.message).toBe("Mobile verified successfully");
    });

    it("should throw error on invalid OTP", async () => {
      const error = new Error("Invalid OTP");
      mockApiService.post.mockRejectedValue(error);

      await expect(
        usersService.verifyMobile({ otp: "000000" })
      ).rejects.toThrow("Invalid OTP");
    });
  });

  describe("uploadAvatar", () => {
    it("should upload avatar successfully", async () => {
      const mockFile = new File(["content"], "avatar.jpg", {
        type: "image/jpeg",
      });

      mockApiService.postFormData.mockResolvedValue({
        url: "https://example.com/avatar.jpg",
      });

      const result = await usersService.uploadAvatar(mockFile);

      expect(mockApiService.postFormData).toHaveBeenCalledWith(
        "/users/me/avatar",
        expect.any(FormData)
      );
      expect(result.url).toBe("https://example.com/avatar.jpg");
    });

    it("should throw error on invalid file type", async () => {
      const mockFile = new File(["content"], "document.pdf", {
        type: "application/pdf",
      });

      const error = new Error("Invalid file type");
      mockApiService.postFormData.mockRejectedValue(error);

      await expect(usersService.uploadAvatar(mockFile)).rejects.toThrow(
        "Invalid file type"
      );
    });
  });

  describe("deleteAvatar", () => {
    it("should delete avatar successfully", async () => {
      mockApiService.delete.mockResolvedValue({
        message: "Avatar deleted successfully",
      });

      const result = await usersService.deleteAvatar();

      expect(mockApiService.delete).toHaveBeenCalledWith("/users/me/avatar");
      expect(result.message).toBe("Avatar deleted successfully");
    });

    it("should throw error if no avatar exists", async () => {
      const error = new Error("No avatar to delete");
      mockApiService.delete.mockRejectedValue(error);

      await expect(usersService.deleteAvatar()).rejects.toThrow(
        "No avatar to delete"
      );
    });
  });

  describe("deleteAccount", () => {
    it("should delete account successfully", async () => {
      mockApiService.post.mockResolvedValue({
        message: "Account deleted successfully",
      });

      const result = await usersService.deleteAccount("password123");

      expect(mockApiService.post).toHaveBeenCalledWith("/users/me/delete", {
        password: "password123",
      });
      expect(result.message).toBe("Account deleted successfully");
    });

    it("should throw error on incorrect password", async () => {
      const error = new Error("Incorrect password");
      mockApiService.post.mockRejectedValue(error);

      await expect(usersService.deleteAccount("wrongPassword")).rejects.toThrow(
        "Incorrect password"
      );
    });
  });

  describe("getStats", () => {
    it("should get user statistics", async () => {
      const mockStats = {
        totalUsers: 1000,
        activeUsers: 800,
        newUsersThisMonth: 50,
        usersByRole: {
          customer: 900,
          seller: 80,
          admin: 20,
        },
      };

      mockApiService.get.mockResolvedValue(mockStats);

      const result = await usersService.getStats();

      expect(mockApiService.get).toHaveBeenCalledWith("/users/stats");
      expect(result.totalUsers).toBe(1000);
      expect(result.usersByRole.customer).toBe(900);
    });

    it("should throw error if unauthorized", async () => {
      const error = new Error("Unauthorized - Admin only");
      mockApiService.get.mockRejectedValue(error);

      await expect(usersService.getStats()).rejects.toThrow(
        "Unauthorized - Admin only"
      );
    });
  });

  describe("bulkMakeSeller", () => {
    it("should bulk make users sellers", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await usersService.bulkMakeSeller(["user1", "user2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/users/bulk", {
        action: "make-seller",
        ids: ["user1", "user2"],
        data: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkMakeUser", () => {
    it("should bulk make sellers users", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await usersService.bulkMakeUser(["seller1", "seller2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/users/bulk", {
        action: "make-user",
        ids: ["seller1", "seller2"],
        data: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkBan", () => {
    it("should bulk ban users with reason", async () => {
      const mockResponse = {
        success: true,
        successCount: 3,
        failureCount: 0,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await usersService.bulkBan(
        ["user1", "user2", "user3"],
        "Spam accounts"
      );

      expect(mockApiService.post).toHaveBeenCalledWith("/users/bulk", {
        action: "ban",
        ids: ["user1", "user2", "user3"],
        data: { banReason: "Spam accounts" },
      });
      expect(result.success).toBe(true);
    });

    it("should bulk ban users without reason", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await usersService.bulkBan(["user1", "user2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/users/bulk", {
        action: "ban",
        ids: ["user1", "user2"],
        data: { banReason: undefined },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkUnban", () => {
    it("should bulk unban users", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await usersService.bulkUnban(["user1", "user2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/users/bulk", {
        action: "unban",
        ids: ["user1", "user2"],
        data: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkVerifyEmail", () => {
    it("should bulk verify user emails", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await usersService.bulkVerifyEmail(["user1", "user2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/users/bulk", {
        action: "verify-email",
        ids: ["user1", "user2"],
        data: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkVerifyPhone", () => {
    it("should bulk verify user phones", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await usersService.bulkVerifyPhone(["user1", "user2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/users/bulk", {
        action: "verify-phone",
        ids: ["user1", "user2"],
        data: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("bulkDelete", () => {
    it("should bulk delete users", async () => {
      const mockResponse = {
        success: true,
        successCount: 2,
        failureCount: 0,
      };

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await usersService.bulkDelete(["user1", "user2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/users/bulk", {
        action: "delete",
        ids: ["user1", "user2"],
        data: undefined,
      });
      expect(result.success).toBe(true);
    });
  });
});
