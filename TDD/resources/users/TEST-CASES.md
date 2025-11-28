# Users Resource - Test Cases

## Unit Tests

### Authentication Tests

#### auth.service.test.ts

```typescript
describe("AuthService", () => {
  describe("register", () => {
    it("should register a new user with valid data", async () => {
      const data = {
        email: "test@example.com",
        password: "SecurePass123!",
        displayName: "Test User",
      };

      const result = await authService.register(data);

      expect(result.success).toBe(true);
      expect(result.data.email).toBe(data.email);
      expect(result.data.role).toBe("user");
    });

    it("should reject registration with invalid email", async () => {
      const data = {
        email: "invalid-email",
        password: "SecurePass123!",
        displayName: "Test User",
      };

      await expect(authService.register(data)).rejects.toThrow("Invalid email");
    });

    it("should reject registration with weak password", async () => {
      const data = {
        email: "test@example.com",
        password: "weak",
        displayName: "Test User",
      };

      await expect(authService.register(data)).rejects.toThrow(
        "Password too weak"
      );
    });

    it("should reject duplicate email registration", async () => {
      const data = {
        email: "existing@example.com",
        password: "SecurePass123!",
        displayName: "Test User",
      };

      await expect(authService.register(data)).rejects.toThrow(
        "Email already registered"
      );
    });
  });

  describe("login", () => {
    it("should login with valid credentials", async () => {
      const result = await authService.login({
        email: "user@test.jfv.in",
        password: "TestPass123!",
      });

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(result.data.token).toBeDefined();
    });

    it("should reject invalid password", async () => {
      await expect(
        authService.login({
          email: "user@test.jfv.in",
          password: "WrongPass",
        })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should reject banned user login", async () => {
      await expect(
        authService.login({
          email: "banned@test.jfv.in",
          password: "TestPass123!",
        })
      ).rejects.toThrow("Account banned");
    });
  });

  describe("logout", () => {
    it("should successfully logout authenticated user", async () => {
      const result = await authService.logout();
      expect(result.success).toBe(true);
    });
  });

  describe("getSession", () => {
    it("should return session for authenticated user", async () => {
      const session = await authService.getSession();

      expect(session.uid).toBeDefined();
      expect(session.email).toBeDefined();
      expect(session.role).toBeDefined();
    });

    it("should return null for unauthenticated user", async () => {
      const session = await authService.getSession();
      expect(session).toBeNull();
    });
  });
});
```

---

### Profile Tests

#### users.service.test.ts

```typescript
describe("UsersService - Profile", () => {
  describe("getProfile", () => {
    it("should return current user profile", async () => {
      const profile = await usersService.getProfile();

      expect(profile.uid).toBeDefined();
      expect(profile.email).toBeDefined();
      expect(profile.displayName).toBeDefined();
    });

    it("should require authentication", async () => {
      // With no auth token
      await expect(usersService.getProfile()).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateProfile", () => {
    it("should update display name", async () => {
      const result = await usersService.updateProfile({
        displayName: "New Name",
      });

      expect(result.displayName).toBe("New Name");
    });

    it("should update phone number", async () => {
      const result = await usersService.updateProfile({
        phone: "+919876543211",
      });

      expect(result.phone).toBe("+919876543211");
    });

    it("should reject invalid phone format", async () => {
      await expect(
        usersService.updateProfile({
          phone: "invalid-phone",
        })
      ).rejects.toThrow("Invalid phone number");
    });

    it("should reject too short display name", async () => {
      await expect(
        usersService.updateProfile({
          displayName: "A",
        })
      ).rejects.toThrow("Display name too short");
    });
  });
});
```

---

### Address Tests

