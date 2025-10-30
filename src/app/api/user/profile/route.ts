import { NextRequest } from 'next/server';
import { createApiHandler, successResponse, errorResponse, unauthorizedResponse } from '@/lib/api';
import { getAdminAuth, getAdminDb } from '@/lib/database/admin';
import { Address } from '@/types';
import { z } from 'zod';

/**
 * Address validation schema
 */
const AddressSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
});

/**
 * Profile update schema
 */
const ProfileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
  addresses: z.array(AddressSchema).max(5, 'Maximum 5 addresses allowed').optional(),
});

/**
 * GET /api/user/profile
 * Get current user profile
 */
export const GET = createApiHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorizedResponse('Not authenticated');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return errorResponse('User not found', 404);
    }

    const userData = userDoc.data();
    
    return successResponse({
      id: decodedToken.uid,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: userData?.name || userData?.displayName,
      phone: userData?.phone,
      role: userData?.role || 'user',
      addresses: userData?.addresses || [],
      createdAt: userData?.createdAt,
      updatedAt: userData?.updatedAt,
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return errorResponse(error.message || 'Failed to fetch profile');
  }
});

/**
 * PUT /api/user/profile
 * Update user profile (including addresses)
 */
export const PUT = createApiHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorizedResponse('Not authenticated');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const body = await request.json();
    
    // Validate input
    const validationResult = ProfileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.errors[0].message, 400);
    }

    const updates = validationResult.data;
    const db = getAdminDb();
    const userRef = db.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return errorResponse('User not found', 404);
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }

    if (updates.phone !== undefined) {
      updateData.phone = updates.phone;
    }

    if (updates.addresses !== undefined) {
      // Validate address limit
      if (updates.addresses.length > 5) {
        return errorResponse('Maximum 5 addresses allowed', 400);
      }

      // Generate IDs for new addresses
      const processedAddresses = updates.addresses.map((addr, index) => ({
        ...addr,
        id: addr.id || `addr_${Date.now()}_${index}`,
      }));

      // Ensure only one default address
      const defaultAddresses = processedAddresses.filter(addr => addr.isDefault);
      if (defaultAddresses.length > 1) {
        return errorResponse('Only one address can be set as default', 400);
      }

      updateData.addresses = processedAddresses;
    }

    // Update Firestore
    await userRef.update(updateData);

    // Fetch updated user data
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();

    return successResponse({
      id: decodedToken.uid,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: updatedData?.name,
      phone: updatedData?.phone,
      role: updatedData?.role || 'user',
      addresses: updatedData?.addresses || [],
      updatedAt: updatedData?.updatedAt,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return errorResponse(error.message || 'Failed to update profile');
  }
});

/**
 * PATCH /api/user/profile
 * Partial update of user profile
 */
export const PATCH = PUT;
