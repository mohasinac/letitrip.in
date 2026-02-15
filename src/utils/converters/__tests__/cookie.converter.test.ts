/**
 * @jest-environment jsdom
 */

import {
  parseCookies,
  getCookie,
  hasCookie,
  deleteCookie,
} from "../cookie.converter";

describe("Cookie Converter", () => {
  beforeEach(() => {
    // Clear document.cookie before each test
    document.cookie.split(";").forEach((c) => {
      deleteCookie(c.split("=")[0]?.trim());
    });
  });

  afterEach(() => {
    // Clean up after each test
    document.cookie.split(";").forEach((c) => {
      deleteCookie(c.split("=")[0]?.trim());
    });
  });

  describe("parseCookies", () => {
    it("should return empty object when no cookies exist", () => {
      const result = parseCookies();
      expect(result).toEqual({});
    });

    it("should parse single cookie correctly", () => {
      document.cookie = "sessionId=abc123";
      const result = parseCookies();
      expect(result.sessionId).toBe("abc123");
    });

    it("should parse multiple cookies correctly", () => {
      document.cookie = "sessionId=abc123";
      document.cookie = "userId=user456";
      document.cookie = "theme=dark";
      const result = parseCookies();
      expect(result.sessionId).toBe("abc123");
      expect(result.userId).toBe("user456");
      expect(result.theme).toBe("dark");
    });

    it("should decode URI encoded cookie values", () => {
      document.cookie = `data=${encodeURIComponent("hello world")}`;
      const result = parseCookies();
      expect(result.data).toBe("hello world");
    });

    it("should handle cookie values with equals signs", () => {
      document.cookie = `token=${encodeURIComponent("abc=def=ghi")}`;
      const result = parseCookies();
      expect(result.token).toBe("abc=def=ghi");
    });

    it("should trim cookie names and values", () => {
      document.cookie = " spacedName = spacedValue ";
      const result = parseCookies();
      expect(Object.keys(result)).toContain("spacedName");
    });
  });

  describe("getCookie", () => {
    it("should return null when cookie does not exist", () => {
      const result = getCookie("nonexistent");
      expect(result).toBeNull();
    });

    it("should return cookie value when it exists", () => {
      document.cookie = "testCookie=testValue";
      const result = getCookie("testCookie");
      expect(result).toBe("testValue");
    });

    it("should return correct cookie from multiple cookies", () => {
      document.cookie = "cookie1=value1";
      document.cookie = "cookie2=value2";
      document.cookie = "cookie3=value3";
      const result = getCookie("cookie2");
      expect(result).toBe("value2");
    });

    it("should decode URI encoded cookie values", () => {
      document.cookie = `encoded=${encodeURIComponent("hello world")}`;
      const result = getCookie("encoded");
      expect(result).toBe("hello world");
    });

    it("should handle cookie values with equals signs", () => {
      document.cookie = `keyvalue=${encodeURIComponent("a=b=c")}`;
      const result = getCookie("keyvalue");
      expect(result).toBe("a=b=c");
    });

    it("should be case-sensitive", () => {
      document.cookie = "TestCookie=value";
      expect(getCookie("testcookie")).toBeNull();
      expect(getCookie("TestCookie")).toBe("value");
    });
  });

  describe("hasCookie", () => {
    it("should return false when cookie does not exist", () => {
      const result = hasCookie("missing");
      expect(result).toBe(false);
    });

    it("should return true when cookie exists", () => {
      document.cookie = "exists=true";
      const result = hasCookie("exists");
      expect(result).toBe(true);
    });

    it("should return true for any cookie in the set", () => {
      document.cookie = "cookie1=value1";
      document.cookie = "cookie2=value2";
      expect(hasCookie("cookie1")).toBe(true);
      expect(hasCookie("cookie2")).toBe(true);
    });

    it("should be case-sensitive", () => {
      document.cookie = "MyCookie=value";
      expect(hasCookie("mycookie")).toBe(false);
      expect(hasCookie("MyCookie")).toBe(true);
    });
  });

  describe("deleteCookie", () => {
    it("should delete an existing cookie", () => {
      document.cookie = "toDelete=value";
      expect(hasCookie("toDelete")).toBe(true);
      deleteCookie("toDelete");
      expect(hasCookie("toDelete")).toBe(false);
    });

    it("should not affect other cookies when deleting", () => {
      document.cookie = "keep1=value1";
      document.cookie = "delete=value";
      document.cookie = "keep2=value2";
      deleteCookie("delete");
      expect(hasCookie("keep1")).toBe(true);
      expect(hasCookie("keep2")).toBe(true);
      expect(hasCookie("delete")).toBe(false);
    });

    it("should handle deletion of non-existent cookie gracefully", () => {
      expect(() => deleteCookie("nonexistent")).not.toThrow();
    });

    it("should delete cookie with custom path", () => {
      document.cookie = "customPath=value; path=/";
      expect(hasCookie("customPath")).toBe(true);
      deleteCookie("customPath", "/");
      expect(hasCookie("customPath")).toBe(false);
    });

    it("should delete multiple cookies independently", () => {
      document.cookie = "first=1";
      document.cookie = "second=2";
      document.cookie = "third=3";
      deleteCookie("first");
      deleteCookie("third");
      expect(hasCookie("first")).toBe(false);
      expect(hasCookie("second")).toBe(true);
      expect(hasCookie("third")).toBe(false);
    });
  });

  describe("Integration", () => {
    it("should maintain state across multiple operations", () => {
      document.cookie = "auth=token123";
      expect(getCookie("auth")).toBe("token123");
      expect(hasCookie("auth")).toBe(true);

      document.cookie = "user=john";
      const cookies = parseCookies();
      expect(Object.keys(cookies).length).toBeGreaterThanOrEqual(2);

      deleteCookie("auth");
      expect(hasCookie("auth")).toBe(false);
      expect(hasCookie("user")).toBe(true);
    });

    it("should handle special characters in values", () => {
      const specialValue = "!@#$%^&*()_+-=[]{}|;:',.<>?/";
      document.cookie = `special=${encodeURIComponent(specialValue)}`;
      expect(getCookie("special")).toBe(specialValue);
    });
  });
});
