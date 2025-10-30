import {
  createApiHandler,
  successResponse,
  errorResponse,
  validationErrorResponse,
  getCorsHeaders,
  HTTP_STATUS,
} from "@/lib/api";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/database/config";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";
import { z } from "zod";

/**
 * Handle OPTIONS request for CORS preflight
 * REFACTORED: Uses standardized CORS utilities
 */
export async function OPTIONS() {
  return new Response(null, { headers: getCorsHeaders() });
}

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(["admin", "seller", "user"]).default("user"),
});

/**
 * POST /api/auth/register
 * REFACTORED: Uses standardized API utilities
 */
export const POST = createApiHandler(async (request) => {
  const body = await request.json();

  // Validate input
  const validation = registerSchema.safeParse(body);
  if (!validation.success) {
    return validationErrorResponse(validation.error);
  }

  const validatedData = validation.data;

  const { name, email, password, phone, role } = validatedData;

  // Use Firebase Admin SDK for server-side user creation
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();

  // Check if user already exists
  try {
    await adminAuth.getUserByEmail(email);
    return errorResponse(
      "User already exists with this email",
      HTTP_STATUS.BAD_REQUEST,
    );
  } catch (error: any) {
    // User doesn't exist, continue with registration
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
  }

  // Create user with Firebase Admin
  const createUserParams: any = {
    email,
    displayName: name,
    phoneNumber: phone || undefined,
  };

  // Only add password if provided (for email/password signup)
  // For social logins, password is not required
  if (password) {
    createUserParams.password = password;
  }

  const userRecord = await adminAuth.createUser(createUserParams);

  // Create user document in Firestore
  const now = new Date().toISOString();
  const userData = {
    id: userRecord.uid,
    name,
    email,
    phone: phone || null,
    role,
    isEmailVerified: false,
    isPhoneVerified: false,
    addresses: [],
    createdAt: now,
    updatedAt: now,
    lastLogin: null,
    profile: {
      avatar: null,
      bio: null,
      preferences: {
        notifications: true,
        marketing: false,
      },
    },
  };

  await adminDb.collection("users").doc(userRecord.uid).set(userData);

  // Set custom claims for role-based access
  await adminAuth.setCustomUserClaims(userRecord.uid, { role });

  // Return user data (excluding sensitive info)
  const responseData = {
    id: userRecord.uid,
    name,
    email,
    phone: phone || null,
    role,
    isEmailVerified: false,
    isPhoneVerified: false,
    createdAt: new Date(),
  };

  return successResponse(
    { user: responseData },
    "User registered successfully",
  );
});
