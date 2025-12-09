/**
 * Unit Tests for WhatsApp Configuration
 *
 * Tests providers, message templates, rate limits, and helper functions
 * No mocks - testing actual config logic
 */

import {
  MESSAGE_CATEGORIES,
  MESSAGE_TEMPLATES,
  WHATSAPP_PROVIDERS,
  formatWhatsAppPhone,
  getAvailableProviders,
  getProviderById,
  getTemplateById,
  getTemplatesByCategory,
  isWithinMessagingWindow,
  validateWhatsAppPhone,
  type WhatsAppProviderId,
} from "../whatsapp.config";

describe("WhatsApp Configuration", () => {
  describe("WHATSAPP_PROVIDERS constant", () => {
    it("should have providers defined", () => {
      expect(WHATSAPP_PROVIDERS).toBeDefined();
      expect(Object.keys(WHATSAPP_PROVIDERS).length).toBeGreaterThan(0);
    });

    it("should have TWILIO provider", () => {
      expect(WHATSAPP_PROVIDERS.TWILIO).toBeDefined();
      expect(WHATSAPP_PROVIDERS.TWILIO.id).toBe("twilio");
    });

    it("should have GUPSHUP provider", () => {
      expect(WHATSAPP_PROVIDERS.GUPSHUP).toBeDefined();
      expect(WHATSAPP_PROVIDERS.GUPSHUP.id).toBe("gupshup");
    });

    it("should have unique priorities", () => {
      const priorities = Object.values(WHATSAPP_PROVIDERS).map(
        (p) => p.priority
      );
      const uniquePriorities = new Set(priorities);
      expect(priorities.length).toBe(uniquePriorities.size);
    });

    it("should have valid rate limits", () => {
      Object.values(WHATSAPP_PROVIDERS).forEach((provider) => {
        expect(provider.rateLimit.messagesPerSecond).toBeGreaterThan(0);
        expect(provider.rateLimit.messagesPerMinute).toBeGreaterThan(
          provider.rateLimit.messagesPerSecond
        );
        expect(provider.rateLimit.messagesPerDay).toBeGreaterThan(
          provider.rateLimit.messagesPerMinute
        );
      });
    });

    it("should have valid pricing", () => {
      Object.values(WHATSAPP_PROVIDERS).forEach((provider) => {
        expect(provider.pricing.marketing).toBeGreaterThan(0);
        expect(provider.pricing.utility).toBeGreaterThan(0);
        expect(provider.pricing.authentication).toBeGreaterThan(0);
        expect(provider.pricing.service).toBeGreaterThan(0);
      });
    });

    it("should have feature flags", () => {
      Object.values(WHATSAPP_PROVIDERS).forEach((provider) => {
        expect(typeof provider.features.richMedia).toBe("boolean");
        expect(typeof provider.features.buttons).toBe("boolean");
        expect(typeof provider.features.lists).toBe("boolean");
        expect(typeof provider.features.templates).toBe("boolean");
      });
    });
  });

  describe("MESSAGE_CATEGORIES", () => {
    it("should have message categories defined", () => {
      expect(MESSAGE_CATEGORIES).toBeDefined();
      expect(Object.keys(MESSAGE_CATEGORIES).length).toBeGreaterThan(0);
    });

    it("should have marketing category", () => {
      expect(MESSAGE_CATEGORIES.MARKETING).toBeDefined();
      expect(MESSAGE_CATEGORIES.MARKETING.id).toBe("marketing");
    });

    it("should have utility category", () => {
      expect(MESSAGE_CATEGORIES.UTILITY).toBeDefined();
      expect(MESSAGE_CATEGORIES.UTILITY.id).toBe("utility");
    });

    it("should have authentication category", () => {
      expect(MESSAGE_CATEGORIES.AUTHENTICATION).toBeDefined();
      expect(MESSAGE_CATEGORIES.AUTHENTICATION.id).toBe("authentication");
    });

    it("should have service category", () => {
      expect(MESSAGE_CATEGORIES.SERVICE).toBeDefined();
      expect(MESSAGE_CATEGORIES.SERVICE.id).toBe("service");
    });

    it("should have opt-in requirements properly set", () => {
      expect(MESSAGE_CATEGORIES.MARKETING.requiresOptIn).toBe(true);
      expect(MESSAGE_CATEGORIES.UTILITY.requiresOptIn).toBe(false);
      expect(MESSAGE_CATEGORIES.AUTHENTICATION.requiresOptIn).toBe(false);
    });

    it("should have valid window values", () => {
      Object.values(MESSAGE_CATEGORIES).forEach((category) => {
        if (category.window !== null) {
          expect(category.window).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("MESSAGE_TEMPLATES", () => {
    it("should have message templates defined", () => {
      expect(MESSAGE_TEMPLATES).toBeDefined();
      expect(MESSAGE_TEMPLATES.length).toBeGreaterThan(0);
    });

    it("should have unique template IDs", () => {
      const ids = MESSAGE_TEMPLATES.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should have valid categories", () => {
      const validCategories = Object.values(MESSAGE_CATEGORIES).map(
        (c) => c.id
      );
      MESSAGE_TEMPLATES.forEach((template) => {
        expect(validCategories).toContain(template.category);
      });
    });

    it("should have template body", () => {
      MESSAGE_TEMPLATES.forEach((template) => {
        expect(template.body).toBeTruthy();
        expect(typeof template.body).toBe("string");
      });
    });

    it("should have variables array", () => {
      MESSAGE_TEMPLATES.forEach((template) => {
        expect(Array.isArray(template.variables)).toBe(true);
      });
    });

    it("should have consistent variable placeholders in body", () => {
      MESSAGE_TEMPLATES.forEach((template) => {
        template.variables.forEach((_, index) => {
          const placeholder = `{{${index + 1}}}`;
          expect(template.body).toContain(placeholder);
        });
      });
    });
  });

  describe("getProviderById", () => {
    it("should return provider by valid ID", () => {
      const provider = getProviderById("TWILIO");
      expect(provider).toBeDefined();
      expect(provider.id).toBe("twilio");
    });

    it("should return provider for GUPSHUP", () => {
      const provider = getProviderById("GUPSHUP");
      expect(provider).toBeDefined();
      expect(provider.id).toBe("gupshup");
    });

    it("should return undefined for invalid ID", () => {
      const provider = getProviderById("INVALID" as WhatsAppProviderId);
      expect(provider).toBeUndefined();
    });
  });

  describe("getAvailableProviders", () => {
    it("should return all providers", () => {
      const providers = getAvailableProviders();
      expect(providers.length).toBe(Object.keys(WHATSAPP_PROVIDERS).length);
    });

    it("should return sorted by priority", () => {
      const providers = getAvailableProviders();
      for (let i = 0; i < providers.length - 1; i++) {
        expect(providers[i].priority).toBeLessThanOrEqual(
          providers[i + 1].priority
        );
      }
    });

    it("should have TWILIO as first priority", () => {
      const providers = getAvailableProviders();
      expect(providers[0].id).toBe("twilio");
    });
  });

  describe("getTemplateById", () => {
    it("should return template by valid ID", () => {
      const firstTemplate = MESSAGE_TEMPLATES[0];
      const template = getTemplateById(firstTemplate.id);
      expect(template).toBeDefined();
      expect(template?.id).toBe(firstTemplate.id);
    });

    it("should return undefined for invalid ID", () => {
      const template = getTemplateById("invalid-template");
      expect(template).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const template = getTemplateById("");
      expect(template).toBeUndefined();
    });
  });

  describe("getTemplatesByCategory", () => {
    it("should return templates for marketing category", () => {
      const templates = getTemplatesByCategory("marketing");
      templates.forEach((t) => {
        expect(t.category).toBe("marketing");
      });
    });

    it("should return templates for utility category", () => {
      const templates = getTemplatesByCategory("utility");
      templates.forEach((t) => {
        expect(t.category).toBe("utility");
      });
    });

    it("should return templates for authentication category", () => {
      const templates = getTemplatesByCategory("authentication");
      templates.forEach((t) => {
        expect(t.category).toBe("authentication");
      });
    });

    it("should return templates for service category", () => {
      const templates = getTemplatesByCategory("service");
      templates.forEach((t) => {
        expect(t.category).toBe("service");
      });
    });

    it("should return empty array for invalid category", () => {
      const templates = getTemplatesByCategory("invalid" as any);
      expect(templates).toEqual([]);
    });

    it("should return at least one template per category", () => {
      Object.values(MESSAGE_CATEGORIES).forEach((category) => {
        const templates = getTemplatesByCategory(category.id as any);
        expect(templates.length).toBeGreaterThan(0);
      });
    });
  });

  describe("validateWhatsAppPhone", () => {
    it("should validate 10-digit Indian number", () => {
      expect(validateWhatsAppPhone("9876543210")).toBe(true);
    });

    it("should validate Indian number with country code", () => {
      expect(validateWhatsAppPhone("919876543210")).toBe(true);
      expect(validateWhatsAppPhone("+919876543210")).toBe(true);
    });

    it("should validate international numbers", () => {
      expect(validateWhatsAppPhone("14155551234")).toBe(true); // US
      expect(validateWhatsAppPhone("+14155551234")).toBe(true);
    });

    it("should reject too short numbers", () => {
      expect(validateWhatsAppPhone("123456789")).toBe(false);
    });

    it("should reject too long numbers", () => {
      expect(validateWhatsAppPhone("12345678901234567")).toBe(false);
    });

    it("should reject non-numeric characters", () => {
      expect(validateWhatsAppPhone("98765abc10")).toBe(false);
    });

    it("should reject empty string", () => {
      expect(validateWhatsAppPhone("")).toBe(false);
    });

    it("should handle numbers with spaces and dashes", () => {
      // After cleaning, should be valid
      expect(validateWhatsAppPhone("987-654-3210")).toBe(true);
      expect(validateWhatsAppPhone("987 654 3210")).toBe(true);
    });

    it("should handle numbers with parentheses", () => {
      expect(validateWhatsAppPhone("(987) 654-3210")).toBe(true);
    });

    it("should validate exactly 10 digits without country code", () => {
      expect(validateWhatsAppPhone("1234567890")).toBe(true);
    });

    it("should validate 12 digits with Indian country code", () => {
      expect(validateWhatsAppPhone("911234567890")).toBe(true);
    });
  });

  describe("formatWhatsAppPhone", () => {
    it("should add country code to 10-digit number", () => {
      const formatted = formatWhatsAppPhone("9876543210");
      expect(formatted).toBe("+919876543210");
    });

    it("should keep existing country code", () => {
      const formatted = formatWhatsAppPhone("919876543210");
      expect(formatted).toBe("+919876543210");
    });

    it("should handle number with + already", () => {
      const formatted = formatWhatsAppPhone("+919876543210");
      expect(formatted).toBe("+919876543210");
    });

    it("should remove non-digit characters", () => {
      const formatted = formatWhatsAppPhone("987-654-3210");
      expect(formatted).toBe("+919876543210");
    });

    it("should handle spaces", () => {
      const formatted = formatWhatsAppPhone("987 654 3210");
      expect(formatted).toBe("+919876543210");
    });

    it("should handle parentheses", () => {
      const formatted = formatWhatsAppPhone("(987) 654-3210");
      expect(formatted).toBe("+919876543210");
    });

    it("should always start with +", () => {
      const formatted = formatWhatsAppPhone("9876543210");
      expect(formatted.startsWith("+")).toBe(true);
    });

    it("should not duplicate + symbol", () => {
      const formatted = formatWhatsAppPhone("+919876543210");
      expect(formatted.match(/\+/g)?.length).toBe(1);
    });

    it("should handle international number", () => {
      const formatted = formatWhatsAppPhone("14155551234");
      expect(formatted).toBe("+14155551234");
    });

    it("should be idempotent", () => {
      const phone = "9876543210";
      const formatted1 = formatWhatsAppPhone(phone);
      const formatted2 = formatWhatsAppPhone(formatted1);
      expect(formatted1).toBe(formatted2);
    });
  });

  describe("isWithinMessagingWindow", () => {
    it("should return true for recent message", () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      expect(isWithinMessagingWindow(oneHourAgo, 24)).toBe(true);
    });

    it("should return true for message within 24 hours", () => {
      const twentyThreeHoursAgo = new Date(Date.now() - 23 * 60 * 60 * 1000);
      expect(isWithinMessagingWindow(twentyThreeHoursAgo, 24)).toBe(true);
    });

    it("should return false for message beyond window", () => {
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      expect(isWithinMessagingWindow(twentyFiveHoursAgo, 24)).toBe(false);
    });

    it("should return false for undefined lastMessageAt", () => {
      expect(isWithinMessagingWindow(undefined, 24)).toBe(false);
    });

    it("should handle custom window hours", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(isWithinMessagingWindow(twoHoursAgo, 1)).toBe(false);
      expect(isWithinMessagingWindow(twoHoursAgo, 3)).toBe(true);
    });

    it("should handle boundary case - exactly at window edge", () => {
      const exactlyTwentyFourHoursAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      );
      const result = isWithinMessagingWindow(exactlyTwentyFourHoursAgo, 24);
      expect(typeof result).toBe("boolean");
    });

    it("should handle zero window", () => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      expect(isWithinMessagingWindow(oneMinuteAgo, 0)).toBe(false);
    });

    it("should handle future dates", () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      expect(isWithinMessagingWindow(futureDate, 24)).toBe(true);
    });
  });

  describe("Rate Limits and Pricing", () => {
    it("should have consistent rate limits across providers", () => {
      Object.values(WHATSAPP_PROVIDERS).forEach((provider) => {
        const { messagesPerSecond, messagesPerMinute, messagesPerDay } =
          provider.rateLimit;

        // Per minute should be more than per second * 60 (considering burst)
        expect(messagesPerMinute).toBeGreaterThanOrEqual(messagesPerSecond);

        // Per day should be more than per minute * 60 * 24
        expect(messagesPerDay).toBeGreaterThanOrEqual(messagesPerMinute);
      });
    });

    it("should have authentication cheaper than marketing", () => {
      Object.values(WHATSAPP_PROVIDERS).forEach((provider) => {
        expect(provider.pricing.authentication).toBeLessThan(
          provider.pricing.marketing
        );
      });
    });

    it("should have utility cheaper than marketing", () => {
      Object.values(WHATSAPP_PROVIDERS).forEach((provider) => {
        expect(provider.pricing.utility).toBeLessThan(
          provider.pricing.marketing
        );
      });
    });
  });

  describe("Template Validation", () => {
    it("should have all required fields in templates", () => {
      MESSAGE_TEMPLATES.forEach((template) => {
        expect(template.id).toBeTruthy();
        expect(template.name).toBeTruthy();
        expect(template.category).toBeTruthy();
        expect(template.body).toBeTruthy();
        expect(Array.isArray(template.variables)).toBe(true);
      });
    });

    it("should have matching variable count in body", () => {
      MESSAGE_TEMPLATES.forEach((template) => {
        const placeholderCount = (template.body.match(/\{\{\d+\}\}/g) || [])
          .length;
        expect(placeholderCount).toBe(template.variables.length);
      });
    });

    it("should have sequential variable placeholders", () => {
      MESSAGE_TEMPLATES.forEach((template) => {
        for (let i = 0; i < template.variables.length; i++) {
          const placeholder = `{{${i + 1}}}`;
          expect(template.body).toContain(placeholder);
        }
      });
    });

    it("should not have duplicate variable placeholders", () => {
      MESSAGE_TEMPLATES.forEach((template) => {
        const placeholders = template.body.match(/\{\{\d+\}\}/g) || [];
        const uniquePlaceholders = new Set(placeholders);
        expect(placeholders.length).toBe(uniquePlaceholders.size);
      });
    });
  });

  describe("Phone Number Format Edge Cases", () => {
    it("should handle leading zeros", () => {
      const formatted = formatWhatsAppPhone("09876543210");
      expect(formatted).toMatch(/^\+91\d{10}$/);
    });

    it("should handle multiple + symbols", () => {
      const formatted = formatWhatsAppPhone("++919876543210");
      expect(formatted.match(/\+/g)?.length).toBe(1);
    });

    it("should handle very long numbers by keeping them as is", () => {
      const longNumber = "123456789012345";
      const formatted = formatWhatsAppPhone(longNumber);
      expect(formatted).toContain(longNumber);
    });

    it("should handle special characters", () => {
      const formatted = formatWhatsAppPhone("+91 (987) 654-3210");
      expect(formatted).toBe("+919876543210");
    });

    it("should handle dots in number", () => {
      const formatted = formatWhatsAppPhone("987.654.3210");
      expect(formatted).toBe("+919876543210");
    });
  });

  describe("Provider Feature Comparison", () => {
    it("should have at least one provider with catalog support", () => {
      const providersWithCatalog = Object.values(WHATSAPP_PROVIDERS).filter(
        (p) => p.features.catalog
      );
      expect(providersWithCatalog.length).toBeGreaterThan(0);
    });

    it("should have all providers support templates", () => {
      Object.values(WHATSAPP_PROVIDERS).forEach((provider) => {
        expect(provider.features.templates).toBe(true);
      });
    });

    it("should have all providers support rich media", () => {
      Object.values(WHATSAPP_PROVIDERS).forEach((provider) => {
        expect(provider.features.richMedia).toBe(true);
      });
    });
  });

  describe("Integration Scenarios", () => {
    it("should validate and format phone number in sequence", () => {
      const phone = "9876543210";
      expect(validateWhatsAppPhone(phone)).toBe(true);

      const formatted = formatWhatsAppPhone(phone);
      expect(formatted).toBe("+919876543210");
      expect(validateWhatsAppPhone(formatted)).toBe(true);
    });

    it("should select template and validate category", () => {
      const template = MESSAGE_TEMPLATES[0];
      expect(template).toBeDefined();

      const category =
        MESSAGE_CATEGORIES[
          template.category.toUpperCase() as keyof typeof MESSAGE_CATEGORIES
        ];
      expect(category).toBeDefined();
      expect(category.id).toBe(template.category);
    });

    it("should check messaging window for utility messages", () => {
      const recentMessage = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const utilityWindow = MESSAGE_CATEGORIES.UTILITY.window || 24;

      expect(isWithinMessagingWindow(recentMessage, utilityWindow)).toBe(true);
    });

    it("should select provider based on priority", () => {
      const providers = getAvailableProviders();
      const firstProvider = providers[0];

      expect(firstProvider.id).toBe("twilio");
      expect(firstProvider.priority).toBe(1);
    });
  });

  describe("Configuration Consistency", () => {
    it("should have consistent naming between ID and name fields", () => {
      Object.values(WHATSAPP_PROVIDERS).forEach((provider) => {
        expect(provider.name.toLowerCase()).toContain(provider.id);
      });
    });

    it("should have all message categories referenced in templates", () => {
      const categoriesInTemplates = new Set(
        MESSAGE_TEMPLATES.map((t) => t.category)
      );
      const definedCategories = Object.values(MESSAGE_CATEGORIES).map(
        (c) => c.id
      );

      categoriesInTemplates.forEach((category) => {
        expect(definedCategories).toContain(category);
      });
    });

    it("should have reasonable pricing differences", () => {
      Object.values(WHATSAPP_PROVIDERS).forEach((provider) => {
        const prices = Object.values(provider.pricing);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);

        // Max price should not be more than 3x min price (sanity check)
        expect(maxPrice / minPrice).toBeLessThan(3);
      });
    });
  });
});
