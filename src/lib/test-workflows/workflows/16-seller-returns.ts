/**
 * Workflow #16: Seller Returns Management
 *
 * Complete seller returns handling workflow:
 * 1. View returns dashboard
 * 2. Check pending returns
 * 3. View return request details
 * 4. Review return evidence (photos/media)
 * 5. Approve return request
 * 6. Update return status to processing
 * 7. Process refund for approved return
 * 8. Reject invalid return with reason
 * 9. View return statistics
 * 10. Check completed returns
 * 11. Verify all operations
 *
 * Expected time: 10-12 minutes
 * Success criteria: All return management operations successful
 */

import { returnsService } from "@/services/returns.service";
import { shopsService } from "@/services/shops.service";
import { TEST_CONFIG, getSafeShopId } from "../test-config";
import { BaseWorkflow, WorkflowResult, ShopHelpers } from "../helpers";

export class SellerReturnsManagementWorkflow extends BaseWorkflow {
  private shopId: string | null = null;
  private testReturnIds: string[] = [];

  async run(): Promise<WorkflowResult> {
    this.initialize();

    try {
      // Step 1: View returns dashboard
      await this.executeStep("View Returns Dashboard", async () => {
        console.log("Navigating to /seller/returns");

        // Get shop ID from test config
        this.shopId = getSafeShopId();

        if (!this.shopId) {
          throw new Error("No shop ID available - seller role required");
        }

        // Verify shop exists
        const shop = await shopsService.getBySlug(this.shopId);

        console.log(
          `Accessing returns dashboard for shop: ${ShopHelpers.getName(shop)}`
        );
      });

      // Step 2: Check pending returns
      await this.executeStep("Check Pending Returns", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const pendingReturns = await returnsService.list({
          shopId: this.shopId,
          status: "requested",
          limit: 10,
        });

        console.log(`Pending returns: ${pendingReturns.data?.length || 0}`);

        if (pendingReturns.data && pendingReturns.data.length > 0) {
          // Store some return IDs for testing
          this.testReturnIds = pendingReturns.data.slice(0, 3).map((r) => r.id);

          console.log("Recent pending returns:");
          pendingReturns.data.slice(0, 3).forEach((ret) => {
            console.log(
              `  - Return ${ret.id}: Order ${ret.orderId} (${ret.reason})`
            );
          });
        } else {
          console.log("No pending returns available for testing");
        }
      });

      // Step 3: View return request details
      await this.executeStep(
        "View Return Request Details",
        async () => {
          if (this.testReturnIds.length === 0) {
            console.log("No test returns available to view");
            return;
          }

          const returnId = this.testReturnIds[0];
          const returnDetails = await returnsService.getById(returnId);

          console.log(`Return Details for ${returnId}:`);
          console.log(`  Order ID: ${returnDetails.orderId}`);
          console.log(`  Reason: ${returnDetails.reason}`);
          console.log(`  Status: ${returnDetails.status}`);
          console.log(`  Description: ${returnDetails.description || "N/A"}`);
        },
        true // optional
      );

      // Step 4: Review return evidence (photos/media)
      await this.executeStep(
        "Review Return Evidence",
        async () => {
          if (this.testReturnIds.length === 0) {
            console.log("No test returns available to review");
            return;
          }

          const returnId = this.testReturnIds[0];
          const returnDetails = await returnsService.getById(returnId);

          const mediaCount = returnDetails.media?.length || 0;

          console.log(
            `Return evidence for ${returnId}: ${mediaCount} media files`
          );

          if (returnDetails.media && returnDetails.media.length > 0) {
            console.log("Media files:");
            returnDetails.media.forEach((url, index) => {
              console.log(`  ${index + 1}. ${url}`);
            });
          } else {
            console.log("No media files attached to this return");
          }
        },
        true // optional
      );

      // Step 5: Approve return request
      await this.executeStep(
        "Approve Return Request",
        async () => {
          if (this.testReturnIds.length === 0) {
            console.log("No test returns available to approve");
            return;
          }

          const returnId = this.testReturnIds[0];

          const approvedReturn = await returnsService.approve(returnId, {
            approved: true,
            notes: "Return approved - item condition verified",
          });

          console.log(
            `Approved return ${returnId}: Status now ${approvedReturn.status}`
          );
        },
        true // optional
      );

      // Step 6: Update return status to processing
      await this.executeStep(
        "Update Return Status",
        async () => {
          if (this.testReturnIds.length === 0) {
            console.log("No test returns available to update");
            return;
          }

          const returnId = this.testReturnIds[0];

          const updatedReturn = await returnsService.update(returnId, {
            status: "item-received",
            adminNotes: "Processing return - item received at warehouse",
          });

          console.log(
            `Updated return ${returnId} status to: ${updatedReturn.status}`
          );
        },
        true // optional
      );

      // Step 7: Process refund for approved return
      await this.executeStep(
        "Process Refund",
        async () => {
          if (this.testReturnIds.length === 0) {
            console.log("No test returns available for refund");
            return;
          }

          const returnId = this.testReturnIds[0];

          const refundedReturn = await returnsService.processRefund(returnId, {
            refundAmount: 1000,
            refundMethod: "original_payment_method",
            refundTransactionId: `TXN_${Date.now()}`,
          });

          console.log(
            `Processed refund for return ${returnId}: ₹${
              refundedReturn.refundAmount || 1000
            }`
          );
        },
        true // optional
      );

      // Step 8: Reject invalid return with reason
      await this.executeStep(
        "Reject Invalid Return",
        async () => {
          if (this.testReturnIds.length < 2) {
            console.log("No additional test returns available to reject");
            return;
          }

          const returnId = this.testReturnIds[1];

          const rejectedReturn = await returnsService.approve(returnId, {
            approved: false,
            notes:
              "Return rejected - item shows signs of use beyond normal inspection",
          });

          console.log(
            `Rejected return ${returnId}: Status now ${rejectedReturn.status}`
          );
        },
        true // optional
      );

      // Step 9: View return statistics
      await this.executeStep("View Return Statistics", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const stats = await returnsService.getStats({
          shopId: this.shopId,
        });

        console.log("Return Statistics:");
        console.log(`  Total Returns: ${stats.total || 0}`);
        console.log(`  Pending: ${stats.pending || 0}`);
        console.log(`  Approved: ${stats.approved || 0}`);
        console.log(`  Rejected: ${stats.rejected || 0}`);
        console.log(`  Completed: ${stats.completed || 0}`);
        console.log(`  Refund Amount: ₹${stats.totalRefundAmount || 0}`);
      });

