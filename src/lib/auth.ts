/**
 * NextAuth Configuration
 * 
 * Server-side authentication configuration using NextAuth v5.
 * Supports multiple authentication providers:
 * - Credentials (Email/Phone + Password)
 * - Google OAuth
 * - Apple OAuth
 * 
 * Features:
 * - Server-side session management
 * - Custom user roles stored in Firestore
 * - JWT with custom claims
 * - Session callbacks for role propagation
 */

import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { UserRole } from '@/types/auth';
import bcrypt from 'bcryptjs';

export const authConfig: NextAuthConfig = {
  adapter: FirestoreAdapter(adminDb),
  providers: [
    // Credentials Provider (Email/Phone + Password)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        emailOrPhone: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.emailOrPhone || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const identifier = credentials.emailOrPhone as string;
        const password = credentials.password as string;

        try {
          // Check if identifier is email or phone
          const isEmail = identifier.includes('@');
          
          let userDoc;
          if (isEmail) {
            // Query by email
            const usersRef = adminDb.collection('users');
            const snapshot = await usersRef.where('email', '==', identifier).limit(1).get();
            
            if (snapshot.empty) {
              throw new Error('User not found');
            }
            
            userDoc = snapshot.docs[0];
          } else {
            // Query by phone
            const usersRef = adminDb.collection('users');
            const snapshot = await usersRef.where('phoneNumber', '==', identifier).limit(1).get();
            
            if (snapshot.empty) {
              throw new Error('User not found');
            }
            
            userDoc = snapshot.docs[0];
          }

          const userData = userDoc.data();

          // Verify password
          const isValidPassword = await bcrypt.compare(password, userData.password);
          
          if (!isValidPassword) {
            throw new Error('Invalid password');
          }

          // Check if user is disabled
          if (userData.disabled) {
            throw new Error('Account is disabled');
          }

          // Return user data
          return {
            id: userDoc.id,
            email: userData.email || null,
            name: userData.displayName || null,
            image: userData.photoURL || null,
            role: userData.role || 'user',
            phoneNumber: userData.phoneNumber || null,
            emailVerified: userData.emailVerified || false,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Apple OAuth Provider
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
  ],

  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/welcome',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, create/update user profile in Firestore
      if (account?.provider === 'google' || account?.provider === 'apple') {
        if (!user.id) return false;
        
        try {
          const userRef = adminDb.collection('users').doc(user.id);
          const userDoc = await userRef.get();

          if (!userDoc.exists) {
            // Create new user profile with default role
            await userRef.set({
              email: user.email,
              displayName: user.name,
              photoURL: user.image,
              role: 'user' as UserRole,
              emailVerified: true,
              disabled: false,
              provider: account.provider,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            // Update last sign in
            await userRef.update({
              updatedAt: new Date(),
            });
          }
        } catch (error) {
          console.error('Error creating user profile:', error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Add custom claims to JWT
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'user';
        token.phoneNumber = (user as any).phoneNumber || null;
        token.emailVerified = (user as any).emailVerified || false;
      }

      // Handle session update (e.g., role change)
      if (trigger === 'update' && session) {
        token.role = session.role || token.role;
        token.name = session.name || token.name;
        token.picture = session.image || token.picture;
      }

      return token;
    },

    async session({ session, token }) {
      // Add custom fields to session
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as UserRole;
        (session.user as any).phoneNumber = token.phoneNumber as string | null;
        (session.user as any).emailVerified = token.emailVerified as boolean;
      }

      return session;
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
