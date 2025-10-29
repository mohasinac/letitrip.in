import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/database/config';
import { getAdminAuth, getAdminDb } from '@/lib/database/admin';
import { z } from 'zod';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(['admin', 'seller', 'user']).default('user'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    
    const { name, email, password, phone, role } = validatedData;

    // Use Firebase Admin SDK for server-side user creation
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // Check if user already exists
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json(
        { success: false, error: 'User already exists with this email' },
        { status: 400, headers: corsHeaders }
      );
    } catch (error: any) {
      // User doesn't exist, continue with registration
      if (error.code !== 'auth/user-not-found') {
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

    await adminDb.collection('users').doc(userRecord.uid).set(userData);

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

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: { user: responseData },
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { success: false, error: 'User already exists with this email' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (error.code === 'auth/weak-password') {
      return NextResponse.json(
        { success: false, error: 'Password is too weak' },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
