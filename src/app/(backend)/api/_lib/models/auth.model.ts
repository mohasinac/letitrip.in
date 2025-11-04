/**
 * Auth Model
 * 
 * Database layer for authentication operations with Firebase Admin SDK
 * 
 * Features:
 * - User registration (email/password, OTP, social)
 * - JWT token verification
 * - Password management
 * - OTP management
 * - Account verification
 * - Session management
 */

import { getAdminDb, getAdminAuth } from '../database/admin';
import { ConflictError, NotFoundError, ValidationError, AuthorizationError } from '../middleware/error-handler';
import * as admin from 'firebase-admin';

// ============================================================================
// Types
// ============================================================================

/**
 * User registration data
 */
export interface RegisterUserData {
  email: string;
  password?: string; // Optional for OTP/social registration
  name: string;
  phone?: string;
  role?: 'admin' | 'seller' | 'user';
  photoURL?: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook';
}

/**
 * OTP data for verification
 */
export interface OTPData {
  phone: string;
  otp: string;
  expiresAt: string;
  attempts: number;
  createdAt: string;
}

/**
 * Session data
 */
export interface SessionData {
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// Auth Model Class
// ============================================================================

export class AuthModel {
  private db: FirebaseFirestore.Firestore;
  private auth: admin.auth.Auth;
  private usersCollection: FirebaseFirestore.CollectionReference;
  private otpCollection: FirebaseFirestore.CollectionReference;
  private sessionsCollection: FirebaseFirestore.CollectionReference;

  constructor() {
    this.db = getAdminDb();
    this.auth = getAdminAuth();
    this.usersCollection = this.db.collection('users');
    this.otpCollection = this.db.collection('otps');
    this.sessionsCollection = this.db.collection('sessions');
  }

  // ==========================================================================
  // User Registration
  // ==========================================================================