```typescript
describe("UsersService - Addresses", () => {
  describe("getAddresses", () => {
    it("should return user addresses", async () => {
      const addresses = await usersService.getAddresses();

      expect(Array.isArray(addresses)).toBe(true);
    });

    it("should return empty array for new user", async () => {
      const addresses = await usersService.getAddresses();
      expect(addresses).toHaveLength(0);
    });
  });

  describe("addAddress", () => {
    it("should add valid address", async () => {
      const address = {
        type: "home",
        name: "John Doe",
        phone: "+919876543210",
        addressLine1: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      };

      const result = await usersService.addAddress(address);

      expect(result.id).toBeDefined();
      expect(result.name).toBe(address.name);
    });

    it("should set first address as default", async () => {
      const address = {
        type: "home",
        name: "John Doe",
        phone: "+919876543210",
        addressLine1: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      };

      const result = await usersService.addAddress(address);
      expect(result.isDefault).toBe(true);
    });

    it("should reject invalid pincode", async () => {
      const address = {
        type: "home",
        name: "John Doe",
        phone: "+919876543210",
        addressLine1: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "12345", // Invalid - should be 6 digits
      };

      await expect(usersService.addAddress(address)).rejects.toThrow(
        "Invalid pincode"
      );
    });

    it("should reject invalid state", async () => {
      const address = {
        type: "home",
        name: "John Doe",
        phone: "+919876543210",
        addressLine1: "123 Main Street",
        city: "Mumbai",
        state: "InvalidState",
        pincode: "400001",
      };

      await expect(usersService.addAddress(address)).rejects.toThrow(
        "Invalid state"
      );
    });
  });

  describe("updateAddress", () => {
    it("should update address", async () => {
      const result = await usersService.updateAddress("addr_001", {
        phone: "+919876543211",
      });

      expect(result.phone).toBe("+919876543211");
    });

    it("should reject update of non-existent address", async () => {
      await expect(
        usersService.updateAddress("non_existent", { phone: "+919876543211" })
      ).rejects.toThrow("Address not found");
    });

    it("should reject update of another user's address", async () => {
      await expect(
        usersService.updateAddress("other_user_addr", {
          phone: "+919876543211",
        })
      ).rejects.toThrow("Access denied");
    });
  });

  describe("deleteAddress", () => {
    it("should delete address", async () => {
      await usersService.deleteAddress("addr_001");
      // Verify deletion
    });

    it("should reject deletion of non-existent address", async () => {
      await expect(usersService.deleteAddress("non_existent")).rejects.toThrow(
        "Address not found"
      );
    });
  });
});
```

---

### Admin User Management Tests

```typescript
describe("UsersService - Admin", () => {
  beforeEach(() => {
    // Set admin auth context
  });

  describe("list", () => {
    it("should list users with pagination", async () => {
      const result = await usersService.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.meta.page).toBe(1);
      expect(result.meta.total).toBeGreaterThan(0);
    });

    it("should filter by role", async () => {
      const result = await usersService.list({ role: "seller" });

      result.data.forEach((user) => {
        expect(user.role).toBe("seller");
      });
    });

    it("should search by email", async () => {
      const result = await usersService.list({ search: "test@" });

      result.data.forEach((user) => {
        expect(user.email).toContain("test@");
      });
    });

    it("should reject non-admin access", async () => {
      // With user auth
      await expect(usersService.list({})).rejects.toThrow("Access denied");
    });
  });

  describe("getById", () => {
    it("should get user by ID", async () => {
      const user = await usersService.getById("test_user_001");

      expect(user.uid).toBe("test_user_001");
    });

    it("should return 404 for non-existent user", async () => {
      await expect(usersService.getById("non_existent")).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("updateRole", () => {
    it("should update user role to seller", async () => {
      const result = await usersService.updateRole("test_user_001", "seller");
      expect(result.role).toBe("seller");
    });

    it("should reject invalid role", async () => {
      await expect(
        usersService.updateRole("test_user_001", "invalid_role")
      ).rejects.toThrow("Invalid role");
    });

    it("should reject self role change", async () => {
      await expect(
        usersService.updateRole("current_admin_id", "user")
      ).rejects.toThrow("Cannot change own role");
    });
  });

  describe("ban", () => {
    it("should ban user", async () => {
      const result = await usersService.ban("test_user_001", {
        reason: "Spam",
      });

      expect(result.isBanned).toBe(true);
      expect(result.banReason).toBe("Spam");
    });

    it("should reject banning admin", async () => {
      await expect(
        usersService.ban("test_admin_001", { reason: "Test" })
      ).rejects.toThrow("Cannot ban admin");
    });
  });

  describe("unban", () => {
    it("should unban user", async () => {
      const result = await usersService.unban("test_user_003");
      expect(result.isBanned).toBe(false);
    });
  });

  describe("bulk", () => {
    it("should perform bulk ban", async () => {
      const result = await usersService.bulk({
        action: "ban",
        userIds: ["test_user_001", "test_user_002"],
        reason: "Bulk ban",
      });

      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
    });

    it("should handle partial failures", async () => {
      const result = await usersService.bulk({
        action: "ban",
        userIds: ["test_user_001", "non_existent"],
        reason: "Bulk ban",
      });

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);
    });
  });
});
```

