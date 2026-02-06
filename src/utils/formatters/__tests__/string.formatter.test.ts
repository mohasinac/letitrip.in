/**
 * @jest-environment jsdom
 */

import {
  capitalize,
  capitalizeWords,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  truncate,
  truncateWords,
  stripHtml,
  escapeHtml,
  slugify,
  maskString,
  randomString,
  isEmptyString,
  wordCount,
  reverse,
} from "../string.formatter";

describe("String Formatter", () => {
  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("world")).toBe("World");
    });

    it("should lowercase remaining letters", () => {
      expect(capitalize("hELLO")).toBe("Hello");
      expect(capitalize("WORLD")).toBe("World");
    });

    it("should handle single character", () => {
      expect(capitalize("a")).toBe("A");
    });

    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });
  });

  describe("capitalizeWords", () => {
    it("should capitalize all words", () => {
      expect(capitalizeWords("hello world")).toBe("Hello World");
      expect(capitalizeWords("the quick brown fox")).toBe(
        "The Quick Brown Fox",
      );
    });

    it("should handle mixed case", () => {
      expect(capitalizeWords("hELLO wORLD")).toBe("Hello World");
    });

    it("should handle single word", () => {
      expect(capitalizeWords("hello")).toBe("Hello");
    });

    it("should handle empty string", () => {
      expect(capitalizeWords("")).toBe("");
    });
  });

  describe("toCamelCase", () => {
    it("should convert to camelCase", () => {
      expect(toCamelCase("hello world")).toBe("helloWorld");
      expect(toCamelCase("foo bar baz")).toBe("fooBarBaz");
    });

    it("should handle PascalCase input", () => {
      expect(toCamelCase("HelloWorld")).toBe("helloWorld");
    });

    it("should handle snake_case input", () => {
      expect(toCamelCase("hello_world")).toBe("helloWorld");
    });

    it("should handle kebab-case input", () => {
      expect(toCamelCase("hello-world")).toBe("helloWorld");
    });

    it("should handle single word", () => {
      expect(toCamelCase("hello")).toBe("hello");
    });
  });

  describe("toPascalCase", () => {
    it("should convert to PascalCase", () => {
      expect(toPascalCase("hello world")).toBe("HelloWorld");
      expect(toPascalCase("foo bar baz")).toBe("FooBarBaz");
    });

    it("should handle camelCase input", () => {
      expect(toPascalCase("helloWorld")).toBe("HelloWorld");
    });

    it("should handle single word", () => {
      expect(toPascalCase("hello")).toBe("Hello");
    });
  });

  describe("toSnakeCase", () => {
    it("should convert to snake_case", () => {
      expect(toSnakeCase("hello world")).toBe("hello_world");
      expect(toSnakeCase("foo bar baz")).toBe("foo_bar_baz");
    });

    it("should handle camelCase input", () => {
      expect(toSnakeCase("helloWorld")).toBe("hello_world");
      expect(toSnakeCase("fooBarBaz")).toBe("foo_bar_baz");
    });

    it("should handle PascalCase input", () => {
      expect(toSnakeCase("HelloWorld")).toBe("hello_world");
    });

    it("should handle single word", () => {
      expect(toSnakeCase("hello")).toBe("hello");
    });
  });

  describe("toKebabCase", () => {
    it("should convert to kebab-case", () => {
      expect(toKebabCase("hello world")).toBe("hello-world");
      expect(toKebabCase("foo bar baz")).toBe("foo-bar-baz");
    });

    it("should handle camelCase input", () => {
      expect(toKebabCase("helloWorld")).toBe("hello-world");
      expect(toKebabCase("fooBarBaz")).toBe("foo-bar-baz");
    });

    it("should handle PascalCase input", () => {
      expect(toKebabCase("HelloWorld")).toBe("hello-world");
    });

    it("should handle single word", () => {
      expect(toKebabCase("hello")).toBe("hello");
    });
  });

  describe("truncate", () => {
    it("should truncate long strings", () => {
      expect(truncate("Hello World", 8)).toBe("Hello...");
      expect(truncate("The quick brown fox", 10)).toBe("The qui...");
    });

    it("should not truncate short strings", () => {
      expect(truncate("Hello", 10)).toBe("Hello");
      expect(truncate("Short", 10)).toBe("Short");
    });

    it("should use custom suffix", () => {
      expect(truncate("Hello World", 8, "…")).toBe("Hello W…");
    });

    it("should handle edge cases", () => {
      expect(truncate("", 10)).toBe("");
      expect(truncate("Hello", 5)).toBe("Hello");
    });
  });

  describe("truncateWords", () => {
    it("should truncate by word count", () => {
      expect(truncateWords("one two three four", 2)).toBe("one two...");
      expect(truncateWords("the quick brown fox", 3)).toBe(
        "the quick brown...",
      );
    });

    it("should not truncate if word count is sufficient", () => {
      expect(truncateWords("one two three", 5)).toBe("one two three");
    });

    it("should use custom suffix", () => {
      expect(truncateWords("one two three", 2, "…")).toBe("one two…");
    });

    it("should handle edge cases", () => {
      expect(truncateWords("", 2)).toBe("");
      expect(truncateWords("one", 1)).toBe("one");
    });
  });

  describe("stripHtml", () => {
    it("should remove HTML tags", () => {
      expect(stripHtml("<p>Hello</p>")).toBe("Hello");
      expect(stripHtml("<div><span>World</span></div>")).toBe("World");
      expect(stripHtml('<a href="#">Link</a>')).toBe("Link");
    });

    it("should handle multiple tags", () => {
      expect(stripHtml("<p>Hello <strong>World</strong></p>")).toBe(
        "Hello World",
      );
    });

    it("should handle self-closing tags", () => {
      expect(stripHtml("Hello<br/>World")).toBe("HelloWorld");
      expect(stripHtml('<img src="test.jpg" />Text')).toBe("Text");
    });

    it("should handle plain text", () => {
      expect(stripHtml("No tags here")).toBe("No tags here");
    });
  });

  describe("escapeHtml", () => {
    it("should escape HTML entities", () => {
      expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
      expect(escapeHtml('"Hello"')).toBe("&quot;Hello&quot;");
      expect(escapeHtml("It's")).toBe("It&#x27;s");
    });

    it("should escape multiple entities", () => {
      expect(escapeHtml('<p class="test">Hello & goodbye</p>')).toBe(
        "&lt;p class=&quot;test&quot;&gt;Hello &amp; goodbye&lt;&#x2F;p&gt;",
      );
    });

    it("should handle plain text", () => {
      expect(escapeHtml("No special chars")).toBe("No special chars");
    });

    it("should handle empty string", () => {
      expect(escapeHtml("")).toBe("");
    });
  });

  describe("slugify", () => {
    it("should create URL-friendly slugs", () => {
      expect(slugify("Hello World")).toBe("hello-world");
      expect(slugify("The Quick Brown Fox")).toBe("the-quick-brown-fox");
    });

    it("should remove special characters", () => {
      expect(slugify("Hello, World!")).toBe("hello-world");
      expect(slugify("Test@#$%123")).toBe("test123");
    });

    it("should handle multiple spaces", () => {
      expect(slugify("Hello   World")).toBe("hello-world");
    });

    it("should remove leading/trailing hyphens", () => {
      expect(slugify("-Hello World-")).toBe("hello-world");
    });

    it("should handle underscores", () => {
      expect(slugify("hello_world")).toBe("hello-world");
    });

    it("should handle empty string", () => {
      expect(slugify("")).toBe("");
    });
  });

  describe("maskString", () => {
    it("should mask middle portion of string", () => {
      expect(maskString("1234567890")).toBe("1234**7890");
      expect(maskString("test@example.com")).toBe("test********com");
    });

    it("should use custom visible lengths", () => {
      expect(maskString("1234567890", 2, 2)).toBe("12******90");
      expect(maskString("1234567890", 6, 2)).toBe("123456**90");
    });

    it("should use custom mask character", () => {
      expect(maskString("1234567890", 4, 4, "X")).toBe("1234XX7890");
    });

    it("should not mask short strings", () => {
      expect(maskString("12345678", 4, 4)).toBe("12345678");
      expect(maskString("123", 4, 4)).toBe("123");
    });

    it("should handle edge cases", () => {
      expect(maskString("")).toBe("");
    });
  });

  describe("randomString", () => {
    it("should generate string of specified length", () => {
      expect(randomString(10)).toHaveLength(10);
      expect(randomString(20)).toHaveLength(20);
    });

    it("should generate different strings", () => {
      const str1 = randomString(10);
      const str2 = randomString(10);
      expect(str1).not.toBe(str2);
    });

    it("should use default length of 10", () => {
      expect(randomString()).toHaveLength(10);
    });

    it("should contain alphanumeric characters", () => {
      const str = randomString(100);
      expect(str).toMatch(/^[A-Za-z0-9]+$/);
    });
  });

  describe("isEmptyString", () => {
    it("should detect empty strings", () => {
      expect(isEmptyString("")).toBe(true);
      expect(isEmptyString("   ")).toBe(true);
      expect(isEmptyString("\t\n")).toBe(true);
    });

    it("should handle null and undefined", () => {
      expect(isEmptyString(null)).toBe(true);
      expect(isEmptyString(undefined)).toBe(true);
    });

    it("should detect non-empty strings", () => {
      expect(isEmptyString("hello")).toBe(false);
      expect(isEmptyString(" a ")).toBe(false);
    });
  });

  describe("wordCount", () => {
    it("should count words", () => {
      expect(wordCount("one")).toBe(1);
      expect(wordCount("one two")).toBe(2);
      expect(wordCount("the quick brown fox")).toBe(4);
    });

    it("should handle multiple spaces", () => {
      expect(wordCount("one   two   three")).toBe(3);
    });

    it("should handle leading/trailing spaces", () => {
      expect(wordCount("  one two  ")).toBe(2);
    });

    it("should handle empty string", () => {
      expect(wordCount("")).toBe(1); // split creates one empty string
    });
  });

  describe("reverse", () => {
    it("should reverse strings", () => {
      expect(reverse("hello")).toBe("olleh");
      expect(reverse("world")).toBe("dlrow");
      expect(reverse("12345")).toBe("54321");
    });

    it("should handle single character", () => {
      expect(reverse("a")).toBe("a");
    });

    it("should handle empty string", () => {
      expect(reverse("")).toBe("");
    });

    it("should handle palindromes", () => {
      expect(reverse("racecar")).toBe("racecar");
    });
  });
});
