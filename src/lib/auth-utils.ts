/**
 * Auth Utility Functions
 * 
 * @deprecated These functions are kept for backward compatibility.
 * Use the hooks from '@/hooks/useAuth' instead:
 * - useLogin() instead of signInWithCredentials()
 * - useRegister() instead of registerUser()
 * 
 * Helper functions for authentication operations.
 */

'use client';

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { LoginCredentials, RegisterData } from '@/types/auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';

/**
 * Sign in with email or phone
 * @deprecated Use useLogin() hook instead
 */
export async function signInWithCredentials(credentials: LoginCredentials) {
  try {
    const result = await nextAuthSignIn('credentials', {
      emailOrPhone: credentials.email || credentials.phoneNumber,
      password: credentials.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  try {
    await nextAuthSignIn('google', { callbackUrl: '/dashboard' });
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
}

/**
 * Sign in with Apple
 */
export async function signInWithApple() {
  try {
    await nextAuthSignIn('apple', { callbackUrl: '/dashboard' });
  } catch (error) {
    console.error('Apple sign in error:', error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut() {
  try {
    await nextAuthSignOut({ callbackUrl: '/' });
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Register new user
 */
export async function registerUser(data: RegisterData) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Registration failed');
    }

    return result;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}
