/**
 * Demo Configuration
 *
 * Scale multipliers for demo data generation
 */

export const DEMO_CONFIG = {
  SCALE_MULTIPLIERS: {
    USERS: 5, // Create 5x users
    SHOPS: 0.5, // Create 0.5x shops (divide by 2)
    PRODUCTS: 10, // Create 10x products
    AUCTIONS: 3, // Create 3x auctions
    BIDS: 15, // Create 15x+ bids per auction
    REVIEWS: 8, // Create 8x+ reviews per product
  },
} as const;