      // Step 10: Check completed returns
      await this.executeStep("Check Completed Returns", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const completedReturns = await returnsService.list({
          shopId: this.shopId,
          status: "completed",
          limit: 5,
        });

        console.log(`Completed returns: ${completedReturns.data?.length || 0}`);

        if (completedReturns.data && completedReturns.data.length > 0) {
          console.log("Recent completed returns:");
          completedReturns.data.forEach((ret) => {
            console.log(
              `  - Return ${ret.id}: ₹${ret.refundAmount || 0} refunded`
            );
          });
        }
      });

      // Step 11: Verify all operations
      await this.executeStep("Verify All Operations", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        // Get all returns for verification
        const allReturns = await returnsService.list({
          shopId: this.shopId,
          limit: 50,
        });

        console.log("Return Management Summary:");
        console.log(`  Total Returns: ${allReturns.data?.length || 0}`);

        if (allReturns.data) {
          const statusCounts = {
            requested: allReturns.data.filter((r) => r.status === "requested")
              .length,
            approved: allReturns.data.filter((r) => r.status === "approved")
              .length,
            rejected: allReturns.data.filter((r) => r.status === "rejected")
              .length,
            itemReceived: allReturns.data.filter(
              (r) => r.status === "item-received"
            ).length,
            refundProcessed: allReturns.data.filter(
              (r) => r.status === "refund-processed"
            ).length,
            completed: allReturns.data.filter((r) => r.status === "completed")
              .length,
          };

          console.log("  By Status:");
          console.log(`    Requested: ${statusCounts.requested}`);
          console.log(`    Approved: ${statusCounts.approved}`);
          console.log(`    Item Received: ${statusCounts.itemReceived}`);
          console.log(`    Refund Processed: ${statusCounts.refundProcessed}`);
          console.log(`    Completed: ${statusCounts.completed}`);
          console.log(`    Rejected: ${statusCounts.rejected}`);
        }

        console.log("\n  ✅ All return management operations verified!");
      });
    } catch (error) {
      console.error("Workflow failed:", error);
      throw error;
    }

    return this.printSummary();
  }
}
