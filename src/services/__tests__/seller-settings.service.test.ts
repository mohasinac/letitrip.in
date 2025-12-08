import { apiService } from "../api.service";
import type {
  SellerNotificationSettings,
  SellerPayoutSettings,
  SellerProfileSettings,
  SellerSettings,
} from "../seller-settings.service";
import { sellerSettingsService } from "../seller-settings.service";

jest.mock("../api.service");

describe("SellerSettingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProfile: SellerProfileSettings = {
    displayName: "John's Electronics",
    email: "john@example.com",
    phone: "+919876543210",
    businessName: "John Electronics Pvt Ltd",
    businessType: "company",
    gstNumber: "27AAPFU0939F1ZV",
    panNumber: "AAPFU0939F",
    address: {
      street: "123 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
  };

  const mockNotifications: SellerNotificationSettings = {
    emailNotifications: true,
    orderAlerts: true,
    reviewAlerts: true,
    payoutAlerts: true,
    promotionalEmails: false,
    lowStockAlerts: true,
    dailyDigest: false,
  };

  const mockPayout: SellerPayoutSettings = {
    accountHolderName: "John Doe",
    bankName: "HDFC Bank",
    accountNumber: "50100123456789",
    ifscCode: "HDFC0001234",
    upiId: "john@paytm",
    preferredMethod: "bank",
    minPayoutAmount: 500,
  };

  const mockSettings: SellerSettings = {
    profile: mockProfile,
    notifications: mockNotifications,
    payout: mockPayout,
  };

  describe("getAll", () => {
    it("should fetch all seller settings", async () => {
      const mockResponse = {
        profile: mockProfile,
        notifications: mockNotifications,
        payout: mockPayout,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sellerSettingsService.getAll();

      expect(apiService.get).toHaveBeenCalledWith("/api/seller/settings");
      expect(result).toEqual(mockSettings);
    });

    it("should throw error if response contains error", async () => {
      const mockResponse = {
        profile: mockProfile,
        notifications: mockNotifications,
        payout: mockPayout,
        error: "Failed to fetch settings",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await expect(sellerSettingsService.getAll()).rejects.toThrow(
        "Failed to fetch settings"
      );
    });

    it("should handle network errors", async () => {
      const error = new Error("Network error");
      (apiService.get as jest.Mock).mockRejectedValue(error);

      await expect(sellerSettingsService.getAll()).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("updateProfile", () => {
    it("should update profile settings successfully", async () => {
      const updates = {
        displayName: "Jane's Electronics",
        email: "jane@example.com",
      };

      const mockResponse = {
        success: true,
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updateProfile(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        profile: updates,
      });
    });

    it("should throw error on failed update", async () => {
      const updates = { displayName: "New Name" };
      const mockResponse = {
        success: false,
        error: "Validation failed",
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        sellerSettingsService.updateProfile(updates)
      ).rejects.toThrow("Validation failed");
    });

    it("should throw default error message when no error provided", async () => {
      const updates = { displayName: "New Name" };
      const mockResponse = {
        success: false,
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        sellerSettingsService.updateProfile(updates)
      ).rejects.toThrow("Failed to update profile settings");
    });

    it("should update business type", async () => {
      const updates = { businessType: "individual" as const };

      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updateProfile(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        profile: updates,
      });
    });

    it("should update address fields", async () => {
      const updates = {
        address: {
          street: "456 Park Street",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "700016",
        },
      };

      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updateProfile(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        profile: updates,
      });
    });

    it("should update GST and PAN numbers", async () => {
      const updates = {
        gstNumber: "29ABCDE1234F1Z5",
        panNumber: "ABCDE1234F",
      };

      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updateProfile(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        profile: updates,
      });
    });
  });

  describe("updateNotifications", () => {
    it("should update notification settings successfully", async () => {
      const updates = {
        emailNotifications: false,
        orderAlerts: true,
      };

      const mockResponse = {
        success: true,
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updateNotifications(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        notifications: updates,
      });
    });

    it("should throw error on failed update", async () => {
      const updates = { emailNotifications: false };
      const mockResponse = {
        success: false,
        error: "Update failed",
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        sellerSettingsService.updateNotifications(updates)
      ).rejects.toThrow("Update failed");
    });

    it("should throw default error message when no error provided", async () => {
      const updates = { emailNotifications: false };
      const mockResponse = {
        success: false,
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        sellerSettingsService.updateNotifications(updates)
      ).rejects.toThrow("Failed to update notification settings");
    });

    it("should update multiple notification preferences", async () => {
      const updates = {
        orderAlerts: true,
        reviewAlerts: false,
        payoutAlerts: true,
        lowStockAlerts: false,
        dailyDigest: true,
      };

      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updateNotifications(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        notifications: updates,
      });
    });

    it("should disable promotional emails", async () => {
      const updates = {
        promotionalEmails: false,
      };

      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updateNotifications(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        notifications: updates,
      });
    });
  });

  describe("updatePayout", () => {
    it("should update payout settings successfully", async () => {
      const updates = {
        accountHolderName: "Jane Doe",
        bankName: "ICICI Bank",
      };

      const mockResponse = {
        success: true,
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updatePayout(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        payout: updates,
      });
    });

    it("should throw error on failed update", async () => {
      const updates = { minPayoutAmount: 1000 };
      const mockResponse = {
        success: false,
        error: "Invalid amount",
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await expect(sellerSettingsService.updatePayout(updates)).rejects.toThrow(
        "Invalid amount"
      );
    });

    it("should throw default error message when no error provided", async () => {
      const updates = { minPayoutAmount: 1000 };
      const mockResponse = {
        success: false,
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await expect(sellerSettingsService.updatePayout(updates)).rejects.toThrow(
        "Failed to update payout settings"
      );
    });

    it("should update bank account details", async () => {
      const updates = {
        accountNumber: "60200987654321",
        ifscCode: "ICIC0001234",
        bankName: "ICICI Bank",
      };

      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updatePayout(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        payout: updates,
      });
    });

    it("should update UPI ID", async () => {
      const updates = {
        upiId: "seller@paytm",
      };

      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updatePayout(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        payout: updates,
      });
    });

    it("should change preferred payment method", async () => {
      const updates = {
        preferredMethod: "upi" as const,
      };

      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updatePayout(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        payout: updates,
      });
    });

    it("should update minimum payout amount", async () => {
      const updates = {
        minPayoutAmount: 1500,
      };

      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updatePayout(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        payout: updates,
      });
    });
  });

  describe("updateAll", () => {
    it("should update all settings at once", async () => {
      const updates = {
        profile: { displayName: "New Name" },
        notifications: { emailNotifications: false },
        payout: { minPayoutAmount: 1000 },
      };

      const mockResponse = {
        success: true,
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updateAll(updates);

      expect(apiService.put).toHaveBeenCalledWith(
        "/api/seller/settings",
        updates
      );
    });

    it("should throw error on failed update", async () => {
      const updates = {
        profile: { displayName: "New Name" },
      };
      const mockResponse = {
        success: false,
        error: "Validation failed",
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await expect(sellerSettingsService.updateAll(updates)).rejects.toThrow(
        "Validation failed"
      );
    });

    it("should throw default error message when no error provided", async () => {
      const updates = {
        profile: { displayName: "New Name" },
      };
      const mockResponse = {
        success: false,
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await expect(sellerSettingsService.updateAll(updates)).rejects.toThrow(
        "Failed to update settings"
      );
    });

    it("should update only profile in bulk update", async () => {
      const updates = {
        profile: {
          displayName: "Complete Store",
          businessType: "company" as const,
        },
      };

      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updateAll(updates);

      expect(apiService.put).toHaveBeenCalledWith(
        "/api/seller/settings",
        updates
      );
    });

    it("should update only notifications in bulk update", async () => {
      const updates = {
        notifications: {
          orderAlerts: true,
          lowStockAlerts: true,
        },
      };

      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updateAll(updates);

      expect(apiService.put).toHaveBeenCalledWith(
        "/api/seller/settings",
        updates
      );
    });

    it("should update only payout in bulk update", async () => {
      const updates = {
        payout: {
          preferredMethod: "upi" as const,
          minPayoutAmount: 2000,
        },
      };

      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.updateAll(updates);

      expect(apiService.put).toHaveBeenCalledWith(
        "/api/seller/settings",
        updates
      );
    });
  });

  describe("toggleNotification", () => {
    it("should enable email notifications", async () => {
      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.toggleNotification(
        "emailNotifications",
        true
      );

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        notifications: { emailNotifications: true },
      });
    });

    it("should disable order alerts", async () => {
      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.toggleNotification("orderAlerts", false);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        notifications: { orderAlerts: false },
      });
    });

    it("should enable review alerts", async () => {
      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.toggleNotification("reviewAlerts", true);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        notifications: { reviewAlerts: true },
      });
    });

    it("should toggle payout alerts", async () => {
      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.toggleNotification("payoutAlerts", true);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        notifications: { payoutAlerts: true },
      });
    });

    it("should disable promotional emails", async () => {
      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.toggleNotification(
        "promotionalEmails",
        false
      );

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        notifications: { promotionalEmails: false },
      });
    });

    it("should enable low stock alerts", async () => {
      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.toggleNotification("lowStockAlerts", true);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        notifications: { lowStockAlerts: true },
      });
    });

    it("should enable daily digest", async () => {
      const mockResponse = { success: true };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await sellerSettingsService.toggleNotification("dailyDigest", true);

      expect(apiService.put).toHaveBeenCalledWith("/api/seller/settings", {
        notifications: { dailyDigest: true },
      });
    });

    it("should handle toggle error", async () => {
      const mockResponse = {
        success: false,
        error: "Toggle failed",
      };
      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        sellerSettingsService.toggleNotification("emailNotifications", true)
      ).rejects.toThrow("Toggle failed");
    });
  });
});
