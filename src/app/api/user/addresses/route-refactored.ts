/**
 * User Addresses API - Refactored Version
 * Demonstrates the new middleware pattern
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { 
  createAuthHandler, 
  ResponseHelper, 
  DatabaseHelper,
  createPaginationSchema,
} from "@/lib/api/middleware";

// Validation schemas
const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other']).default('home'),
  name: z.string().min(1, 'Name is required'),
  street: z.string().min(1, 'Street address is required'),
  area: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode is required').max(6),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
});

const getAddressesSchema = createPaginationSchema({ defaultLimit: 20 });

// GET /api/user/addresses - Get user addresses
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
      ttl: 300, // 5 minutes
      key: (request, user) => `addresses:${user?.userId}`,
    },
  }
);

// POST /api/user/addresses - Add new address
export const POST = createAuthHandler(
  async (request, user, validated) => {
    const addressData = validated.body!;
    
    // If this is set as default, unset other defaults
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

    // Create new address
    const newAddress = await DatabaseHelper.createDocument('addresses', {
      userId: user.userId,
      ...addressData,
    });

    return ResponseHelper.success(
      newAddress.data, 
      'Address added successfully', 
      201
    );
  },
  {
    validation: {
      body: addressSchema,
    },
    rateLimit: {
      requests: 10, // Max 10 addresses per 15 minutes
      windowMs: 15 * 60 * 1000,
    },
  }
);