  /**
   * Register a new user with email/password
   */
  async registerWithEmail(data: RegisterUserData): Promise<{ uid: string; user: any }> {
    try {
      // Check if user already exists
      try {
        await this.auth.getUserByEmail(data.email);
        throw new ConflictError('User already exists with this email');
      } catch (error: any) {
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
        // User doesn't exist, continue
      }

      // Validate password if provided
      if (data.password && data.password.length < 6) {
        throw new ValidationError('Password must be at least 6 characters');
      }

      // Create Firebase Auth user
      const createUserParams: admin.auth.CreateRequest = {
        email: data.email,
        displayName: data.name,
        password: data.password,
        phoneNumber: data.phone,
        photoURL: data.photoURL,
      };

      const userRecord = await this.auth.createUser(createUserParams);

      // Create Firestore user document
      const now = new Date().toISOString();
      const userData = {
        email: data.email.toLowerCase(),
        name: data.name,
        phone: data.phone || null,
        role: data.role || 'user',
        avatar: data.photoURL || null,
        photoURL: data.photoURL || null,
        displayName: data.name,
        status: 'active',
        isEmailVerified: false,
        isPhoneVerified: false,
        emailVerified: false,
        phoneVerified: false,
        addresses: [],
        preferredCurrency: 'INR',
        provider: data.provider || 'email',
        preferences: {
          newsletter: true,
          smsNotifications: true,
          orderUpdates: true,
          language: 'en',
          timezone: 'Asia/Kolkata',
        },
        profile: {},
        metadata: {
          lastLoginAt: now,
          loginCount: 1,
        },
        createdAt: now,
        updatedAt: now,
        lastLogin: now,
        version: 1,
      };

      await this.usersCollection.doc(userRecord.uid).set(userData);

      return {
        uid: userRecord.uid,
        user: {
          id: userRecord.uid,
          uid: userRecord.uid,
          ...userData,
        },
      };
    } catch (error: any) {
      if (error instanceof ConflictError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Register a new user with phone/OTP
   */
  async registerWithPhone(data: RegisterUserData): Promise<{ uid: string; user: any }> {
    if (!data.phone) {
      throw new ValidationError('Phone number is required');
    }

    try {
      // Check if user already exists with this phone
      try {
        await this.auth.getUserByPhoneNumber(data.phone);
        throw new ConflictError('User already exists with this phone number');
      } catch (error: any) {
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
        // User doesn't exist, continue
      }

      // Create Firebase Auth user
      const createUserParams: admin.auth.CreateRequest = {
        phoneNumber: data.phone,
        displayName: data.name,
        email: data.email,
        photoURL: data.photoURL,
      };

      const userRecord = await this.auth.createUser(createUserParams);

      // Create Firestore user document
      const now = new Date().toISOString();
      const userData = {
        email: data.email?.toLowerCase() || null,
        name: data.name,
        phone: data.phone,
        role: data.role || 'user',
        avatar: data.photoURL || null,
        photoURL: data.photoURL || null,
        displayName: data.name,
        status: 'active',
        isEmailVerified: false,
        isPhoneVerified: true, // Phone is verified through OTP
        emailVerified: false,
        phoneVerified: true,
        addresses: [],
        preferredCurrency: 'INR',
        provider: data.provider || 'phone',
        preferences: {
          newsletter: true,
          smsNotifications: true,
          orderUpdates: true,
          language: 'en',
          timezone: 'Asia/Kolkata',
        },
        profile: {},
        metadata: {
          lastLoginAt: now,
          loginCount: 1,
        },
        createdAt: now,
        updatedAt: now,
        lastLogin: now,
        version: 1,
      };

      await this.usersCollection.doc(userRecord.uid).set(userData);

      return {
        uid: userRecord.uid,
        user: {
          id: userRecord.uid,
          uid: userRecord.uid,
          ...userData,
        },
      };
    } catch (error: any) {
      if (error instanceof ConflictError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`Phone registration failed: ${error.message}`);
    }
  }

  // ==========================================================================
  // Token Verification
  // ==========================================================================

  /**
   * Verify Firebase ID token
   */
  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await this.auth.verifyIdToken(token);
      
      // Update last login
      await this.updateLastLogin(decodedToken.uid);
      
      return decodedToken;
    } catch (error: any) {
      throw new AuthorizationError('Invalid or expired token');
    }
  }

  /**
   * Get user data by ID token
   */
  async getUserByToken(token: string): Promise<any> {
    const decodedToken = await this.verifyToken(token);
    
    // Get user data from Firestore
    const userDoc = await this.usersCollection.doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      // Return basic Firebase data if Firestore doc doesn't exist yet
      return {
        id: decodedToken.uid,
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        role: 'user',
        isEmailVerified: decodedToken.email_verified || false,
        isPhoneVerified: false,
      };
    }
    
    const userData = userDoc.data();
    return {
      id: decodedToken.uid,
      uid: decodedToken.uid,
      ...userData,
    };
  }

  // ==========================================================================
  // Password Management
  // ==========================================================================

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Validate new password
      if (newPassword.length < 6) {
        throw new ValidationError('New password must be at least 6 characters');
      }

      // Get user record
      const userRecord = await this.auth.getUser(userId);
      
      if (!userRecord.email) {
        throw new ValidationError('User does not have an email account');
      }

      // Note: Firebase Admin SDK doesn't have a way to verify current password
      // In production, you should use client SDK for password change
      // or implement additional verification

      // Update password
      await this.auth.updateUser(userId, {
        password: newPassword,
      });

