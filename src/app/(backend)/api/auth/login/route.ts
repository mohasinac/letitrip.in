/**
 * Auth Login API Route - POST
 * Session-based authentication with HTTP-only cookies
 */

import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../_lib/database/config';
import { getAdminDb } from '../../_lib/database/admin';
import { createSession } from '../../_lib/auth/session';

/**
 * POST /api/auth/login
 * Public endpoint - Login with email/password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User data not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userRole = (userData?.role || 'user') as 'admin' | 'seller' | 'user';

    // Create server-side session with HTTP-only cookie
    await createSession(firebaseUser.uid, email, userRole);

    // Return user data (NO TOKEN!)
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: userData?.name || firebaseUser.displayName,
            name: userData?.name,
            role: userRole,
            avatar: userData?.avatar || firebaseUser.photoURL,
            phone: userData?.phone,
            isEmailVerified: firebaseUser.emailVerified,
            createdAt: userData?.createdAt,
          },
        },
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);

    // Handle Firebase auth errors
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (error.code === 'auth/too-many-requests') {
      return NextResponse.json(
        { success: false, error: 'Too many failed attempts. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
