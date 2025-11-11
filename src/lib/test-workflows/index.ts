/**
 * Test Workflows - Barrel Export
 *
 * Centralized export for all test workflows and configuration
 */

// Configuration
export {
  TEST_CONFIG,
  updateTestConfig,
  validateTestConfig,
  getSafeUserId,
  getSafeShopId,
} from "./test-config";

// Type-Safe Helpers & Base Classes
export * from "./helpers";

// Workflows
export { ProductPurchaseWorkflow } from "./workflows/01-product-purchase";
export { AuctionBiddingWorkflow } from "./workflows/02-auction-bidding";
export { OrderFulfillmentWorkflow } from "./workflows/03-order-fulfillment";
export { SupportTicketWorkflow } from "./workflows/04-support-tickets";
export { ReviewsRatingsWorkflow } from "./workflows/05-reviews-ratings";
export { AdvancedBrowsingWorkflow } from "./workflows/06-advanced-browsing";
export { AdvancedAuctionWorkflow } from "./workflows/07-advanced-auction";
export { SellerProductCreationWorkflow } from "./workflows/08-seller-product-creation";
export { AdminCategoryCreationWorkflow } from "./workflows/09-admin-category-creation";
export { SellerInlineOperationsWorkflow } from "./workflows/10-seller-inline-operations";
export { AdminInlineEditsWorkflow } from "./workflows/11-admin-inline-edits";
