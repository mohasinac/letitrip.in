/**
 * Multi-Factor Authentication Service
 *
 * Provides MFA enrollment, verification, and management functionality
 * using Firebase Authentication's built-in MFA support.
 *
 * Features:
 * - SMS-based MFA enrollment
 * - TOTP (Time-based One-Time Password) support
 * - MFA verification during sign-in
 * - Device trust management
 * - MFA unenrollment
 *
 * @module services/auth-mfa-service
 */

import { AuthError, ValidationError } from "@/lib/errors";
import {
  getAuth,
  multiFactor,
  MultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  TotpMultiFactorGenerator,
  TotpSecret,
} from "firebase/auth";
import { z } from "zod";

// ============================================================================
// Validation Schemas
// ============================================================================

const EnrollPhoneMFASchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  displayName: z.string().optional(),
});

const VerifyPhoneMFASchema = z.object({
  verificationId: z.string().min(1, "Verification ID is required"),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
});

const VerifyTotpMFASchema = z.object({
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
  displayName: z.string().optional(),
});

const UnEnrollMFASchema = z.object({
  factorUid: z.string().min(1, "Factor UID is required"),
});

// ============================================================================
// Types
// ============================================================================

export interface EnrollPhoneMFARequest {
  phoneNumber: string;
  displayName?: string;
}

export interface EnrollPhoneMFAResponse {
  verificationId: string;
  message: string;
}

export interface VerifyPhoneMFARequest {
  verificationId: string;
  verificationCode: string;
}

export interface EnrollTotpMFAResponse {
  totpSecret: TotpSecret;
  qrCodeUrl: string;
  secretKey: string;
}

export interface VerifyTotpMFARequest {
  verificationCode: string;
  displayName?: string;
}

export interface MFAFactorInfo {
  uid: string;
  displayName?: string;
  factorId: string;
  enrollmentTime: string;
  phoneNumber?: string;
}

export interface UnEnrollMFARequest {
  factorUid: string;
}

export interface SignInWithMFARequest {
  verificationCode: string;
  resolver: MultiFactorResolver;
  selectedFactorIndex?: number;
}

// ============================================================================
// Auth MFA Service
// ============================================================================

