/**
 * Auth Provider
 * 
 * Client-side auth provider using next-auth/react SessionProvider
 * For server components, use auth() directly from @/lib/auth
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
