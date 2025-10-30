/**
 * Custom React Hooks
 * Reusable hooks for common patterns
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { isMobile, getCurrentBreakpoint, type Breakpoint } from '@/utils/responsive';
import { debounce } from '@/utils/performance';

/**
 * Hook to detect mobile device
 */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  
  useEffect(() => {
    setMobile(isMobile());
    
    const handleResize = debounce(() => {
      setMobile(isMobile());
    }, 150);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return mobile;
}

/**
 * Hook to get current breakpoint
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg');
  
  useEffect(() => {
    setBreakpoint(getCurrentBreakpoint());
    
    const handleResize = debounce(() => {
      setBreakpoint(getCurrentBreakpoint());
    }, 150);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return breakpoint;
}

/**
 * Hook for managing local storage with SSR safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
  }, [key]);
  
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    },
    [key, storedValue]
  );
  
  return [storedValue, setValue];
}

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Hook for intersection observer
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, options]);
  
  return isIntersecting;
}

/**
 * Hook for previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Hook for window size
 */
export function useWindowSize(): { width: number; height: number } {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
}

/**
 * Hook for click outside detection
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/**
 * Hook for media query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  
  return matches;
}

/**
 * Hook for async data fetching
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): {
  execute: () => Promise<void>;
  loading: boolean;
  data: T | null;
  error: Error | null;
} {
  const [loading, setLoading] = useState(immediate);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async () => {
    setLoading(true);
    setData(null);
    setError(null);
    
    try {
      const response = await asyncFunction();
      setData(response);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  
  return { execute, loading, data, error };
}

/**
 * Hook for scroll position
 */
export function useScrollPosition(): { x: number; y: number } {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleScroll = debounce(() => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return scrollPosition;
}

/**
 * Hook for scroll lock
 */
export function useScrollLock(): [boolean, (locked: boolean) => void] {
  const [locked, setLocked] = useState(false);
  
  useEffect(() => {
    if (locked) {
      const originalOverflow = document.body.style.overflow;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = '';
      };
    }
  }, [locked]);
  
  return [locked, setLocked];
}
