import { withRegistrationTracking } from "@/app/api/middleware/ip-tracker";
import { COLLECTIONS } from "@/constants/database";
import {
  isValidEmail,
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
} from "@/constants/validation-messages";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../lib/firebase/config";
import {
  clearSessionCookie,
  createSession,
  setSessionCookie,
} from "../../lib/session";

interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  role?: string;
}

async function registerHandler(req: Request) {
  try {
    const body: RegisterRequestBody = await req.json();
    const { email, password, name, phoneNumber, role } = body;

    // Validate input
    if (!email || !password || !name) {
      const response = NextResponse.json(
        {
          error: "Missing required fields",
          fields: ["email", "password", "name"],
        },
        { status: 400 }
      );
      clearSessionCookie(response);
      return response;
    }

    // Validate role (default to 'user' if not provided or invalid)
    const validRoles = ["user", "seller", "admin"];
    const userRole = role && validRoles.includes(role) ? role : "user";

    // Validate email format
    if (!isValidEmail(email)) {
      const response = NextResponse.json(
        { error: VALIDATION_MESSAGES.EMAIL.INVALID },
        { status: 400 }
      );
      clearSessionCookie(response);
      return response;
    }

    // Validate password strength
    if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
      const response = NextResponse.json(
        { error: VALIDATION_MESSAGES.PASSWORD.TOO_SHORT },
        { status: 400 }
      );
      clearSessionCookie(response);
      return response;
    }

    // Check if user already exists in Firestore
    const userSnapshot = await adminDb
      .collection(COLLECTIONS.USERS)
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (!userSnapshot.empty) {
      const response = NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
      clearSessionCookie(response);
      return response;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: email.toLowerCase(),
      password: password,
      displayName: name,
      phoneNumber: phoneNumber,
    });

    // Create user document in Firestore
    const userData = {
      uid: userRecord.uid,
      email: email.toLowerCase(),
      name: name,
      phoneNumber: phoneNumber || null,
      hashedPassword: hashedPassword,
      role: userRole, // Use the validated role
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        avatar: null,
        bio: null,
        address: null,
      },
      preferences: {
        notifications: true,
        newsletter: true,
      },
    };

    await adminDb
      .collection(COLLECTIONS.USERS)
      .doc(userRecord.uid)
      .set(userData);

    // Send verification email
    try {
      const verificationLink = await adminAuth.generateEmailVerificationLink(
        email
      );

      // Import email service dynamically to avoid circular dependencies
      const { emailService } = await import(
        "@/app/api/lib/email/email.service"
      );

      // Send verification email
      const emailResult = await emailService.sendVerificationEmail(
        email,
        name,
        verificationLink
      );

      if (emailResult.success) {
        console.log("✅ Verification email sent successfully to:", email);
      } else {
        console.error(
          "❌ Failed to send verification email:",
          emailResult.error
        );
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      // Don't fail registration if email sending fails
    }

    // Create session for immediate login
    const { sessionId, token } = await createSession(
      userRecord.uid,
      email.toLowerCase(),
      userRole, // Use the validated role
      req as NextRequest
    );

    // Create response with session cookie
    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName,
          role: userRole, // Use the validated role
          isEmailVerified: false,
        },
        sessionId,
      },
      { status: 201 }
    );

    // Set session cookie
    setSessionCookie(response, token);

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle Firebase Auth errors
    if (error.code === "auth/email-already-exists") {
      const response = NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
      clearSessionCookie(response);
      return response;
    }

    if (error.code === "auth/invalid-email") {
      const response = NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
      clearSessionCookie(response);
      return response;
    }

    if (error.code === "auth/invalid-password") {
      const response = NextResponse.json(
        { error: "Invalid password. Password must be at least 6 characters" },
        { status: 400 }
      );
      clearSessionCookie(response);
      return response;
    }

    const response = NextResponse.json(
      {
        error: "Registration failed",
        message:
          process.env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : error.message,
      },
      { status: 500 }
    );
    clearSessionCookie(response);
    return response;
  }
}

// Export with IP tracking and rate limiting (max 3 attempts per hour)
export const POST = withRegistrationTracking(registerHandler);
