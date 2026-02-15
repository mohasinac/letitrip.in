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
export * from "./products";
export * from "./orders";
export * from "./reviews";
export * from "./bids";
export * from "./sessions";

// Platform configuration schemas
export * from "./site-settings";
export * from "./carousel-slides";
export * from "./homepage-sections";
export * from "./categories";
export * from "./coupons";
export * from "./faqs";
