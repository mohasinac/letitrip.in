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

  // Note: sendOTP and verifyOTP methods don't exist in users.service - using sendMobileVerification/verifyMobile instead

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
  });
});
