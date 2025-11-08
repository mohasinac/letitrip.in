/**
 * Firestore Collection References
 * Provides type-safe collection references and helpers
 * Location: /src/app/api/lib/firebase/collections.ts
 */

import { CollectionReference, DocumentReference } from 'firebase-admin/firestore';
import { getFirestoreAdmin } from './admin';
import { COLLECTIONS } from '@/constants/database';

/**
 * Get a collection reference
 */
export function getCollection<T = any>(collectionName: string): CollectionReference<T> {
  const db = getFirestoreAdmin();
  return db.collection(collectionName) as CollectionReference<T>;
}

/**
 * Get a document reference
 */
export function getDocument<T = any>(
  collectionName: string,
  documentId: string
): DocumentReference<T> {
  const db = getFirestoreAdmin();
  return db.collection(collectionName).doc(documentId) as DocumentReference<T>;
}

/**
 * Collection References
 */
export const Collections = {
  // Core collections
  users: () => getCollection(COLLECTIONS.USERS),
  shops: () => getCollection(COLLECTIONS.SHOPS),
  products: () => getCollection(COLLECTIONS.PRODUCTS),
  categories: () => getCollection(COLLECTIONS.CATEGORIES),
  
  // Order collections
  orders: () => getCollection(COLLECTIONS.ORDERS),
  orderItems: () => getCollection(COLLECTIONS.ORDER_ITEMS),
  cart: () => getCollection(COLLECTIONS.CARTS),
  
  // Auction collections
  auctions: () => getCollection(COLLECTIONS.AUCTIONS),
  bids: () => getCollection(COLLECTIONS.BIDS),
  
  // Marketing collections
  coupons: () => getCollection(COLLECTIONS.COUPONS),
  reviews: () => getCollection(COLLECTIONS.REVIEWS),
  
  // Return & Refund collections
  returns: () => getCollection(COLLECTIONS.RETURNS),
  refunds: () => getCollection(COLLECTIONS.REFUNDS),
  
  // Financial collections
  payouts: () => getCollection(COLLECTIONS.PAYOUTS),
  paymentTransactions: () => getCollection(COLLECTIONS.PAYMENT_TRANSACTIONS),
  
  // User interaction collections
  favorites: () => getCollection(COLLECTIONS.FAVORITES),
  cartItems: () => getCollection(COLLECTIONS.CART_ITEMS),
  viewingHistory: () => getCollection(COLLECTIONS.VIEWING_HISTORY),
  
  // Support collections
  supportTickets: () => getCollection(COLLECTIONS.SUPPORT_TICKETS),
  ticketMessages: () => getCollection(COLLECTIONS.TICKET_MESSAGES),
  
  // System collections
  addresses: () => getCollection(COLLECTIONS.ADDRESSES),
  notifications: () => getCollection(COLLECTIONS.NOTIFICATIONS),
};

/**
 * Helper to get a document by ID
 */
export async function getDocumentById<T = any>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  try {
    const docRef = getDocument<T>(collectionName, documentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return null;
    }
    
    return { id: docSnap.id, ...docSnap.data() } as T;
  } catch (error) {
    console.error(`Error getting document ${documentId} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Helper to check if a document exists
 */
export async function documentExists(
  collectionName: string,
  documentId: string
): Promise<boolean> {
  try {
    const docRef = getDocument(collectionName, documentId);
    const docSnap = await docRef.get();
    return docSnap.exists;
  } catch (error) {
    console.error(`Error checking document existence ${documentId} in ${collectionName}:`, error);
    return false;
  }
}

/**
 * Helper to create a new document with auto-generated ID
 */
export async function createDocument<T = any>(
  collectionName: string,
  data: Partial<T>
): Promise<string> {
  try {
    const collectionRef = getCollection<T>(collectionName);
    const docRef = await collectionRef.add({
      ...data,
      createdAt: new Date(),
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
export async function updateDocument<T = any>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = getDocument<T>(collectionName, documentId);
    await docRef.update({
      ...data,
      updatedAt: new Date(),
    } as any);
  } catch (error) {
    console.error(`Error updating document ${documentId} in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Helper to delete a document
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  try {
    const docRef = getDocument(collectionName, documentId);
    await docRef.delete();
  } catch (error) {
    console.error(`Error deleting document ${documentId} from ${collectionName}:`, error);
    throw error;
  }
}
