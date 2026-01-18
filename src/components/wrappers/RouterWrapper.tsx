/**
 * Next.js Router Wrapper for React Library Components
 * 
 * Provides Next.js router functionality to pure React components
 * in @letitrip/react-library through a callback interface.
 * 
 * @example
 * // In pages/components:
 * const { push, back } = useRouterWrapper();
 * <LibraryComponent onNavigate={push} onGoBack={back} />
 */

'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export interface RouterWrapperInterface {
  /** Navigate to a new route */
  push: (href: string) => void;
  /** Navigate back */
  back: () => void;
  /** Navigate forward */
  forward: () => void;
  /** Replace current route */
  replace: (href: string) => void;
  /** Refresh current route */
  refresh: () => void;
  /** Get current pathname */
  pathname: string;
  /** Get current search params */
  searchParams: URLSearchParams | null;
}

/**
 * Hook to access Next.js router functionality
 * Use this in pages/components to pass navigation callbacks to library components
 */
export function useRouterWrapper(): RouterWrapperInterface {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const push = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  const back = useCallback(() => {
    router.back();
  }, [router]);

  const forward = useCallback(() => {
    router.forward();
  }, [router]);

  const replace = useCallback((href: string) => {
    router.replace(href);
  }, [router]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return {
    push,
    back,
    forward,
    replace,
    refresh,
    pathname,
    searchParams,
  };
}

/**
 * Navigation callbacks interface for library components
 * Library components should accept these as props
 */
export interface NavigationCallbacks {
  onNavigate?: (href: string) => void;
  onGoBack?: () => void;
  onGoForward?: () => void;
  onReplace?: (href: string) => void;
}

export default useRouterWrapper;
