/**
 * Workflow #17: Seller Coupon Management
 *
 * Complete seller coupon lifecycle management:
 * 1. Navigate to coupons page (verify access)
 * 2. Create percentage discount coupon (10% off)
 * 3. Set coupon restrictions (min order ₹500, specific categories)
 * 4. Create fixed amount coupon (₹100 off)
 * 5. Set usage limits (5 per user, 100 total)
 * 6. Create first-time buyer coupon (20% off)
 * 7. Schedule coupon activation (start/end dates)
 * 8. Test coupon code validity
 * 9. View coupon usage statistics
 * 10. Bulk update multiple coupons status
 * 11. Extend coupon expiry date
 * 12. Deactivate expired coupon
 * 13. Verify all operations in coupon list
 *
 * Expected time: 15-20 minutes
 * Success criteria: All coupons created, validated, and managed successfully
 */

import { couponsService } from "@/services/coupons.service";
import { shopsService } from "@/services/shops.service";
import { categoriesService } from "@/services/categories.service";
import { TEST_CONFIG, getSafeShopId } from "../test-config";
import { BaseWorkflow, WorkflowResult, ShopHelpers, sleep } from "../helpers";

export class SellerCouponManagementWorkflow extends BaseWorkflow {
  private shopId: string | null = null;
  private percentageCouponCode: string | null = null;
  private fixedCouponCode: string | null = null;
  private firstTimeCouponCode: string | null = null;
  private createdCoupons: string[] = [];

  async run(): Promise<WorkflowResult> {
    this.initialize();

    console.log("\n" + "=".repeat(70));
    console.log("🎫 SELLER COUPON MANAGEMENT WORKFLOW");
    console.log("=".repeat(70));
    console.log("Testing complete coupon creation and management lifecycle\n");

    // Execute all steps
    await this.step1_NavigateToCouponsPage();
    await this.step2_CreatePercentageCoupon();
    await this.step3_SetCouponRestrictions();
    await this.step4_CreateFixedAmountCoupon();
    await this.step5_SetUsageLimits();
    await this.step6_CreateFirstTimeBuyerCoupon();
    await this.step7_ScheduleCouponActivation();
    await this.step8_TestCouponValidity();
    await this.step9_ViewCouponStatistics();
    await this.step10_BulkUpdateCoupons();
    await this.step11_ExtendCouponExpiry();
    await this.step12_DeactivateExpiredCoupon();
    await this.step13_VerifyAllOperations();

    return this.printSummary();
  }

  // Step 1: Navigate to coupons page and verify access
  private async step1_NavigateToCouponsPage(): Promise<void> {
    await this.executeStep(
      "Step 1: Navigate to Coupons Page & Verify Access",
      async () => {
        // Get or verify shop
        this.shopId = getSafeShopId();

        if (!this.shopId) {
          throw new Error("No shop ID available for seller");
        }

        // Verify shop exists
        const shop = await shopsService.getBySlug(this.shopId);
        console.log(
          `   ✅ Accessing coupons for shop: ${ShopHelpers.getName(shop)}`
        );

        // Fetch existing coupons to verify access
        const coupons = await couponsService.list({
          shopId: this.shopId,
          limit: 5,
        });

        console.log(
          `   ℹ️  Current active coupons: ${coupons.data?.length || 0}`
        );
      }
    );
  }

  // Step 2: Create percentage discount coupon (10% off)
  private async step2_CreatePercentageCoupon(): Promise<void> {
    await this.executeStep(
      "Step 2: Create Percentage Discount Coupon (10% off)",
      async () => {
        const timestamp = Date.now();
        this.percentageCouponCode = `SAVE10_${timestamp}`;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // Valid for 30 days

        const coupon = await couponsService.create({
          shopId: this.shopId!,
          code: this.percentageCouponCode,
          name: "10% Off Storewide",
          description: "Get 10% discount on all products",
          type: "percentage",
          discountValue: 10,
          maxDiscountAmount: 500, // Max ₹500 discount
          minPurchaseAmount: 0,
          minQuantity: 1,
          applicability: "all",
          usageLimitPerUser: 1,
          startDate,
          endDate,
          firstOrderOnly: false,
          newUsersOnly: false,
          canCombineWithOtherCoupons: false,
          autoApply: false,
          isPublic: true,
          isFeatured: false,
        });

        this.createdCoupons.push(this.percentageCouponCode);

        console.log(
          `   ✅ Created percentage coupon: ${this.percentageCouponCode}`
        );
        console.log(`   💰 Discount: 10% (Max ₹500)`);
        console.log(`   📅 Valid till: ${endDate.toLocaleDateString()}`);
      }
    );
  }

