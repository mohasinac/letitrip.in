import { createApiHandler, successResponse, validationErrorResponse, errorResponse, getCorsHeaders, HTTP_STATUS } from '@/lib/api';
import { getAdminAuth, getAdminDb } from '@/lib/database/admin';
import { z } from 'zod';

/**
 * Handle OPTIONS request for CORS preflight
 * REFACTORED: Uses standardized CORS utilities
 */
export async function OPTIONS() {
  return new Response(null, { headers: getCorsHeaders() });
}

const verifyOTPSchema = z.object({
  verificationId: z.string().min(1, 'Verification ID required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

/**
 * POST /api/auth/verify-otp
 * REFACTORED: Uses standardized API utilities
 */
export const POST = createApiHandler(async (request) => {
  const body = await request.json();
  
  // Validate input
  const validation = verifyOTPSchema.safeParse(body);
  if (!validation.success) {
    return validationErrorResponse(validation.error);
  }

  const { verificationId, otp, phoneNumber } = validation.data;

  // In a real implementation, you would:
  // 1. Verify the OTP against the stored verification
  // 2. Check expiration time
  // 3. Validate against Firebase Auth

  // For demo purposes, we'll accept "123456" as valid OTP
  if (otp !== '123456') {
    return errorResponse('Invalid OTP. Please try again.', HTTP_STATUS.BAD_REQUEST);
  }

  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();

  // Check if user exists with this phone number
  let userRecord;
  try {
    const users = await adminAuth.getUsers([]);
    userRecord = users.users.find(user => user.phoneNumber === phoneNumber);
  } catch (error) {
    console.error('Error finding user:', error);
  }

  if (userRecord) {
    // User exists, update phone verification status
    await adminDb.collection('users').doc(userRecord.uid).update({
      isPhoneVerified: true,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Get updated user data
    const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();

    // Generate custom token for auto-login
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return successResponse({
      user: {
        id: userRecord.uid,
        uid: userRecord.uid,
        email: userRecord.email,
        name: userData?.name || userRecord.displayName,
        phone: phoneNumber,
        role: userData?.role || 'user',
        isEmailVerified: userRecord.emailVerified,
        isPhoneVerified: true,
      },
      customToken,
    }, 'Phone number verified successfully');
  } else {
    // Create new user with phone number
    const newUser = await adminAuth.createUser({
      phoneNumber,
      disabled: false,
    });

    // Create user document
    const now = new Date().toISOString();
    const userData = {
      id: newUser.uid,
      name: phoneNumber.replace(/^\+\d+/, ''), // Use phone as temporary name
      email: null,
      phone: phoneNumber,
      role: 'user',
      isEmailVerified: false,
      isPhoneVerified: true,
      addresses: [],
      createdAt: now,
      updatedAt: now,
      lastLogin: now,
      profile: {
        avatar: null,
        bio: null,
        preferences: {
          notifications: true,
          marketing: false,
        },
      },
    };

    await adminDb.collection('users').doc(newUser.uid).set(userData);

    // Set custom claims
    await adminAuth.setCustomUserClaims(newUser.uid, { role: 'user' });

    // Generate custom token
    const customToken = await adminAuth.createCustomToken(newUser.uid);

    return successResponse({
      user: {
        id: newUser.uid,
        uid: newUser.uid,
        email: null,
        name: userData.name,
        phone: phoneNumber,
        role: 'user',
        isEmailVerified: false,
        isPhoneVerified: true,
      },
      customToken,
    }, 'Phone number verified and account created');
  }
});
