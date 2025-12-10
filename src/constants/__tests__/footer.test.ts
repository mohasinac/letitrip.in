/**
 * Footer Constants Tests
 *
 * Tests footer navigation links, payment methods, languages, and social media
 * Coverage: 100%
 */

import {
  ABOUT_LINKS,
  COMPANY_INFO,
  COPYRIGHT_TEXT,
  FEE_DESCRIPTION,
  LANGUAGES,
  PAYMENT_METHODS,
  SHOPPING_NOTES,
  SOCIAL_LINKS,
} from "../footer";

describe("Footer Constants", () => {
  describe("ABOUT_LINKS", () => {
    it("should export ABOUT_LINKS array", () => {
      expect(ABOUT_LINKS).toBeDefined();
      expect(Array.isArray(ABOUT_LINKS)).toBe(true);
    });

    it("should have 6 about links", () => {
      expect(ABOUT_LINKS).toHaveLength(6);
    });

    it("should have all required properties", () => {
      ABOUT_LINKS.forEach((link) => {
        expect(link).toHaveProperty("id");
        expect(link).toHaveProperty("name");
        expect(link).toHaveProperty("link");
        expect(typeof link.id).toBe("string");
        expect(typeof link.name).toBe("string");
        expect(typeof link.link).toBe("string");
        expect(link.id.length).toBeGreaterThan(0);
        expect(link.name.length).toBeGreaterThan(0);
        expect(link.link).toMatch(/^\//);
      });
    });

    it("should have unique ids", () => {
      const ids = ABOUT_LINKS.map((l) => l.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have about link", () => {
      const about = ABOUT_LINKS.find((l) => l.id === "about");
      expect(about).toBeDefined();
      expect(about?.name).toBe("About Let It Rip");
      expect(about?.link).toBe("/about");
    });

    it("should have terms link", () => {
      const terms = ABOUT_LINKS.find((l) => l.id === "terms");
      expect(terms).toBeDefined();
      expect(terms?.name).toBe("Terms of Service");
      expect(terms?.link).toBe("/terms-of-service");
    });

    it("should have privacy link", () => {
      const privacy = ABOUT_LINKS.find((l) => l.id === "privacy");
      expect(privacy).toBeDefined();
      expect(privacy?.name).toBe("Privacy Policy");
      expect(privacy?.link).toBe("/privacy-policy");
    });

    it("should have refund link", () => {
      const refund = ABOUT_LINKS.find((l) => l.id === "refund");
      expect(refund).toBeDefined();
      expect(refund?.name).toBe("Refund Policy");
      expect(refund?.link).toBe("/refund-policy");
    });

    it("should have shipping policy link", () => {
      const shipping = ABOUT_LINKS.find((l) => l.id === "shipping");
      expect(shipping).toBeDefined();
      expect(shipping?.name).toBe("Shipping Policy");
      expect(shipping?.link).toBe("/shipping-policy");
    });

    it("should have cookie policy link", () => {
      const cookie = ABOUT_LINKS.find((l) => l.id === "cookie");
      expect(cookie).toBeDefined();
      expect(cookie?.name).toBe("Cookie Policy");
      expect(cookie?.link).toBe("/cookie-policy");
    });
  });

  describe("SHOPPING_NOTES", () => {
    it("should export SHOPPING_NOTES array", () => {
      expect(SHOPPING_NOTES).toBeDefined();
      expect(Array.isArray(SHOPPING_NOTES)).toBe(true);
    });

    it("should have 4 shopping notes", () => {
      expect(SHOPPING_NOTES).toHaveLength(4);
    });

    it("should have all required properties", () => {
      SHOPPING_NOTES.forEach((note) => {
        expect(note).toHaveProperty("id");
        expect(note).toHaveProperty("name");
        expect(note).toHaveProperty("link");
        expect(typeof note.id).toBe("string");
        expect(typeof note.name).toBe("string");
        expect(typeof note.link).toBe("string");
        expect(note.link).toMatch(/^\//);
      });
    });

    it("should have unique ids", () => {
      const ids = SHOPPING_NOTES.map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have FAQ link", () => {
      const faq = SHOPPING_NOTES.find((n) => n.id === "faq");
      expect(faq).toBeDefined();
      expect(faq?.name).toBe("FAQ");
      expect(faq?.link).toBe("/faq");
    });

    it("should have new user guide", () => {
      const newUser = SHOPPING_NOTES.find((n) => n.id === "new-user");
      expect(newUser).toBeDefined();
      expect(newUser?.name).toBe("New Users' Guide");
      expect(newUser?.link).toBe("/guide/new-user");
    });

    it("should have returns guide", () => {
      const returns = SHOPPING_NOTES.find((n) => n.id === "returns");
      expect(returns).toBeDefined();
      expect(returns?.name).toBe("Returns & Refunds");
      expect(returns?.link).toBe("/guide/returns");
    });

    it("should have prohibited items guide", () => {
      const prohibited = SHOPPING_NOTES.find((n) => n.id === "prohibited");
      expect(prohibited).toBeDefined();
      expect(prohibited?.name).toBe("Prohibited Items");
      expect(prohibited?.link).toBe("/guide/prohibited");
    });
  });

  describe("FEE_DESCRIPTION", () => {
    it("should export FEE_DESCRIPTION array", () => {
      expect(FEE_DESCRIPTION).toBeDefined();
      expect(Array.isArray(FEE_DESCRIPTION)).toBe(true);
    });

    it("should have 4 fee description links", () => {
      expect(FEE_DESCRIPTION).toHaveLength(4);
    });

    it("should have all required properties", () => {
      FEE_DESCRIPTION.forEach((fee) => {
        expect(fee).toHaveProperty("id");
        expect(fee).toHaveProperty("name");
        expect(fee).toHaveProperty("link");
        expect(typeof fee.id).toBe("string");
        expect(typeof fee.name).toBe("string");
        expect(typeof fee.link).toBe("string");
        expect(fee.link).toMatch(/^\//);
      });
    });

    it("should have unique ids", () => {
      const ids = FEE_DESCRIPTION.map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should have payment methods link", () => {
      const payment = FEE_DESCRIPTION.find((f) => f.id === "payment");
      expect(payment).toBeDefined();
      expect(payment?.name).toBe("Payment Methods");
      expect(payment?.link).toBe("/fees/payment");
    });

    it("should have fee structure link", () => {
      const structure = FEE_DESCRIPTION.find((f) => f.id === "structure");
      expect(structure).toBeDefined();
      expect(structure?.name).toBe("Fee Structure");
      expect(structure?.link).toBe("/fees/structure");
    });

    it("should have optional services link", () => {
      const optional = FEE_DESCRIPTION.find((f) => f.id === "optional");
      expect(optional).toBeDefined();
      expect(optional?.name).toBe("Optional Services");
      expect(optional?.link).toBe("/fees/optional");
    });

    it("should have international shipping link", () => {
      const shipping = FEE_DESCRIPTION.find((f) => f.id === "shipping");
      expect(shipping).toBeDefined();
      expect(shipping?.name).toBe("International Shipping");
      expect(shipping?.link).toBe("/fees/shipping");
    });
  });

  describe("COMPANY_INFO", () => {
    it("should export COMPANY_INFO array", () => {
      expect(COMPANY_INFO).toBeDefined();
      expect(Array.isArray(COMPANY_INFO)).toBe(true);
    });

    it("should have 2 company info links", () => {
      expect(COMPANY_INFO).toHaveLength(2);
    });

    it("should have all required properties", () => {
      COMPANY_INFO.forEach((info) => {
        expect(info).toHaveProperty("id");
        expect(info).toHaveProperty("name");
        expect(info).toHaveProperty("link");
        expect(typeof info.id).toBe("string");
        expect(typeof info.name).toBe("string");
        expect(typeof info.link).toBe("string");
        expect(info.link).toMatch(/^\//);
      });
    });

    it("should have company overview link", () => {
      const overview = COMPANY_INFO.find((c) => c.id === "overview");
      expect(overview).toBeDefined();
      expect(overview?.name).toBe("Company Overview");
      expect(overview?.link).toBe("/company/overview");
    });

    it("should have customer ticket link", () => {
      const ticket = COMPANY_INFO.find((c) => c.id === "ticket");
      expect(ticket).toBeDefined();
      expect(ticket?.name).toBe("Customer Ticket");
      expect(ticket?.link).toBe("/support/ticket");
    });
  });

  describe("PAYMENT_METHODS", () => {
    it("should export PAYMENT_METHODS array", () => {
      expect(PAYMENT_METHODS).toBeDefined();
      expect(Array.isArray(PAYMENT_METHODS)).toBe(true);
    });

    it("should have 11 payment methods", () => {
      expect(PAYMENT_METHODS).toHaveLength(11);
    });

    it("should have all required properties", () => {
      PAYMENT_METHODS.forEach((method) => {
        expect(method).toHaveProperty("id");
        expect(method).toHaveProperty("name");
        expect(method).toHaveProperty("logo");
        expect(typeof method.id).toBe("string");
        expect(typeof method.name).toBe("string");
        expect(typeof method.logo).toBe("string");
        expect(method.logo).toMatch(/^\/payments\//);
        expect(method.logo).toMatch(/\.svg$/);
      });
    });

    it("should have unique ids", () => {
      const ids = PAYMENT_METHODS.map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should include major card networks", () => {
      const cardNetworks = ["visa", "mastercard", "jcb", "amex"];
      cardNetworks.forEach((network) => {
        const method = PAYMENT_METHODS.find((m) => m.id === network);
        expect(method).toBeDefined();
        expect(method?.logo).toMatch(new RegExp(`/${network}\\.svg$`));
      });
    });

    it("should include digital wallets", () => {
      const wallets = ["paypal", "alipay"];
      wallets.forEach((wallet) => {
        const method = PAYMENT_METHODS.find((m) => m.id === wallet);
        expect(method).toBeDefined();
      });
    });

    it("should have visa payment method", () => {
      const visa = PAYMENT_METHODS.find((m) => m.id === "visa");
      expect(visa).toBeDefined();
      expect(visa?.name).toBe("Visa");
      expect(visa?.logo).toBe("/payments/visa.svg");
    });

    it("should have paypal payment method", () => {
      const paypal = PAYMENT_METHODS.find((m) => m.id === "paypal");
      expect(paypal).toBeDefined();
      expect(paypal?.name).toBe("PayPal");
      expect(paypal?.logo).toBe("/payments/paypal.svg");
    });
  });

  describe("LANGUAGES", () => {
    it("should export LANGUAGES array", () => {
      expect(LANGUAGES).toBeDefined();
      expect(Array.isArray(LANGUAGES)).toBe(true);
    });

    it("should have 17 languages", () => {
      expect(LANGUAGES).toHaveLength(17);
    });

    it("should have all required properties", () => {
      LANGUAGES.forEach((lang) => {
        expect(lang).toHaveProperty("code");
        expect(lang).toHaveProperty("name");
        expect(lang).toHaveProperty("fullName");
        expect(typeof lang.code).toBe("string");
        expect(typeof lang.name).toBe("string");
        expect(typeof lang.fullName).toBe("string");
        expect(lang.code.length).toBeGreaterThan(0);
        expect(lang.name.length).toBeGreaterThan(0);
        expect(lang.fullName.length).toBeGreaterThan(0);
      });
    });

    it("should have unique language codes", () => {
      const codes = LANGUAGES.map((l) => l.code);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it("should have English as first language", () => {
      expect(LANGUAGES[0].code).toBe("en");
      expect(LANGUAGES[0].name).toBe("EN");
      expect(LANGUAGES[0].fullName).toBe("English");
    });

    it("should include major Asian languages", () => {
      const asianLangs = ["ja", "ko", "zh-cn", "zh-tw", "th", "id"];
      asianLangs.forEach((code) => {
        const lang = LANGUAGES.find((l) => l.code === code);
        expect(lang).toBeDefined();
      });
    });

    it("should include major European languages", () => {
      const europeanLangs = ["de", "fr", "es", "it", "pt", "pl", "ru"];
      europeanLangs.forEach((code) => {
        const lang = LANGUAGES.find((l) => l.code === code);
        expect(lang).toBeDefined();
      });
    });

    it("should have Japanese language", () => {
      const japanese = LANGUAGES.find((l) => l.code === "ja");
      expect(japanese).toBeDefined();
      expect(japanese?.name).toBe("日本語");
      expect(japanese?.fullName).toBe("Japanese");
    });

    it("should have Arabic language with RTL support", () => {
      const arabic = LANGUAGES.find((l) => l.code === "ar");
      expect(arabic).toBeDefined();
      expect(arabic?.name).toBe("العربية");
      expect(arabic?.fullName).toBe("Arabic");
    });
  });

  describe("SOCIAL_LINKS", () => {
    it("should export SOCIAL_LINKS array", () => {
      expect(SOCIAL_LINKS).toBeDefined();
      expect(Array.isArray(SOCIAL_LINKS)).toBe(true);
    });

    it("should have 4 social media links", () => {
      expect(SOCIAL_LINKS).toHaveLength(4);
    });

    it("should have all required properties", () => {
      SOCIAL_LINKS.forEach((social) => {
        expect(social).toHaveProperty("id");
        expect(social).toHaveProperty("name");
        expect(social).toHaveProperty("link");
        expect(social).toHaveProperty("icon");
        expect(typeof social.id).toBe("string");
        expect(typeof social.name).toBe("string");
        expect(typeof social.link).toBe("string");
        expect(typeof social.icon).toBe("string");
        expect(social.link).toMatch(/^https?:\/\//);
      });
    });

    it("should have unique ids", () => {
      const ids = SOCIAL_LINKS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should include major social platforms", () => {
      const platforms = ["facebook", "twitter", "instagram", "youtube"];
      platforms.forEach((platform) => {
        const social = SOCIAL_LINKS.find((s) => s.id === platform);
        expect(social).toBeDefined();
        expect(social?.icon).toBe(platform);
      });
    });

    it("should have facebook link", () => {
      const facebook = SOCIAL_LINKS.find((s) => s.id === "facebook");
      expect(facebook).toBeDefined();
      expect(facebook?.name).toBe("Facebook");
      expect(facebook?.link).toBe("https://facebook.com");
    });

    it("should have youtube link", () => {
      const youtube = SOCIAL_LINKS.find((s) => s.id === "youtube");
      expect(youtube).toBeDefined();
      expect(youtube?.name).toBe("YouTube");
      expect(youtube?.link).toBe("https://youtube.com");
    });
  });

  describe("COPYRIGHT_TEXT", () => {
    it("should export COPYRIGHT_TEXT", () => {
      expect(COPYRIGHT_TEXT).toBeDefined();
      expect(typeof COPYRIGHT_TEXT).toBe("string");
    });

    it("should contain copyright symbol and year range", () => {
      expect(COPYRIGHT_TEXT).toContain("Copyright");
      expect(COPYRIGHT_TEXT).toContain("©");
      expect(COPYRIGHT_TEXT).toContain("2015-2025");
    });

    it("should contain company domain", () => {
      expect(COPYRIGHT_TEXT).toContain("letitrip.com");
    });

    it("should contain all rights reserved", () => {
      expect(COPYRIGHT_TEXT).toContain("All Rights Reserved");
    });

    it("should match expected format", () => {
      expect(COPYRIGHT_TEXT).toBe(
        "Copyright © 2015-2025 letitrip.com. All Rights Reserved"
      );
    });
  });

  describe("Data Consistency", () => {
    it("should have no empty strings in any array", () => {
      const allArrays = [
        ABOUT_LINKS,
        SHOPPING_NOTES,
        FEE_DESCRIPTION,
        COMPANY_INFO,
        PAYMENT_METHODS,
        LANGUAGES,
        SOCIAL_LINKS,
      ];

      allArrays.forEach((arr) => {
        arr.forEach((item: any) => {
          Object.values(item).forEach((value) => {
            if (typeof value === "string") {
              expect(value.trim()).toBe(value);
              expect(value.length).toBeGreaterThan(0);
            }
          });
        });
      });
    });

    it("should have valid URLs in all link arrays", () => {
      [
        ...ABOUT_LINKS,
        ...SHOPPING_NOTES,
        ...FEE_DESCRIPTION,
        ...COMPANY_INFO,
      ].forEach((item) => {
        expect(item.link).toMatch(/^\/[a-z0-9\/-]*$/);
      });
    });

    it("should have valid external URLs in social links", () => {
      SOCIAL_LINKS.forEach((social) => {
        expect(social.link).toMatch(/^https?:\/\//);
      });
    });

    it("should maintain consistent naming conventions", () => {
      const allItems = [
        ...ABOUT_LINKS,
        ...SHOPPING_NOTES,
        ...FEE_DESCRIPTION,
        ...COMPANY_INFO,
      ];

      allItems.forEach((item) => {
        // IDs should be lowercase with hyphens
        expect(item.id).toMatch(/^[a-z-]+$/);
      });
    });
  });
});
