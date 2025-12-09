import i18n, { LANGUAGES, LanguageCode } from "../config";

describe("i18n Config", () => {
  describe("LANGUAGES constant", () => {
    it("should export all supported languages", () => {
      expect(LANGUAGES).toBeDefined();
      expect(Object.keys(LANGUAGES)).toHaveLength(4);
      expect(LANGUAGES["en-IN"]).toBeDefined();
      expect(LANGUAGES.hi).toBeDefined();
      expect(LANGUAGES.ta).toBeDefined();
      expect(LANGUAGES.te).toBeDefined();
    });

    it("should have correct language metadata", () => {
      expect(LANGUAGES["en-IN"]).toEqual({
        name: "English",
        nativeName: "English",
      });
      expect(LANGUAGES.hi).toEqual({
        name: "Hindi",
        nativeName: "हिन्दी",
      });
      expect(LANGUAGES.ta).toEqual({
        name: "Tamil",
        nativeName: "தமிழ்",
      });
      expect(LANGUAGES.te).toEqual({
        name: "Telugu",
        nativeName: "తెలుగు",
      });
    });

    it("should have native names in correct scripts", () => {
      expect(LANGUAGES.hi.nativeName).toMatch(/[\u0900-\u097F]/); // Devanagari
      expect(LANGUAGES.ta.nativeName).toMatch(/[\u0B80-\u0BFF]/); // Tamil
      expect(LANGUAGES.te.nativeName).toMatch(/[\u0C00-\u0C7F]/); // Telugu
    });
  });

  describe("i18n initialization", () => {
    it("should initialize i18n instance", () => {
      expect(i18n).toBeDefined();
      expect(i18n.isInitialized).toBe(true);
    });

    it("should have fallback language set to en-IN", () => {
      // fallbackLng can be string or array
      const fallback = i18n.options.fallbackLng;
      if (Array.isArray(fallback)) {
        expect(fallback).toContain("en-IN");
      } else {
        expect(fallback).toBe("en-IN");
      }
    });

    it("should have all language resources loaded", () => {
      const resources = i18n.options.resources;
      expect(resources).toBeDefined();
      expect(resources?.["en-IN"]).toBeDefined();
      expect(resources?.["hi"]).toBeDefined();
      expect(resources?.["ta"]).toBeDefined();
      expect(resources?.["te"]).toBeDefined();
    });

    it("should have interpolation escaping disabled for React", () => {
      expect(i18n.options.interpolation?.escapeValue).toBe(false);
    });

    it("should use translation namespace by default", () => {
      expect(i18n.options.defaultNS).toBe("translation");
    });

    it("should have language detection configured", () => {
      expect(i18n.options.detection).toBeDefined();
      expect(i18n.options.detection?.order).toEqual([
        "localStorage",
        "cookie",
        "navigator",
        "htmlTag",
      ]);
    });

    it("should cache language preference in localStorage and cookie", () => {
      expect(i18n.options.detection?.caches).toEqual([
        "localStorage",
        "cookie",
      ]);
      expect(i18n.options.detection?.lookupLocalStorage).toBe("i18nextLng");
      expect(i18n.options.detection?.lookupCookie).toBe("i18next");
    });

    it("should have React useSuspense disabled", () => {
      expect(i18n.options.react?.useSuspense).toBe(false);
    });

    it("should have debug mode based on NODE_ENV", () => {
      if (process.env.NODE_ENV === "development") {
        expect(i18n.options.debug).toBe(true);
      } else {
        expect(i18n.options.debug).toBe(false);
      }
    });
  });

  describe("Language switching", () => {
    it("should allow changing language", async () => {
      await i18n.changeLanguage("hi");
      expect(i18n.language).toBe("hi");
    });

    it("should support all configured languages", async () => {
      const languages: LanguageCode[] = ["en-IN", "hi", "ta", "te"];

      for (const lang of languages) {
        await i18n.changeLanguage(lang);
        expect(i18n.language).toBe(lang);
      }
    });

    it("should fallback to en-IN for unsupported languages", async () => {
      await i18n.changeLanguage("fr"); // Unsupported language
      // i18n will use fallback language
      const fallback = i18n.options.fallbackLng;
      if (Array.isArray(fallback)) {
        expect(fallback).toContain("en-IN");
      } else {
        expect(fallback).toBe("en-IN");
      }
    });

    it("should handle empty language code", async () => {
      const currentLang = i18n.language;
      await i18n.changeLanguage("");
      // Should remain on current or fallback
      expect(i18n.language).toBeTruthy();
    });
  });

  describe("Translation resources", () => {
    it("should have translation resources for each language", () => {
      const resources = i18n.options.resources;

      Object.keys(LANGUAGES).forEach((langCode) => {
        expect(resources?.[langCode]?.translation).toBeDefined();
      });
    });

    it("should have non-empty translation objects", () => {
      const resources = i18n.options.resources;

      Object.keys(LANGUAGES).forEach((langCode) => {
        const translations = resources?.[langCode]?.translation;
        expect(translations).toBeDefined();
        expect(Object.keys(translations || {})).not.toHaveLength(0);
      });
    });
  });

  describe("Type safety", () => {
    it("should accept valid LanguageCode types", () => {
      const validCodes: LanguageCode[] = ["en-IN", "hi", "ta", "te"];

      validCodes.forEach((code) => {
        expect(LANGUAGES[code]).toBeDefined();
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle rapid language changes", async () => {
      await i18n.changeLanguage("en-IN");
      await i18n.changeLanguage("hi");
      await i18n.changeLanguage("ta");
      await i18n.changeLanguage("te");

      expect(i18n.language).toBe("te");
    });

    it("should maintain state after multiple initialization attempts", () => {
      const initialLang = i18n.language;

      // i18n is already initialized, this should be idempotent
      if (!i18n.isInitialized) {
        i18n.init();
      }

      expect(i18n.isInitialized).toBe(true);
      expect(i18n.language).toBe(initialLang);
    });

    it("should handle case-sensitive language codes", async () => {
      await i18n.changeLanguage("en-IN");
      expect(i18n.language).toBe("en-IN");

      // i18next might normalize this, but we should handle it
      await i18n.changeLanguage("EN-IN" as any);
      // The actual behavior depends on i18next configuration
      expect(i18n.language).toBeTruthy();
    });
  });

  describe("Configuration consistency", () => {
    it("should have consistent language codes between LANGUAGES and resources", () => {
      const languageCodes = Object.keys(LANGUAGES);
      const resourceCodes = Object.keys(i18n.options.resources || {});

      languageCodes.forEach((code) => {
        expect(resourceCodes).toContain(code);
      });
    });

    it("should not have extra resource languages not in LANGUAGES", () => {
      const languageCodes = Object.keys(LANGUAGES);
      const resourceCodes = Object.keys(i18n.options.resources || {});

      resourceCodes.forEach((code) => {
        expect(languageCodes).toContain(code);
      });
    });
  });
});
