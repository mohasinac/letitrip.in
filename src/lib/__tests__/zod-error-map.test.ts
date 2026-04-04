/**
 * Tests for the Zod v4 global error map.
 *
 * Tests the zodErrorMap function directly (without going through z.setErrorMap)
 * to avoid module-level side-effects interfering with the test suite.
 */

import { zodErrorMap, setupZodErrorMap } from "@mohasinac/validation";

// Helper: simulate a minimal Zod-like raw issue
function makeIssue(
  code: string,
  extras: Record<string, unknown> = {},
): Parameters<typeof zodErrorMap>[0] {
  return {
    code,
    path: [],
    message: "default",
    input: undefined,
    ...extras,
  } as Parameters<typeof zodErrorMap>[0];
}

describe("zodErrorMap", () => {
  // ----------------------------------------------------------------
  // invalid_type
  // ----------------------------------------------------------------
  describe("invalid_type", () => {
    it("returns REQUIRED message when input is undefined", () => {
      const result = zodErrorMap(
        makeIssue("invalid_type", { input: undefined }),
      );
      expect(result.message).toBeTruthy();
      expect(result.message.length).toBeGreaterThan(0);
    });

    it("returns REQUIRED message when input is null", () => {
      const result = zodErrorMap(makeIssue("invalid_type", { input: null }));
      expect(result.message).toBeTruthy();
    });

    it("returns generic message for non-null mismatches", () => {
      const result = zodErrorMap(
        makeIssue("invalid_type", { input: 123, expected: "string" }),
      );
      expect(result.message).toBeTruthy();
    });
  });

  // ----------------------------------------------------------------
  // too_small
  // ----------------------------------------------------------------
  describe("too_small", () => {
    it("returns REQUIRED message for string min(1)", () => {
      const result = zodErrorMap(
        makeIssue("too_small", { origin: "string", minimum: 1 }),
      );
      expect(result.message).toBeTruthy();
    });

    it("returns character count message for string min > 1", () => {
      const result = zodErrorMap(
        makeIssue("too_small", { origin: "string", minimum: 5 }),
      );
      expect(result.message).toMatch(/5 character/i);
    });

    it("returns item count for array min", () => {
      const result = zodErrorMap(
        makeIssue("too_small", { origin: "array", minimum: 2 }),
      );
      expect(result.message).toMatch(/2 item/i);
    });

    it("returns numeric minimum for number min", () => {
      const result = zodErrorMap(
        makeIssue("too_small", { origin: "number", minimum: 10 }),
      );
      expect(result.message).toMatch(/10/);
    });
  });

  // ----------------------------------------------------------------
  // too_big
  // ----------------------------------------------------------------
  describe("too_big", () => {
    it("returns character count for string max", () => {
      const result = zodErrorMap(
        makeIssue("too_big", { origin: "string", maximum: 100 }),
      );
      expect(result.message).toMatch(/100 character/i);
    });

    it("returns item count for array max", () => {
      const result = zodErrorMap(
        makeIssue("too_big", { origin: "array", maximum: 3 }),
      );
      expect(result.message).toMatch(/3 item/i);
    });

    it("returns numeric maximum for number max", () => {
      const result = zodErrorMap(
        makeIssue("too_big", { origin: "number", maximum: 50 }),
      );
      expect(result.message).toMatch(/50/);
    });
  });

  // ----------------------------------------------------------------
  // invalid_format (Zod v4 replaces invalid_string)
  // ----------------------------------------------------------------
  describe("invalid_format", () => {
    it("returns email message for email format", () => {
      const result = zodErrorMap(
        makeIssue("invalid_format", { format: "email" }),
      );
      expect(result.message.toLowerCase()).toMatch(/email|valid/);
    });

    it("returns URL message for url format", () => {
      const result = zodErrorMap(
        makeIssue("invalid_format", { format: "url" }),
      );
      expect(result.message.toLowerCase()).toMatch(/url/i);
    });

    it("returns ID message for uuid format", () => {
      const result = zodErrorMap(
        makeIssue("invalid_format", { format: "uuid" }),
      );
      expect(result.message.toLowerCase()).toMatch(/id|format/i);
    });

    it("returns format-named message for unknown formats", () => {
      const result = zodErrorMap(
        makeIssue("invalid_format", { format: "myformat" }),
      );
      expect(result.message).toMatch(/myformat/i);
    });
  });

  // ----------------------------------------------------------------
  // invalid_value (Zod v4 replaces invalid_enum_value)
  // ----------------------------------------------------------------
  describe("invalid_value", () => {
    it("lists expected values when provided", () => {
      const result = zodErrorMap(
        makeIssue("invalid_value", { values: ["a", "b", "c"] }),
      );
      expect(result.message).toMatch(/a.*b.*c/i);
    });

    it("returns fallback message with no values", () => {
      const result = zodErrorMap(makeIssue("invalid_value", { values: [] }));
      expect(result.message).toBeTruthy();
    });
  });

  // ----------------------------------------------------------------
  // custom
  // ----------------------------------------------------------------
  describe("custom", () => {
    it("passes custom messages through", () => {
      const result = zodErrorMap(
        makeIssue("custom", { message: "My custom error" }),
      );
      expect(result.message).toBe("My custom error");
    });
  });

  // ----------------------------------------------------------------
  // unknown codes
  // ----------------------------------------------------------------
  describe("unknown code", () => {
    it("returns a fallback message for unknown issue codes", () => {
      const result = zodErrorMap(makeIssue("some_future_code"));
      expect(result.message).toBeTruthy();
    });
  });
});

// ----------------------------------------------------------------
// setupZodErrorMap idempotency
// ----------------------------------------------------------------
describe("setupZodErrorMap", () => {
  it("can be called multiple times without throwing", () => {
    expect(() => {
      setupZodErrorMap();
      setupZodErrorMap();
      setupZodErrorMap();
    }).not.toThrow();
  });
});
