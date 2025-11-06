import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../lib/firebase/config';
import { withMiddleware } from '../../middleware';
import { createSession, setSessionCookie } from '../../lib/session';
import bcrypt from 'bcryptjs';

interface LoginRequestBody {
  email: string;
  password: string;
}

async function loginHandler(req: NextRequest) {
  try {
    const body: LoginRequestBody = await req.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields', fields: ['email', 'password'] },
        { status: 400 }
      );
    }

    // Get user from Firestore
    const userSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.hashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is disabled
    try {
      const userRecord = await adminAuth.getUser(userData.uid);
      if (userRecord.disabled) {
        return NextResponse.json(
          { error: 'Account has been disabled' },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }

    // Create session
    const { sessionId, token } = await createSession(
      userData.uid,
      userData.email,
      userData.role,
      req
    );

    // Update last login
    await adminDb.collection('users').doc(userData.uid).update({
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create response with session cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          uid: userData.uid,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          isEmailVerified: userData.isEmailVerified,
          profile: userData.profile,
        },
        sessionId,
      },
      { status: 200 }
    );

    // Set session cookie
    setSessionCookie(response, token);

    return response;

  } catch (error: any) {
    console.error('Login error:', error);

    return NextResponse.json(
      { 
        error: 'Login failed',
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return withMiddleware(req, loginHandler, {
    rateLimit: {
      maxRequests: 15, // Stricter limit for login
      windowMs: 60 * 1000,
    },
  });
}
