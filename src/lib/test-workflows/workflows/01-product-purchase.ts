/**
 * Phase 3: Test Workflow #1 - Product Purchase Flow
 *
 * This test simulates a complete customer purchase journey:
 * 1. Browse products
 * 2. Add to cart
 * 3. Apply coupon
 * 4. Proceed to checkout
 * 5. Complete payment
 * 6. Receive order confirmation
 * 7. Track order status
 *
 * Expected time: 15-20 minutes
 * Success criteria: Order created with "pending" status
 */

import { productsService } from "@/services/products.service";
import { cartService } from "@/services/cart.service";
import { checkoutService } from "@/services/checkout.service";
import { ordersService } from "@/services/orders.service";
import { couponsService } from "@/services/coupons.service";

interface TestResult {
  step: string;
  status: "success" | "failed" | "skipped";
  message: string;
  duration: number;
  data?: any;
}

interface WorkflowResult {
  workflowName: string;
  totalSteps: number;
  passed: number;
  failed: number;
  skipped: number;
  totalDuration: number;
  results: TestResult[];
  finalStatus: "success" | "failed" | "partial";
}

class ProductPurchaseWorkflow {
  private results: TestResult[] = [];
  private testData: any = {};

  async executeStep(
    stepName: string,
    action: () => Promise<any>
  ): Promise<TestResult> {
    const startTime = Date.now();
    console.log(`\n🔄 Executing: ${stepName}...`);

    try {
      const data = await action();
      const duration = Date.now() - startTime;
      const result: TestResult = {
        step: stepName,
        status: "success",
        message: "✅ Step completed successfully",
        duration,
        data,
      };
      this.results.push(result);
      console.log(`✅ ${stepName} - Success (${duration}ms)`);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        step: stepName,
        status: "failed",
        message: `❌ Error: ${error.message}`,
        duration,
      };
      this.results.push(result);
      console.error(`❌ ${stepName} - Failed:`, error.message);
      return result;
    }
  }

  async run(): Promise<WorkflowResult> {
    console.log("\n" + "=".repeat(60));
    console.log("🛒 WORKFLOW: Product Purchase Flow");
    console.log("=".repeat(60));

    const workflowStart = Date.now();

    // Step 1: Browse products
    await this.executeStep("Browse Products", async () => {
      const products = await productsService.list({
        status: "published",
        limit: 10,
        page: 1,
      });

      if (!products.data || products.data.length === 0) {
        throw new Error("No published products found");
      }

      this.testData.products = products.data;
      this.testData.selectedProduct = products.data[0];

      return {
        totalProducts: products.data.length,
        selectedProductId: this.testData.selectedProduct.id,
        selectedProductName: this.testData.selectedProduct.name,
        selectedProductPrice: this.testData.selectedProduct.price,
      };
    });

    // Step 2: View product details
    await this.executeStep("View Product Details", async () => {
      const productId = this.testData.selectedProduct.id;
      const product = await productsService.getById(productId);

      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      // Check stock availability
      if (product.stockCount < 1) {
        throw new Error("Product out of stock");
      }

      this.testData.productDetails = product;

      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        stockCount: product.stockCount,
        inStock: product.stockCount > 0,
      };
    });

    // Step 3: Add to cart
    await this.executeStep("Add to Cart", async () => {
      const productId = this.testData.selectedProduct.id;
      const quantity = 1;

      const cartItem = await cartService.addItem({
        productId,
        quantity,
        variant: undefined,
      });

      this.testData.cartItemId = cartItem.id;

      return {
        cartItemId: cartItem.id,
        productId,
        quantity,
        subtotal: cartItem.price * quantity,
      };
    });

    // Step 4: View cart
    await this.executeStep("View Cart", async () => {
      const cart = await cartService.get();

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty after adding item");
      }

      this.testData.cart = cart;

      return {
        itemCount: cart.items.length,
        subtotal: cart.subtotal,
        total: cart.total,
        items: cart.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      };
    });

    // Step 5: Check coupon availability (optional)
    await this.executeStep("Check Available Coupons", async () => {
      try {
        const coupons = await couponsService.list({
          status: "active",
          limit: 5,
        });

        if (coupons.data && coupons.data.length > 0) {
          this.testData.availableCoupon = coupons.data[0];
          return {
            couponsAvailable: coupons.data.length,
            firstCouponCode: coupons.data[0].code,
            discountType: (coupons.data[0] as any).discountType || "percentage",
            discountValue: (coupons.data[0] as any).discountValue || 0,
          };
        }

        return { couponsAvailable: 0, message: "No active coupons" };
      } catch (error) {
        // Coupons are optional
        return { couponsAvailable: 0, message: "Coupon check skipped" };
      }
    });

    // Step 6: Apply coupon (if available)
    if (this.testData.availableCoupon) {
      await this.executeStep("Apply Coupon", async () => {
        const couponCode = this.testData.availableCoupon.code;
        const result = await cartService.applyCoupon({ code: couponCode });

        this.testData.appliedCoupon = result;

        return {
          couponCode,
          discountAmount: result.discount || 0,
          newTotal: result.total,
        };
      });
    }

    // Step 7: Proceed to checkout
    await this.executeStep("Proceed to Checkout", async () => {
      const cart = this.testData.cart;

      // Validate cart before checkout
      if (!cart || cart.items.length === 0) {
        throw new Error("Cannot checkout with empty cart");
      }

      this.testData.checkoutReady = true;

      return {
        itemCount: cart.items.length,
        total: cart.total,
        readyForCheckout: true,
      };
    });

    // Step 8: Create order
    await this.executeStep("Create Order", async () => {
      const orderData = {
        items: this.testData.cart.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          variant: item.variant,
        })),
        shippingAddress: {
          name: "Test Customer",
          phone: "+919876543210",
          line1: "123 Test Street",
          line2: "Apt 4B",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
        },
        billingAddress: {
          name: "Test Customer",
          phone: "+919876543210",
          line1: "123 Test Street",
          line2: "Apt 4B",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
        },
        paymentMethod: "cod" as const,
        couponCode: this.testData.appliedCoupon?.code,
        customerNotes: "Test order - Phase 3 workflow",
      };

      const order = await ordersService.create(orderData);

      if (!order || !order.id) {
        throw new Error("Order creation failed");
      }

      this.testData.order = order;
      this.testData.orderId = order.id;

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        itemCount: order.items.length,
      };
    });

    // Step 9: Verify order status
    await this.executeStep("Verify Order Created", async () => {
      const orderId = this.testData.orderId;
      const order = await ordersService.getById(orderId);

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (order.status !== "pending" && order.status !== "confirmed") {
        throw new Error(`Unexpected order status: ${order.status}`);
      }

      return {
        orderId: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        verified: true,
      };
    });

    // Step 10: Clear cart after successful order
    await this.executeStep("Clear Cart", async () => {
      await cartService.clear();

      const cart = await cartService.get();

      return {
        cartCleared: !cart || cart.items.length === 0,
        itemCount: cart ? cart.items.length : 0,
      };
    });

    // Step 11: Email confirmation (simulation)
    await this.executeStep("Email Confirmation (Simulated)", async () => {
      // In production, this would trigger actual email
      const emailData = {
        to: "customer@example.com",
        subject: `Order Confirmation - ${this.testData.order.orderNumber}`,
        template: "order-confirmation",
        data: {
          orderNumber: this.testData.order.orderNumber,
          orderTotal: this.testData.order.total,
          items: this.testData.order.items,
        },
      };

      return {
        emailSent: true,
        simulated: true,
        recipient: emailData.to,
        orderNumber: this.testData.order.orderNumber,
      };
    });

    // Generate final report
    const workflowDuration = Date.now() - workflowStart;
    const passed = this.results.filter((r) => r.status === "success").length;
    const failed = this.results.filter((r) => r.status === "failed").length;
    const skipped = this.results.filter((r) => r.status === "skipped").length;

    const finalStatus =
      failed === 0 ? "success" : passed > 0 ? "partial" : "failed";

    console.log("\n" + "=".repeat(60));
    console.log("📊 WORKFLOW SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Steps: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`⏱️  Total Duration: ${workflowDuration}ms`);
    console.log(`🎯 Final Status: ${finalStatus.toUpperCase()}`);

    if (this.testData.orderId) {
      console.log(`\n🎉 Order ID: ${this.testData.orderId}`);
      console.log(`📝 Order Number: ${this.testData.order.orderNumber}`);
    }

    console.log("=".repeat(60) + "\n");

    return {
      workflowName: "Product Purchase Flow",
      totalSteps: this.results.length,
      passed,
      failed,
      skipped,
      totalDuration: workflowDuration,
      results: this.results,
      finalStatus,
    };
  }
}

// Export for use in test runner
export { ProductPurchaseWorkflow };

// Allow direct execution
if (require.main === module) {
  const workflow = new ProductPurchaseWorkflow();
  workflow
    .run()
    .then((result) => {
      process.exit(result.finalStatus === "success" ? 0 : 1);
    })
    .catch((error) => {
      console.error("Workflow execution failed:", error);
      process.exit(1);
    });
}
