# Security Test Specifications

## Overview

Security testing specifications for vulnerability assessment, penetration testing, and compliance verification of the JustForView auction platform.

---

## Security Testing Categories

### 1. Authentication & Authorization

### 2. Input Validation & Injection

### 3. Session Management

### 4. Data Protection

### 5. API Security

### 6. Business Logic Security

### 7. Infrastructure Security

---

## 1. Authentication & Authorization Tests

### Authentication Tests

```typescript
describe("Authentication Security", () => {
  describe("Password Security", () => {
    it("should reject weak passwords", async () => {
      const weakPasswords = ["123456", "password", "qwerty", "abc123", "short"];

      for (const password of weakPasswords) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password,
            name: "Test User",
          }),
        });
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toContain("password");
      }
    });

    it("should not return password in any response", async () => {
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const json = await res.json();
      expect(json.data.password).toBeUndefined();
      expect(json.data.passwordHash).toBeUndefined();
    });

    it("should hash passwords before storage", async () => {
      // Verify via direct DB check that passwords are hashed
      const user = await getUser("test@example.com");
      expect(user.password).not.toBe("plaintextPassword");
      expect(user.password).toMatch(/^\$2[aby]?\$\d{1,2}\$/); // bcrypt format
    });
  });

  describe("Brute Force Protection", () => {
    it("should rate limit login attempts", async () => {
      const attempts = Array(10).fill(null);

      for (const _ of attempts) {
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "wrongpassword",
          }),
        });
      }

      // Next attempt should be rate limited
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      });
      expect(res.status).toBe(429);
    });

    it("should lock account after too many failed attempts", async () => {
      // After 10 failed attempts, account should be temporarily locked
      // Implementation varies
    });
  });

  describe("Token Security", () => {
    it("should reject expired tokens", async () => {
      const expiredToken = generateExpiredToken();
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });
      expect(res.status).toBe(401);
    });

    it("should reject malformed tokens", async () => {
      const malformedTokens = [
        "invalid",
        "Bearer",
        "Bearer invalid.token",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid",
      ];

      for (const token of malformedTokens) {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: token },
        });
        expect(res.status).toBe(401);
      }
    });

    it("should reject tokens signed with wrong secret", async () => {
      const wrongSecret = jwt.sign(
        { userId: "user_123", role: "admin" },
        "wrongsecret",
      );
      const res = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${wrongSecret}` },
      });
      expect(res.status).toBe(401);
    });

    it("should not accept tokens in URL parameters", async () => {
      // Tokens in URLs can be logged and leaked
      const res = await fetch(`/api/user/profile?token=${userToken}`);
      expect(res.status).toBe(401);
    });
  });
});
```

### Authorization Tests (RBAC)

```typescript
describe("Authorization Security (RBAC)", () => {
  describe("Role Escalation Prevention", () => {
    it("should prevent user from accessing admin endpoints", async () => {
      const res = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(res.status).toBe(403);
    });

    it("should prevent seller from modifying other seller's products", async () => {
      const res = await fetch("/api/products/other_seller_product", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Hacked Product" }),
      });
      expect(res.status).toBe(403);
    });

    it("should prevent user from modifying their role", async () => {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "admin" }),
      });
      expect(res.status).toBe(403);
      // Or role field should be ignored
    });

    it("should prevent user from accessing other user's orders", async () => {
      const res = await fetch("/api/orders/other_user_order", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(res.status).toBe(404); // Or 403
    });
  });

  describe("IDOR Prevention", () => {
    it("should prevent accessing other user's profile via ID manipulation", async () => {
      const res = await fetch("/api/users/other_user_id", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(res.status).toBe(403);
    });

    it("should prevent accessing other user's notifications", async () => {
      const res = await fetch("/api/notifications/other_user_notif", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(res.status).toBe(404);
    });

    it("should prevent viewing other user's cart", async () => {
      const res = await fetch("/api/cart?user_id=other_user", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      // Should ignore the user_id param and return own cart
      const json = await res.json();
      expect(json.data.userId).toBe(currentUserId);
    });
  });
});
```

---

## 2. Input Validation & Injection Tests

### SQL/NoSQL Injection

```typescript
describe("Injection Prevention", () => {
  describe("NoSQL Injection", () => {
    const injectionPayloads = [
      { $gt: "" },
      { $ne: null },
      { $where: "1==1" },
      { $regex: ".*" },
      "'; db.users.drop(); //",
      '{"$or": [{}]}',
    ];

    it("should sanitize query parameters", async () => {
      for (const payload of injectionPayloads) {
        const res = await fetch(
          `/api/products?category=${encodeURIComponent(
            JSON.stringify(payload),
          )}`,
        );
        expect(res.status).not.toBe(500);
        // Should not return unfiltered data
      }
    });

    it("should sanitize request body", async () => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: { $gt: "" },
          price: { $where: "this.price > 0" },
        }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("XSS Prevention", () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '"><script>alert("XSS")</script>',
      "'-alert(1)-'",
      '<svg/onload=alert("XSS")>',
    ];

    it("should sanitize user input in product names", async () => {
      for (const payload of xssPayloads) {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sellerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: payload,
            price: 1000,
            // ... other fields
          }),
        });

        if (res.status === 200 || res.status === 201) {
          const json = await res.json();
          expect(json.data.name).not.toContain("<script>");
          expect(json.data.name).not.toContain("onerror=");
        }
      }
    });

    it("should sanitize review content", async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: "prod_001",
          rating: 5,
          content: "<script>document.cookie</script>",
        }),
      });

      const json = await res.json();
      expect(json.data?.content).not.toContain("<script>");
    });
  });

  describe("Command Injection", () => {
    const cmdPayloads = [
      "; ls -la",
      "| cat /etc/passwd",
      "`whoami`",
      "$(cat /etc/passwd)",
      "& ping -c 10 attacker.com",
    ];

    it("should sanitize file names", async () => {
      for (const payload of cmdPayloads) {
        const formData = new FormData();
        formData.append("file", new Blob(["test"]), `image${payload}.jpg`);

        const res = await fetch("/api/media/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${sellerToken}` },
          body: formData,
        });

        expect(res.status).toBe(400);
        // Or filename should be sanitized
      }
    });
  });

  describe("Path Traversal", () => {
    const traversalPayloads = [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32\\config\\sam",
      "....//....//....//etc/passwd",
      "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    ];

    it("should prevent path traversal in file access", async () => {
      for (const payload of traversalPayloads) {
        const res = await fetch(`/api/media/${encodeURIComponent(payload)}`);
        expect(res.status).toBe(400);
        expect(res.status).not.toBe(200);
      }
    });
  });
});
```

---

## 3. Session Management Tests

```typescript
describe("Session Management Security", () => {
  describe("Session Handling", () => {
    it("should invalidate session on logout", async () => {
      // Get initial token
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
      const { token } = await loginRes.json();

      // Verify token works
      let profileRes = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(profileRes.status).toBe(200);

      // Logout
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Token should no longer work
      profileRes = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(profileRes.status).toBe(401);
    });

    it("should invalidate all sessions on password change", async () => {
      // Login from multiple "devices"
      const tokens = await Promise.all([
        login("test@example.com", "password123"),
        login("test@example.com", "password123"),
      ]);

      // Change password using first token
      await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens[0]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: "password123",
          newPassword: "newPassword123!",
        }),
      });

      // All old tokens should be invalid
      for (const token of tokens) {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect(res.status).toBe(401);
      }
    });

    it("should limit concurrent sessions", async () => {
      // Platform may limit to N concurrent sessions
      const MAX_SESSIONS = 5;
      const tokens = [];

      for (let i = 0; i < MAX_SESSIONS + 2; i++) {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        });
        const { token } = await res.json();
        tokens.push(token);
      }

      // Oldest sessions should be invalidated
      const oldestRes = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${tokens[0]}` },
      });
      expect(oldestRes.status).toBe(401);
    });
  });

  describe("Cookie Security", () => {
    it("should set secure cookies in production", async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const cookies = res.headers.get("set-cookie");
      if (cookies) {
        expect(cookies).toContain("Secure");
        expect(cookies).toContain("HttpOnly");
        expect(cookies).toContain("SameSite=Strict");
      }
    });
  });
});
```