export class AuthMFAService {
  private auth = getAuth();
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  /**
   * Initialize reCAPTCHA verifier for phone MFA
   * Should be called before enrolling phone MFA
   */
  initializeRecaptcha(containerId: string): RecaptchaVerifier {
    if (this.recaptchaVerifier) {
      return this.recaptchaVerifier;
    }

    this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved
        console.log("reCAPTCHA solved");
      },
      "expired-callback": () => {
        // Response expired
        console.warn("reCAPTCHA expired");
        this.recaptchaVerifier = null;
      },
    });

    return this.recaptchaVerifier;
  }

  /**
   * Start phone MFA enrollment process
   * Returns verification ID for code verification
   */
  async enrollPhoneMFA(
    request: EnrollPhoneMFARequest
  ): Promise<EnrollPhoneMFAResponse> {
    try {
      // Validate input
      const validated = EnrollPhoneMFASchema.parse(request);

      // Get current user
      const user = this.auth.currentUser;
      if (!user) {
        throw new AuthError(
          "User must be signed in to enroll MFA",
          "UNAUTHORIZED"
        );
      }

      // Check if reCAPTCHA is initialized
      if (!this.recaptchaVerifier) {
        throw new ValidationError(
          "reCAPTCHA verifier not initialized. Call initializeRecaptcha() first",
          "RECAPTCHA_NOT_INITIALIZED"
        );
      }

      // Get multi-factor session
      const multiFactorSession = await multiFactor(user).getSession();

      // Start phone verification
      const phoneAuthProvider = new PhoneAuthProvider(this.auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        {
          phoneNumber: validated.phoneNumber,
          session: multiFactorSession,
        },
        this.recaptchaVerifier
      );

      return {
        verificationId,
        message: "Verification code sent to your phone",
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors[0].message,
          "VALIDATION_ERROR",
          error.errors
        );
      }

      if (error instanceof AuthError || error instanceof ValidationError) {
        throw error;
      }

      throw new AuthError(
        `Failed to enroll phone MFA: ${(error as Error).message}`,
        "MFA_ENROLLMENT_FAILED"
      );
    }
  }

  /**
   * Complete phone MFA enrollment with verification code
   */
  async verifyPhoneMFA(request: VerifyPhoneMFARequest): Promise<void> {
    try {
      // Validate input
      const validated = VerifyPhoneMFASchema.parse(request);

      // Get current user
      const user = this.auth.currentUser;
      if (!user) {
        throw new AuthError(
          "User must be signed in to verify MFA",
          "UNAUTHORIZED"
        );
      }

      // Create phone credential
      const phoneAuthCredential = PhoneAuthProvider.credential(
        validated.verificationId,
        validated.verificationCode
      );

      // Create multi-factor assertion
      const multiFactorAssertion =
        PhoneMultiFactorGenerator.assertion(phoneAuthCredential);

      // Finalize enrollment
      await multiFactor(user).enroll(multiFactorAssertion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors[0].message,
          "VALIDATION_ERROR",
          error.errors
        );
      }

      if (error instanceof AuthError || error instanceof ValidationError) {
        throw error;
      }

      throw new AuthError(
        `Failed to verify phone MFA: ${(error as Error).message}`,
        "MFA_VERIFICATION_FAILED"
      );
    }
  }

  /**
   * Start TOTP MFA enrollment process
   * Returns TOTP secret and QR code URL
   */
  async enrollTotpMFA(displayName?: string): Promise<EnrollTotpMFAResponse> {
    try {
      // Get current user
      const user = this.auth.currentUser;
      if (!user) {
        throw new AuthError(
          "User must be signed in to enroll MFA",
          "UNAUTHORIZED"
        );
      }

      // Get multi-factor session
      const multiFactorSession = await multiFactor(user).getSession();

      // Generate TOTP secret
      const totpSecret = await TotpMultiFactorGenerator.generateSecret(
        multiFactorSession
      );

      // Generate QR code URL for authenticator apps
      const qrCodeUrl = totpSecret.generateQrCodeUrl(
        user.email || user.phoneNumber || "user",
        "Letitrip.in"
      );

      return {
        totpSecret,
        qrCodeUrl,
        secretKey: totpSecret.secretKey,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        `Failed to enroll TOTP MFA: ${(error as Error).message}`,
        "MFA_ENROLLMENT_FAILED"
      );
    }
  }

  /**
   * Complete TOTP MFA enrollment with verification code
   */
  async verifyTotpMFA(
    totpSecret: TotpSecret,
    request: VerifyTotpMFARequest
  ): Promise<void> {
    try {
      // Validate input
      const validated = VerifyTotpMFASchema.parse(request);

      // Get current user
      const user = this.auth.currentUser;
      if (!user) {
        throw new AuthError(
          "User must be signed in to verify MFA",
          "UNAUTHORIZED"
        );
      }

      // Create multi-factor assertion
      const multiFactorAssertion =
        TotpMultiFactorGenerator.assertionForEnrollment(
          totpSecret,
          validated.verificationCode
        );

      // Finalize enrollment with optional display name
      await multiFactor(user).enroll(
        multiFactorAssertion,
        validated.displayName
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors[0].message,
          "VALIDATION_ERROR",
          error.errors
        );
      }

      if (error instanceof AuthError || error instanceof ValidationError) {
        throw error;
      }

      throw new AuthError(
        `Failed to verify TOTP MFA: ${(error as Error).message}`,
        "MFA_VERIFICATION_FAILED"
      );
    }
  }

  /**
   * Get list of enrolled MFA factors for current user
   */
  async getEnrolledFactors(): Promise<MFAFactorInfo[]> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new AuthError(
          "User must be signed in to get enrolled factors",
          "UNAUTHORIZED"
        );
      }

      const enrolledFactors = multiFactor(user).enrolledFactors;

      return enrolledFactors.map((factor) => ({
        uid: factor.uid,
        displayName: factor.displayName || undefined,
        factorId: factor.factorId,
        enrollmentTime: factor.enrollmentTime,
        phoneNumber:
          factor.factorId === "phone" ? (factor as any).phoneNumber : undefined,
      }));
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        `Failed to get enrolled factors: ${(error as Error).message}`,
        "MFA_LIST_FAILED"
      );
    }
  }

  /**
   * Unenroll (remove) an MFA factor
   */
  async unenrollMFA(request: UnEnrollMFARequest): Promise<void> {
    try {
      // Validate input
      const validated = UnEnrollMFASchema.parse(request);

      // Get current user
      const user = this.auth.currentUser;
      if (!user) {
        throw new AuthError(
          "User must be signed in to unenroll MFA",
          "UNAUTHORIZED"
        );
      }

      // Find the factor to unenroll
      const enrolledFactors = multiFactor(user).enrolledFactors;
      const factorToUnenroll = enrolledFactors.find(
        (factor) => factor.uid === validated.factorUid
      );

      if (!factorToUnenroll) {
        throw new ValidationError(
          "MFA factor not found",
          "MFA_FACTOR_NOT_FOUND"
        );
      }

      // Unenroll the factor
      await multiFactor(user).unenroll(factorToUnenroll);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors[0].message,
          "VALIDATION_ERROR",
          error.errors
        );
      }

      if (error instanceof AuthError || error instanceof ValidationError) {
        throw error;
      }

      throw new AuthError(
        `Failed to unenroll MFA: ${(error as Error).message}`,
        "MFA_UNENROLL_FAILED"
      );
    }
  }

  /**
   * Sign in with MFA (second factor verification)
   * Used when user encounters MFA challenge during sign-in
   */
  async signInWithMFA(request: SignInWithMFARequest): Promise<void> {
    try {
      const { verificationCode, resolver, selectedFactorIndex = 0 } = request;

      if (!verificationCode || verificationCode.length !== 6) {
        throw new ValidationError(
          "Verification code must be 6 digits",
          "INVALID_VERIFICATION_CODE"
        );
      }

      // Get selected factor (default to first factor)
      const selectedFactor = resolver.hints[selectedFactorIndex];
      if (!selectedFactor) {
        throw new ValidationError(
          "Invalid factor selected",
          "INVALID_MFA_FACTOR"
        );
      }

      let multiFactorAssertion;

      // Handle different factor types
      if (selectedFactor.factorId === PhoneMultiFactorGenerator.FACTOR_ID) {
        // Phone MFA
        if (!this.recaptchaVerifier) {
          throw new ValidationError(
            "reCAPTCHA verifier not initialized",
            "RECAPTCHA_NOT_INITIALIZED"
          );
        }

        const phoneAuthProvider = new PhoneAuthProvider(this.auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(
          {
            multiFactorHint: selectedFactor,
            session: resolver.session,
          },
          this.recaptchaVerifier
        );

        const phoneAuthCredential = PhoneAuthProvider.credential(
          verificationId,
          verificationCode
        );

        multiFactorAssertion =
          PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      } else if (
        selectedFactor.factorId === TotpMultiFactorGenerator.FACTOR_ID
      ) {
        // TOTP MFA
        multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
          selectedFactor.uid,
          verificationCode
        );
      } else {
        throw new ValidationError(
          "Unsupported MFA factor type",
          "UNSUPPORTED_MFA_FACTOR"
        );
      }

      // Complete sign-in with MFA
      await resolver.resolveSignIn(multiFactorAssertion);
    } catch (error) {
      if (error instanceof AuthError || error instanceof ValidationError) {
        throw error;
      }

      throw new AuthError(
        `Failed to sign in with MFA: ${(error as Error).message}`,
        "MFA_SIGN_IN_FAILED"
      );
    }
  }

  /**
   * Check if user has MFA enabled
   */
  async isMFAEnabled(): Promise<boolean> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        return false;
      }

      const enrolledFactors = multiFactor(user).enrolledFactors;
      return enrolledFactors.length > 0;
    } catch (error) {
      console.error("Failed to check MFA status:", error);
      return false;
    }
  }

  /**
   * Clean up reCAPTCHA verifier
   */
  clearRecaptcha(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }
}

// Export singleton instance
export const authMFAService = new AuthMFAService();

// Export class for testing
export default authMFAService;
