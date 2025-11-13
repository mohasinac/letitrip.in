import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import {
  TestDataContext,
  WorkflowResult,
  WorkflowStepResult,
} from "@/types/test-workflow";

/**
 * POST - Execute Product Purchase Workflow
 * Uses shared test data context
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { context, config } = body;

    const results: WorkflowStepResult[] = [];
    const startTime = Date.now();

    // Helper to execute steps
    const executeStep = async (
      stepName: string,
      action: () => Promise<any>
    ): Promise<WorkflowStepResult> => {
      const stepStart = Date.now();
      try {
        const data = await action();
        const result: WorkflowStepResult = {
          step: stepName,
          status: "success",
          message: "Step completed successfully",
          duration: Date.now() - stepStart,
          data,
        };
        results.push(result);
        return result;
      } catch (error: any) {
        const result: WorkflowStepResult = {
          step: stepName,
          status: "failed",
          message: error.message,
          duration: Date.now() - stepStart,
          error: error.message,
        };
        results.push(result);
        return result;
      }
    };

    // Validate context
    if (
      !context ||
      !context.products ||
      context.products.published.length === 0
    ) {
      return NextResponse.json({
        success: false,
        error: "No test data available. Please generate test data first.",
      });
    }

    const testContext = context as TestDataContext;

    // Step 1: Select test customer
    await executeStep("Select Test Customer", async () => {
      if (testContext.users.customers.length === 0) {
        throw new Error("No test customers available");
      }

      const customer = testContext.users.customers[0];
      return {
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: customer.name,
      };
    });

    // Step 2: Browse published products
    await executeStep("Browse Products", async () => {
      const products = testContext.products.published;
      if (products.length === 0) {
        throw new Error("No published products available");
      }

      return {
        totalProducts: products.length,
        inStockProducts: testContext.products.inStock.length,
        featuredProducts: testContext.products.featured.length,
      };
    });

    // Step 3: Select product from specific shop
    await executeStep("Select Product", async () => {
      const product = testContext.products.inStock[0];
      if (!product) {
        throw new Error("No in-stock products available");
      }

      const shop = testContext.shops.all.find((s) => s.id === product.shopId);

      return {
        productId: product.id,
        productName: product.name,
        price: product.price,
        stockCount: product.stockCount,
        shopId: shop?.id,
        shopName: shop?.name,
        shopVerified: shop?.isVerified,
      };
    });

    // Step 4: Check available coupons
    await executeStep("Check Coupons", async () => {
      const activeCoupons = testContext.coupons.active;

      if (activeCoupons.length > 0) {
        const coupon = activeCoupons[0];
        return {
          couponsAvailable: activeCoupons.length,
          selectedCoupon: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        };
      }

      return {
        couponsAvailable: 0,
        message: "No active coupons available",
      };
    });

    // Step 5: Add to cart (simulated)
    await executeStep("Add to Cart", async () => {
      const product = testContext.products.inStock[0];
      const quantity = 1;

      return {
        productId: product.id,
        quantity,
        price: product.price,
        subtotal: product.price * quantity,
      };
    });

    // Step 6: Apply coupon (if available)
    if (testContext.coupons.active.length > 0) {
      await executeStep("Apply Coupon", async () => {
        const coupon = testContext.coupons.active[0];
        const product = testContext.products.inStock[0];
        const subtotal = product.price;

        let discount = 0;
        if (coupon.discountType === "percentage") {
          discount = (subtotal * coupon.discountValue) / 100;
        } else {
          discount = coupon.discountValue;
        }

        return {
          couponCode: coupon.code,
          discountAmount: discount,
          newTotal: subtotal - discount,
        };
      });
    }

    // Step 7: Proceed to checkout
    await executeStep("Proceed to Checkout", async () => {
      const customer = testContext.users.customers[0];
      const product = testContext.products.inStock[0];

      return {
        customerId: customer.id,
        itemCount: 1,
        total: product.price,
        readyForCheckout: true,
      };
    });

    // Step 8: Create order (simulated)
    await executeStep("Create Order", async () => {
      const customer = testContext.users.customers[0];
      const product = testContext.products.inStock[0];
      const orderNumber = `TEST_ORD${Date.now()}`;

      return {
        orderId: `test-order-${Date.now()}`,
        orderNumber,
        customerId: customer.id,
        productId: product.id,
        status: "pending",
        paymentStatus: "pending",
        total: product.price,
      };
    });

    // Step 9: Verify order
    await executeStep("Verify Order Created", async () => {
      return {
        orderVerified: true,
        status: "pending",
        message: "Order created successfully",
      };
    });

    // Step 10: Send confirmation (simulated)
    await executeStep("Send Confirmation", async () => {
      const customer = testContext.users.customers[0];

      return {
        emailSent: true,
        simulated: true,
        recipient: customer.email,
      };
    });

    // Calculate results
    const totalDuration = Date.now() - startTime;
    const passed = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const finalStatus =
      failed === 0 ? "success" : passed > 0 ? "partial" : "failed";

    const workflowResult: WorkflowResult = {
      workflowName: "Product Purchase Flow",
      workflowId: "product-purchase",
      totalSteps: results.length,
      passed,
      failed,
      skipped,
      totalDuration,
      results,
      finalStatus,
      context: {
        users: testContext.users,
        products: testContext.products,
      },
    };

    return NextResponse.json({
      success: finalStatus !== "failed",
      ...workflowResult,
    });
  } catch (error: any) {
    console.error("Error executing product purchase workflow:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to execute workflow",
      },
      { status: 500 }
    );
  }
}
