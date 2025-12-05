/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/bulk-operations
 * @description This file contains functionality related to bulk-operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Bulk Operations Utility
 * Provides reusable functions for handling bulk operations across all resources
 */

import { NextRequest } from "next/server";
import { getFirestoreAdmin } from "./firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * BulkOperationResult interface
 * 
 * @interface
 * @description Defines the structure and contract for BulkOperationResult
 */
export interface BulkOperationResult {
  /** Success */
  success: boolean;
  /** Success Count */
  successCount: number;
  /** Failed Count */
  failedCount: number;
  /** Errors */
  errors?: Array<{ id: string; error: string }>;
  /** Message */
  message: string;
}

/**
 * BulkOperationConfig interface
 * 
 * @interface
 * @description Defines the structure and contract for BulkOperationConfig
 */
export interface BulkOperationConfig {
  /** Collection */
  collection: string;
  /** Action */
  action: string;
  /** Ids */
  ids: string[];
  /** Data */
  data?: Record<string, any>;
  /** User Id */
  userId?: string;
  /** Validate Permission */
  validatePermission?: (userId: string, action: string) => Promise<boolean>;
  /** Validate Item */
  validateItem?: (
    /** Item */
    item: any,
    /** Action */
    action: string,
  ) => Promise<{ valid: boolean; error?: string }>;
  /** Custom Handler */
  customHandler?: (
    /** Db */
    db: FirebaseFirestore.Firestore,
    /** Id */
    id: string,
    /** Data */
    data?: any,
  ) => Promise<void>;
}

/**
 * Execute a bulk operation with transaction support
 */
/**
 * Performs execute bulk operation operation
 *
 * @param {BulkOperationConfig} config - The config
 *
 * @returns {Promise<any>} Promise resolving to executebulkoperation result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * executeBulkOperation(config);
 */

/**
 * Performs execute bulk operation operation
 *
 * @param {BulkOperationConfig} /** Config */
  config - The /**  config */
  config
 *
 * @returns {Promise<any>} Promise resolving to executebulkoperation result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * executeBulkOperation(/** Config */
  config);
 */

/**
 * Performs execute bulk operation operation
 *
 * @param {BulkOperationConfig} config - The config
 *
 * @returns {Promise<BulkOperationResult>} The executebulkoperation result
 *
 * @example
 * executeBulkOperation(config);
 */
export async function executeBulkOperation(
  /** Config */
  config: BulkOperationConfig,
): Promise<BulkOperationResult> {
  const { collection, action, ids, data, validateItem, customHandler } = config;

  if (!ids || ids.length === 0) {
    return {
      /** Success */
      success: false,
      /** Success Count */
      successCount: 0,
      /** Failed Count */
      failedCount: 0,
      /** Message */
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
        /** Error */
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
    /** Errors */
    errors: errors.length > 0 ? errors : undefined,
    /** Message */
    message: `${successCount} item(s) ${action} successfully${
      failedCount > 0 ? `, ${failedCount} failed` : ""
    }`,
  };
}

/**
 * Validate user permission for bulk operations
 */
/**
 * Validates bulk permission
 *
 * @param {string} userId - user identifier
 * @param {"admin" | "seller" | "user"} requiredRole - The required role
 *
 * @returns {Promise<any>} Promise resolving to validatebulkpermission result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateBulkPermission("example", requiredRole);
 */

/**
 * Validates bulk permission
 *
 * @returns {Promise<any>} Promise resolving to validatebulkpermission result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateBulkPermission();
 */

export async function validateBulkPermission(
  /** User Id */
  userId: string,
  /** Required Role */
  requiredRole: "admin" | "seller" | "user",
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
    /** Admin */
    admin: 3,
    /** Seller */
    seller: 2,
    /** User */
    user: 1,
  };

  const hasPermission = roleHierarchy[userRole] >= roleHierarchy[requiredRole];

  if (!hasPermission) {
    return {
      /** Valid */
      valid: false,
      /** Error */
      error: `Insufficient permissions. Required: ${requiredRole}, Current: ${userRole}`,
    };
  }

  return { valid: true };
}

