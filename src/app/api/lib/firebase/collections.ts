/**
 * @fileoverview TypeScript Module
 * @module src/app/api/lib/firebase/collections
 * @description This file contains functionality related to collections
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Firestore Collection References
 * Provides type-safe collection references and helpers
 * Location: /src/app/api/lib/firebase/collections.ts
 */

import { COLLECTIONS } from "@/constants/database";
import {
  CollectionReference,
  DocumentReference,
} from "firebase-admin/firestore";
import { getFirestoreAdmin } from "./admin";

/**
 * Get a collection reference
 */
/**
 * Retrieves collection
 *
 * @param {string} collectionName - Name of collection
 *
 * @returns {string} The collection result
 *
 * @example
 * getCollection("example");
 */

/**
 * Retrieves collection
 *
 * @param {string} /** Collection Name */
  collectionName - Name of /** collection name */
  collection
 *
 * @returns {string} The collection result
 *
 * @example
 * getCollection("example");
 */

export function getCollection<T = any>(
  /** Collection Name */
  collectionName: string,
): CollectionReference<T> {
  const db = getFirestoreAdmin();
  return db.collection(collectionName) as CollectionReference<T>;
}

/**
 * Get a document reference
 */
/**
 * Retrieves document
 *
 * @param {string} collectionName - Name of collection
 * @param {string} documentId - document identifier
 *
 * @returns {string} The document result
 *
 * @example
 * getDocument("example", "example");
 */

/**
 * Retrieves document
 *
 * @returns {string} The document result
 *
 * @example
 * getDocument();
 */

export function getDocument<T = any>(
  /** Collection Name */
  collectionName: string,
  /** Document Id */
  documentId: string,
): DocumentReference<T> {
  const db = getFirestoreAdmin();
  return db.collection(collectionName).doc(documentId) as DocumentReference<T>;
}

/**
 * Collection References
 */
export const Collections = {
  // Core collections
  /** Users */
  users: () => getCollection(COLLECTIONS.USERS),
  /** Shops */
  shops: () => getCollection(COLLECTIONS.SHOPS),
  /** Products */
  products: () => getCollection(COLLECTIONS.PRODUCTS),
  /** Categories */
  categories: () => getCollection(COLLECTIONS.CATEGORIES),

  // Order collections
  /** Orders */
  orders: () => getCollection(COLLECTIONS.ORDERS),
  /** Order Items */
  orderItems: () => getCollection(COLLECTIONS.ORDER_ITEMS),
  /** Cart */
  cart: () => getCollection(COLLECTIONS.CARTS),

  // Auction collections
  /** Auctions */
  auctions: () => getCollection(COLLECTIONS.AUCTIONS),
  /** Bids */
  bids: () => getCollection(COLLECTIONS.BIDS),
  /** Auction Watchlist */
  auctionWatchlist: () => getCollection(COLLECTIONS.AUCTION_WATCHLIST),
  /** Won Auctions */
  wonAuctions: () => getCollection(COLLECTIONS.WON_AUCTIONS),

  // Marketing collections
  /** Coupons */
  coupons: () => getCollection(COLLECTIONS.COUPONS),
  /** Reviews */
  reviews: () => getCollection(COLLECTIONS.REVIEWS),

  // Return & Refund collections
  /** Returns */
  returns: () => getCollection(COLLECTIONS.RETURNS),
  /** Refunds */
  refunds: () => getCollection(COLLECTIONS.REFUNDS),

  // Financial collections
  /** Payments */
  payments: () => getCollection(COLLECTIONS.PAYMENTS),
  /** Payouts */
  payouts: () => getCollection(COLLECTIONS.PAYOUTS),
  /** Payment Transactions */
  paymentTransactions: () => getCollection(COLLECTIONS.PAYMENT_TRANSACTIONS),

  // User interaction collections
  /** Favorites */
  favorites: () => getCollection(COLLECTIONS.FAVORITES),
  /** Cart Items */
  cartItems: () => getCollection(COLLECTIONS.CART_ITEMS),
  /** Viewing History */
  viewingHistory: () => getCollection(COLLECTIONS.VIEWING_HISTORY),

  // Support collections
  /** Support Tickets */
  supportTickets: () => getCollection(COLLECTIONS.SUPPORT_TICKETS),
  /** Ticket Messages */
  ticketMessages: () => getCollection(COLLECTIONS.TICKET_MESSAGES),

  // System collections
  /** Addresses */
  addresses: () => getCollection(COLLECTIONS.ADDRESSES),
  /** Notifications */
  notifications: () => getCollection(COLLECTIONS.NOTIFICATIONS),

  // Event collections
  /** Events */
  events: () => getCollection(COLLECTIONS.EVENTS),
  /** Event Registrations */
  eventRegistrations: () => getCollection(COLLECTIONS.EVENT_REGISTRATIONS),
  /** Event Votes */
  eventVotes: () => getCollection(COLLECTIONS.EVENT_VOTES),
  /** Event Options */
  eventOptions: () => getCollection(COLLECTIONS.EVENT_OPTIONS),
};

