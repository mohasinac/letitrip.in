/**
 * Settings Service Tests
 *
 * Tests admin settings management service
 */

import { apiService } from "../api.service";
import { settingsService } from "../settings.service";

jest.mock("../api.service");

describe("SettingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should fetch all settings categories", async () => {
      const mockResponse = {
        success: true,
        settings: {
          general: {
            siteName: "Test Auction",
            siteTagline: "Your trusted marketplace",
            siteDescription: "Buy and sell with confidence",
            contactEmail: "contact@test.com",
            supportEmail: "support@test.com",
            contactPhone: "+919876543210",
            address: "123 Main St, Mumbai",
            logoUrl: "/logo.png",
            faviconUrl: "/favicon.ico",
            socialLinks: {
              facebook: "https://facebook.com/test",
              twitter: "https://twitter.com/test",
              instagram: "https://instagram.com/test",
              linkedin: "https://linkedin.com/test",
              youtube: "https://youtube.com/test",
            },
            maintenanceMode: false,
            maintenanceMessage: "",
          },
          payment: {
            razorpay: { enabled: true, keyId: "rzp_test_123", testMode: true },
            payu: { enabled: false, merchantKey: "", testMode: true },
            cod: { enabled: true, maxOrderValue: 50000, minOrderValue: 100 },
            currency: "INR",
            currencySymbol: "₹",
          },
          shipping: {
            freeShippingThreshold: 500,
            defaultShippingCharge: 50,
            expressShippingCharge: 100,
            expressShippingEnabled: true,
            estimatedDeliveryDays: {
              standard: { min: 5, max: 7 },
              express: { min: 2, max: 3 },
            },
            restrictedPincodes: ["110001", "400001"],
            shiprocket: {
              enabled: true,
              email: "test@shiprocket.com",
              password: "secret123",
            },
          },
          features: {
            auctionsEnabled: true,
            buyNowEnabled: true,
            reviewsEnabled: true,
            wishlistEnabled: true,
            comparisonsEnabled: true,
            chatEnabled: false,
            multiVendorEnabled: true,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await settingsService.getAll();

      expect(apiService.get).toHaveBeenCalledWith("/api/admin/settings");
      expect(result.general.siteName).toBe("Test Auction");
      expect(result.payment.razorpay.enabled).toBe(true);
      expect(result.shipping.freeShippingThreshold).toBe(500);
      expect(result.features.auctionsEnabled).toBe(true);
    });

    it("should throw error if fetch fails", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: false,
        error: "Unauthorized",
      });

      await expect(settingsService.getAll()).rejects.toThrow("Unauthorized");
    });

    it("should throw generic error if no error message", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ success: false });

      await expect(settingsService.getAll()).rejects.toThrow(
        "Failed to fetch settings"
      );
    });
  });

  describe("getCategory", () => {
    it("should fetch general settings", async () => {
      const mockResponse = {
        success: true,
        settings: {
          siteName: "Test Site",
          siteTagline: "Best marketplace",
          siteDescription: "Auction platform",
          contactEmail: "contact@test.com",
          supportEmail: "support@test.com",
          contactPhone: "+919876543210",
          address: "123 Main St",
          logoUrl: "/logo.png",
          faviconUrl: "/favicon.ico",
          socialLinks: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
            youtube: "",
          },
          maintenanceMode: false,
          maintenanceMessage: "",
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await settingsService.getGeneral();

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/admin/settings?category=general"
      );
      expect(result.siteName).toBe("Test Site");
    });

    it("should fetch payment settings", async () => {
      const mockResponse = {
        success: true,
        settings: {
          razorpay: { enabled: true, keyId: "rzp_test_123", testMode: true },
          payu: { enabled: false, merchantKey: "", testMode: true },
          cod: { enabled: true, maxOrderValue: 50000, minOrderValue: 100 },
          currency: "INR",
          currencySymbol: "₹",
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await settingsService.getPayment();

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/admin/settings?category=payment"
      );
      expect(result.razorpay.enabled).toBe(true);
      expect(result.currency).toBe("INR");
    });

    it("should fetch shipping settings", async () => {
      const mockResponse = {
        success: true,
        settings: {
          freeShippingThreshold: 500,
          defaultShippingCharge: 50,
          expressShippingCharge: 100,
          expressShippingEnabled: true,
          estimatedDeliveryDays: {
            standard: { min: 5, max: 7 },
            express: { min: 2, max: 3 },
          },
          restrictedPincodes: ["110001"],
          shiprocket: {
            enabled: true,
            email: "test@example.com",
            password: "secret",
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await settingsService.getShipping();

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/admin/settings?category=shipping"
      );
      expect(result.freeShippingThreshold).toBe(500);
      expect(result.shiprocket?.enabled).toBe(true);
    });

    it("should fetch feature settings", async () => {
      const mockResponse = {
        success: true,
        settings: {
          auctionsEnabled: true,
          buyNowEnabled: true,
          reviewsEnabled: false,
          wishlistEnabled: true,
          comparisonsEnabled: true,
          chatEnabled: false,
          multiVendorEnabled: true,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await settingsService.getFeatures();

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/admin/settings?category=features"
      );
      expect(result.auctionsEnabled).toBe(true);
      expect(result.reviewsEnabled).toBe(false);
    });

    it("should throw error if category fetch fails", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: false,
        error: "Invalid category",
      });

      await expect(settingsService.getGeneral()).rejects.toThrow(
        "Invalid category"
      );
    });
  });

  describe("updateCategory", () => {
    it("should update general settings", async () => {
      const updates = {
        siteName: "Updated Site",
        siteTagline: "New tagline",
      };

      const mockResponse = {
        success: true,
        settings: {
          siteName: "Updated Site",
          siteTagline: "New tagline",
          siteDescription: "Existing description",
          contactEmail: "contact@test.com",
          supportEmail: "support@test.com",
          contactPhone: "+919876543210",
          address: "123 Main St",
          logoUrl: "/logo.png",
          faviconUrl: "/favicon.ico",
          socialLinks: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
            youtube: "",
          },
          maintenanceMode: false,
          maintenanceMessage: "",
        },
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await settingsService.updateGeneral(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/admin/settings", {
        category: "general",
        settings: updates,
      });
      expect(result.siteName).toBe("Updated Site");
      expect(result.siteTagline).toBe("New tagline");
    });

    it("should update payment settings", async () => {
      const updates = {
        razorpay: { enabled: false, keyId: "rzp_live_456", testMode: false },
      };

      const mockResponse = {
        success: true,
        settings: {
          razorpay: { enabled: false, keyId: "rzp_live_456", testMode: false },
          payu: { enabled: false, merchantKey: "", testMode: true },
          cod: { enabled: true, maxOrderValue: 50000, minOrderValue: 100 },
          currency: "INR",
          currencySymbol: "₹",
        },
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await settingsService.updatePayment(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/admin/settings", {
        category: "payment",
        settings: updates,
      });
      expect(result.razorpay.enabled).toBe(false);
      expect(result.razorpay.testMode).toBe(false);
    });

    it("should update shipping settings", async () => {
      const updates = {
        freeShippingThreshold: 1000,
        expressShippingEnabled: false,
      };

      const mockResponse = {
        success: true,
        settings: {
          freeShippingThreshold: 1000,
          defaultShippingCharge: 50,
          expressShippingCharge: 100,
          expressShippingEnabled: false,
          estimatedDeliveryDays: {
            standard: { min: 5, max: 7 },
            express: { min: 2, max: 3 },
          },
          restrictedPincodes: [],
        },
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await settingsService.updateShipping(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/admin/settings", {
        category: "shipping",
        settings: updates,
      });
      expect(result.freeShippingThreshold).toBe(1000);
      expect(result.expressShippingEnabled).toBe(false);
    });

    it("should update feature settings", async () => {
      const updates = {
        chatEnabled: true,
        reviewsEnabled: false,
      };

      const mockResponse = {
        success: true,
        settings: {
          auctionsEnabled: true,
          buyNowEnabled: true,
          reviewsEnabled: false,
          wishlistEnabled: true,
          comparisonsEnabled: true,
          chatEnabled: true,
          multiVendorEnabled: true,
        },
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await settingsService.updateFeatures(updates);

      expect(apiService.put).toHaveBeenCalledWith("/api/admin/settings", {
        category: "features",
        settings: updates,
      });
      expect(result.chatEnabled).toBe(true);
      expect(result.reviewsEnabled).toBe(false);
    });

    it("should throw error if update fails", async () => {
      (apiService.put as jest.Mock).mockResolvedValue({
        success: false,
        error: "Validation error",
      });

      await expect(
        settingsService.updateGeneral({ siteName: "" })
      ).rejects.toThrow("Validation error");
    });

    it("should throw generic error if no error message", async () => {
      (apiService.put as jest.Mock).mockResolvedValue({ success: false });

      await expect(
        settingsService.updateGeneral({ siteName: "Test" })
      ).rejects.toThrow("Failed to update general settings");
    });
  });

  describe("updateSetting", () => {
    it("should update a single setting by path", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({ success: true });

      await settingsService.updateSetting("general.siteName", "New Name");

      expect(apiService.patch).toHaveBeenCalledWith("/api/admin/settings", {
        path: "general.siteName",
        value: "New Name",
      });
    });

    it("should throw error if update fails", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({
        success: false,
        error: "Invalid path",
      });

      await expect(
        settingsService.updateSetting("invalid.path", "value")
      ).rejects.toThrow("Invalid path");
    });

    it("should throw generic error if no error message", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({ success: false });

      await expect(
        settingsService.updateSetting("general.siteName", "Test")
      ).rejects.toThrow("Failed to update setting");
    });
  });

  describe("toggleMaintenanceMode", () => {
    it("should enable maintenance mode with message", async () => {
      const mockResponse = {
        success: true,
        settings: {
          siteName: "Test Site",
          siteTagline: "Best marketplace",
          siteDescription: "Auction platform",
          contactEmail: "contact@test.com",
          supportEmail: "support@test.com",
          contactPhone: "+919876543210",
          address: "123 Main St",
          logoUrl: "/logo.png",
          faviconUrl: "/favicon.ico",
          socialLinks: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
            youtube: "",
          },
          maintenanceMode: true,
          maintenanceMessage: "Under maintenance",
        },
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await settingsService.toggleMaintenanceMode(true, "Under maintenance");

      expect(apiService.put).toHaveBeenCalledWith("/api/admin/settings", {
        category: "general",
        settings: {
          maintenanceMode: true,
          maintenanceMessage: "Under maintenance",
        },
      });
    });

    it("should disable maintenance mode without message", async () => {
      const mockResponse = {
        success: true,
        settings: {
          siteName: "Test Site",
          siteTagline: "Best marketplace",
          siteDescription: "Auction platform",
          contactEmail: "contact@test.com",
          supportEmail: "support@test.com",
          contactPhone: "+919876543210",
          address: "123 Main St",
          logoUrl: "/logo.png",
          faviconUrl: "/favicon.ico",
          socialLinks: {
            facebook: "",
            twitter: "",
            instagram: "",
            linkedin: "",
            youtube: "",
          },
          maintenanceMode: false,
          maintenanceMessage: "",
        },
      };

      (apiService.put as jest.Mock).mockResolvedValue(mockResponse);

      await settingsService.toggleMaintenanceMode(false);

      expect(apiService.put).toHaveBeenCalledWith("/api/admin/settings", {
        category: "general",
        settings: { maintenanceMode: false },
      });
    });
  });

  describe("toggleFeature", () => {
    it("should enable a feature", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({ success: true });

      await settingsService.toggleFeature("chatEnabled", true);

      expect(apiService.patch).toHaveBeenCalledWith("/api/admin/settings", {
        path: "features.chatEnabled",
        value: true,
      });
    });

    it("should disable a feature", async () => {
      (apiService.patch as jest.Mock).mockResolvedValue({ success: true });

      await settingsService.toggleFeature("reviewsEnabled", false);

      expect(apiService.patch).toHaveBeenCalledWith("/api/admin/settings", {
        path: "features.reviewsEnabled",
        value: false,
      });
    });
  });

  describe("updateSocialLinks", () => {
    it("should update social links while preserving others", async () => {
      const currentSettings = {
        siteName: "Test Site",
        siteTagline: "Best marketplace",
        siteDescription: "Auction platform",
        contactEmail: "contact@test.com",
        supportEmail: "support@test.com",
        contactPhone: "+919876543210",
        address: "123 Main St",
        logoUrl: "/logo.png",
        faviconUrl: "/favicon.ico",
        socialLinks: {
          facebook: "https://facebook.com/old",
          twitter: "https://twitter.com/old",
          instagram: "",
          linkedin: "",
          youtube: "",
        },
        maintenanceMode: false,
        maintenanceMessage: "",
      };

      const updatedSettings = {
        ...currentSettings,
        socialLinks: {
          facebook: "https://facebook.com/old",
          twitter: "https://twitter.com/new",
          instagram: "https://instagram.com/new",
          linkedin: "",
          youtube: "",
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        settings: currentSettings,
      });

      (apiService.put as jest.Mock).mockResolvedValue({
        success: true,
        settings: updatedSettings,
      });

      await settingsService.updateSocialLinks({
        twitter: "https://twitter.com/new",
        instagram: "https://instagram.com/new",
      });

      expect(apiService.put).toHaveBeenCalledWith("/api/admin/settings", {
        category: "general",
        settings: {
          socialLinks: {
            facebook: "https://facebook.com/old",
            twitter: "https://twitter.com/new",
            instagram: "https://instagram.com/new",
            linkedin: "",
            youtube: "",
          },
        },
      });
    });
  });

  describe("testShiprocketConnection", () => {
    it("should test Shiprocket connection successfully", async () => {
      const mockResponse = {
        success: true,
        message: "Connection successful",
        data: {
          name: "Test Company",
          email: "test@example.com",
          companyId: 12345,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await settingsService.testShiprocketConnection(
        "test@example.com",
        "password123"
      );

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/admin/settings/shipping/test-shiprocket",
        { email: "test@example.com", password: "password123" }
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe("Connection successful");
      expect(result.data?.companyId).toBe(12345);
    });

    it("should handle connection failure", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: false,
        error: "Invalid credentials",
      });

      const result = await settingsService.testShiprocketConnection(
        "wrong@example.com",
        "wrongpass"
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid credentials");
      expect(result.data).toBeUndefined();
    });

    it("should handle connection failure with no error message", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({ success: false });

      const result = await settingsService.testShiprocketConnection(
        "test@example.com",
        "password"
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe("Failed to test connection");
    });
  });
});