---

## 4. Data Protection Tests

```typescript
describe("Data Protection", () => {
  describe("Sensitive Data Exposure", () => {
    it("should not expose sensitive user data in public endpoints", async () => {
      const res = await fetch("/api/users/user_123");
      const json = await res.json();

      expect(json.data.email).toBeUndefined();
      expect(json.data.phone).toBeUndefined();
      expect(json.data.password).toBeUndefined();
      expect(json.data.addresses).toBeUndefined();
    });

    it("should mask sensitive data in responses", async () => {
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const json = await res.json();

      // Phone should be partially masked
      if (json.data.phone) {
        expect(json.data.phone).toMatch(/^\*{6}\d{4}$/);
      }
    });

    it("should not expose payment details", async () => {
      const res = await fetch("/api/payments/payment_001", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const json = await res.json();

      expect(json.data.cardNumber).toBeUndefined();
      expect(json.data.cvv).toBeUndefined();
      // Masked card number is ok
      expect(json.data.lastFourDigits).toBeDefined();
    });
  });

  describe("Error Message Security", () => {
    it("should not expose stack traces in production", async () => {
      const res = await fetch("/api/products/invalid-id-that-causes-error");
      const json = await res.json();

      expect(json.stack).toBeUndefined();
      expect(json.error).not.toContain("at ");
      expect(json.error).not.toContain("node_modules");
    });

    it("should use generic error messages for auth failures", async () => {
      // Should not reveal if email exists
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "password",
        }),
      });
      const json = await res.json();

      expect(json.error).toBe("Invalid credentials");
      expect(json.error).not.toContain("email not found");
    });
  });

  describe("Data Encryption", () => {
    it("should encrypt sensitive fields at rest", async () => {
      // Direct database check
      const user = await getDirectDbUser("test@example.com");

      // Phone/address should be encrypted
      expect(user.phone).not.toMatch(/^\d{10}$/);
      expect(user.encrypted_fields).toBeDefined();
    });
  });
});
```

