/**
 * Firebase Cloud Functions for LetItRip E-Commerce Platform
 * Phase 8.1 - Firebase Functions
 *
 * Functions:
 * 1. Order confirmation emails (onCreate trigger)
 * 2. Auction end notifications (scheduled function)
 * 3. Image thumbnail generation (Storage trigger)
 * 4. Search index updates (Firestore trigger)
 */

import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin
initializeApp();

// Export all functions
export { processAuctionEndings } from "./scheduled/auctionEndings";
export { generateThumbnail } from "./storage/thumbnailGenerator";
export { sendOrderConfirmationEmail } from "./triggers/orderConfirmation";
export { updateSearchIndex } from "./triggers/searchIndex";