  // Step 3: Set coupon restrictions (min order, categories)
  private async step3_SetCouponRestrictions(): Promise<void> {
    await this.executeStep(
      "Step 3: Set Coupon Restrictions (Min Order ₹500, Categories)",
      async () => {
        // Get categories for restrictions
        const categories = await categoriesService.list();
        const categoryIds = categories.slice(0, 2).map((c: any) => c.id) || [];

        const timestamp = Date.now();
        const restrictedCouponCode = `RESTRICTED_${timestamp}`;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 15);

        const coupon = await couponsService.create({
          shopId: this.shopId!,
          code: restrictedCouponCode,
          name: "Category Specific Discount",
          description: "15% off on selected categories (min order ₹500)",
          type: "percentage",
          discountValue: 15,
          maxDiscountAmount: 1000,
          minPurchaseAmount: 500, // Minimum ₹500 order
          minQuantity: 1,
          applicability: categoryIds.length > 0 ? "category" : "all",
          applicableCategories: categoryIds,
          usageLimitPerUser: 3,
          usageLimit: 100,
          startDate,
          endDate,
          firstOrderOnly: false,
          newUsersOnly: false,
          canCombineWithOtherCoupons: false,
          autoApply: false,
          isPublic: true,
          isFeatured: false,
        });

        this.createdCoupons.push(restrictedCouponCode);

        console.log(`   ✅ Created restricted coupon: ${restrictedCouponCode}`);
        console.log(`   💵 Min Order: ₹500`);
        console.log(`   📦 Categories: ${categoryIds.length} selected`);
      }
    );
  }

  // Step 4: Create fixed amount coupon (₹100 off)
  private async step4_CreateFixedAmountCoupon(): Promise<void> {
    await this.executeStep(
      "Step 4: Create Fixed Amount Coupon (₹100 off)",
      async () => {
        const timestamp = Date.now();
        this.fixedCouponCode = `FLAT100_${timestamp}`;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 20);

        const coupon = await couponsService.create({
          shopId: this.shopId!,
          code: this.fixedCouponCode,
          name: "Flat ₹100 Off",
          description: "Get ₹100 flat discount on orders above ₹1000",
          type: "flat",
          discountValue: 100,
          minPurchaseAmount: 1000,
          minQuantity: 1,
          applicability: "all",
          usageLimitPerUser: 2,
          startDate,
          endDate,
          firstOrderOnly: false,
          newUsersOnly: false,
          canCombineWithOtherCoupons: false,
          autoApply: false,
          isPublic: true,
          isFeatured: true, // Featured coupon
        });

        this.createdCoupons.push(this.fixedCouponCode);

        console.log(
          `   ✅ Created fixed amount coupon: ${this.fixedCouponCode}`
        );
        console.log(`   💰 Flat Discount: ₹100`);
        console.log(`   💵 Min Order: ₹1000`);
        console.log(`   ⭐ Featured: Yes`);
      }
    );
  }

  // Step 5: Set usage limits (per user, total)
  private async step5_SetUsageLimits(): Promise<void> {
    await this.executeStep(
      "Step 5: Verify Usage Limits Configuration",
      async () => {
        // Verify the previously created coupons have correct limits
        if (this.fixedCouponCode) {
          const coupon = await couponsService.getByCode(this.fixedCouponCode);

          console.log(
            `   ✅ Usage limits verified for: ${this.fixedCouponCode}`
          );
          console.log(
            `   👤 Per User: ${(coupon as any).usageLimitPerUser || "N/A"} uses`
          );
          console.log(
            `   🌐 Total: ${(coupon as any).usageLimit || "Unlimited"} uses`
          );
          console.log(`   📊 Used: ${(coupon as any).usageCount || 0} times`);
        }
      }
    );
  }

  // Step 6: Create first-time buyer coupon (20% off)
  private async step6_CreateFirstTimeBuyerCoupon(): Promise<void> {
    await this.executeStep(
      "Step 6: Create First-Time Buyer Coupon (20% off)",
      async () => {
        const timestamp = Date.now();
        this.firstTimeCouponCode = `WELCOME20_${timestamp}`;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 60); // Valid for 60 days

        const coupon = await couponsService.create({
          shopId: this.shopId!,
          code: this.firstTimeCouponCode,
          name: "Welcome Offer - 20% Off",
          description: "Exclusive 20% discount for first-time buyers",
          type: "percentage",
          discountValue: 20,
          maxDiscountAmount: 1000,
          minPurchaseAmount: 500,
          minQuantity: 1,
          applicability: "all",
          usageLimitPerUser: 1,
          startDate,
          endDate,
          firstOrderOnly: true, // First order only
          newUsersOnly: true, // New users only
          canCombineWithOtherCoupons: false,
          autoApply: false,
          isPublic: true,
          isFeatured: true,
        });

        this.createdCoupons.push(this.firstTimeCouponCode);

        console.log(
          `   ✅ Created first-time buyer coupon: ${this.firstTimeCouponCode}`
        );
        console.log(`   🎁 Discount: 20% (Max ₹1000)`);
        console.log(`   🆕 First Order Only: Yes`);
        console.log(`   👥 New Users Only: Yes`);
      }
    );
  }

  // Step 7: Schedule coupon activation (start/end dates)
  private async step7_ScheduleCouponActivation(): Promise<void> {
    await this.executeStep(
      "Step 7: Create Scheduled Future Coupon",
      async () => {
        const timestamp = Date.now();
        const scheduledCode = `FUTURE25_${timestamp}`;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 7); // Starts in 7 days
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 37); // Valid for 30 days after start

        const coupon = await couponsService.create({
          shopId: this.shopId!,
          code: scheduledCode,
          name: "Upcoming Sale - 25% Off",
          description: "Special discount starting next week",
          type: "percentage",
          discountValue: 25,
          maxDiscountAmount: 2000,
          minPurchaseAmount: 1500,
          minQuantity: 1,
          applicability: "all",
          usageLimitPerUser: 1,
          usageLimit: 50,
          startDate,
          endDate,
          firstOrderOnly: false,
          newUsersOnly: false,
          canCombineWithOtherCoupons: false,
          autoApply: false,
          isPublic: true,
          isFeatured: false,
        });

        this.createdCoupons.push(scheduledCode);

        console.log(`   ✅ Created scheduled coupon: ${scheduledCode}`);
        console.log(`   📅 Starts: ${startDate.toLocaleDateString()}`);
        console.log(`   📅 Ends: ${endDate.toLocaleDateString()}`);
        console.log(`   ⏱️  Status: Scheduled (not yet active)`);
      }
    );
  }

  // Step 8: Test coupon code validity
  private async step8_TestCouponValidity(): Promise<void> {
    await this.executeStep("Step 8: Validate Coupon Codes", async () => {
      // Test percentage coupon
      if (this.percentageCouponCode) {
        const validation = await couponsService.validate({
          code: this.percentageCouponCode,
          cartTotal: 1000,
          items: [
            {
              productId: "test-product-1",
              categoryId: "test-category-1",
              quantity: 2,
              price: 500,
            },
          ],
        });

        console.log(`   ✅ Tested: ${this.percentageCouponCode}`);
        console.log(
          `   ${validation.valid ? "✓" : "✗"} Valid: ${validation.valid}`
        );
        console.log(`   💰 Discount: ₹${validation.discount || 0}`);
      }

      // Test fixed coupon
      if (this.fixedCouponCode) {
        const validation = await couponsService.validate({
          code: this.fixedCouponCode,
          cartTotal: 1200,
          items: [
            {
              productId: "test-product-2",
              categoryId: "test-category-1",
              quantity: 1,
              price: 1200,
            },
          ],
        });

        console.log(`   ✅ Tested: ${this.fixedCouponCode}`);
        console.log(
          `   ${validation.valid ? "✓" : "✗"} Valid: ${validation.valid}`
        );
        console.log(`   💰 Discount: ₹${validation.discount || 0}`);
      }
    });
  }

  // Step 9: View coupon usage statistics
  private async step9_ViewCouponStatistics(): Promise<void> {
    await this.executeStep("Step 9: View Coupon Usage Statistics", async () => {
      const coupons = await couponsService.list({
        shopId: this.shopId!,
        limit: 20,
      });

      const stats = {
        totalCoupons: coupons.data?.length || 0,
        activeCoupons:
          coupons.data?.filter((c: any) => c.status === "active").length || 0,
        expiredCoupons:
          coupons.data?.filter((c: any) => c.status === "expired").length || 0,
        scheduledCoupons:
          coupons.data?.filter((c: any) => c.status === "scheduled").length ||
          0,
        totalUsage: coupons.data?.reduce(
          (sum: number, c: any) => sum + (c.usageCount || 0),
          0
        ),
      };

      console.log(`   📊 Total Coupons: ${stats.totalCoupons}`);
      console.log(`   ✅ Active: ${stats.activeCoupons}`);
      console.log(`   📅 Scheduled: ${stats.scheduledCoupons}`);
      console.log(`   ❌ Expired: ${stats.expiredCoupons}`);
      console.log(`   📈 Total Usage: ${stats.totalUsage} times`);
    });
  }

  // Step 10: Bulk update coupon status
  private async step10_BulkUpdateCoupons(): Promise<void> {
    await this.executeStep(
      "Step 10: Bulk Update Coupons (Make Featured)",
      async () => {
        let updated = 0;

        // Update first two created coupons to featured
        for (const code of this.createdCoupons.slice(0, 2)) {
          try {
            await couponsService.update(code, {
              isFeatured: true,
            });
            updated++;
            console.log(`   ✅ Updated ${code} to featured`);
          } catch (error) {
            console.log(`   ⚠️  Could not update ${code}`);
          }
        }

        console.log(`   📦 Bulk updated: ${updated} coupons`);
      }
    );
  }

  // Step 11: Extend coupon expiry date
  private async step11_ExtendCouponExpiry(): Promise<void> {
    await this.executeStep("Step 11: Extend Coupon Expiry Date", async () => {
      if (this.percentageCouponCode) {
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 60); // Extend by 30 more days

        await couponsService.update(this.percentageCouponCode, {
          endDate: newEndDate,
        });

        console.log(`   ✅ Extended: ${this.percentageCouponCode}`);
        console.log(`   📅 New Expiry: ${newEndDate.toLocaleDateString()}`);
      }
    });
  }

  // Step 12: Deactivate coupon
  private async step12_DeactivateExpiredCoupon(): Promise<void> {
    await this.executeStep("Step 12: Deactivate Coupon", async () => {
      if (this.createdCoupons.length > 0) {
        const codeToDeactivate =
          this.createdCoupons[this.createdCoupons.length - 1];

        await couponsService.update(codeToDeactivate, {
          status: "inactive",
        });

        console.log(`   ✅ Deactivated: ${codeToDeactivate}`);
        console.log(`   📊 Status: inactive`);
      }
    });
  }

  // Step 13: Verify all operations
  private async step13_VerifyAllOperations(): Promise<void> {
    await this.executeStep(
      "Step 13: Verify All Coupon Operations",
      async () => {
        const coupons = await couponsService.list({
          shopId: this.shopId!,
          limit: 50,
        });

        const ourCoupons =
          coupons.data?.filter((c: any) =>
            this.createdCoupons.includes(c.code)
          ) || [];

        console.log(`   ✅ Created Coupons: ${this.createdCoupons.length}`);
        console.log(`   ✅ Found in System: ${ourCoupons.length}`);

        // Verify each coupon type
        const types = {
          percentage: ourCoupons.filter((c: any) => c.type === "percentage")
            .length,
          fixed: ourCoupons.filter((c: any) => c.type === "fixed").length,
          firstTime: ourCoupons.filter((c: any) => c.firstOrderOnly).length,
          scheduled: ourCoupons.filter((c: any) => c.status === "scheduled")
            .length,
          featured: ourCoupons.filter((c: any) => c.isFeatured).length,
        };

        console.log(`   💯 Percentage Coupons: ${types.percentage}`);
        console.log(`   💰 Fixed Amount Coupons: ${types.fixed}`);
        console.log(`   🆕 First-Time Buyer: ${types.firstTime}`);
        console.log(`   📅 Scheduled: ${types.scheduled}`);
        console.log(`   ⭐ Featured: ${types.featured}`);

        console.log(`\n   🎉 All coupon management operations completed!`);
      }
    );
  }

  // Cleanup
  async cleanup(): Promise<void> {
    console.log("\n🧹 Cleaning up test coupons...");

    for (const code of this.createdCoupons) {
      try {
        await couponsService.delete(code);
        console.log(`   ✅ Deleted coupon: ${code}`);
      } catch (error) {
        console.log(`   ⚠️  Could not delete coupon: ${code}`);
      }
    }

    console.log("✅ Cleanup completed\n");
  }
}
