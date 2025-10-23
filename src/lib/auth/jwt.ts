/**
 * JWT Authentication Utilities
 * Server-side only - handles token generation and verification
 */

import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'seller' | 'user';
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token
 * @param payload - User data to encode in the token
 * @returns Signed JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, JWT_SECRET!, options);
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;
    
    // Type guard to ensure it's our custom payload
    if (
      decoded &&
      typeof decoded === 'object' &&
      'userId' in decoded &&
      'email' in decoded &&
      'role' in decoded
    ) {
      return decoded as JWTPayload;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get the current user from the request cookies
 * @returns User payload or null if not authenticated
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Check if the current user is an admin
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

/**
 * Set authentication cookie
 * @param token - JWT token to set in cookies
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}
