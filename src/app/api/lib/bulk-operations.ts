/**
 * Bulk Operations Utility
 * Provides reusable functions for handling bulk operations across all resources
 */

import { NextRequest } from "next/server";
import { getFirestoreAdmin } from "./firebase/admin";
import { COLLECTIONS } from "@/constants/database";

export interface BulkOperationResult {
  success: boolean;
  successCount: number;
  failedCount: number;
  errors?: Array<{ id: string; error: string }>;
  message: string;
}

export interface BulkOperationConfig {
  collection: string;
  action: string;
  ids: string[];
  data?: Record<string, any>;
  userId?: string;
  validatePermission?: (userId: string, action: string) => Promise<boolean>;
  validateItem?: (
    item: any,
    action: string
  ) => Promise<{ valid: boolean; error?: string }>;
  customHandler?: (
    db: FirebaseFirestore.Firestore,
    id: string,
    data?: any
  ) => Promise<void>;
}

/**
 * Execute a bulk operation with transaction support
 */
export async function executeBulkOperation(
  config: BulkOperationConfig
): Promise<BulkOperationResult> {
  const { collection, action, ids, data, validateItem, customHandler } = config;

  if (!ids || ids.length === 0) {
    return {
      success: false,
      successCount: 0,
      failedCount: 0,
      message: "No items selected",
    };
  }

  const db = getFirestoreAdmin();
  const errors: Array<{ id: string; error: string }> = [];
  let successCount = 0;

  // Process each item
  for (const id of ids) {
    try {
      const docRef = db.collection(collection).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        errors.push({ id, error: "Item not found" });
        continue;
      }

      const itemData = doc.data();

      // Validate item if validator provided
      if (validateItem) {
        const validation = await validateItem(itemData, action);
        if (!validation.valid) {
          errors.push({ id, error: validation.error || "Validation failed" });
          continue;
        }
      }

      // Execute custom handler or default update
      if (customHandler) {
        await customHandler(db, id, data);
      } else {
        await docRef.update({
          ...data,
          updated_at: new Date().toISOString(),
        });
      }

      successCount++;
    } catch (error: any) {
      errors.push({
        id,
        error: error.message || "Operation failed",
      });
    }
  }

  const failedCount = ids.length - successCount;
  const success = successCount > 0;

  return {
    success,
    successCount,
    failedCount,
    errors: errors.length > 0 ? errors : undefined,
    message: `${successCount} item(s) ${action} successfully${
      failedCount > 0 ? `, ${failedCount} failed` : ""
    }`,
  };
}

/**
 * Validate user permission for bulk operations
 */
export async function validateBulkPermission(
  userId: string,
  requiredRole: "admin" | "seller" | "user"
): Promise<{ valid: boolean; error?: string }> {
  if (!userId) {
    return { valid: false, error: "Authentication required" };
  }

  const db = getFirestoreAdmin();
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();

  if (!userDoc.exists) {
    return { valid: false, error: "User not found" };
  }

  const userData = userDoc.data();
  const userRole = userData?.role || "user";

  // Role hierarchy: admin > seller > user
  const roleHierarchy: Record<string, number> = {
    admin: 3,
    seller: 2,
    user: 1,
  };

  const hasPermission = roleHierarchy[userRole] >= roleHierarchy[requiredRole];

  if (!hasPermission) {
    return {
      valid: false,
      error: `Insufficient permissions. Required: ${requiredRole}, Current: ${userRole}`,
    };
  }

  return { valid: true };
}

/**
 * Parse and validate bulk operation request
 */
export async function parseBulkRequest(req: NextRequest): Promise<{
  action: string;
  ids: string[];
  data?: Record<string, any>;
  userId?: string;
}> {
  const body = await req.json();

  if (!body.action) {
    throw new Error("Action is required");
  }

  if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
    throw new Error("IDs array is required and must not be empty");
  }

  return {
    action: body.action,
    ids: body.ids,
    data: body.data,
    userId: body.userId,
  };
}

/**
 * Common bulk action handlers
 */
export const commonBulkHandlers = {
  /**
   * Activate items (set is_active or status to true/active)
   */
  activate: async (db: FirebaseFirestore.Firestore, id: string) => {
    await db.collection("temp").doc(id).update({
      is_active: true,
      status: "active",
      updated_at: new Date().toISOString(),
    });
  },

  /**
   * Deactivate items (set is_active or status to false/inactive)
   */
  deactivate: async (db: FirebaseFirestore.Firestore, id: string) => {
    await db.collection("temp").doc(id).update({
      is_active: false,
      status: "inactive",
      updated_at: new Date().toISOString(),
    });
  },

  /**
   * Delete items (soft delete with deleted_at timestamp)
   */
  softDelete: async (db: FirebaseFirestore.Firestore, id: string) => {
    await db.collection("temp").doc(id).update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  },

  /**
   * Hard delete items (permanent deletion)
   */
  hardDelete: async (db: FirebaseFirestore.Firestore, id: string) => {
    await db.collection("temp").doc(id).delete();
  },

  /**
   * Update field value
   */
  updateField: (field: string, value: any) => {
    return async (db: FirebaseFirestore.Firestore, id: string) => {
      await db
        .collection("temp")
        .doc(id)
        .update({
          [field]: value,
          updated_at: new Date().toISOString(),
        });
    };
  },
};

/**
 * Create standardized error response
 */
export function createBulkErrorResponse(error: any) {
  return {
    success: false,
    successCount: 0,
    failedCount: 0,
    message: error.message || "Bulk operation failed",
    error: error.message,
  };
}

/**
 * Transaction-based bulk operation (for operations that need atomicity)
 */
export async function executeBulkOperationWithTransaction(
  config: BulkOperationConfig
): Promise<BulkOperationResult> {
  const { collection, action, ids, data } = config;

  if (!ids || ids.length === 0) {
    return {
      success: false,
      successCount: 0,
      failedCount: 0,
      message: "No items selected",
    };
  }

  const db = getFirestoreAdmin();
  const errors: Array<{ id: string; error: string }> = [];

  try {
    await db.runTransaction(async (transaction) => {
      // Get all documents
      const docRefs = ids.map((id) => db.collection(collection).doc(id));
      const docs = await Promise.all(
        docRefs.map((ref) => transaction.get(ref))
      );

      // Validate all exist
      for (let i = 0; i < docs.length; i++) {
        if (!docs[i].exists) {
          throw new Error(`Item ${ids[i]} not found`);
        }
      }

      // Update all in transaction
      for (let i = 0; i < docRefs.length; i++) {
        transaction.update(docRefs[i], {
          ...data,
          updated_at: new Date().toISOString(),
        });
      }
    });

    return {
      success: true,
      successCount: ids.length,
      failedCount: 0,
      message: `${ids.length} item(s) ${action} successfully`,
    };
  } catch (error: any) {
    return {
      success: false,
      successCount: 0,
      failedCount: ids.length,
      message: "Transaction failed",
      errors: [{ id: "all", error: error.message }],
    };
  }
}