---

## Integration Tests

### Registration Flow

```typescript
describe("User Registration Flow", () => {
  it("should complete full registration flow", async () => {
    // 1. Register
    const registerResult = await authService.register({
      email: "newuser@example.com",
      password: "SecurePass123!",
      displayName: "New User",
    });

    expect(registerResult.success).toBe(true);
    const userId = registerResult.data.uid;

    // 2. Login
    const loginResult = await authService.login({
      email: "newuser@example.com",
      password: "SecurePass123!",
    });

    expect(loginResult.success).toBe(true);

    // 3. Get profile
    const profile = await usersService.getProfile();
    expect(profile.uid).toBe(userId);

    // 4. Add address
    const address = await usersService.addAddress({
      type: "home",
      name: "New User",
      phone: "+919876543210",
      addressLine1: "123 Test Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    });

    expect(address.id).toBeDefined();

    // 5. Logout
    await authService.logout();
  });
});
```

---

### Admin User Management Flow

```typescript
describe("Admin User Management Flow", () => {
  beforeAll(async () => {
    // Login as admin
    await authService.login({
      email: "admin@test.jfv.in",
      password: "AdminPass123!",
    });
  });

  it("should manage user lifecycle", async () => {
    // 1. List users
    const users = await usersService.list({ page: 1 });
    expect(users.data.length).toBeGreaterThan(0);

    const targetUser = users.data[0];

    // 2. Get user details
    const userDetails = await usersService.getById(targetUser.uid);
    expect(userDetails.uid).toBe(targetUser.uid);

    // 3. Update role
    await usersService.updateRole(targetUser.uid, "seller");

    // 4. Verify role change
    const updated = await usersService.getById(targetUser.uid);
    expect(updated.role).toBe("seller");

    // 5. Ban user
    await usersService.ban(targetUser.uid, { reason: "Test ban" });

    // 6. Verify ban
    const banned = await usersService.getById(targetUser.uid);
    expect(banned.isBanned).toBe(true);

    // 7. Unban user
    await usersService.unban(targetUser.uid);

    // 8. Verify unban
    const unbanned = await usersService.getById(targetUser.uid);
    expect(unbanned.isBanned).toBe(false);
  });
});
```

---

## Test Coverage Targets

| Area               | Target | Priority |
| ------------------ | ------ | -------- |
| Authentication     | 95%    | Critical |
| Profile Management | 90%    | High     |
| Address Management | 85%    | Medium   |
| Admin Operations   | 90%    | High     |
| Input Validation   | 100%   | Critical |
| Error Handling     | 95%    | High     |

---

## Test Data Dependencies

- Requires test users from `TEST-DATA-REQUIREMENTS.md`
- Use `test_user_001`, `test_admin_001`, etc.
- Clean up created test data after tests
