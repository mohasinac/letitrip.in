/**
 * Database Schema Export Barrel
 *
 * Single import point for all schema definitions
 */

// Schema field name constants (use these instead of hardcoded strings)
export * from "./field-names";

// Core schemas
export * from "./users";
export * from "./tokens";
export * from "./addresses";
export * from "./products";
export * from "./orders";
export * from "./reviews";
export * from "./bids";
export * from "./sessions";
export * from "./cart";
export * from "./stores";
export * from "./store-addresses";

// Platform configuration schemas
export * from "./categories";
export * from "./coupons";
export * from "./blog-posts";
export * from "./notifications";
export * from "./payouts";
export * from "./events";
export * from "./offers";