---

## 5. API Security Tests

```typescript
describe("API Security", () => {
  describe("Rate Limiting", () => {
    it("should rate limit API requests", async () => {
      const requests = Array(150).fill(null);
      const responses = await Promise.all(
        requests.map(() => fetch("/api/products")),
      );

      const rateLimited = responses.filter((r) => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it("should have stricter limits for auth endpoints", async () => {
      const requests = Array(20).fill(null);
      const responses = await Promise.all(
        requests.map(() =>
          fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "test@example.com",
              password: "wrong",
            }),
          }),
        ),
      );

      const rateLimited = responses.filter((r) => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe("CORS", () => {
    it("should reject requests from unauthorized origins", async () => {
      const res = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${userToken}`,
          Origin: "https://evil.com",
        },
      });

      expect(res.headers.get("Access-Control-Allow-Origin")).not.toBe("*");
      expect(res.headers.get("Access-Control-Allow-Origin")).not.toBe(
        "https://evil.com",
      );
    });

    it("should not allow credentials with wildcard origin", async () => {
      const corsOrigin = res.headers.get("Access-Control-Allow-Origin");
      const corsCredentials = res.headers.get(
        "Access-Control-Allow-Credentials",
      );

      if (corsCredentials === "true") {
        expect(corsOrigin).not.toBe("*");
      }
    });
  });

  describe("HTTP Security Headers", () => {
    it("should set security headers", async () => {
      const res = await fetch("/api/products");

      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("X-Frame-Options")).toBe("DENY");
      expect(res.headers.get("X-XSS-Protection")).toBe("1; mode=block");
    });

    it("should set strict transport security", async () => {
      const res = await fetch("https://api.justforview.in/products");

      expect(res.headers.get("Strict-Transport-Security")).toContain(
        "max-age=",
      );
    });
  });

  describe("Request Validation", () => {
    it("should validate content-type", async () => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "text/plain",
        },
        body: "not json",
      });

      expect(res.status).toBe(400);
    });

    it("should reject oversized requests", async () => {
      const largePayload = "x".repeat(10 * 1024 * 1024); // 10MB

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: largePayload }),
      });

      expect(res.status).toBe(413);
    });
  });
});
```

---

## 6. Business Logic Security

```typescript
describe("Business Logic Security", () => {
  describe("Auction Integrity", () => {
    it("should prevent bidding below current bid", async () => {
      // Get current bid
      const auctionRes = await fetch("/api/auctions/auc_001");
      const { data: auction } = await auctionRes.json();

      // Attempt lower bid
      const bidRes = await fetch("/api/auctions/auc_001/bids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: auction.currentBid - 100 }),
      });

      expect(bidRes.status).toBe(400);
    });

    it("should prevent seller from bidding on own auction", async () => {
      const res = await fetch("/api/auctions/seller_own_auction/bids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 100000 }),
      });

      expect(res.status).toBe(403);
    });

    it("should prevent bidding on ended auctions", async () => {
      const res = await fetch("/api/auctions/ended_auction/bids", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 100000 }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("Price Manipulation Prevention", () => {
    it("should not allow negative prices", async () => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Test", price: -100 }),
      });

      expect(res.status).toBe(400);
    });

    it("should not allow modifying order total", async () => {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressId: "addr_001",
          total: 100, // Attempt to set custom total
        }),
      });

      const json = await res.json();
      // Total should be calculated server-side
      expect(json.data.total).not.toBe(100);
    });
  });

  describe("Coupon Abuse Prevention", () => {
    it("should prevent using same coupon twice", async () => {
      // Use coupon first time
      await fetch("/api/cart/apply-coupon", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: "ONCE10" }),
      });

      // Complete order
      await createOrder();

      // Try using same coupon again
      const res = await fetch("/api/cart/apply-coupon", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: "ONCE10" }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("already used");
    });

    it("should prevent applying multiple coupons", async () => {
      await fetch("/api/cart/apply-coupon", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: "DISCOUNT10" }),
      });

      const res = await fetch("/api/cart/apply-coupon", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: "DISCOUNT20" }),
      });

      // Should either replace or reject
      expect(res.status).toBe(400);
    });
  });
});
```

---

## 7. Infrastructure Security

### Security Scanning Tools

```yaml
# GitHub Actions security workflow
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm audit --audit-level=high
      - run: npx snyk test

  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: p/typescript

  secrets-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
```

---

## Security Checklist

### Pre-Deployment

- [ ] All dependencies updated to latest secure versions
- [ ] npm audit shows no high/critical vulnerabilities
- [ ] Environment variables properly configured (not in code)
- [ ] API keys and secrets rotated
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Security headers set
- [ ] Error messages don't leak information
- [ ] All authentication tests pass
- [ ] All authorization tests pass
- [ ] Input validation tests pass
- [ ] Session management tests pass

### Regular Audits

- [ ] Quarterly dependency audit
- [ ] Quarterly penetration testing
- [ ] Monthly access review
- [ ] Weekly vulnerability scanning
- [ ] Daily log monitoring

---

## Compliance Requirements

### PCI-DSS (Payment)

- Payment data not stored on our servers (use Razorpay tokenization)
- All payment forms served over HTTPS
- Access logs maintained for 1 year

### GDPR/Privacy

- User data export functionality
- User data deletion functionality
- Consent management
- Privacy policy accessible

### Data Retention

| Data Type     | Retention Period |
| ------------- | ---------------- |
| User accounts | Until deletion   |
| Order data    | 7 years          |
| Payment logs  | 7 years          |
| Access logs   | 1 year           |
| Session data  | 30 days          |
| Notifications | 90 days          |
