import "@/providers.config";
/**
 * Seller Products API Route
 * GET /api/seller/products — Delegated to @mohasinac/feat-seller
 *                            (enforces sellerId=={uid} server-side)
 *
 * Mutations use Server Action: createSellerProductAction.
 */

// GET delegated to package (seller auth + sellerId filter enforced server-side)
export { sellerProductsGET as GET } from "@mohasinac/feat-seller";