/**
 * Helper to get a document by ID
 */
/**
 * Retrieves document by id
 *
 * @param {string} collectionName - Name of collection
 * @param {string} documentId - document identifier
 *
 * @returns {Promise<any>} Promise resolving to documentbyid result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getDocumentById("example", "example");
 */

/**
 * Retrieves document by id
 *
 * @returns {Promise<any>} Promise resolving to documentbyid result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getDocumentById();
 */

export async function getDocumentById<T = any>(
  /** Collection Name */
  collectionName: string,
  /** Document Id */
  documentId: string,
): Promise<T | null> {
  try {
    const docRef = getDocument<T>(collectionName, documentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as T;
  } catch (error) {
    console.error(
      `Error getting document ${documentId} from ${collectionName}:`,
      error,
    );
    throw error;
  }
}

/**
 * Helper to check if a document exists
 */
/**
 * Performs document exists operation
 *
 * @param {string} collectionName - Name of collection
 * @param {string} documentId - document identifier
 *
 * @returns {Promise<any>} Promise resolving to documentexists result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * documentExists("example", "example");
 */

/**
 * Performs document exists operation
 *
 * @returns {Promise<any>} Promise resolving to documentexists result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * documentExists();
 */

export async function documentExists(
  /** Collection Name */
  collectionName: string,
  /** Document Id */
  documentId: string,
): Promise<boolean> {
  try {
    const docRef = getDocument(collectionName, documentId);
    const docSnap = await docRef.get();
    return docSnap.exists;
  } catch (error) {
    console.error(
      `Error checking document existence ${documentId} in ${collectionName}:`,
      error,
    );
    return false;
  }
}

/**
 * Helper to create a new document with auto-generated ID
 */
/**
 * Creates a new document
 *
 * @param {string} collectionName - Name of collection
 * @param {Partial<T>} data - Data object containing information
 *
 * @returns {Promise<any>} Promise resolving to document result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * createDocument("example", data);
 */

/**
 * Creates a new document
 *
 * @returns {Promise<any>} Promise resolving to document result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * createDocument();
 */

export async function createDocument<T = any>(
  /** Collection Name */
  collectionName: string,
  /** Data */
  data: Partial<T>,
): Promise<string> {
  try {
    const collectionRef = getCollection<T>(collectionName);
    const docRef = await collectionRef.add({
      ...data,
      /** Created At */
      createdAt: new Date(),
      /** Updated At */
      updatedAt: new Date(),
    } as any);

    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Helper to update a document
 */
/**
 * Updates existing document
 *
 * @param {string} collectionName - Name of collection
 * @param {string} documentId - document identifier
 * @param {Partial<T>} data - Data object containing information
 *
 * @returns {Promise<any>} Promise resolving to updatedocument result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * updateDocument("example", "example", data);
 */

/**
 * Updates existing document
 *
 * @returns {Promise<any>} Promise resolving to updatedocument result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * updateDocument();
 */

export async function updateDocument<T = any>(
  /** Collection Name */
  collectionName: string,
  /** Document Id */
  documentId: string,
  /** Data */
  data: Partial<T>,
): Promise<void> {
  try {
    const docRef = getDocument<T>(collectionName, documentId);
    await docRef.update({
      ...data,
      /** Updated At */
      updatedAt: new Date(),
    } as any);
  } catch (error) {
    console.error(
      `Error updating document ${documentId} in ${collectionName}:`,
      error,
    );
    throw error;
  }
}

/**
 * Helper to delete a document
 */
/**
 * Deletes document
 *
 * @param {string} collectionName - Name of collection
 * @param {string} documentId - document identifier
 *
 * @returns {Promise<any>} Promise resolving to deletedocument result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * deleteDocument("example", "example");
 */

/**
 * Deletes document
 *
 * @returns {Promise<any>} Promise resolving to deletedocument result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * deleteDocument();
 */

export async function deleteDocument(
  /** Collection Name */
  collectionName: string,
  /** Document Id */
  documentId: string,
): Promise<void> {
  try {
    const docRef = getDocument(collectionName, documentId);
    await docRef.delete();
  } catch (error) {
    console.error(
      `Error deleting document ${documentId} from ${collectionName}:`,
      error,
    );
    throw error;
  }
}
