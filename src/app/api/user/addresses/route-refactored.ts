/**
 * User Addresses API - Refactored Version
 * Demonstrates the new middleware pattern with comprehensive validation
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { 
  createAuthHandler, 
  ResponseHelper, 
  DatabaseHelper,
  createPaginationSchema,
} from "@/lib/api/middleware";
import { addressSchema } from "@/lib/validations";

// Query validation schema for GET requests
const getAddressesSchema = createPaginationSchema({ defaultLimit: 20 });

// GET /api/user/addresses - Get user addresses with pagination and caching
export const GET = createAuthHandler(
  async (request, user, validated) => {
    const { page, limit } = validated.query!;
    
    const addresses = await DatabaseHelper.queryDocuments('addresses', {
      filters: { userId: user.userId },
      pagination: { page, limit },
      sort: [{ field: 'createdAt', direction: 'desc' }],
    });

    return ResponseHelper.success(addresses, 'Addresses retrieved successfully');
  },
  {
    validation: {
      query: getAddressesSchema,
    },
    cache: {
      ttl: 300, // 5 minutes cache
      key: (request, user) => `addresses:${user?.userId}:${request.url}`,
    },
    rateLimit: {
      requests: 30, // 30 requests per 15 minutes
      windowMs: 15 * 60 * 1000,
    },
  }
);

// POST /api/user/addresses - Add new address with comprehensive validation
export const POST = createAuthHandler(
  async (request, user, validated) => {
    const addressData = validated.body!;
    
    // Check if user already has maximum addresses (e.g., 10)
    const existingAddresses = await DatabaseHelper.queryDocuments('addresses', {
      filters: { userId: user.userId },
    });
    
    if (existingAddresses.pagination.totalItems >= 10) {
      return ResponseHelper.badRequest('Maximum 10 addresses allowed per user');
    }
    
    // If this is set as default, unset other defaults using batch operations
    if (addressData.isDefault) {
      const currentDefaults = await DatabaseHelper.queryDocuments('addresses', {
        filters: { userId: user.userId, isDefault: true },
      });

      if (currentDefaults.data.length > 0) {
        const updateOperations = currentDefaults.data.map((addr: any) => ({
          type: 'update' as const,
          collection: 'addresses',
          id: addr.id,
          data: { isDefault: false },
        }));

        await DatabaseHelper.batchOperations(updateOperations);
      }
    }

    // Create new address with comprehensive data
    const newAddress = await DatabaseHelper.createDocument('addresses', {
      userId: user.userId,
      ...addressData,
      // Add additional metadata
      verified: false,
      lastUsed: null,
      usageCount: 0,
    });

    return ResponseHelper.success(
      newAddress.data, 
      'Address added successfully'
    );
  },
  {
    validation: {
      body: addressSchema,
    },
    rateLimit: {
      requests: 10, // Max 10 new addresses per 15 minutes
      windowMs: 15 * 60 * 1000,
    },
  }
);

// PUT /api/user/addresses/[id] - Update existing address
export const PUT = createAuthHandler(
  async (request, user, validated) => {
    const { id } = validated.params!;
    const updateData = validated.body!;
    
    // Verify address belongs to user
    const existingAddress = await DatabaseHelper.getDocumentById('addresses', id);
    if (!existingAddress || (existingAddress as any).userId !== user.userId) {
      return ResponseHelper.notFound('Address not found');
    }
    
    // Handle default address logic
    if (updateData.isDefault) {
      const currentDefaults = await DatabaseHelper.queryDocuments('addresses', {
        filters: { userId: user.userId, isDefault: true },
      });

      const updateOperations = currentDefaults.data
        .filter((addr: any) => addr.id !== id)
        .map((addr: any) => ({
          type: 'update' as const,
          collection: 'addresses',
          id: addr.id,
          data: { isDefault: false },
        }));

      if (updateOperations.length > 0) {
        await DatabaseHelper.batchOperations(updateOperations);
      }
    }

    // Update the address
    const updatedAddress = await DatabaseHelper.updateDocument('addresses', id, updateData);

    return ResponseHelper.success(
      updatedAddress,
      'Address updated successfully'
    );
  },
  {
    validation: {
      body: addressSchema.partial(),
      params: z.object({
        id: z.string().min(1, 'ID is required'),
      }),
    },
    rateLimit: {
      requests: 20, // 20 updates per 15 minutes
      windowMs: 15 * 60 * 1000,
    },
  }
);

// DELETE /api/user/addresses/[id] - Delete address
export const DELETE = createAuthHandler(
  async (request, user, validated) => {
    const { id } = validated.params!;
    
    // Verify address belongs to user
    const existingAddress = await DatabaseHelper.getDocumentById('addresses', id);
    if (!existingAddress || (existingAddress as any).userId !== user.userId) {
      return ResponseHelper.notFound('Address not found');
    }
    
    // Prevent deletion of default address if it's the only one
    if ((existingAddress as any).isDefault) {
      const totalAddresses = await DatabaseHelper.queryDocuments('addresses', {
        filters: { userId: user.userId },
      });
      
      if (totalAddresses.pagination.totalItems <= 1) {
        return ResponseHelper.badRequest('Cannot delete the only address');
      }
    }

    // Delete the address
    await DatabaseHelper.deleteDocument('addresses', id);

    return ResponseHelper.success(
      null,
      'Address deleted successfully'
    );
  },
  {
    validation: {
      params: z.object({
        id: z.string().min(1, 'ID is required'),
      }),
    },
    rateLimit: {
      requests: 10, // 10 deletions per 15 minutes
      windowMs: 15 * 60 * 1000,
    },
  }
);
