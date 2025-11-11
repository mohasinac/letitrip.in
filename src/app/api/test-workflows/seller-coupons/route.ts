import { NextResponse } from "next/server";
import { SellerCouponManagementWorkflow } from "@/lib/test-workflows/workflows/17-seller-coupons";

export async function POST() {
  try {
    const workflow = new SellerCouponManagementWorkflow();
    const result = await workflow.run();

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error running Seller Coupon Management workflow:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Workflow execution failed",
        totalSteps: 0,
        passedSteps: 0,
        failedSteps: 0,
        steps: [],
      },
      { status: 500 }
    );
  }
}
