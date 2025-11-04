/**
 * Session-based Auth Client
 * Client-side utilities for session authentication
 */

import { apiClient } from '@/lib/api/client';

export interface SessionUser {
  id: string;
  uid: string;
  email: string;
  name?: string;
  displayName?: string;
  role: 'admin' | 'seller' | 'user';
  avatar?: string;
  phone?: string;
  isEmailVerified?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

/**
 * Login with email and password
 * Session cookie is automatically set by the server
 */
export async function loginWithSession(email: string, password: string): Promise<SessionUser> {
  const response = await apiClient.post<{ user: SessionUser }>('/api/auth/login', {
    email,
    password,
  });
  
  return response.user;
}

/**
 * Register new user
 * Session cookie is automatically set by the server
 */
export async function registerWithSession(
  name: string,
  email: string,
  password: string,
  role?: 'user' | 'seller'
): Promise<SessionUser> {
  const response = await apiClient.post<{ user: SessionUser }>('/api/auth/register', {
    name,
    email,
    password,
    role: role || 'user',
  });
  
  return response.user;
}

/**
 * Logout user
 * Destroys session on server and clears cookie
 */
export async function logoutSession(): Promise<void> {
  await apiClient.post('/api/auth/logout');
}

/**
 * Get current user from session
 * Returns null if not authenticated
 */
export async function getCurrentSessionUser(): Promise<SessionUser | null> {
  try {
    const response = await apiClient.get<SessionUser>('/api/auth/me');
    return response;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return null;
    }
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export async function isSessionAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentSessionUser();
    return !!user;
  } catch {
    return false;
  }
}
