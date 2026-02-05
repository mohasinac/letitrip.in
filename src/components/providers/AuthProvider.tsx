/**
 * Session Provider Wrapper
 * 
 * Client component wrapper for NextAuth SessionProvider.
 * Must be used in root layout to enable useSession hook throughout the app.
 */

'use client';

import { SessionProvider } from 'next-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
