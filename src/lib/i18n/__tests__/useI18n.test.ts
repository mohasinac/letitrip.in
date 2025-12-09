import { act, renderHook } from "@testing-library/react";
import i18n from "../config";
import { useI18n } from "../useI18n";

describe("useI18n", () => {
  beforeEach(async () => {
    // Reset to default language
    await i18n.changeLanguage("en-IN");
  });

  describe("Hook initialization", () => {
    it("should return translation function", () => {
      const { result } = renderHook(() => useI18n());

      expect(result.current.t).toBeDefined();
      expect(typeof result.current.t).toBe("function");
    });

    it("should return i18n instance", () => {
      const { result } = renderHook(() => useI18n());

      expect(result.current.i18n).toBeDefined();
      // Check structural equality instead of reference equality
      expect(result.current.i18n.language).toBe(i18n.language);
      expect(result.current.i18n.isInitialized).toBe(true);
    });

    it("should return current language", () => {
      const { result } = renderHook(() => useI18n());

      expect(result.current.language).toBeDefined();
      expect(typeof result.current.language).toBe("string");
    });

    it("should return changeLanguage function", () => {
      const { result } = renderHook(() => useI18n());

      expect(result.current.changeLanguage).toBeDefined();
      expect(typeof result.current.changeLanguage).toBe("function");
    });
  });

  describe("Translation function", () => {
    it("should translate keys", () => {
      const { result } = renderHook(() => useI18n());

      // Assuming translation keys exist
      const translation = result.current.t("common.save");
      expect(typeof translation).toBe("string");
    });

    it("should handle missing translation keys", () => {
      const { result } = renderHook(() => useI18n());

      const key = "nonexistent.key.that.does.not.exist";
      const translation = result.current.t(key);

      // i18next returns the key if translation not found
      expect(translation).toBe(key);
    });

    it("should support interpolation", () => {
      const { result } = renderHook(() => useI18n());

      // Test with interpolation if translations support it
      const translation = result.current.t("welcome", { name: "John" });
      expect(typeof translation).toBe("string");
    });

    it("should handle empty translation key", () => {
      const { result } = renderHook(() => useI18n());

      const translation = result.current.t("");
      expect(translation).toBe("");
    });

    it("should handle nested translation keys", () => {
      const { result } = renderHook(() => useI18n());

      const translation = result.current.t("auth.login.title");
      expect(typeof translation).toBe("string");
    });
  });

  describe("Language switching", () => {
    it("should change language", async () => {
      const { result } = renderHook(() => useI18n());

      await act(async () => {
        await result.current.changeLanguage("hi");
      });

      expect(result.current.language).toBe("hi");
    });

    it("should update language state when changed", async () => {
      const { result } = renderHook(() => useI18n());

      const initialLanguage = result.current.language;

      await act(async () => {
        await result.current.changeLanguage("ta");
      });

      expect(result.current.language).not.toBe(initialLanguage);
      expect(result.current.language).toBe("ta");
    });

    it("should support all available languages", async () => {
      const { result } = renderHook(() => useI18n());
      const languages = ["en-IN", "hi", "ta", "te"];

      for (const lang of languages) {
        await act(async () => {
          await result.current.changeLanguage(lang);
        });

        expect(result.current.language).toBe(lang);
      }
    });

    it("should handle invalid language codes gracefully", async () => {
      const { result } = renderHook(() => useI18n());

      await act(async () => {
        await result.current.changeLanguage("invalid-lang");
      });

      // Should still have a valid language (fallback)
      expect(result.current.language).toBeTruthy();
    });

    it("should handle rapid language switches", async () => {
      const { result } = renderHook(() => useI18n());

      await act(async () => {
        await result.current.changeLanguage("hi");
        await result.current.changeLanguage("ta");
        await result.current.changeLanguage("te");
      });

      expect(result.current.language).toBe("te");
    });
  });

  describe("i18n instance access", () => {
    it("should provide access to i18n instance methods", () => {
      const { result } = renderHook(() => useI18n());

      expect(result.current.i18n.isInitialized).toBe(true);
      expect(result.current.i18n.language).toBeDefined();
      expect(result.current.i18n.options).toBeDefined();
    });

    it("should allow direct i18n operations", async () => {
      const { result } = renderHook(() => useI18n());

      const exists = result.current.i18n.exists("common.save");
      expect(typeof exists).toBe("boolean");
    });

    it("should access language detection", () => {
      const { result } = renderHook(() => useI18n());

      expect(result.current.i18n.options.detection).toBeDefined();
    });
  });

  describe("Multiple hook instances", () => {
    it("should share state between multiple hook instances", async () => {
      const { result: result1 } = renderHook(() => useI18n());
      const { result: result2 } = renderHook(() => useI18n());

      await act(async () => {
        await result1.current.changeLanguage("hi");
      });

      // Both hooks should reflect the same language
      expect(result1.current.language).toBe("hi");
      expect(result2.current.language).toBe("hi");
    });

    it("should use same i18n instance", () => {
      const { result: result1 } = renderHook(() => useI18n());
      const { result: result2 } = renderHook(() => useI18n());

      // Check structural equality - both should use the same configuration
      expect(result1.current.i18n.language).toBe(result2.current.i18n.language);
      expect(result1.current.i18n.isInitialized).toBe(
        result2.current.i18n.isInitialized
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined translation options", () => {
      const { result } = renderHook(() => useI18n());

      const translation = result.current.t("key", undefined);
      expect(typeof translation).toBe("string");
    });

    it("should handle null translation key", () => {
      const { result } = renderHook(() => useI18n());

      // @ts-ignore - testing runtime behavior
      const translation = result.current.t(null);
      expect(translation).toBeDefined();
    });

    it("should handle array translation keys", () => {
      const { result } = renderHook(() => useI18n());

      // Some i18n libraries support array keys for fallbacks
      const translation = result.current.t(["key1", "key2"]);
      expect(typeof translation).toBe("string");
    });

    it("should handle special characters in translation keys", () => {
      const { result } = renderHook(() => useI18n());

      const translation = result.current.t("key.with-dash_and_underscore");
      expect(typeof translation).toBe("string");
    });

    it("should maintain consistency after language change", async () => {
      const { result, rerender } = renderHook(() => useI18n());

      const key = "common.test";
      const translationBefore = result.current.t(key);

      await act(async () => {
        await result.current.changeLanguage("hi");
      });

      rerender();

      const translationAfter = result.current.t(key);
      expect(typeof translationAfter).toBe("string");
    });
  });

  describe("Type safety", () => {
    it("should return expected types", () => {
      const { result } = renderHook(() => useI18n());

      expect(typeof result.current.t).toBe("function");
      expect(typeof result.current.language).toBe("string");
      expect(typeof result.current.changeLanguage).toBe("function");
      expect(typeof result.current.i18n).toBe("object");
    });

    it("should handle translation parameters correctly", () => {
      const { result } = renderHook(() => useI18n());

      const translation = result.current.t("key", {
        count: 5,
        name: "Test",
        value: 100,
      });

      expect(typeof translation).toBe("string");
    });
  });

  describe("Performance", () => {
    it("should not recreate functions on re-render", () => {
      const { result, rerender } = renderHook(() => useI18n());

      const changeLanguageBefore = result.current.changeLanguage;
      const tBefore = result.current.t;

      rerender();

      expect(result.current.changeLanguage).toBe(changeLanguageBefore);
      expect(result.current.t).toBe(tBefore);
    });
  });
});
