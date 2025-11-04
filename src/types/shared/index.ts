/**
 * Shared Types Index
 * Types used by both UI (Frontend) and Backend (API)
 * 
 * These are the single source of truth for domain models
 */

// ============================================
// Core Types
// ============================================

// Common types (API responses, pagination, etc.)
export * from "./common";

// User & Auth types
export * from "./user";

// ============================================
// Domain Types
// ============================================

// Product types
export * from "./product";

// Category types
export * from "./category";

// Order types
export * from "./order";

// Cart types
export * from "./cart";

// Review types
export * from "./review";

// Auction types
export * from "./auction";

// Coupon types
export * from "./coupon";

// Seller types
export * from "./seller";

// Payment types
export * from "./payment";

// Shipping types
export * from "./shipping";
