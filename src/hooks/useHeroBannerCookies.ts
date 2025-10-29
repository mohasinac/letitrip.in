"use client";

import { useState, useEffect, useCallback } from 'react';

interface HeroBannerPreferences {
  lastViewedSlide?: number;
  dismissedBanners?: string[];
  viewCount?: number;
  lastVisitDate?: string;
}

/**
 * Hook for managing hero banner preferences
 * Play/pause state: stored in cookies
 * Other data (slides, dismissals, views): stored in database
 */
export const useHeroBannerCookies = () => {
  const [preferences, setPreferences] = useState<HeroBannerPreferences | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch preferences from database
  const fetchPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/hero-banner', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data || {});
      }
    } catch (error) {
      console.error('Failed to fetch hero banner preferences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get play/pause state from cookie
  const getPlayPauseFromCookie = useCallback(() => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'heroBannerPlaying') {
          return value !== 'false';
        }
      }
    }
    return true;
  }, []);

  useEffect(() => {
    fetchPreferences();
    setIsPlaying(getPlayPauseFromCookie());
  }, [fetchPreferences, getPlayPauseFromCookie]);

  // Update last viewed slide in database
  const setLastViewedSlide = useCallback(async (slideIndex: number) => {
    try {
      await fetch('/api/hero-banner', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastViewedSlide: slideIndex,
        }),
      });
      setPreferences(prev => prev ? { ...prev, lastViewedSlide: slideIndex } : null);
    } catch (error) {
      console.error('Failed to update last viewed slide:', error);
    }
  }, []);

  // Mark banner as dismissed in database
  const dismissBanner = useCallback(async (bannerId: string) => {
    try {
      const dismissed = preferences?.dismissedBanners || [];
      if (!dismissed.includes(bannerId)) {
        dismissed.push(bannerId);
        
        await fetch('/api/hero-banner', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dismissedBanners: dismissed,
          }),
        });
        
        setPreferences(prev => prev ? { ...prev, dismissedBanners: dismissed } : null);
      }
    } catch (error) {
      console.error('Failed to dismiss banner:', error);
    }
  }, [preferences]);

  // Increment view count in database
  const incrementViewCount = useCallback(async () => {
    try {
      const newCount = (preferences?.viewCount || 0) + 1;
      
      await fetch('/api/hero-banner', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewCount: newCount,
        }),
      });
      
      setPreferences(prev => prev ? { ...prev, viewCount: newCount } : null);
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  }, [preferences]);

  // Toggle play/pause - stored in cookie only
  const togglePlayPause = useCallback(() => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    
    if (typeof window !== 'undefined') {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30); // 30 days
      document.cookie = `heroBannerPlaying=${newState}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    }
  }, [isPlaying]);

  return {
    preferences,
    loading,
    isPlaying,
    setLastViewedSlide,
    dismissBanner,
    incrementViewCount,
    togglePlayPause,
    refetch: fetchPreferences,
  };
};

export default useHeroBannerCookies;
