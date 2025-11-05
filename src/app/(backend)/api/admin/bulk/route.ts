/**
 * Admin Bulk Operations API
 * GET /api/admin/bulk - List all bulk jobs
 * POST /api/admin/bulk - Create bulk operation (update, delete, import)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../_lib/auth/admin-auth';
import { AuthorizationError, ValidationError } from '../../_lib/middleware/error-handler';

interface BulkJob {
  id: string;
  type: 'import' | 'export' | 'update' | 'delete';
  entity: 'products' | 'inventory' | 'categories' | 'orders';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ itemId: string; error: string }>;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  fileUrl?: string;
  downloadUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Verify admin authentication
 */


  

/**
 * GET /api/admin/bulk
 * List all bulk jobs with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminSession(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const db = getAdminDb();
    let query = db.collection('bulk_jobs').orderBy('createdAt', 'desc');

    // Apply filters
    if (status) {
      query = query.where('status', '==', status) as any;
    }
    if (type) {
      query = query.where('type', '==', type) as any;
    }

    // Get paginated results
    const snapshot = await query.limit(limit).offset(offset).get();

    const jobs: any[] = [];
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      jobs.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        startedAt: data.startedAt?.toDate?.()?.toISOString() || data.startedAt,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || data.completedAt,
      });
    });

    // Get total count
    const totalSnapshot = await db.collection('bulk_jobs').count().get();
    const total = totalSnapshot.data().count;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/bulk:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch bulk jobs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/bulk
 * Create and execute bulk operation
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminSession(request);

    const body = await request.json();
    const { operation, entity, data, options } = body;

    // Validate required fields
    if (!operation || !entity) {
      throw new ValidationError('Operation and entity are required');
    }

    if (!['update', 'delete', 'import'].includes(operation)) {
      throw new ValidationError('Operation must be update, delete, or import');
    }

    if (!['products', 'inventory', 'categories', 'orders'].includes(entity)) {
      throw new ValidationError('Invalid entity type');
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new ValidationError('Data array is required and must not be empty');
    }

    const db = getAdminDb();

    // Create bulk job
    const jobId = db.collection('bulk_jobs').doc().id;
    const now = new Date();

    const job: Partial<BulkJob> = {
      id: jobId,
      type: operation as any,
      entity: entity as any,
      status: 'pending',
      totalItems: data.length,
      processedItems: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      userId: admin.uid,
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('bulk_jobs').doc(jobId).set(job);

    // Process based on operation type
    let result;
    switch (operation) {
      case 'update':
        result = await processBulkUpdate(jobId, entity, data, options);
        break;
      case 'delete':
        result = await processBulkDelete(jobId, entity, data);
        break;
      case 'import':
        result = await processBulkImport(jobId, entity, data, options);
        break;
      default:
        throw new ValidationError(`Unsupported operation: ${operation}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        ...result,
      },
      message: `Bulk ${operation} operation completed`,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/bulk:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create bulk operation' },
      { status: 500 }
    );
  }
}

/**
 * Process bulk update operation
 */
async function processBulkUpdate(
  jobId: string,
  entity: string,
  data: any[],
  options?: any
) {
  const db = getAdminDb();
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ itemId: string; error: string }> = [];

  try {
    // Update job status to processing
    await db.collection('bulk_jobs').doc(jobId).update({
      status: 'processing',
      updatedAt: new Date(),
    });

    const collectionName = getCollectionName(entity);
    const batch = db.batch();
    let batchCount = 0;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      try {
        if (!item.id) {
          throw new Error('Item ID is required');
        }

        const docRef = db.collection(collectionName).doc(item.id);
        const updates = { ...item.updates, updatedAt: new Date() };
        
        batch.update(docRef, updates);
        batchCount++;

        // Commit batch every 500 operations (Firestore limit)
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }

        successCount++;
      } catch (error: any) {
        errorCount++;
        errors.push({ itemId: item.id || `item-${i}`, error: error.message });
      }

      // Update progress every 10 items
      if ((i + 1) % 10 === 0) {
        await db.collection('bulk_jobs').doc(jobId).update({
          processedItems: i + 1,
          successCount,
          errorCount,
          errors: errors.slice(0, 100), // Store max 100 errors
          updatedAt: new Date(),
        });
      }
    }

    // Commit remaining batch
    if (batchCount > 0) {
      await batch.commit();
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);

    // Update job as completed
    await db.collection('bulk_jobs').doc(jobId).update({
      status: successCount > 0 ? 'completed' : 'failed',
      processedItems: data.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 100),
      completedAt: new Date(),
      duration,
      updatedAt: new Date(),
    });

    return {
      status: successCount > 0 ? 'completed' : 'failed',
      totalItems: data.length,
      successCount,
      errorCount,
      duration,
    };
  } catch (error: any) {
    await db.collection('bulk_jobs').doc(jobId).update({
      status: 'failed',
      errors: [{ itemId: 'system', error: error.message }],
      updatedAt: new Date(),
    });
    throw error;
  }
}

