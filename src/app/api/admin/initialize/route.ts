/**
 * Firebase Initialization API
 * POST /api/admin/initialize
 */

import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/auth/middleware';
import { initializeFirebaseData } from '@/lib/firebase/initialize';

/**
 * Initialize Firebase with sample data
 * POST /api/admin/initialize
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Starting Firebase data initialization...');
    
    const result = await initializeFirebaseData();
    
    if (result.success) {
      return ApiResponse.success(result, 201);
    } else {
      return ApiResponse.error(result.error || 'Failed to initialize data', 500);
    }
  } catch (error: any) {
    console.error('Initialize data error:', error);
    return ApiResponse.error(error.message || 'Failed to initialize Firebase data', 500);
  }
}
