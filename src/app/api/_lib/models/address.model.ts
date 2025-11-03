/**
 * Address Model
 * 
 * Database layer for address operations
 * 
 * Features:
 * - CRUD operations for user addresses
 * - Default address management
 * - Address validation
 * - User-scoped queries
 */

import { getAdminDb } from '../database/admin';
import { Address } from '@/types/address';
import { NotFoundError, ValidationError, AuthorizationError } from '../middleware/error-handler';

// Extend Address with version for concurrency control
export interface AddressWithVersion extends Address {
  version?: number;
}

/**
 * Create address input
 */
export interface CreateAddressInput {
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

/**
 * Update address input
 */
export interface UpdateAddressInput {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  type?: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

// ============================================================================
// Address Model Class
// ============================================================================

export class AddressModel {
  private db: FirebaseFirestore.Firestore;
  private collection: FirebaseFirestore.CollectionReference;

  constructor() {
    this.db = getAdminDb();
    this.collection = this.db.collection('addresses');
  }

  /**
   * Create a new address
   */
  async create(data: CreateAddressInput): Promise<AddressWithVersion> {
    // Validate required fields
    this.validateAddressData(data);

    const now = new Date().toISOString();
    const batch = this.db.batch();

    // If this is default, unset other defaults for this user
    if (data.isDefault) {
      const existingDefaults = await this.collection
        .where('userId', '==', data.userId)
        .where('isDefault', '==', true)
        .get();

      existingDefaults.docs.forEach(doc => {
        batch.update(doc.ref, { isDefault: false, updatedAt: now });
      });
    }

    // Create new address
    const addressRef = this.collection.doc();
    const addressData: Omit<AddressWithVersion, 'id'> = {
      userId: data.userId,
      fullName: data.fullName,
      phone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || '',
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: data.country || 'India',
      type: data.type || 'home',
      isDefault: data.isDefault || false,
      createdAt: now,
      updatedAt: now,
      version: 1,
    };

    batch.set(addressRef, addressData);
    await batch.commit();

    return {
      id: addressRef.id,
      ...addressData,
    };
  }

  /**
   * Find all addresses for a user
   */
  async findByUserId(userId: string): Promise<AddressWithVersion[]> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as AddressWithVersion));
  }

  /**
   * Find address by ID
   */
  async findById(id: string): Promise<AddressWithVersion | null> {
    const doc = await this.collection.doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as AddressWithVersion;
  }

  /**
   * Get default address for a user
   */
  async getDefaultAddress(userId: string): Promise<AddressWithVersion | null> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .where('isDefault', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as AddressWithVersion;
  }

  /**
   * Update an address
   */
  async update(
    id: string,
    userId: string,
    data: UpdateAddressInput
  ): Promise<AddressWithVersion> {
    const addressRef = this.collection.doc(id);
    const addressDoc = await addressRef.get();

    if (!addressDoc.exists) {
      throw new NotFoundError('Address not found');
    }

    const addressData = addressDoc.data();

    // Verify ownership
    if (addressData?.userId !== userId) {
      throw new AuthorizationError('You do not have permission to update this address');
    }

    const now = new Date().toISOString();
    const batch = this.db.batch();

    // If setting as default, unset other defaults
    if (data.isDefault) {
      const existingDefaults = await this.collection
        .where('userId', '==', userId)
        .where('isDefault', '==', true)
        .get();

      existingDefaults.docs.forEach(doc => {
        if (doc.id !== id) {
          batch.update(doc.ref, { isDefault: false, updatedAt: now });
        }
      });
    }

    // Update the address
    const updateData: any = {
      ...data,
      updatedAt: now,
      version: (addressData?.version || 0) + 1,
    };

    batch.update(addressRef, updateData);
    await batch.commit();

    // Get updated address
    const updatedDoc = await addressRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as AddressWithVersion;
  }

  /**
   * Delete an address
   */
  async delete(id: string, userId: string): Promise<void> {
    const addressRef = this.collection.doc(id);
    const addressDoc = await addressRef.get();

    if (!addressDoc.exists) {
      throw new NotFoundError('Address not found');
    }

    const addressData = addressDoc.data();

    // Verify ownership
    if (addressData?.userId !== userId) {
      throw new AuthorizationError('You do not have permission to delete this address');
    }

    await addressRef.delete();
  }

  /**
   * Set address as default
   */
  async setDefault(id: string, userId: string): Promise<AddressWithVersion> {
    const addressRef = this.collection.doc(id);
    const addressDoc = await addressRef.get();

    if (!addressDoc.exists) {
      throw new NotFoundError('Address not found');
    }

    const addressData = addressDoc.data();

    // Verify ownership
    if (addressData?.userId !== userId) {
      throw new AuthorizationError('You do not have permission to update this address');
    }

    const now = new Date().toISOString();
    const batch = this.db.batch();

    // Unset all other defaults
    const existingDefaults = await this.collection
      .where('userId', '==', userId)
      .where('isDefault', '==', true)
      .get();

    existingDefaults.docs.forEach(doc => {
      batch.update(doc.ref, { isDefault: false, updatedAt: now });
    });

    // Set this one as default
    batch.update(addressRef, {
      isDefault: true,
      updatedAt: now,
      version: (addressData?.version || 0) + 1,
    });

    await batch.commit();

    // Get updated address
    const updatedDoc = await addressRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as AddressWithVersion;
  }

  /**
   * Validate address data
   */
  private validateAddressData(data: CreateAddressInput): void {
    if (!data.fullName || data.fullName.length < 2) {
      throw new ValidationError('Full name must be at least 2 characters');
    }

    if (!data.phone || !/^\+?[1-9]\d{1,14}$/.test(data.phone)) {
      throw new ValidationError('Invalid phone number format');
    }

    if (!data.addressLine1 || data.addressLine1.length < 5) {
      throw new ValidationError('Address line 1 must be at least 5 characters');
    }

    if (!data.city || data.city.length < 2) {
      throw new ValidationError('City is required');
    }

    if (!data.state || data.state.length < 2) {
      throw new ValidationError('State is required');
    }

    if (!data.pincode || !/^\d{5,6}$/.test(data.pincode)) {
      throw new ValidationError('Invalid pincode format');
    }

    if (!data.country || data.country.length < 2) {
      throw new ValidationError('Country is required');
    }

    if (data.type && !['home', 'work', 'other'].includes(data.type)) {
      throw new ValidationError('Invalid address type');
    }
  }

  /**
   * Count addresses for a user
   */
  async countByUserId(userId: string): Promise<number> {
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .count()
      .get();

    return snapshot.data().count;
  }
}

// Export singleton instance
export const addressModel = new AddressModel();
