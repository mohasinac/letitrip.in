/**
 * API Route: Execute Multiple Workflows in Parallel
 *
 * POST /api/test-workflows/parallel
 *
 * Body:
 * {
 *   "workflowIds": ["product-purchase", "auction-bidding", "order-fulfillment"]
 * }
 *
 * Response:
 * {
 *   "totalWorkflows": 3,
 *   "completed": 2,
 *   "failed": 1,
 *   "totalDuration": 45000,
 *   "workflows": [...],
 *   "aggregateStats": {...}
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { ParallelWorkflowExecutor } from "@/lib/test-workflows/parallel-executor";

// Import all workflow classes
import { ProductPurchaseWorkflow } from "@/lib/test-workflows/workflows/01-product-purchase";
import { AuctionBiddingWorkflow } from "@/lib/test-workflows/workflows/02-auction-bidding";
import { OrderFulfillmentWorkflow } from "@/lib/test-workflows/workflows/03-order-fulfillment";
import { SupportTicketWorkflow } from "@/lib/test-workflows/workflows/04-support-tickets";
import { ReviewsRatingsWorkflow } from "@/lib/test-workflows/workflows/05-reviews-ratings";
import { AdvancedBrowsingWorkflow } from "@/lib/test-workflows/workflows/06-advanced-browsing";
import { AdvancedAuctionWorkflow } from "@/lib/test-workflows/workflows/07-advanced-auction";
import { SellerProductCreationWorkflow } from "@/lib/test-workflows/workflows/08-seller-product-creation";
import { AdminCategoryCreationWorkflow } from "@/lib/test-workflows/workflows/09-admin-category-creation";
import { SellerInlineOperationsWorkflow } from "@/lib/test-workflows/workflows/10-seller-inline-operations";
import { AdminInlineEditsWorkflow } from "@/lib/test-workflows/workflows/11-admin-inline-edits";
import { UserProfileManagementWorkflow } from "@/lib/test-workflows/workflows/12-user-profile";
import { WishlistFavoritesWorkflow } from "@/lib/test-workflows/workflows/13-wishlist-favorites";
import { BiddingHistoryWatchlistWorkflow } from "@/lib/test-workflows/workflows/14-bidding-history";
import { SellerDashboardAnalyticsWorkflow } from "@/lib/test-workflows/workflows/15-seller-dashboard";
import { SellerReturnsManagementWorkflow } from "@/lib/test-workflows/workflows/16-seller-returns";
import { SellerCouponManagementWorkflow } from "@/lib/test-workflows/workflows/17-seller-coupons";
import { AdminBlogManagementWorkflow } from "@/lib/test-workflows/workflows/18-admin-blog";
import { AdminHeroSlidesWorkflow } from "@/lib/test-workflows/workflows/19-admin-hero-slides";
import { AdminReturnsManagementWorkflow } from "@/lib/test-workflows/workflows/20-admin-returns";

// Workflow registry
const WORKFLOW_REGISTRY = new Map([
  [
    "product-purchase",
    { name: "Product Purchase Flow", class: ProductPurchaseWorkflow },
  ],
  [
    "auction-bidding",
    { name: "Auction Bidding Flow", class: AuctionBiddingWorkflow },
  ],
  [
    "order-fulfillment",
    { name: "Order Fulfillment Flow", class: OrderFulfillmentWorkflow },
  ],
  [
    "support-tickets",
    { name: "Support Ticket Flow", class: SupportTicketWorkflow },
  ],
  [
    "reviews-ratings",
    { name: "Reviews & Ratings Flow", class: ReviewsRatingsWorkflow },
  ],
  [
    "advanced-browsing",
    { name: "Advanced Browsing Flow", class: AdvancedBrowsingWorkflow },
  ],
  [
    "advanced-auction",
    { name: "Advanced Auction Flow", class: AdvancedAuctionWorkflow },
  ],
  [
    "seller-product-creation",
    { name: "Seller Product Creation", class: SellerProductCreationWorkflow },
  ],
  [
    "admin-category-creation",
    { name: "Admin Category Creation", class: AdminCategoryCreationWorkflow },
  ],
  [
    "seller-inline-operations",
    { name: "Seller Inline Operations", class: SellerInlineOperationsWorkflow },
  ],
  [
    "admin-inline-edits",
    { name: "Admin Inline Edits", class: AdminInlineEditsWorkflow },
  ],
  [
    "user-profile",
    { name: "User Profile Management", class: UserProfileManagementWorkflow },
  ],
  [
    "wishlist-favorites",
    { name: "Wishlist & Favorites", class: WishlistFavoritesWorkflow },
  ],
  [
    "bidding-history",
    {
      name: "Bidding History & Watchlist",
      class: BiddingHistoryWatchlistWorkflow,
    },
  ],
  [
    "seller-dashboard",
    {
      name: "Seller Dashboard & Analytics",
      class: SellerDashboardAnalyticsWorkflow,
    },
  ],
  [
    "seller-returns",
    {
      name: "Seller Returns Management",
      class: SellerReturnsManagementWorkflow,
    },
  ],
  [
    "seller-coupons",
    { name: "Seller Coupon Management", class: SellerCouponManagementWorkflow },
  ],
  [
    "admin-blog",
    { name: "Admin Blog Management", class: AdminBlogManagementWorkflow },
  ],
  [
    "admin-hero-slides",
    { name: "Admin Hero Slides Management", class: AdminHeroSlidesWorkflow },
  ],
  [
    "admin-returns",
    { name: "Admin Returns & Refunds", class: AdminReturnsManagementWorkflow },
  ],
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowIds } = body;

    if (!Array.isArray(workflowIds) || workflowIds.length === 0) {
      return NextResponse.json(
        { error: "workflowIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Validate all workflow IDs exist
    const invalidIds = workflowIds.filter((id) => !WORKFLOW_REGISTRY.has(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid workflow IDs: ${invalidIds.join(", ")}` },
        { status: 400 }
      );
    }

    // Create parallel executor
    const executor = new ParallelWorkflowExecutor();

    // Add all requested workflows
    workflowIds.forEach((id: string) => {
      const workflow = WORKFLOW_REGISTRY.get(id);
      if (workflow) {
        const instance = new workflow.class();
        executor.addWorkflow(id, workflow.name, () => instance.run());
      }
    });

    // Execute all workflows in parallel
    const result = await executor.executeAll();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Parallel workflow execution error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute workflows" },
      { status: 500 }
    );
  }
}

// GET endpoint to list available workflows
export async function GET() {
  const workflows = Array.from(WORKFLOW_REGISTRY.entries()).map(
    ([id, { name }]) => ({
      id,
      name,
    })
  );

  return NextResponse.json({
    totalWorkflows: workflows.length,
    workflows,
  });
}
