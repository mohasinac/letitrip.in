import {
  changePasswordSchema,
  loginSchema,
  otpVerificationSchema,
  registerSchema,
  userProfileSchema,
} from "../user.schema";

describe("User Validation Schemas", () => {
  describe("User Profile Schema", () => {
    const validProfileData = {
      fullName: "John Doe",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    };

    describe("Full Name validation", () => {
      it("should accept valid full names", () => {
        const result = userProfileSchema.safeParse(validProfileData);
        expect(result.success).toBe(true);
      });

      it("should reject too short names", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          fullName: "A",
        });
        expect(result.success).toBe(false);
      });

      it("should reject too long names", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          fullName: "A".repeat(101),
        });
        expect(result.success).toBe(false);
      });

      it("should handle special characters in names", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          fullName: "O'Connor-Smith Jr.",
        });
        expect(result.success).toBe(true);
      });

      it("should accept minimum length name", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          fullName: "Jo",
        });
        expect(result.success).toBe(true);
      });

      it("should accept maximum length name", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          fullName: "A".repeat(100),
        });
        expect(result.success).toBe(true);
      });
    });

    describe("First Name validation", () => {
      it("should require first name", () => {
        const { firstName, ...data } = validProfileData;
        const result = userProfileSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept valid first names", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          firstName: "Michael",
        });
        expect(result.success).toBe(true);
      });

      it("should reject too long first names", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          firstName: "A".repeat(51),
        });
        expect(result.success).toBe(false);
      });

      it("should reject empty first name", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          firstName: "",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Last Name validation", () => {
      it("should require last name", () => {
        const { lastName, ...data } = validProfileData;
        const result = userProfileSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept valid last names", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          lastName: "Smith",
        });
        expect(result.success).toBe(true);
      });

      it("should reject too long last names", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          lastName: "A".repeat(51),
        });
        expect(result.success).toBe(false);
      });

      it("should reject empty last name", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          lastName: "",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Display Name validation", () => {
      it("should handle optional display name", () => {
        const result = userProfileSchema.safeParse(validProfileData);
        expect(result.success).toBe(true);
      });

      it("should accept valid display names", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          displayName: "JohnnyD",
        });
        expect(result.success).toBe(true);
      });

      it("should reject too short display names", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          displayName: "A",
        });
        expect(result.success).toBe(false);
      });

      it("should reject too long display names", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          displayName: "A".repeat(51),
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Email validation", () => {
      it("should require email", () => {
        const { email, ...data } = validProfileData;
        const result = userProfileSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should accept valid email addresses", () => {
        const validEmails = [
          "user@example.com",
          "test.user@example.co.in",
          "user+tag@example.com",
        ];

        validEmails.forEach((email) => {
          const result = userProfileSchema.safeParse({
            ...validProfileData,
            email,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject invalid email formats", () => {
        const invalidEmails = [
          "notanemail",
          "@example.com",
          "user@",
          "user @example.com",
        ];

        invalidEmails.forEach((email) => {
          const result = userProfileSchema.safeParse({
            ...validProfileData,
            email,
          });
          expect(result.success).toBe(false);
        });
      });

      it("should reject too long emails", () => {
        const longEmail = "a".repeat(250) + "@example.com";
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          email: longEmail,
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Phone validation", () => {
      it("should handle optional phone", () => {
        const result = userProfileSchema.safeParse(validProfileData);
        expect(result.success).toBe(true);
      });

      it("should accept valid Indian phone numbers", () => {
        const validPhones = [
          "9876543210",
          "8123456789",
          "7012345678",
          "6543210987",
        ];

        validPhones.forEach((phone) => {
          const result = userProfileSchema.safeParse({
            ...validProfileData,
            phone,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject invalid phone formats", () => {
        const invalidPhones = [
          "123456789", // too short
          "12345678901", // too long
          "5123456789", // starts with 5
          "abcd123456", // contains letters
        ];

        invalidPhones.forEach((phone) => {
          const result = userProfileSchema.safeParse({
            ...validProfileData,
            phone,
          });
          expect(result.success).toBe(false);
        });
      });
    });

    describe("Bio validation", () => {
      it("should handle optional bio", () => {
        const result = userProfileSchema.safeParse(validProfileData);
        expect(result.success).toBe(true);
      });

      it("should accept valid bios", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          bio: "This is a short bio about me.",
        });
        expect(result.success).toBe(true);
      });

      it("should reject too long bios", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          bio: "A".repeat(501),
        });
        expect(result.success).toBe(false);
      });

      it("should accept maximum length bio", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          bio: "A".repeat(500),
        });
        expect(result.success).toBe(true);
      });
    });

    describe("Photo URL validation", () => {
      it("should handle optional photo URL", () => {
        const result = userProfileSchema.safeParse(validProfileData);
        expect(result.success).toBe(true);
      });

      it("should accept valid URLs", () => {
        const validURLs = [
          "https://example.com/photo.jpg",
          "http://cdn.example.com/avatar.png",
        ];

        validURLs.forEach((photoURL) => {
          const result = userProfileSchema.safeParse({
            ...validProfileData,
            photoURL,
          });
          expect(result.success).toBe(true);
        });
      });

      it("should reject invalid URLs", () => {
        const result = userProfileSchema.safeParse({
          ...validProfileData,
          photoURL: "not-a-url",
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Change Password Schema", () => {
    const validPasswordData = {
      currentPassword: "OldPass123!",
      newPassword: "NewPass456@",
      confirmPassword: "NewPass456@",
    };

    describe("Current Password validation", () => {
      it("should require current password", () => {
        const { currentPassword, ...data } = validPasswordData;
        const result = changePasswordSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject empty current password", () => {
        const result = changePasswordSchema.safeParse({
          ...validPasswordData,
          currentPassword: "",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("New Password validation", () => {
      it("should accept valid passwords", () => {
        const result = changePasswordSchema.safeParse(validPasswordData);
        expect(result.success).toBe(true);
      });

      it("should reject too short passwords", () => {
        const result = changePasswordSchema.safeParse({
          ...validPasswordData,
          newPassword: "Pass1!",
          confirmPassword: "Pass1!",
        });
        expect(result.success).toBe(false);
      });

      it("should require uppercase letter", () => {
        const result = changePasswordSchema.safeParse({
          ...validPasswordData,
          newPassword: "newpass456@",
          confirmPassword: "newpass456@",
        });
        expect(result.success).toBe(false);
      });

      it("should require lowercase letter", () => {
        const result = changePasswordSchema.safeParse({
          ...validPasswordData,
          newPassword: "NEWPASS456@",
          confirmPassword: "NEWPASS456@",
        });
        expect(result.success).toBe(false);
      });

      it("should require number", () => {
        const result = changePasswordSchema.safeParse({
          ...validPasswordData,
          newPassword: "NewPassword!",
          confirmPassword: "NewPassword!",
        });
        expect(result.success).toBe(false);
      });

      it("should require special character", () => {
        const result = changePasswordSchema.safeParse({
          ...validPasswordData,
          newPassword: "NewPass456",
          confirmPassword: "NewPass456",
        });
        expect(result.success).toBe(false);
      });

      it("should accept minimum length password", () => {
        const result = changePasswordSchema.safeParse({
          ...validPasswordData,
          newPassword: "Pass123!",
          confirmPassword: "Pass123!",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("Password confirmation", () => {
      it("should reject mismatched passwords", () => {
        const result = changePasswordSchema.safeParse({
          ...validPasswordData,
          confirmPassword: "Different123!",
        });
        expect(result.success).toBe(false);
      });

      it("should accept matched passwords", () => {
        const result = changePasswordSchema.safeParse(validPasswordData);
        expect(result.success).toBe(true);
      });
    });

    describe("Password reuse validation", () => {
      it("should reject same password as current", () => {
        const result = changePasswordSchema.safeParse({
          currentPassword: "SamePass123!",
          newPassword: "SamePass123!",
          confirmPassword: "SamePass123!",
        });
        expect(result.success).toBe(false);
      });

      it("should accept different password from current", () => {
        const result = changePasswordSchema.safeParse(validPasswordData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Register Schema", () => {
    const validRegisterData = {
      fullName: "John Doe",
      email: "john.doe@example.com",
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
      agreeToTerms: true,
    };

    describe("Full registration validation", () => {
      it("should accept valid registration data", () => {
        const result = registerSchema.safeParse(validRegisterData);
        expect(result.success).toBe(true);
      });

      it("should require all fields", () => {
        const result = registerSchema.safeParse({});
        expect(result.success).toBe(false);
      });
    });

    describe("Terms agreement validation", () => {
      it("should require terms agreement", () => {
        const result = registerSchema.safeParse({
          ...validRegisterData,
          agreeToTerms: false,
        });
        expect(result.success).toBe(false);
      });

      it("should accept terms agreement", () => {
        const result = registerSchema.safeParse(validRegisterData);
        expect(result.success).toBe(true);
      });
    });

    describe("Password confirmation", () => {
      it("should reject mismatched passwords", () => {
        const result = registerSchema.safeParse({
          ...validRegisterData,
          confirmPassword: "DifferentPass123!",
        });
        expect(result.success).toBe(false);
      });

      it("should accept matched passwords", () => {
        const result = registerSchema.safeParse(validRegisterData);
        expect(result.success).toBe(true);
      });
    });

    describe("Email uniqueness", () => {
      it("should accept properly formatted emails", () => {
        const emails = [
          "user@example.com",
          "user.name@example.co.in",
          "user+tag@example.com",
        ];

        emails.forEach((email) => {
          const result = registerSchema.safeParse({
            ...validRegisterData,
            email,
          });
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe("Login Schema", () => {
    const validLoginData = {
      email: "user@example.com",
      password: "password123",
    };

    describe("Basic login validation", () => {
      it("should accept valid login credentials", () => {
        const result = loginSchema.safeParse(validLoginData);
        expect(result.success).toBe(true);
      });

      it("should require email", () => {
        const { email, ...data } = validLoginData;
        const result = loginSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should require password", () => {
        const { password, ...data } = validLoginData;
        const result = loginSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject invalid email format", () => {
        const result = loginSchema.safeParse({
          ...validLoginData,
          email: "invalid-email",
        });
        expect(result.success).toBe(false);
      });

      it("should reject empty password", () => {
        const result = loginSchema.safeParse({
          ...validLoginData,
          password: "",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Remember me validation", () => {
      it("should handle optional remember me", () => {
        const result = loginSchema.safeParse(validLoginData);
        expect(result.success).toBe(true);
      });

      it("should accept remember me true", () => {
        const result = loginSchema.safeParse({
          ...validLoginData,
          rememberMe: true,
        });
        expect(result.success).toBe(true);
      });

      it("should accept remember me false", () => {
        const result = loginSchema.safeParse({
          ...validLoginData,
          rememberMe: false,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("OTP Verification Schema", () => {
    describe("OTP format validation", () => {
      it("should accept valid 6-digit OTP", () => {
        const result = otpVerificationSchema.safeParse({
          otp: "123456",
        });
        expect(result.success).toBe(true);
      });

      it("should reject too short OTP", () => {
        const result = otpVerificationSchema.safeParse({
          otp: "12345",
        });
        expect(result.success).toBe(false);
      });

      it("should reject too long OTP", () => {
        const result = otpVerificationSchema.safeParse({
          otp: "1234567",
        });
        expect(result.success).toBe(false);
      });

      it("should reject non-numeric OTP", () => {
        const result = otpVerificationSchema.safeParse({
          otp: "12345A",
        });
        expect(result.success).toBe(false);
      });

      it("should reject OTP with spaces", () => {
        const result = otpVerificationSchema.safeParse({
          otp: "123 456",
        });
        expect(result.success).toBe(false);
      });

      it("should accept all numeric OTP", () => {
        const result = otpVerificationSchema.safeParse({
          otp: "000000",
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle all optional fields missing", () => {
      const result = userProfileSchema.safeParse({
        fullName: "John Doe",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should handle Unicode characters in names", () => {
      const result = userProfileSchema.safeParse({
        fullName: "José María García",
        firstName: "José",
        lastName: "García",
        email: "jose@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should handle all special characters in password", () => {
      const result = registerSchema.safeParse({
        fullName: "John Doe",
        email: "john@example.com",
        password: "P@ssw0rd!#$%",
        confirmPassword: "P@ssw0rd!#$%",
        agreeToTerms: true,
      });
      expect(result.success).toBe(true);
    });

    it("should handle maximum email length", () => {
      const email = "a".repeat(240) + "@example.com";
      const result = loginSchema.safeParse({
        email,
        password: "password123",
      });
      expect(result.success).toBe(true);
    });
  });
});
