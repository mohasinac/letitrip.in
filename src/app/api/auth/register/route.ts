/**
 * User Registration API Route
 * 
 * Handles new user registration with email/phone and password.
 * Creates user in Firestore with hashed password and default role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import bcrypt from 'bcryptjs';
import { RegisterData, UserRole } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const data: RegisterData = await request.json();

    // Validation
    if (!data.password || data.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!data.email && !data.phoneNumber) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    if (!data.acceptTerms) {
      return NextResponse.json(
        { error: 'You must accept the terms and conditions' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const usersRef = adminDb.collection('users');
    let existingUser;

    if (data.email) {
      existingUser = await usersRef.where('email', '==', data.email).limit(1).get();
    } else if (data.phoneNumber) {
      existingUser = await usersRef.where('phoneNumber', '==', data.phoneNumber).limit(1).get();
    }

    if (existingUser && !existingUser.empty) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user document
    const userDoc = await usersRef.add({
      email: data.email || null,
      phoneNumber: data.phoneNumber || null,
      displayName: data.displayName || null,
      photoURL: null,
      password: hashedPassword,
      role: 'user' as UserRole,
      emailVerified: false,
      disabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      provider: 'credentials',
    });

    return NextResponse.json(
      {
        success: true,
        userId: userDoc.id,
        message: 'User registered successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
