import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/database/admin';
import { serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const verifyOTPSchema = z.object({
  verificationId: z.string().min(1, 'Verification ID required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { verificationId, otp, phoneNumber } = verifyOTPSchema.parse(body);

    // In a real implementation, you would:
    // 1. Verify the OTP against the stored verification
    // 2. Check expiration time
    // 3. Validate against Firebase Auth

    // For demo purposes, we'll accept "123456" as valid OTP
    if (otp !== '123456') {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
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
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Get updated user data
      const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
      const userData = userDoc.data();

      // Generate custom token for auto-login
      const customToken = await adminAuth.createCustomToken(userRecord.uid);

      return NextResponse.json({
        success: true,
        message: 'Phone number verified successfully',
        data: {
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
        },
      });
    } else {
      // Create new user with phone number
      const newUser = await adminAuth.createUser({
        phoneNumber,
        disabled: false,
      });

      // Create user document
      const userData = {
        id: newUser.uid,
        name: phoneNumber.replace(/^\+\d+/, ''), // Use phone as temporary name
        email: null,
        phone: phoneNumber,
        role: 'user',
        isEmailVerified: false,
        isPhoneVerified: true,
        addresses: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
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

      return NextResponse.json({
        success: true,
        message: 'Phone number verified and account created',
        data: {
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
        },
      });
    }

  } catch (error: any) {
    console.error('Verify OTP error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'OTP verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