/**
 * Process bulk delete operation
 */
async function processBulkDelete(jobId: string, entity: string, data: any[]) {
  const db = getAdminDb();
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ itemId: string; error: string }> = [];

  try {
    await db.collection('bulk_jobs').doc(jobId).update({
      status: 'processing',
      updatedAt: new Date(),
    });

    const collectionName = getCollectionName(entity);
    const batch = db.batch();
    let batchCount = 0;

    for (let i = 0; i < data.length; i++) {
      const id = typeof data[i] === 'string' ? data[i] : data[i].id;
      try {
        if (!id) {
          throw new Error('Item ID is required');
        }

        const docRef = db.collection(collectionName).doc(id);
        batch.delete(docRef);
        batchCount++;

        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }

        successCount++;
      } catch (error: any) {
        errorCount++;
        errors.push({ itemId: id || `item-${i}`, error: error.message });
      }

      if ((i + 1) % 10 === 0) {
        await db.collection('bulk_jobs').doc(jobId).update({
          processedItems: i + 1,
          successCount,
          errorCount,
          errors: errors.slice(0, 100),
          updatedAt: new Date(),
        });
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);

    await db.collection('bulk_jobs').doc(jobId).update({
      status: successCount > 0 ? 'completed' : 'failed',
      processedItems: data.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 100),
      completedAt: new Date(),
      duration,
      updatedAt: new Date(),
    });

    return {
      status: successCount > 0 ? 'completed' : 'failed',
      totalItems: data.length,
      successCount,
      errorCount,
      duration,
    };
  } catch (error: any) {
    await db.collection('bulk_jobs').doc(jobId).update({
      status: 'failed',
      errors: [{ itemId: 'system', error: error.message }],
      updatedAt: new Date(),
    });
    throw error;
  }
}

/**
 * Process bulk import operation
 */
async function processBulkImport(
  jobId: string,
  entity: string,
  data: any[],
  options?: any
) {
  const db = getAdminDb();
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ itemId: string; error: string }> = [];

  try {
    await db.collection('bulk_jobs').doc(jobId).update({
      status: 'processing',
      updatedAt: new Date(),
    });

    const collectionName = getCollectionName(entity);
    const batch = db.batch();
    let batchCount = 0;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      try {
        // Validate required fields based on entity
        validateEntityData(entity, item);

        const id = item.id || db.collection(collectionName).doc().id;
        const docRef = db.collection(collectionName).doc(id);

        const now = new Date();
        const docData = {
          ...item,
          id,
          createdAt: item.createdAt || now,
          updatedAt: now,
        };

        if (options?.updateExisting) {
          batch.set(docRef, docData, { merge: true });
        } else {
          batch.set(docRef, docData);
        }
        batchCount++;

        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }

        successCount++;
      } catch (error: any) {
        errorCount++;
        errors.push({ itemId: item.id || `row-${i + 1}`, error: error.message });
      }

      if ((i + 1) % 10 === 0) {
        await db.collection('bulk_jobs').doc(jobId).update({
          processedItems: i + 1,
          successCount,
          errorCount,
          errors: errors.slice(0, 100),
          updatedAt: new Date(),
        });
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);

    await db.collection('bulk_jobs').doc(jobId).update({
      status: successCount > 0 ? 'completed' : 'failed',
      processedItems: data.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 100),
      completedAt: new Date(),
      duration,
      updatedAt: new Date(),
    });

    return {
      status: successCount > 0 ? 'completed' : 'failed',
      totalItems: data.length,
      successCount,
      errorCount,
      duration,
    };
  } catch (error: any) {
    await db.collection('bulk_jobs').doc(jobId).update({
      status: 'failed',
      errors: [{ itemId: 'system', error: error.message }],
      updatedAt: new Date(),
    });
    throw error;
  }
}

/**
 * Helper: Get collection name from entity type
 */
function getCollectionName(entity: string): string {
  const collectionMap: { [key: string]: string } = {
    products: 'products',
    inventory: 'inventory_items',
    categories: 'categories',
    orders: 'orders',
  };
  return collectionMap[entity] || entity;
}

/**
 * Helper: Validate entity data before import
 */
function validateEntityData(entity: string, data: any): void {
  switch (entity) {
    case 'products':
      if (!data.name) throw new Error('Product name is required');
      if (!data.price) throw new Error('Product price is required');
      break;
    case 'inventory':
      if (!data.productId) throw new Error('Product ID is required');
      if (data.quantity === undefined) throw new Error('Quantity is required');
      break;
    case 'categories':
      if (!data.name) throw new Error('Category name is required');
      break;
  }
}
