/**
 * Authentication Service
 * All authentication logic is server-side only
 */

import bcrypt from 'bcryptjs';
import { getAdminAuth, getAdminDb } from '../../database/admin';
import { generateToken, JWTPayload } from '../../auth/jwt';
import { User } from '@/types';
import { FirebaseService } from '../../database/services';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(email: string, password: string, name: string, phone?: string, role: 'admin' | 'seller' | 'user' = 'user'): Promise<{ user: User; token: string }> {
    const firebaseService = FirebaseService.getInstance();
    
    try {
      const db = getAdminDb();
      const auth = getAdminAuth();

      // Check if user already exists
      const existingUser = await firebaseService.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });

      // Create user document directly in Firestore with password hash
      const userData = {
        email,
        name,
        ...(phone && { phone }), // Only include phone if it's provided
        role: role,
        passwordHash: hashedPassword,
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection('users').doc(userRecord.uid).set(userData);

      // If user is a seller or admin, create their store in sellers collection
      if (role === 'seller' || role === 'admin') {
        const defaultStoreName = `${name}'s Store`;
        const storeData = {
          userId: userRecord.uid,
          storeName: defaultStoreName,
          storeStatus: 'offline', // Default to offline until they set it up
          storeDescription: '',
          businessName: '',
          isActive: false, // Store needs to be activated
          isVerified: false,
          awayMode: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await db.collection('sellers').doc(userRecord.uid).set(storeData);
      }

      // Generate JWT token with minimal payload
      const token = generateToken({
        userId: userRecord.uid,
        role: role,
      });

      return {
        user: { 
          ...userData, 
          id: userRecord.uid
        } as User,
        token,
      };
    } catch (error: any) {
      console.error('Firebase registration error:', error);
      
      
      throw new Error(`Registration failed: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const db = getAdminDb();

    // Get user from database
    const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();

    if (userSnapshot.empty) {
      throw new Error('Invalid email or password');
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token with minimal payload
    const token = generateToken({
      userId: userDoc.id,
      role: userData.role,
    });

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = userData;

    return {
      user: { ...userWithoutPassword, id: userDoc.id } as User,
      token,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    if (!userData) return null;

    const { passwordHash, ...userWithoutPassword } = userData;
    return { ...userWithoutPassword, id: userDoc.id } as User;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const db = getAdminDb();
    const userRef = db.collection('users').doc(userId);

    // Remove fields that shouldn't be updated
    const { id, email, role, createdAt, passwordHash, ...allowedUpdates } = updates as any;

    await userRef.update({
      ...allowedUpdates,
      updatedAt: new Date().toISOString(),
    });

    const updatedUser = await this.getUserById(userId);
    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const db = getAdminDb();
    const auth = getAdminAuth();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    if (!userData) throw new Error('User data not found');

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userData.passwordHash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password in both Firebase Auth and Firestore
    await auth.updateUser(userId, { password: newPassword });
    await userRef.update({
      passwordHash: hashedPassword,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Add address to user
   */
  static async addAddress(userId: string, address: Omit<User['addresses'][0], 'id'>): Promise<User> {
    const db = getAdminDb();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const addresses = userData?.addresses || [];

    // If this is the default address, unset other defaults
    if (address.isDefault) {
      addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    // If this is the first address, make it default
    if (addresses.length === 0) {
      address.isDefault = true;
    }

    const newAddress = {
      ...address,
      id: db.collection('_').doc().id, // Generate unique ID
    };

    addresses.push(newAddress);

    await userRef.update({
      addresses,
      updatedAt: new Date().toISOString(),
    });

    const updatedUser = await this.getUserById(userId);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    return updatedUser;
  }

  /**
   * Update address
   */
  static async updateAddress(userId: string, addressId: string, updates: Partial<User['addresses'][0]>): Promise<User> {
    const db = getAdminDb();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const addresses = userData?.addresses || [];

    const addressIndex = addresses.findIndex((addr: any) => addr.id === addressId);
    if (addressIndex === -1) {
      throw new Error('Address not found');
    }

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    addresses[addressIndex] = { ...addresses[addressIndex], ...updates };

    await userRef.update({
      addresses,
      updatedAt: new Date().toISOString(),
    });

    const updatedUser = await this.getUserById(userId);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    return updatedUser;
  }

  /**
   * Delete address
   */
  static async deleteAddress(userId: string, addressId: string): Promise<User> {
    const db = getAdminDb();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const addresses = userData?.addresses || [];

    const filteredAddresses = addresses.filter((addr: any) => addr.id !== addressId);

    // If we removed the default address and there are other addresses, make the first one default
    if (filteredAddresses.length > 0) {
      const hadDefault = addresses.some((addr: any) => addr.id === addressId && addr.isDefault);
      if (hadDefault) {
        filteredAddresses[0].isDefault = true;
      }
    }

    await userRef.update({
      addresses: filteredAddresses,
      updatedAt: new Date().toISOString(),
    });

    const updatedUser = await this.getUserById(userId);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    return updatedUser;
  }
}
