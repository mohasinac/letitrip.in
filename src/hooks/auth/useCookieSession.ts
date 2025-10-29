/**
 * Use Cookie Session Hook
 * Client-side hook for managing sessions via cookies
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { API_CONSTANTS } from '@/constants/app';

export interface SessionState {
  sessionId: string | null;
  userId: string | null;
  lastVisitedPage: string | null;
  cartItemCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useCookieSession() {
  const [session, setSession] = useState<SessionState>({
    sessionId: null,
    userId: null,
    lastVisitedPage: null,
    cartItemCount: 0,
    isLoading: true,
    error: null,
  });

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch(`${API_CONSTANTS.ENDPOINTS.SESSIONS}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSession((prev) => ({
              ...prev,
              sessionId: data.data.sessionId,
              userId: data.data.userId || null,
              lastVisitedPage: data.data.lastVisitedPage || null,
              cartItemCount: data.data.cartItemCount || 0,
              isLoading: false,
            }));
          }
        } else {
          setSession((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        setSession((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize session',
        }));
      }
    };

    initSession();
  }, []);

  // Update last visited page
  const updateLastVisitedPage = useCallback(async (page: string) => {
    try {
      const response = await fetch(`${API_CONSTANTS.ENDPOINTS.SESSIONS}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_page',
          data: { page },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSession((prev) => ({
            ...prev,
            lastVisitedPage: page,
          }));
        }
      }
    } catch (error) {
      console.error('Error updating page:', error);
    }
  }, []);

  // Update cart count
  const updateCartCount = useCallback(async (count: number) => {
    try {
      const response = await fetch(`${API_CONSTANTS.ENDPOINTS.SESSIONS}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_cart',
          data: { count },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSession((prev) => ({
            ...prev,
            cartItemCount: count,
          }));
        }
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }, []);

  // Set user in session
  const setUserInSession = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${API_CONSTANTS.ENDPOINTS.SESSIONS}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_user',
          data: { userId },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSession((prev) => ({
            ...prev,
            userId,
          }));
        }
      }
    } catch (error) {
      console.error('Error setting user in session:', error);
    }
  }, []);

  // Clear session (logout)
  const clearSession = useCallback(async () => {
    try {
      await fetch(`${API_CONSTANTS.ENDPOINTS.SESSIONS}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      setSession({
        sessionId: null,
        userId: null,
        lastVisitedPage: null,
        cartItemCount: 0,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }, []);

  // Get last visited page
  const getLastVisitedPage = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_CONSTANTS.ENDPOINTS.SESSIONS}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_last_page',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data.lastVisitedPage || null;
        }
      }
    } catch (error) {
      console.error('Error getting last visited page:', error);
    }
    return null;
  }, []);

  // Get cart count
  const getCartCount = useCallback(async (): Promise<number> => {
    try {
      const response = await fetch(`${API_CONSTANTS.ENDPOINTS.SESSIONS}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_cart_count',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data.cartCount || 0;
        }
      }
    } catch (error) {
      console.error('Error getting cart count:', error);
    }
    return 0;
  }, []);

  return {
    session,
    updateLastVisitedPage,
    updateCartCount,
    setUserInSession,
    clearSession,
    getLastVisitedPage,
    getCartCount,
  };
}
