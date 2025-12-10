import {
  ABANDONED_CART_TEMPLATE,
  AUCTION_BID_PLACED_TEMPLATE,
  AUCTION_ENDING_SOON_TEMPLATE,
  AUCTION_LOST_TEMPLATE,
  AUCTION_OUTBID_TEMPLATE,
  AUCTION_WINNING_TEMPLATE,
  AUCTION_WON_TEMPLATE,
  FLASH_SALE_TEMPLATE,
  NEW_ARRIVAL_TEMPLATE,
  ORDER_CANCELLED_TEMPLATE,
  ORDER_CONFIRMED_TEMPLATE,
  ORDER_DELIVERED_TEMPLATE,
  ORDER_PLACED_TEMPLATE,
  ORDER_SHIPPED_TEMPLATE,
  OTP_VERIFICATION_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
  WELCOME_TEMPLATE,
  WHATSAPP_TEMPLATES,
  WhatsAppTemplate,
  formatTemplate,
  getTemplatesByCategory,
  getWhatsAppTemplate,
} from "../whatsapp-templates";

describe("WhatsApp Templates Constants", () => {
  // Helper function to validate template structure
  const validateTemplateStructure = (template: WhatsAppTemplate) => {
    expect(template).toHaveProperty("id");
    expect(template).toHaveProperty("name");
    expect(template).toHaveProperty("category");
    expect(template).toHaveProperty("language");
    expect(template).toHaveProperty("body");
    expect(template).toHaveProperty("variables");
    expect(typeof template.id).toBe("string");
    expect(typeof template.name).toBe("string");
    expect(typeof template.category).toBe("string");
    expect(typeof template.language).toBe("string");
    expect(typeof template.body).toBe("string");
    expect(Array.isArray(template.variables)).toBe(true);
    expect(template.id.length).toBeGreaterThan(0);
    expect(template.name.length).toBeGreaterThan(0);
    expect(template.body.length).toBeGreaterThan(0);
  };

  // ============================================================================
  // Order Templates Tests
  // ============================================================================
  describe("Order Templates", () => {
    describe("ORDER_PLACED_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(ORDER_PLACED_TEMPLATE);
      });

      it("should have ORDER category", () => {
        expect(ORDER_PLACED_TEMPLATE.category).toBe("ORDER");
      });

      it("should have required variables", () => {
        expect(ORDER_PLACED_TEMPLATE.variables).toContain("name");
        expect(ORDER_PLACED_TEMPLATE.variables).toContain("orderId");
        expect(ORDER_PLACED_TEMPLATE.variables).toContain("amount");
      });

      it("should have placeholders in body", () => {
        expect(ORDER_PLACED_TEMPLATE.body).toContain("{{1}}");
        expect(ORDER_PLACED_TEMPLATE.body).toContain("{{2}}");
      });

      it("should have buttons", () => {
        expect(ORDER_PLACED_TEMPLATE.buttons).toBeDefined();
        expect(Array.isArray(ORDER_PLACED_TEMPLATE.buttons)).toBe(true);
      });
    });

    describe("ORDER_CONFIRMED_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(ORDER_CONFIRMED_TEMPLATE);
      });

      it("should have ORDER category", () => {
        expect(ORDER_CONFIRMED_TEMPLATE.category).toBe("ORDER");
      });

      it("should have required variables", () => {
        expect(ORDER_CONFIRMED_TEMPLATE.variables).toContain("name");
        expect(ORDER_CONFIRMED_TEMPLATE.variables).toContain("orderId");
      });
    });

    describe("ORDER_SHIPPED_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(ORDER_SHIPPED_TEMPLATE);
      });

      it("should have ORDER category", () => {
        expect(ORDER_SHIPPED_TEMPLATE.category).toBe("ORDER");
      });

      it("should have tracking variables", () => {
        expect(ORDER_SHIPPED_TEMPLATE.variables).toContain("courier");
        expect(ORDER_SHIPPED_TEMPLATE.variables).toContain("awb");
        expect(ORDER_SHIPPED_TEMPLATE.variables).toContain("trackingUrl");
      });
    });

    describe("ORDER_DELIVERED_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(ORDER_DELIVERED_TEMPLATE);
      });

      it("should have ORDER category", () => {
        expect(ORDER_DELIVERED_TEMPLATE.category).toBe("ORDER");
      });

      it("should encourage review", () => {
        expect(ORDER_DELIVERED_TEMPLATE.body.toLowerCase()).toContain("review");
      });
    });

    describe("ORDER_CANCELLED_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(ORDER_CANCELLED_TEMPLATE);
      });

      it("should have ORDER category", () => {
        expect(ORDER_CANCELLED_TEMPLATE.category).toBe("ORDER");
      });

      it("should have refund variables", () => {
        expect(ORDER_CANCELLED_TEMPLATE.variables).toContain("reason");
        expect(ORDER_CANCELLED_TEMPLATE.variables).toContain("refundAmount");
        expect(ORDER_CANCELLED_TEMPLATE.variables).toContain("refundStatus");
      });
    });
  });

  // ============================================================================
  // Auction Templates Tests
  // ============================================================================
  describe("Auction Templates", () => {
    describe("AUCTION_BID_PLACED_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(AUCTION_BID_PLACED_TEMPLATE);
      });

      it("should have AUCTION category", () => {
        expect(AUCTION_BID_PLACED_TEMPLATE.category).toBe("AUCTION");
      });

      it("should have bid variables", () => {
        expect(AUCTION_BID_PLACED_TEMPLATE.variables).toContain("bidAmount");
        expect(AUCTION_BID_PLACED_TEMPLATE.variables).toContain("productName");
        expect(AUCTION_BID_PLACED_TEMPLATE.variables).toContain("status");
      });
    });

    describe("AUCTION_OUTBID_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(AUCTION_OUTBID_TEMPLATE);
      });

      it("should have AUCTION category", () => {
        expect(AUCTION_OUTBID_TEMPLATE.category).toBe("AUCTION");
      });

      it("should have bid comparison variables", () => {
        expect(AUCTION_OUTBID_TEMPLATE.variables).toContain("yourBid");
        expect(AUCTION_OUTBID_TEMPLATE.variables).toContain("currentBid");
      });
    });

    describe("AUCTION_WINNING_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(AUCTION_WINNING_TEMPLATE);
      });

      it("should have AUCTION category", () => {
        expect(AUCTION_WINNING_TEMPLATE.category).toBe("AUCTION");
      });

      it("should be encouraging", () => {
        expect(AUCTION_WINNING_TEMPLATE.body.toLowerCase()).toContain(
          "winning"
        );
      });
    });

    describe("AUCTION_WON_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(AUCTION_WON_TEMPLATE);
      });

      it("should have AUCTION category", () => {
        expect(AUCTION_WON_TEMPLATE.category).toBe("AUCTION");
      });

      it("should be congratulatory", () => {
        expect(AUCTION_WON_TEMPLATE.body.toLowerCase()).toContain(
          "congratulations"
        );
      });

      it("should have payment prompt", () => {
        expect(AUCTION_WON_TEMPLATE.body.toLowerCase()).toContain("payment");
      });
    });

    describe("AUCTION_LOST_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(AUCTION_LOST_TEMPLATE);
      });

      it("should have AUCTION category", () => {
        expect(AUCTION_LOST_TEMPLATE.category).toBe("AUCTION");
      });

      it("should have winning bid variable", () => {
        expect(AUCTION_LOST_TEMPLATE.variables).toContain("winningBid");
      });
    });

    describe("AUCTION_ENDING_SOON_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(AUCTION_ENDING_SOON_TEMPLATE);
      });

      it("should have AUCTION category", () => {
        expect(AUCTION_ENDING_SOON_TEMPLATE.category).toBe("AUCTION");
      });

      it("should create urgency", () => {
        expect(AUCTION_ENDING_SOON_TEMPLATE.body.toLowerCase()).toContain(
          "ending"
        );
      });
    });
  });

  // ============================================================================
  // Account Templates Tests
  // ============================================================================
  describe("Account Templates", () => {
    describe("WELCOME_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(WELCOME_TEMPLATE);
      });

      it("should have ACCOUNT category", () => {
        expect(WELCOME_TEMPLATE.category).toBe("ACCOUNT");
      });

      it("should be welcoming", () => {
        expect(WELCOME_TEMPLATE.body.toLowerCase()).toContain("welcome");
      });

      it("should have call to action buttons", () => {
        expect(WELCOME_TEMPLATE.buttons).toBeDefined();
        expect(WELCOME_TEMPLATE.buttons!.length).toBeGreaterThan(0);
      });
    });

    describe("OTP_VERIFICATION_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(OTP_VERIFICATION_TEMPLATE);
      });

      it("should have ACCOUNT category", () => {
        expect(OTP_VERIFICATION_TEMPLATE.category).toBe("ACCOUNT");
      });

      it("should have otp variable", () => {
        expect(OTP_VERIFICATION_TEMPLATE.variables).toContain("otp");
      });

      it("should have security warning", () => {
        expect(OTP_VERIFICATION_TEMPLATE.body.toLowerCase()).toContain(
          "not share"
        );
      });

      it("should have footer", () => {
        expect(OTP_VERIFICATION_TEMPLATE.footer).toBeDefined();
      });
    });

    describe("PASSWORD_RESET_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(PASSWORD_RESET_TEMPLATE);
      });

      it("should have ACCOUNT category", () => {
        expect(PASSWORD_RESET_TEMPLATE.category).toBe("ACCOUNT");
      });

      it("should have resetUrl variable", () => {
        expect(PASSWORD_RESET_TEMPLATE.variables).toContain("resetUrl");
      });

      it("should have expiry information", () => {
        expect(PASSWORD_RESET_TEMPLATE.body.toLowerCase()).toContain("expire");
      });
    });
  });

  // ============================================================================
  // Marketing Templates Tests
  // ============================================================================
  describe("Marketing Templates", () => {
    describe("NEW_ARRIVAL_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(NEW_ARRIVAL_TEMPLATE);
      });

      it("should have MARKETING category", () => {
        expect(NEW_ARRIVAL_TEMPLATE.category).toBe("MARKETING");
      });

      it("should have product information", () => {
        expect(NEW_ARRIVAL_TEMPLATE.variables).toContain("category");
        expect(NEW_ARRIVAL_TEMPLATE.variables).toContain("products");
      });
    });

    describe("FLASH_SALE_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(FLASH_SALE_TEMPLATE);
      });

      it("should have MARKETING category", () => {
        expect(FLASH_SALE_TEMPLATE.category).toBe("MARKETING");
      });

      it("should have discount variable", () => {
        expect(FLASH_SALE_TEMPLATE.variables).toContain("discount");
      });

      it("should create urgency", () => {
        expect(FLASH_SALE_TEMPLATE.body.toLowerCase()).toContain("hurry");
      });
    });

    describe("ABANDONED_CART_TEMPLATE", () => {
      it("should have valid template structure", () => {
        validateTemplateStructure(ABANDONED_CART_TEMPLATE);
      });

      it("should have MARKETING category", () => {
        expect(ABANDONED_CART_TEMPLATE.category).toBe("MARKETING");
      });

      it("should have cart variables", () => {
        expect(ABANDONED_CART_TEMPLATE.variables).toContain("itemCount");
        expect(ABANDONED_CART_TEMPLATE.variables).toContain("amount");
      });

      it("should mention cart", () => {
        expect(ABANDONED_CART_TEMPLATE.body.toLowerCase()).toContain("cart");
      });
    });
  });

  // ============================================================================
  // WHATSAPP_TEMPLATES Registry Tests
  // ============================================================================
  describe("WHATSAPP_TEMPLATES Registry", () => {
    it("should export WHATSAPP_TEMPLATES object", () => {
      expect(WHATSAPP_TEMPLATES).toBeDefined();
      expect(typeof WHATSAPP_TEMPLATES).toBe("object");
    });

    it("should contain ORDER_PLACED", () => {
      expect(WHATSAPP_TEMPLATES.ORDER_PLACED).toBe(ORDER_PLACED_TEMPLATE);
    });

    it("should contain ORDER_CONFIRMED", () => {
      expect(WHATSAPP_TEMPLATES.ORDER_CONFIRMED).toBe(ORDER_CONFIRMED_TEMPLATE);
    });

    it("should contain ORDER_SHIPPED", () => {
      expect(WHATSAPP_TEMPLATES.ORDER_SHIPPED).toBe(ORDER_SHIPPED_TEMPLATE);
    });

    it("should contain ORDER_DELIVERED", () => {
      expect(WHATSAPP_TEMPLATES.ORDER_DELIVERED).toBe(ORDER_DELIVERED_TEMPLATE);
    });

    it("should contain ORDER_CANCELLED", () => {
      expect(WHATSAPP_TEMPLATES.ORDER_CANCELLED).toBe(ORDER_CANCELLED_TEMPLATE);
    });

    it("should contain auction templates", () => {
      expect(WHATSAPP_TEMPLATES.AUCTION_BID_PLACED).toBe(
        AUCTION_BID_PLACED_TEMPLATE
      );
      expect(WHATSAPP_TEMPLATES.AUCTION_OUTBID).toBe(AUCTION_OUTBID_TEMPLATE);
      expect(WHATSAPP_TEMPLATES.AUCTION_WON).toBe(AUCTION_WON_TEMPLATE);
    });

    it("should contain account templates", () => {
      expect(WHATSAPP_TEMPLATES.WELCOME).toBe(WELCOME_TEMPLATE);
      expect(WHATSAPP_TEMPLATES.OTP_VERIFICATION).toBe(
        OTP_VERIFICATION_TEMPLATE
      );
      expect(WHATSAPP_TEMPLATES.PASSWORD_RESET).toBe(PASSWORD_RESET_TEMPLATE);
    });

    it("should contain marketing templates", () => {
      expect(WHATSAPP_TEMPLATES.NEW_ARRIVAL).toBe(NEW_ARRIVAL_TEMPLATE);
      expect(WHATSAPP_TEMPLATES.FLASH_SALE).toBe(FLASH_SALE_TEMPLATE);
      expect(WHATSAPP_TEMPLATES.ABANDONED_CART).toBe(ABANDONED_CART_TEMPLATE);
    });

    it("should have unique template IDs", () => {
      const ids = Object.values(WHATSAPP_TEMPLATES).map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid templates", () => {
      Object.values(WHATSAPP_TEMPLATES).forEach((template) => {
        validateTemplateStructure(template);
      });
    });
  });

  // ============================================================================
  // Helper Functions Tests
  // ============================================================================
  describe("Helper Functions", () => {
    describe("getWhatsAppTemplate", () => {
      it("should return template by ID", () => {
        const template = getWhatsAppTemplate("ORDER_PLACED");
        expect(template).toBe(ORDER_PLACED_TEMPLATE);
      });

      it("should return template for auction", () => {
        const template = getWhatsAppTemplate("AUCTION_BID_PLACED");
        expect(template).toBe(AUCTION_BID_PLACED_TEMPLATE);
      });

      it("should return undefined for non-existent ID", () => {
        const template = getWhatsAppTemplate("NON_EXISTENT");
        expect(template).toBeUndefined();
      });

      it("should be case sensitive", () => {
        const template = getWhatsAppTemplate("order_placed");
        expect(template).toBeUndefined();
      });
    });

    describe("getTemplatesByCategory", () => {
      it("should return ORDER templates", () => {
        const templates = getTemplatesByCategory("ORDER");
        expect(Array.isArray(templates)).toBe(true);
        expect(templates.length).toBeGreaterThan(0);
        templates.forEach((t) => {
          expect(t.category).toBe("ORDER");
        });
      });

      it("should return AUCTION templates", () => {
        const templates = getTemplatesByCategory("AUCTION");
        expect(Array.isArray(templates)).toBe(true);
        expect(templates.length).toBeGreaterThan(0);
        templates.forEach((t) => {
          expect(t.category).toBe("AUCTION");
        });
      });

      it("should return ACCOUNT templates", () => {
        const templates = getTemplatesByCategory("ACCOUNT");
        expect(Array.isArray(templates)).toBe(true);
        expect(templates.length).toBeGreaterThan(0);
        templates.forEach((t) => {
          expect(t.category).toBe("ACCOUNT");
        });
      });

      it("should return MARKETING templates", () => {
        const templates = getTemplatesByCategory("MARKETING");
        expect(Array.isArray(templates)).toBe(true);
        expect(templates.length).toBeGreaterThan(0);
        templates.forEach((t) => {
          expect(t.category).toBe("MARKETING");
        });
      });

      it("should return empty array for non-existent category", () => {
        const templates = getTemplatesByCategory("NONEXISTENT" as any);
        expect(Array.isArray(templates)).toBe(true);
        expect(templates.length).toBe(0);
      });
    });

    describe("formatTemplate", () => {
      it("should replace single variable", () => {
        const template: WhatsAppTemplate = {
          id: "test",
          name: "Test",
          category: "ORDER",
          language: "en",
          body: "Hello {{1}}",
          variables: ["name"],
        };
        const result = formatTemplate(template, { name: "John" });
        expect(result).toBe("Hello John");
      });

      it("should replace multiple variables", () => {
        const template: WhatsAppTemplate = {
          id: "test",
          name: "Test",
          category: "ORDER",
          language: "en",
          body: "Hello {{1}}, your order {{2}} is ready",
          variables: ["name", "orderId"],
        };
        const result = formatTemplate(template, {
          name: "John",
          orderId: "12345",
        });
        expect(result).toBe("Hello John, your order 12345 is ready");
      });

      it("should handle missing variables", () => {
        const template: WhatsAppTemplate = {
          id: "test",
          name: "Test",
          category: "ORDER",
          language: "en",
          body: "Hello {{1}}, {{2}}",
          variables: ["name", "message"],
        };
        const result = formatTemplate(template, { name: "John" });
        expect(result).toBe("Hello John, ");
      });

      it("should replace variables in correct order", () => {
        const template: WhatsAppTemplate = {
          id: "test",
          name: "Test",
          category: "ORDER",
          language: "en",
          body: "{{1}} {{2}} {{3}}",
          variables: ["first", "second", "third"],
        };
        const result = formatTemplate(template, {
          first: "A",
          second: "B",
          third: "C",
        });
        expect(result).toBe("A B C");
      });

      it("should handle repeated placeholders", () => {
        const template: WhatsAppTemplate = {
          id: "test",
          name: "Test",
          category: "ORDER",
          language: "en",
          body: "{{1}} and {{1}} again",
          variables: ["name"],
        };
        const result = formatTemplate(template, { name: "John" });
        expect(result).toBe("John and John again");
      });

      it("should format ORDER_PLACED_TEMPLATE correctly", () => {
        const result = formatTemplate(ORDER_PLACED_TEMPLATE, {
          name: "John",
          orderId: "ORD123",
          amount: "1000",
          items: "3",
          address: "Mumbai",
          trackingUrl: "https://track.com",
        });
        expect(result).toContain("John");
        expect(result).toContain("ORD123");
        expect(result).toContain("1000");
      });
    });
  });

  // ============================================================================
  // Button Structure Tests
  // ============================================================================
  describe("Button Structures", () => {
    it("should have valid button types", () => {
      const templatesWithButtons = Object.values(WHATSAPP_TEMPLATES).filter(
        (t) => t.buttons && t.buttons.length > 0
      );

      templatesWithButtons.forEach((template) => {
        template.buttons!.forEach((button) => {
          expect(button).toHaveProperty("type");
          expect(button).toHaveProperty("text");
          expect(["CALL", "URL", "QUICK_REPLY"]).toContain(button.type);
          expect(typeof button.text).toBe("string");
          expect(button.text.length).toBeGreaterThan(0);
        });
      });
    });

    it("should have data for CALL and URL buttons", () => {
      const templatesWithButtons = Object.values(WHATSAPP_TEMPLATES).filter(
        (t) => t.buttons && t.buttons.length > 0
      );

      templatesWithButtons.forEach((template) => {
        template.buttons!.forEach((button) => {
          if (button.type === "CALL" || button.type === "URL") {
            expect(button.data).toBeDefined();
            expect(typeof button.data).toBe("string");
          }
        });
      });
    });
  });

  // ============================================================================
  // Language and Localization Tests
  // ============================================================================
  describe("Language and Localization", () => {
    it("should all be in English", () => {
      Object.values(WHATSAPP_TEMPLATES).forEach((template) => {
        expect(template.language).toBe("en");
      });
    });

    it("should use Indian currency symbol", () => {
      const templatesWithCurrency = Object.values(WHATSAPP_TEMPLATES).filter(
        (t) =>
          t.body.includes("₹") ||
          t.variables.some((v) => v.toLowerCase().includes("amount"))
      );

      expect(templatesWithCurrency.length).toBeGreaterThan(0);
    });
  });
});
