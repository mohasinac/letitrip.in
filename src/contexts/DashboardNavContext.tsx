"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

interface DashboardNavState {
  /** Whether a dashboard section has registered its nav handler. */
  hasNav: boolean;
  /** Open the registered dashboard navigation drawer. */
  openNav: () => void;
  /** Register a callback that opens the dashboard nav drawer. */
  registerNav: (opener: () => void) => void;
  /** Unregister the dashboard nav (on unmount). */
  unregisterNav: () => void;
}

const DashboardNavContext = createContext<DashboardNavState | null>(null);

export function DashboardNavProvider({ children }: { children: ReactNode }) {
  const openerRef = useRef<(() => void) | null>(null);
  const [hasNav, setHasNav] = useState(false);

  const registerNav = useCallback((opener: () => void) => {
    openerRef.current = opener;
    setHasNav(true);
  }, []);

  const unregisterNav = useCallback(() => {
    openerRef.current = null;
    setHasNav(false);
  }, []);

  const openNav = useCallback(() => {
    openerRef.current?.();
  }, []);

  return (
    <DashboardNavContext.Provider
      value={{ hasNav, openNav, registerNav, unregisterNav }}
    >
      {children}
    </DashboardNavContext.Provider>
  );
}

export function useDashboardNav() {
  const ctx = useContext(DashboardNavContext);
  if (!ctx) {
    return {
      hasNav: false,
      openNav: () => {},
      registerNav: () => {},
      unregisterNav: () => {},
    };
  }
  return ctx;
}
