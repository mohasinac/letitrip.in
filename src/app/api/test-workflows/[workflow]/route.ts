import { NextRequest, NextResponse } from "next/server";
import {
  ProductPurchaseWorkflow,
  AuctionBiddingWorkflow,
  OrderFulfillmentWorkflow,
  SupportTicketWorkflow,
  ReviewsRatingsWorkflow,
  AdvancedBrowsingWorkflow,
  AdvancedAuctionWorkflow,
  SellerProductCreationWorkflow,
  AdminCategoryCreationWorkflow,
  SellerInlineOperationsWorkflow,
  AdminInlineEditsWorkflow,
  updateTestConfig,
} from "@/lib/test-workflows";

const WORKFLOW_MAP: Record<string, any> = {
  "product-purchase": ProductPurchaseWorkflow,
  "auction-bidding": AuctionBiddingWorkflow,
  "order-fulfillment": OrderFulfillmentWorkflow,
  "support-tickets": SupportTicketWorkflow,
  "reviews-ratings": ReviewsRatingsWorkflow,
  "advanced-browsing": AdvancedBrowsingWorkflow,
  "advanced-auction": AdvancedAuctionWorkflow,
  "seller-product-creation": SellerProductCreationWorkflow,
  "admin-category-creation": AdminCategoryCreationWorkflow,
  "seller-inline-operations": SellerInlineOperationsWorkflow,
  "admin-inline-edits": AdminInlineEditsWorkflow,
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflow: string }> }
) {
  try {
    const { workflow } = await params;
    const body = await request.json();

    // Update configuration if provided
    if (body.config) {
      updateTestConfig(body.config);
    }

    // Get the workflow class
    const WorkflowClass = WORKFLOW_MAP[workflow];

    if (!WorkflowClass) {
      return NextResponse.json(
        { error: `Workflow "${workflow}" not found` },
        { status: 404 }
      );
    }

    // Run the workflow
    const workflowInstance = new WorkflowClass();
    const result = await workflowInstance.run();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Workflow execution error:", error);
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