/**
 * Parse and validate bulk operation request
 */
/**
 * Parses bulk request
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to parsebulkrequest result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * parseBulkRequest(req);
 */

/**
 * Parses bulk request
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to parsebulkrequest result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * parseBulkRequest(req);
 */

export async function parseBulkRequest(req: NextRequest): Promise<{
  /** Action */
  action: string;
  /** Ids */
  ids: string[];
  /** Data */
  data?: Record<string, any>;
  /** User Id */
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
    /** Action */
    action: body.action,
    /** Ids */
    ids: body.ids,
    /** Data */
    data: body.data,
    /** User Id */
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
      /** Status */
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
      /** Status */
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
/**
 * Creates a new bulk error response
 *
 * @param {any} error - Error object
 *
 * @returns {any} The bulkerrorresponse result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * createBulkErrorResponse(error);
 */

/**
 * Creates a new bulk error response
 *
 * @param {any} error - Error object
 *
 * @returns {any} The bulkerrorresponse result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * createBulkErrorResponse(error);
 */

export function createBulkErrorResponse(error: any) {
  return {
    /** Success */
    success: false,
    /** Success Count */
    successCount: 0,
    /** Failed Count */
    failedCount: 0,
    /** Message */
    message: error.message || "Bulk operation failed",
    /** Error */
    error: error.message,
  };
}

/**
 * Transaction-based bulk operation (for operations that need atomicity)
 */
/**
 * Performs execute bulk operation with transaction operation
 *
 * @param {BulkOperationConfig} config - The config
 *
 * @returns {Promise<any>} Promise resolving to executebulkoperationwithtransaction result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * executeBulkOperationWithTransaction(config);
 */

/**
 * Performs execute bulk operation with transaction operation
 *
 * @param {BulkOperationConfig} /** Config */
  config - The /**  config */
  config
 *
 * @returns/**
 * Performs execute bulk operation with transaction operation
 *
 * @param {BulkOperationConfig} config - The config
 *
 * @returns {Promise<BulkOperationResult>} The executebulkoperationwithtransaction result
 *
 * @example
 * executeBulkOperationWithTransaction(config);
 */
 {Promise<any>} Promise resolving to executebulkoperationwithtransaction result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * executeBulkOperationWithTransaction(/** Config */
  config);
 */

export async function executeBulkOperationWithTransaction(
  /** Config */
  config: BulkOperationConfig,
): Promise<BulkOperationResult> {
  const { collection, action, ids, data } = config;

  if (!ids || ids.length === 0) {
    return {
      /** Success */
      success: false,
      /** Success Count */
      successCount: 0,
      /** Failed Count */
      failedCount: 0,
      /** Message */
      message: "No items selected",
    };
  }

  const db = getFirestoreAdmin();
  /**
 * Performs errors operation
 *
 * @param {any} async(transaction - The async(transaction
 *
 * @returns {Promise<any>} The errors result
 *
 */
const errors: Array<{ id: string; error: string }> = [];

  try {
    await db.runTransaction(async (transaction) => {
      // Get all documents
      const docRefs = ids.map((id) => db.collection(collection).doc(id));
      const docs = await Promise.all(
        docRefs.map((ref) => transaction.get(ref)),
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
      /** Success */
      success: true,
      /** Success Count */
      successCount: ids.length,
      /** Failed Count */
      failedCount: 0,
      /** Message */
      message: `${ids.length} item(s) ${action} successfully`,
    };
  } catch (error: any) {
    return {
      /** Success */
      success: false,
      /** Success Count */
      successCount: 0,
      /** Failed Count */
      failedCount: ids.length,
      /** Message */
      message: "Transaction failed",
      /** Errors */
      errors: [{ id: "all", error: error.message }],
    };
  }
}
