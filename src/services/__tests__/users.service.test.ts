import { apiService } from "../api.service";
import { usersService } from "../users.service";

jest.mock("../api.service");

describe("UsersService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("lists users with filters", async () => {
      const mockResponse = {
        data: [
          {
            id: "user1",
            email: "test@example.com",
            name: "Test User",
            role: "user",
          },
        ],
        count: 1,
        pagination: { page: 1, limit: 10 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.list({ role: "user" });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/users")
      );
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("handles empty user list", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: [],
        count: 0,
        pagination: { page: 1, limit: 10 },
      });

      const result = await usersService.list();

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("getById", () => {
    it("gets user by ID", async () => {
      const mockUser = {
        data: {
          id: "user1",
          email: "test@example.com",
          name: "Test User",
          role: "user",
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockUser);

      const result = await usersService.getById("user1");

      expect(apiService.get).toHaveBeenCalledWith("/users/user1");
      expect(result).toBeDefined();
    });
  });

  describe("update", () => {
    it("updates user profile", async () => {
      const mockFormData = {
        name: "Updated User",
        phone: "9876543210",
      };

      const mockUser = {
        data: {
          id: "user1",
          ...mockFormData,
          email: "test@example.com",
          displayName: "Updated User",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockUser);

      const result = await usersService.update("user1", mockFormData as any);

      expect(apiService.patch).toHaveBeenCalledWith(
        "/users/user1",
        expect.objectContaining({
          updates: expect.any(Object),
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe("ban", () => {
    it("bans a user", async () => {
      const mockUser = {
        data: {
          id: "user1",
          isBanned: true,
          banReason: "Spam",
          email: "test@example.com",
          displayName: "Test User",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockUser);

      const result = await usersService.ban("user1", true, "Spam");

      expect(apiService.patch).toHaveBeenCalledWith(
        "/users/user1/ban",
        expect.objectContaining({
          isBanned: true,
          banReason: "Spam",
        })
      );
      expect(result).toBeDefined();
    });

    it("unbans a user", async () => {
      const mockUser = {
        data: {
          id: "user1",
          isBanned: false,
          email: "test@example.com",
          displayName: "Test User",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockUser);

      const result = await usersService.ban("user1", false);

      expect(apiService.patch).toHaveBeenCalledWith(
        "/users/user1/ban",
        expect.objectContaining({
          isBanned: false,
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe("changeRole", () => {
    it("changes user role", async () => {
      const mockUser = {
        data: {
          id: "user1",
          role: "seller",
          email: "test@example.com",
          displayName: "Test User",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockUser);

      const result = await usersService.changeRole(
        "user1",
        "seller",
        "Promoted to seller"
      );

      expect(apiService.patch).toHaveBeenCalledWith(
        "/users/user1/role",
        expect.objectContaining({
          role: "seller",
          notes: "Promoted to seller",
        })
      );
      expect(result).toBeDefined();
    });

    it("changes role without notes", async () => {
      const mockUser = {
        data: {
          id: "user1",
          role: "admin",
          email: "test@example.com",
          displayName: "Test User",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockUser);

      await usersService.changeRole("user1", "admin");

      expect(apiService.patch).toHaveBeenCalledWith(
        "/users/user1/role",
        expect.any(Object)
      );
    });
  });

  describe("getMe", () => {
    it("gets current user profile", async () => {
      const mockResponse = {
        user: {
          id: "user1",
          email: "test@example.com",
          name: "Test User",
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.getMe();

      expect(apiService.get).toHaveBeenCalledWith("/user/profile");
      expect(result).toBeDefined();
    });
  });

  describe("updateMe", () => {
    it("updates current user profile", async () => {
      const mockFormData = {
        name: "Updated Name",
        phone: "9876543210",
      };

      const mockResponse = {
        user: {
          id: "user1",
          ...mockFormData,
          email: "test@example.com",
          displayName: "Updated Name",
        },
        message: "Profile updated successfully",
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.updateMe(mockFormData as any);

      expect(apiService.patch).toHaveBeenCalledWith(
        "/user/profile",
        expect.any(Object)
      );
      expect(result).toBeDefined();
    });
  });

  describe("changePassword", () => {
    it("changes user password", async () => {
      const mockFormData = {
        currentPassword: "oldpass123",
        newPassword: "newpass123",
      };

      const mockResponse = {
        message: "Password changed successfully",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.changePassword(mockFormData as any);

      expect(apiService.post).toHaveBeenCalledWith(
        "/user/change-password",
        expect.objectContaining({
          currentPassword: "oldpass123",
          newPassword: "newpass123",
        })
      );
      expect(result.message).toBe("Password changed successfully");
    });
  });

  describe("sendEmailVerification", () => {
    it("sends email verification OTP", async () => {
      const mockResponse = {
        message: "Verification email sent",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.sendEmailVerification();

      expect(apiService.post).toHaveBeenCalledWith("/user/verify-email", {});
      expect(result.message).toBe("Verification email sent");
    });
  });

  describe("verifyEmail", () => {
    it("verifies email with OTP", async () => {
      const mockFormData = {
        otp: "123456",
      };

      const mockResponse = {
        message: "Email verified successfully",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.verifyEmail(mockFormData as any);

      expect(apiService.post).toHaveBeenCalledWith(
        "/user/verify-email/confirm",
        expect.objectContaining({ otp: "123456" })
      );
      expect(result.message).toBe("Email verified successfully");
    });
  });

  describe("sendMobileVerification", () => {
    it("sends mobile verification OTP", async () => {
      const mockResponse = {
        message: "Verification SMS sent",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.sendMobileVerification();

      expect(apiService.post).toHaveBeenCalledWith("/user/verify-mobile", {});
      expect(result.message).toBe("Verification SMS sent");
    });
  });

  describe("verifyMobile", () => {
    it("verifies mobile with OTP", async () => {
      const mockFormData = {
        otp: "654321",
      };

      const mockResponse = {
        message: "Mobile verified successfully",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.verifyMobile(mockFormData as any);

      expect(apiService.post).toHaveBeenCalledWith(
        "/user/verify-mobile/confirm",
        expect.objectContaining({ otp: "654321" })
      );
      expect(result.message).toBe("Mobile verified successfully");
    });
  });

  describe("uploadAvatar", () => {
    it("uploads avatar using apiService.postFormData", async () => {
      const mockFile = new File(["avatar"], "avatar.jpg", {
        type: "image/jpeg",
      });
      const mockResponse = {
        url: "https://example.com/avatars/avatar.jpg",
      };

      (apiService.postFormData as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.uploadAvatar(mockFile);

      expect(apiService.postFormData).toHaveBeenCalledWith(
        "/users/me/avatar",
        expect.any(FormData)
      );
      expect(result.url).toBe("https://example.com/avatars/avatar.jpg");
    });

    it("handles upload errors", async () => {
      const mockFile = new File(["avatar"], "avatar.jpg", {
        type: "image/jpeg",
      });

      (apiService.postFormData as jest.Mock).mockRejectedValue(
        new Error("File too large")
      );

      await expect(usersService.uploadAvatar(mockFile)).rejects.toThrow(
        "File too large"
      );
    });
  });

  describe("deleteAvatar", () => {
    it("deletes user avatar", async () => {
      const mockResponse = {
        message: "Avatar deleted successfully",
      };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.deleteAvatar();

      expect(apiService.delete).toHaveBeenCalledWith("/users/me/avatar");
      expect(result.message).toBe("Avatar deleted successfully");
    });
  });

  describe("deleteAccount", () => {
    it("deletes user account with password confirmation", async () => {
      const mockResponse = {
        message: "Account deleted successfully",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.deleteAccount("password123");

      expect(apiService.post).toHaveBeenCalledWith("/users/me/delete", {
        password: "password123",
      });
      expect(result.message).toBe("Account deleted successfully");
    });
  });

  describe("getStats", () => {
    it("gets user statistics", async () => {
      const mockStats = {
        totalUsers: 1000,
        activeUsers: 750,
        newUsersThisMonth: 50,
        usersByRole: {
          user: 800,
          seller: 150,
          admin: 50,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await usersService.getStats();

      expect(apiService.get).toHaveBeenCalledWith("/users/stats");
      expect(result.totalUsers).toBe(1000);
      expect(result.usersByRole.user).toBe(800);
    });
  });

  describe("bulk operations", () => {
    describe("bulkMakeSeller", () => {
      it("promotes users to seller role in bulk", async () => {
        const mockResponse = {
          success: true,
          results: { success: ["user1", "user2"], failed: [] },
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await usersService.bulkMakeSeller(["user1", "user2"]);

        expect(apiService.post).toHaveBeenCalledWith("/users/bulk", {
          action: "make-seller",
          ids: ["user1", "user2"],
          data: undefined,
        });
        expect(result.success).toBe(true);
      });
    });

    describe("bulkMakeUser", () => {
      it("demotes sellers to user role in bulk", async () => {
        const mockResponse = {
          success: true,
          results: { success: ["user1", "user2"], failed: [] },
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        await usersService.bulkMakeUser(["user1", "user2"]);

        expect(apiService.post).toHaveBeenCalledWith("/users/bulk", {
          action: "make-user",
          ids: ["user1", "user2"],
          data: undefined,
        });
      });
    });

    describe("bulkBan", () => {
      it("bans multiple users with reason", async () => {
        const mockResponse = {
          success: true,
          results: { success: ["user1", "user2"], failed: [] },
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        await usersService.bulkBan(["user1", "user2"], "Spam accounts");

        expect(apiService.post).toHaveBeenCalledWith("/users/bulk", {
          action: "ban",
          ids: ["user1", "user2"],
          data: { banReason: "Spam accounts" },
        });
      });

      it("bans multiple users without reason", async () => {
        const mockResponse = {
          success: true,
          results: { success: ["user1"], failed: [] },
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        await usersService.bulkBan(["user1"]);

        expect(apiService.post).toHaveBeenCalledWith("/users/bulk", {
          action: "ban",
          ids: ["user1"],
          data: { banReason: undefined },
        });
      });
    });

    describe("bulkUnban", () => {
      it("unbans multiple users", async () => {
        const mockResponse = {
          success: true,
          results: { success: ["user1", "user2"], failed: [] },
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        await usersService.bulkUnban(["user1", "user2"]);

        expect(apiService.post).toHaveBeenCalledWith("/users/bulk", {
          action: "unban",
          ids: ["user1", "user2"],
          data: undefined,
        });
      });
    });

    describe("bulkVerifyEmail", () => {
      it("verifies emails in bulk", async () => {
        const mockResponse = {
          success: true,
          results: { success: ["user1", "user2"], failed: [] },
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        await usersService.bulkVerifyEmail(["user1", "user2"]);

        expect(apiService.post).toHaveBeenCalledWith("/users/bulk", {
          action: "verify-email",
          ids: ["user1", "user2"],
          data: undefined,
        });
      });
    });

    describe("bulkVerifyPhone", () => {
      it("verifies phones in bulk", async () => {
        const mockResponse = {
          success: true,
          results: { success: ["user1", "user2"], failed: [] },
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        await usersService.bulkVerifyPhone(["user1", "user2"]);

        expect(apiService.post).toHaveBeenCalledWith("/users/bulk", {
          action: "verify-phone",
          ids: ["user1", "user2"],
          data: undefined,
        });
      });
    });

    describe("bulkDelete", () => {
      it("deletes multiple users", async () => {
        const mockResponse = {
          success: true,
          results: { success: ["user1", "user2"], failed: [] },
        };

        (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

        await usersService.bulkDelete(["user1", "user2"]);

        expect(apiService.post).toHaveBeenCalledWith("/users/bulk", {
          action: "delete",
          ids: ["user1", "user2"],
          data: undefined,
        });
      });
    });

    it("handles partial failures in bulk operations", async () => {
      const mockResponse = {
        success: false,
        results: {
          success: ["user1"],
          failed: [{ id: "user2", error: "User not found" }],
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.bulkBan(["user1", "user2"]);

      expect(result.results.success).toHaveLength(1);
      expect(result.results.failed).toHaveLength(1);
    });
  });

  describe("error handling", () => {
    it("handles API errors in list", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(usersService.list()).rejects.toThrow("Network error");
    });

    it("handles API errors in update", async () => {
      (apiService.patch as jest.Mock).mockRejectedValue(
        new Error("Validation failed")
      );

      await expect(usersService.update("user1", {} as any)).rejects.toThrow(
        "Validation failed"
      );
    });

    it("handles API errors in changePassword", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Invalid password")
      );

      await expect(
        usersService.changePassword({
          currentPassword: "wrong",
          newPassword: "new",
        } as any)
      ).rejects.toThrow("Invalid password");
    });

    it("handles validation errors in uploadAvatar", async () => {
      const mockFile = new File([""], "empty.jpg", { type: "image/jpeg" });

      (apiService.postFormData as jest.Mock).mockRejectedValue(
        new Error("File cannot be empty")
      );

      await expect(usersService.uploadAvatar(mockFile)).rejects.toThrow(
        "File cannot be empty"
      );
    });
  });

  describe("edge cases", () => {
    it("handles empty filter object in list", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: { page: 1, limit: 10 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.list({});

      expect(apiService.get).toHaveBeenCalledWith("/users");
      expect(result.data).toEqual([]);
    });

    it("handles large file uploads", async () => {
      const largeFile = new File(
        [new ArrayBuffer(10 * 1024 * 1024)],
        "large.jpg",
        {
          type: "image/jpeg",
        }
      );
      const mockResponse = {
        url: "https://example.com/avatars/large.jpg",
      };

      (apiService.postFormData as jest.Mock).mockResolvedValue(mockResponse);

      const result = await usersService.uploadAvatar(largeFile);

      expect(result.url).toBeDefined();
    });

    it("handles concurrent bulk operations", async () => {
      const mockResponse = {
        success: true,
        results: { success: ["user1", "user2"], failed: [] },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const promises = [
        usersService.bulkMakeSeller(["user1"]),
        usersService.bulkVerifyEmail(["user2"]),
        usersService.bulkUnban(["user3"]),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(apiService.post).toHaveBeenCalledTimes(3);
    });

    it("handles special characters in user data", async () => {
      const mockFormData = {
        name: "Test O'Brien-Smith",
        phone: "+91-9876-543-210",
      };

      const mockUser = {
        data: {
          id: "user1",
          ...mockFormData,
          email: "test@example.com",
          displayName: "Test O'Brien-Smith",
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockUser);

      const result = await usersService.update("user1", mockFormData as any);

      expect(result).toBeDefined();
    });
  });
});
