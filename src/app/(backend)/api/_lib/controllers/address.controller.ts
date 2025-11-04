/**
 * Address Controller
 * 
 * Business logic layer for address operations with RBAC
 * 
 * Features:
 * - User address management
 * - Default address handling
 * - Address validation
 * - Owner-only access
 */

import { addressModel, CreateAddressInput, UpdateAddressInput, AddressWithVersion } from '../models/address.model';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../middleware/error-handler';

// ============================================================================
// Types
// ============================================================================

/**
 * User context for RBAC
 */
export interface UserContext {
  userId: string;
  role: 'admin' | 'seller' | 'user';
  email?: string;
}

/**
 * Create address input from API
 */
export interface CreateAddressData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  type?: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

/**
 * Update address input from API
 */
export interface UpdateAddressData {
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
// Controller Functions
// ============================================================================

/**
 * Get all addresses for the authenticated user
 */
export async function getUserAddresses(
  userContext: UserContext
): Promise<AddressWithVersion[]> {
  const addresses = await addressModel.findByUserId(userContext.userId);
  return addresses;
}

/**
 * Get address by ID
 * User can only view their own addresses
 */
export async function getAddressById(
  id: string,
  userContext: UserContext
): Promise<AddressWithVersion> {
  const address = await addressModel.findById(id);

  if (!address) {
    throw new NotFoundError('Address not found');
  }

  // Users can only view their own addresses
  if (address.userId !== userContext.userId) {
    throw new AuthorizationError('You do not have permission to view this address');
  }

  return address;
}

/**
 * Get default address for the authenticated user
 */
export async function getDefaultAddress(
  userContext: UserContext
): Promise<AddressWithVersion | null> {
  const address = await addressModel.getDefaultAddress(userContext.userId);
  return address;
}

/**
 * Create a new address
 * Users can only create addresses for themselves
 */
export async function createAddress(
  data: CreateAddressData,
  userContext: UserContext
): Promise<AddressWithVersion> {
  // Validate input
  if (!data.fullName || data.fullName.trim().length < 2) {
    throw new ValidationError('Full name must be at least 2 characters');
  }

  if (!data.phone || data.phone.trim().length < 10) {
    throw new ValidationError('Phone number is required');
  }

  if (!data.addressLine1 || data.addressLine1.trim().length < 5) {
    throw new ValidationError('Address line 1 must be at least 5 characters');
  }

  if (!data.city || data.city.trim().length < 2) {
    throw new ValidationError('City is required');
  }

  if (!data.state || data.state.trim().length < 2) {
    throw new ValidationError('State is required');
  }

  if (!data.pincode || data.pincode.trim().length < 5) {
    throw new ValidationError('Pincode is required');
  }

  // Create address for the authenticated user
  const createData: CreateAddressInput = {
    userId: userContext.userId,
    fullName: data.fullName.trim(),
    phone: data.phone.trim(),
    addressLine1: data.addressLine1.trim(),
    addressLine2: data.addressLine2?.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    pincode: data.pincode.trim(),
    country: data.country?.trim() || 'India',
    type: data.type || 'home',
    isDefault: data.isDefault || false,
  };

  const address = await addressModel.create(createData);

  return address;
}

/**
 * Update an address
 * Users can only update their own addresses
 */
export async function updateAddress(
  id: string,
  data: UpdateAddressData,
  userContext: UserContext
): Promise<AddressWithVersion> {
  // Validate at least one field is being updated
  if (Object.keys(data).length === 0) {
    throw new ValidationError('No fields to update');
  }

  // Validate input if provided
  if (data.fullName !== undefined && data.fullName.trim().length < 2) {
    throw new ValidationError('Full name must be at least 2 characters');
  }

  if (data.phone !== undefined && data.phone.trim().length < 10) {
    throw new ValidationError('Phone number must be at least 10 characters');
  }

  if (data.addressLine1 !== undefined && data.addressLine1.trim().length < 5) {
    throw new ValidationError('Address line 1 must be at least 5 characters');
  }

  if (data.city !== undefined && data.city.trim().length < 2) {
    throw new ValidationError('City must be at least 2 characters');
  }

  if (data.state !== undefined && data.state.trim().length < 2) {
    throw new ValidationError('State must be at least 2 characters');
  }

  if (data.pincode !== undefined && data.pincode.trim().length < 5) {
    throw new ValidationError('Pincode must be at least 5 characters');
  }

  if (data.type && !['home', 'work', 'other'].includes(data.type)) {
    throw new ValidationError('Invalid address type');
  }

  // Trim string fields
  const updateData: UpdateAddressInput = {};
  if (data.fullName) updateData.fullName = data.fullName.trim();
  if (data.phone) updateData.phone = data.phone.trim();
  if (data.addressLine1) updateData.addressLine1 = data.addressLine1.trim();
  if (data.addressLine2 !== undefined) updateData.addressLine2 = data.addressLine2?.trim();
  if (data.city) updateData.city = data.city.trim();
  if (data.state) updateData.state = data.state.trim();
  if (data.pincode) updateData.pincode = data.pincode.trim();
  if (data.country) updateData.country = data.country.trim();
  if (data.type) updateData.type = data.type;
  if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

  const address = await addressModel.update(id, userContext.userId, updateData);

  return address;
}

/**
 * Delete an address
 * Users can only delete their own addresses
 */
export async function deleteAddress(
  id: string,
  userContext: UserContext
): Promise<{ message: string }> {
  await addressModel.delete(id, userContext.userId);

  return {
    message: 'Address deleted successfully',
  };
}

/**
 * Set address as default
 * Users can only set their own addresses as default
 */
export async function setDefaultAddress(
  id: string,
  userContext: UserContext
): Promise<AddressWithVersion> {
  const address = await addressModel.setDefault(id, userContext.userId);

  return address;
}

/**
 * Count user's addresses
 */
export async function countUserAddresses(
  userContext: UserContext
): Promise<{ count: number }> {
  const count = await addressModel.countByUserId(userContext.userId);

  return { count };
}
