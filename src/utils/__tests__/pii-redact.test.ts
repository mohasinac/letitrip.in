import { redactPii } from "../pii-redact";

describe("redactPii", () => {
  it("returns primitives unchanged", () => {
    expect(redactPii(null)).toBeNull();
    expect(redactPii(undefined)).toBeUndefined();
    expect(redactPii(42)).toBe(42);
    expect(redactPii("hello")).toBe("hello");
    expect(redactPii(true)).toBe(true);
  });

  it("does not mutate the original object", () => {
    const original = { email: "user@example.com", safe: "ok" };
    const result = redactPii(original);
    expect(original.email).toBe("user@example.com");
    expect((result as any).email).not.toBe("user@example.com");
  });

  // ── Secret keys → [REDACTED] ──────────────────────────────────

  it.each([
    "password",
    "secret",
    "apiKey",
    "apiSecret",
    "token",
    "refreshToken",
    "accessToken",
    "authorization",
    "cookie",
    "sessionToken",
    "accountNumber",
    "ifscCode",
    "upiId",
    "bankAccount",
    "pan",
    "panNumber",
    "aadhar",
    "aadhaar",
    "ssn",
    "gstin",
    "gstNumber",
    "addressLine1",
    "addressLine2",
    "address",
    "shippingAddress",
    "postalCode",
    "pincode",
    "zipCode",
  ])("fully redacts secret key '%s'", (key) => {
    const result = redactPii({ [key]: "sensitive-value" }) as Record<
      string,
      unknown
    >;
    expect(result[key]).toBe("[REDACTED]");
  });

  // ── Email masking ─────────────────────────────────────────────

  it.each(["email", "userEmail", "sellerEmail", "shiprocketEmail"])(
    "masks email key '%s'",
    (key) => {
      const result = redactPii({ [key]: "john@example.com" }) as Record<
        string,
        unknown
      >;
      expect(result[key]).toBe("jo***@example.com");
    },
  );

  it("masks short local part emails", () => {
    const result = redactPii({ email: "a@x.com" }) as any;
    expect(result.email).toBe("a***@x.com");
  });

  it("redacts invalid email without @", () => {
    const result = redactPii({ email: "no-at-sign" }) as any;
    expect(result.email).toBe("[REDACTED]");
  });

  // ── Phone masking ─────────────────────────────────────────────

  it.each(["phone", "phoneNumber", "mobileNumber"])(
    "masks phone key '%s'",
    (key) => {
      const result = redactPii({ [key]: "+91-9876543210" }) as Record<
        string,
        unknown
      >;
      expect(result[key]).toBe("***3210");
    },
  );

  it("redacts very short phone numbers", () => {
    const result = redactPii({ phone: "12" }) as any;
    expect(result.phone).toBe("[REDACTED]");
  });

  // ── Name masking ──────────────────────────────────────────────

  it.each(["displayName", "fullName", "firstName", "lastName", "userName"])(
    "masks name key '%s'",
    (key) => {
      const result = redactPii({ [key]: "John" }) as Record<string, unknown>;
      expect(result[key]).toBe("J***");
    },
  );

  it("redacts single-char names", () => {
    const result = redactPii({ displayName: "J" }) as any;
    expect(result.displayName).toBe("[REDACTED]");
  });

  // ── IP masking ────────────────────────────────────────────────

  it.each(["ip", "ipAddress"])("masks IPv4 key '%s'", (key) => {
    const result = redactPii({ [key]: "192.168.1.42" }) as Record<
      string,
      unknown
    >;
    expect(result[key]).toBe("192.***.***.***");
  });

  it("fully redacts non-IPv4 IP values", () => {
    const result = redactPii({ ip: "::1" }) as any;
    expect(result.ip).toBe("[REDACTED]");
  });

  // ── Safe keys pass through ────────────────────────────────────

  it("passes through non-sensitive keys", () => {
    const input = { orderId: "ORD123", status: "completed", count: 5 };
    expect(redactPii(input)).toEqual(input);
  });

  // ── Nested objects ────────────────────────────────────────────

  it("recursively redacts nested objects", () => {
    const result = redactPii({
      user: { email: "deep@test.com", displayName: "Alice" },
      orderId: "ORD1",
    }) as any;

    expect(result.user.email).toBe("de***@test.com");
    expect(result.user.displayName).toBe("A****");
    expect(result.orderId).toBe("ORD1");
  });

  // ── Arrays ────────────────────────────────────────────────────

  it("redacts inside arrays", () => {
    const result = redactPii([
      { email: "a@b.com" },
      { email: "c@d.com" },
    ]) as any[];

    expect(result[0].email).toBe("a***@b.com");
    expect(result[1].email).toBe("c***@d.com");
  });

  // ── Depth limit ───────────────────────────────────────────────

  it("stops at max depth and returns [MAX_DEPTH]", () => {
    // Build a deeply nested structure > 10 levels
    let obj: any = { email: "deep@test.com" };
    for (let i = 0; i < 12; i++) {
      obj = { nested: obj };
    }
    const result = redactPii(obj) as any;
    // At depth 11+, it should return "[MAX_DEPTH]"
    let cursor = result;
    for (let i = 0; i < 10; i++) {
      cursor = cursor.nested;
    }
    expect(cursor.nested).toBe("[MAX_DEPTH]");
  });
});
