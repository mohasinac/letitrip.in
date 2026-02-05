/**
 * NextAuth API Route Handler
 * 
 * Handles all authentication requests:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/csrf
 * - /api/auth/providers
 * - /api/auth/callback/*
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
