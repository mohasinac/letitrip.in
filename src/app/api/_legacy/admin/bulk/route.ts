import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import * as XLSX from "xlsx";

const adminDb = getAdminDb();
const BULK_JOBS_COLLECTION = "bulk_jobs";

// Interfaces
interface BulkJob {
  id: string;
  type: "import" | "export" | "update" | "delete";
  entity: "products" | "inventory" | "categories" | "orders";
  status: "pending" | "processing" | "completed" | "failed";
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ itemId: string; error: string }>;
  userId: string;
  startedAt: string;
  completedAt?: string;
  duration?: number; // seconds
  fileUrl?: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// GET /api/admin/bulk - List all bulk jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    let query = adminDb.collection(BULK_JOBS_COLLECTION).orderBy("createdAt", "desc");

    // Apply filters
    if (status) {
      query = query.where("status", "==", status) as any;
    }
    if (type) {
      query = query.where("type", "==", type) as any;
    }

    // Get paginated results
    const snapshot = await query.limit(limit).offset(offset).get();

    const jobs: BulkJob[] = [];
    snapshot.forEach((doc) => {
      jobs.push({
        id: doc.id,
        ...doc.data(),
      } as BulkJob);
    });

    // Get total count
    const totalSnapshot = await adminDb.collection(BULK_JOBS_COLLECTION).count().get();
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
    console.error("Error fetching bulk jobs:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bulk jobs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/bulk - Create bulk operation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, entity, data, options } = body;

    // Validate required fields
    if (!operation || !entity) {
      return NextResponse.json(
        { success: false, error: "Operation and entity are required" },
        { status: 400 }
      );
    }

    // Create bulk job
    const jobId = adminDb.collection(BULK_JOBS_COLLECTION).doc().id;
    const now = new Date().toISOString();

    const job: BulkJob = {
      id: jobId,
      type: operation,
      entity,
      status: "pending",
      totalItems: Array.isArray(data) ? data.length : 0,
      processedItems: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      userId: "admin", // TODO: Get from auth
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).set(job);

    // Process based on operation type
    let result;
    switch (operation) {
      case "update":
        result = await processBulkUpdate(jobId, entity, data, options);
        break;
      case "delete":
        result = await processBulkDelete(jobId, entity, data);
        break;
      case "import":
        result = await processBulkImport(jobId, entity, data, options);
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        ...result,
      },
    });
  } catch (error: any) {
    console.error("Error creating bulk operation:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create bulk operation" },
      { status: 500 }
    );
  }
}

// Helper: Process bulk update
async function processBulkUpdate(
  jobId: string,
  entity: string,
  data: any[],
  options?: any
) {
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ itemId: string; error: string }> = [];

  try {
    // Update job status to processing
    await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).update({
      status: "processing",
      updatedAt: new Date().toISOString(),
    });

    const collectionName = getCollectionName(entity);
    const batch = adminDb.batch();
    let batchCount = 0;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      try {
        if (!item.id) {
          throw new Error("Item ID is required");
        }

        const docRef = adminDb.collection(collectionName).doc(item.id);
        const updates = { ...item.updates, updatedAt: new Date().toISOString() };
        
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
        await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).update({
          processedItems: i + 1,
          successCount,
          errorCount,
          errors: errors.slice(0, 100), // Store max 100 errors
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Commit remaining batch
    if (batchCount > 0) {
      await batch.commit();
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);

    // Update job as completed
    await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).update({
      status: successCount > 0 ? "completed" : "failed",
      processedItems: data.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 100),
      completedAt: new Date().toISOString(),
      duration,
      updatedAt: new Date().toISOString(),
    });

    return {
      status: successCount > 0 ? "completed" : "failed",
      totalItems: data.length,
      successCount,
      errorCount,
      duration,
    };
  } catch (error: any) {
    await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).update({
      status: "failed",
      errors: [{ itemId: "system", error: error.message }],
      updatedAt: new Date().toISOString(),
    });
    throw error;
  }
}

// Helper: Process bulk delete
async function processBulkDelete(jobId: string, entity: string, data: any[]) {
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ itemId: string; error: string }> = [];

  try {
    await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).update({
      status: "processing",
      updatedAt: new Date().toISOString(),
    });

    const collectionName = getCollectionName(entity);
    const batch = adminDb.batch();
    let batchCount = 0;

    for (let i = 0; i < data.length; i++) {
      const id = typeof data[i] === "string" ? data[i] : data[i].id;
      try {
        if (!id) {
          throw new Error("Item ID is required");
        }

        const docRef = adminDb.collection(collectionName).doc(id);
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
        await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).update({
          processedItems: i + 1,
          successCount,
          errorCount,
          errors: errors.slice(0, 100),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);

    await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).update({
      status: successCount > 0 ? "completed" : "failed",
      processedItems: data.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 100),
      completedAt: new Date().toISOString(),
      duration,
      updatedAt: new Date().toISOString(),
    });

    return {
      status: successCount > 0 ? "completed" : "failed",
      totalItems: data.length,
      successCount,
      errorCount,
      duration,
    };
  } catch (error: any) {
    await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).update({
      status: "failed",
      errors: [{ itemId: "system", error: error.message }],
      updatedAt: new Date().toISOString(),
    });
    throw error;
  }
}

// Helper: Process bulk import
async function processBulkImport(
  jobId: string,
  entity: string,
  data: any[],
  options?: any
) {
  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ itemId: string; error: string }> = [];

  try {
    await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).update({
      status: "processing",
      updatedAt: new Date().toISOString(),
    });

    const collectionName = getCollectionName(entity);
    const batch = adminDb.batch();
    let batchCount = 0;

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      try {
        // Validate required fields based on entity
        validateEntityData(entity, item);

        const id = item.id || adminDb.collection(collectionName).doc().id;
        const docRef = adminDb.collection(collectionName).doc(id);

        const now = new Date().toISOString();
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
        await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).update({
          processedItems: i + 1,
          successCount,
          errorCount,
          errors: errors.slice(0, 100),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);

    await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).update({
      status: successCount > 0 ? "completed" : "failed",
      processedItems: data.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 100),
      completedAt: new Date().toISOString(),
      duration,
      updatedAt: new Date().toISOString(),
    });

    return {
      status: successCount > 0 ? "completed" : "failed",
      totalItems: data.length,
      successCount,
      errorCount,
      duration,
    };
  } catch (error: any) {
    await adminDb.collection(BULK_JOBS_COLLECTION).doc(jobId).update({
      status: "failed",
      errors: [{ itemId: "system", error: error.message }],
      updatedAt: new Date().toISOString(),
    });
    throw error;
  }
}

// Helper: Get collection name
function getCollectionName(entity: string): string {
  const collectionMap: { [key: string]: string } = {
    products: "products",
    inventory: "inventory_items",
    categories: "categories",
    orders: "orders",
  };
  return collectionMap[entity] || entity;
}

// Helper: Validate entity data
function validateEntityData(entity: string, data: any): void {
  switch (entity) {
    case "products":
      if (!data.name) throw new Error("Product name is required");
      if (!data.price) throw new Error("Product price is required");
      break;
    case "inventory":
      if (!data.productId) throw new Error("Product ID is required");
      if (data.quantity === undefined) throw new Error("Quantity is required");
      break;
    case "categories":
      if (!data.name) throw new Error("Category name is required");
      break;
  }
}
