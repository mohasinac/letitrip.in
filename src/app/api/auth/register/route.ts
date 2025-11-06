import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../lib/firebase/config';
import { withMiddleware } from '../../middleware';
import { createSession, setSessionCookie } from '../../lib/session';
import bcrypt from 'bcryptjs';

interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  role?: string;
}

async function registerHandler(req: NextRequest) {
  try {
    const body: RegisterRequestBody = await req.json();
    const { email, password, name, phoneNumber, role } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields', fields: ['email', 'password', 'name'] },
        { status: 400 }
      );
    }

    // Validate role (default to 'user' if not provided or invalid)
    const validRoles = ['user', 'seller', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'user';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists in Firestore
    const userSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (!userSnapshot.empty) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
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

    await adminDb.collection('users').doc(userRecord.uid).set(userData);

    // Send verification email
    try {
      const verificationLink = await adminAuth.generateEmailVerificationLink(email);
      // TODO: Send email with verification link using your email service
      console.log('Verification link:', verificationLink);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }

    // Create session for immediate login
    const { sessionId, token } = await createSession(
      userRecord.uid,
      email.toLowerCase(),
      userRole, // Use the validated role
      req
    );

    // Create response with session cookie
    const response = NextResponse.json(
      {
        message: 'User registered successfully',
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
    console.error('Registration error:', error);

    // Handle Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (error.code === 'auth/invalid-password') {
      return NextResponse.json(
        { error: 'Invalid password. Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Registration failed',
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return withMiddleware(req, registerHandler, {
    rateLimit: {
      maxRequests: 10, // Stricter limit for registration
      windowMs: 60 * 1000,
    },
  });
}