      // Update Firestore
      await this.usersCollection.doc(userId).update({
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`Password change failed: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // Verify user exists
      await this.auth.getUserByEmail(email);
      
      // Generate password reset link
      const link = await this.auth.generatePasswordResetLink(email);
      
      // In production, send email with the link
      // For now, just log it
      console.log('Password reset link:', link);
      
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Don't reveal if user exists or not for security
        return;
      }
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  // ==========================================================================
  // OTP Management
  // ==========================================================================

  /**
   * Generate and store OTP
   */
  async generateOTP(phone: string): Promise<string> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
    
    const otpData: OTPData = {
      phone,
      otp,
      expiresAt: expiresAt.toISOString(),
      attempts: 0,
      createdAt: now.toISOString(),
    };
    
    // Store OTP (overwrite existing)
    await this.otpCollection.doc(phone).set(otpData);
    
    return otp;
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phone: string, otp: string): Promise<boolean> {
    const otpDoc = await this.otpCollection.doc(phone).get();
    
    if (!otpDoc.exists) {
      throw new ValidationError('OTP not found or expired');
    }
    
    const otpData = otpDoc.data() as OTPData;
    
    // Check expiry
    if (new Date(otpData.expiresAt) < new Date()) {
      await this.otpCollection.doc(phone).delete();
      throw new ValidationError('OTP has expired');
    }
    
    // Check attempts
    if (otpData.attempts >= 3) {
      await this.otpCollection.doc(phone).delete();
      throw new ValidationError('Too many failed attempts');
    }
    
    // Verify OTP
    if (otpData.otp !== otp) {
      // Increment attempts
      await this.otpCollection.doc(phone).update({
        attempts: otpData.attempts + 1,
      });
      throw new ValidationError('Invalid OTP');
    }
    
    // OTP verified, delete it
    await this.otpCollection.doc(phone).delete();
    
    return true;
  }

  // ==========================================================================
  // Account Management
  // ==========================================================================

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<void> {
    try {
      // Delete from Firebase Auth
      await this.auth.deleteUser(userId);
      
      // Delete from Firestore
      await this.usersCollection.doc(userId).delete();
      
      // Delete user sessions
      const sessionsQuery = await this.sessionsCollection
        .where('userId', '==', userId)
        .get();
      
      const batch = this.db.batch();
      sessionsQuery.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
    } catch (error: any) {
      throw new Error(`Account deletion failed: ${error.message}`);
    }
  }

  /**
   * Update email verification status
   */
  async setEmailVerified(userId: string, verified: boolean): Promise<void> {
    await Promise.all([
      this.auth.updateUser(userId, { emailVerified: verified }),
      this.usersCollection.doc(userId).update({
        isEmailVerified: verified,
        emailVerified: verified,
        updatedAt: new Date().toISOString(),
      }),
    ]);
  }

  /**
   * Update phone verification status
   */
  async setPhoneVerified(userId: string, verified: boolean): Promise<void> {
    await this.usersCollection.doc(userId).update({
      isPhoneVerified: verified,
      phoneVerified: verified,
      updatedAt: new Date().toISOString(),
    });
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  /**
   * Update last login timestamp
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      const userDoc = await this.usersCollection.doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const loginCount = (userData?.metadata?.loginCount || 0) + 1;
        
        await this.usersCollection.doc(userId).update({
          lastLogin: new Date().toISOString(),
          'metadata.lastLoginAt': new Date().toISOString(),
          'metadata.loginCount': loginCount,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      // Silently fail, don't block authentication
      console.error('Failed to update last login:', error);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<any> {
    try {
      const userRecord = await this.auth.getUserByEmail(email);
      const userDoc = await this.usersCollection.doc(userRecord.uid).get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      return {
        id: userRecord.uid,
        uid: userRecord.uid,
        ...userDoc.data(),
      };
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get user by phone
   */
  async getUserByPhone(phone: string): Promise<any> {
    try {
      const userRecord = await this.auth.getUserByPhoneNumber(phone);
      const userDoc = await this.usersCollection.doc(userRecord.uid).get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      return {
        id: userRecord.uid,
        uid: userRecord.uid,
        ...userDoc.data(),
      };
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      throw error;
    }
  }
}

// Export singleton instance
export const authModel = new AuthModel();
