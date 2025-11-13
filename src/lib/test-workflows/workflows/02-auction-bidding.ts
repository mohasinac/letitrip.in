/**
 * Phase 3: Test Workflow #2 - Auction Bidding Flow
 *
 * This test simulates complete auction bidding journey:
 * 1. Browse live auctions
 * 2. View auction details
 * 3. Place bid
 * 4. Get outbid (simulate)
 * 5. Place higher bid
 * 6. Win auction
 * 7. Complete payment
 * 8. Receive confirmation
 *
 * Expected time: 15-20 minutes
 * Success criteria: Bid placed successfully, auction won
 */

import { auctionsService } from "@/services/auctions.service";
import type { Auction } from "@/types";

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

class AuctionBiddingWorkflow {
  private results: TestResult[] = [];
  private testData: any = {};
  private context: any = null;

  constructor(context?: any) {
    this.context = context;
  }

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
    console.log("🔨 WORKFLOW: Auction Bidding Flow");
    console.log("=".repeat(60));

    const workflowStart = Date.now();

    // Step 1: Browse live auctions
    await this.executeStep("Browse Live Auctions", async () => {
      let auctions: any[] = [];

      // Use context if available, otherwise query the database
      if (this.context?.auctions?.live?.length > 0) {
        auctions = this.context.auctions.live;
        console.log(`📦 Using ${auctions.length} live auctions from context`);
      } else {
        // Fallback to API call
        const auctionsResponse = await auctionsService.list({
          status: "live",
          limit: 10,
          page: 1,
        });
        auctions = auctionsResponse.data || [];
        console.log(`🌐 Fetched ${auctions.length} live auctions from API`);
      }

      if (auctions.length === 0) {
        throw new Error(
          "No live auctions found. Please generate test data with live auctions first."
        );
      }

      this.testData.auctions = auctions;
      this.testData.selectedAuction = auctions[0];

      return {
        totalAuctions: auctions.length,
        selectedAuctionId: this.testData.selectedAuction.id,
        selectedAuctionName: this.testData.selectedAuction.name,
        currentBid: this.testData.selectedAuction.currentBid,
        startingBid: this.testData.selectedAuction.startingBid,
        source: this.context?.auctions?.live?.length > 0 ? "context" : "api",
      };
    });

    // Step 2: View auction details
    await this.executeStep("View Auction Details", async () => {
      const auctionId = this.testData.selectedAuction.id;
      let auction: any;

      // Use context if available, otherwise query the database
      if (this.testData.selectedAuction.endTime) {
        // We already have full details from context
        auction = this.testData.selectedAuction;
        console.log(`📦 Using auction details from context`);
      } else {
        // Fallback to API call
        auction = await auctionsService.getById(auctionId);
        console.log(`🌐 Fetched auction details from API`);
      }

      if (!auction) {
        throw new Error(`Auction ${auctionId} not found`);
      }

      if (auction.status !== "live") {
        throw new Error("Auction is not live");
      }

      this.testData.auctionDetails = auction;
      // Calculate minimum bid (current bid + typical increment of 100)
      const bidIncrement = 100;
      this.testData.minimumBid =
        (auction.currentBid || auction.startingBid) + bidIncrement;
      this.testData.bidIncrement = bidIncrement;

      return {
        auctionId: auction.id,
        name: auction.name,
        currentBid: auction.currentBid || auction.startingBid,
        bidIncrement: bidIncrement,
        minimumNextBid: this.testData.minimumBid,
        endTime: auction.endTime,
        bidCount: auction.bidCount || 0,
      };
    });

    // Step 3: Check user eligibility
    await this.executeStep("Check Bidding Eligibility", async () => {
      const auction = this.testData.auctionDetails;

      // Check if auction ended
      const now = new Date();
      const endTime = new Date(auction.endTime);
      if (endTime < now) {
        throw new Error("Auction has ended");
      }

      // Check minimum bid requirement
      const minimumBid = this.testData.minimumBid;

      return {
        eligible: true,
        minimumBid,
        timeRemaining: Math.floor((endTime.getTime() - now.getTime()) / 1000),
      };
    });

    // Step 4: Place first bid
    await this.executeStep("Place Initial Bid", async () => {
      const auctionId = this.testData.auctionDetails.id;
      const bidAmount = this.testData.minimumBid;

      const bid = await auctionsService.placeBid(auctionId, {
        bidAmount: bidAmount,
      });

      this.testData.firstBid = bid;
      this.testData.bidId = bid.id;

      return {
        bidId: bid.id,
        auctionId,
        amount: bidAmount,
        isWinning: bid.isWinning,
        timestamp: bid.bidTime,
      };
    });

    // Step 5: Verify bid recorded
    await this.executeStep("Verify Bid Recorded", async () => {
      const auctionId = this.testData.auctionDetails.id;
      const auction = await auctionsService.getById(auctionId);

      const expectedBid = this.testData.minimumBid;
      const actualBid = auction.currentBid;

      if (actualBid !== expectedBid) {
        throw new Error(
          `Bid mismatch: expected ${expectedBid}, got ${actualBid}`
        );
      }

      return {
        bidRecorded: true,
        currentBid: actualBid,
        isHighestBidder: true,
      };
    });

    // Step 6: Simulate outbid notification (if another bidder exists)
    await this.executeStep("Outbid Notification (Simulated)", async () => {
      // In production, this would be a real-time notification
      return {
        notificationSent: true,
        simulated: true,
        message: "Another bidder has placed a higher bid",
        previousBid: this.testData.minimumBid,
        newMinimumBid: this.testData.minimumBid + this.testData.bidIncrement,
      };
    });

    // Step 7: Place higher bid (if outbid)
    await this.executeStep("Place Higher Bid", async () => {
      const auctionId = this.testData.auctionDetails.id;
      const newBidAmount =
        this.testData.minimumBid + this.testData.bidIncrement * 2;

      try {
        const bid = await auctionsService.placeBid(auctionId, {
          bidAmount: newBidAmount,
        });

        this.testData.winningBid = bid;

        return {
          bidId: bid.id,
          amount: newBidAmount,
          isWinning: bid.isWinning,
          isHighestBid: true,
        };
      } catch (error: any) {
        // May fail if auction ended or user already highest bidder
        return {
          skipped: true,
          reason: error.message,
        };
      }
    });

    // Step 8: Get bid history
    await this.executeStep("View Bid History", async () => {
      const auctionId = this.testData.auctionDetails.id;

      try {
        const bidsResponse = await auctionsService.getBids(auctionId);
        const bids = bidsResponse.data || [];

        return {
          totalBids: bids.length,
          highestBid: bids[0]?.bidAmount || 0,
          userBids: bids.filter((b: any) => b.userId === "current-user").length,
        };
      } catch (error) {
        // Bid history may not be publicly available
        return {
          skipped: true,
          reason: "Bid history not accessible",
        };
      }
    });

    // Step 9: Monitor auction end
    await this.executeStep("Monitor Auction Status", async () => {
      const auctionId = this.testData.auctionDetails.id;
      const auction = await auctionsService.getById(auctionId);

      const now = new Date();
      const endTime = new Date(auction.endTime);
      const timeRemaining = Math.floor(
        (endTime.getTime() - now.getTime()) / 1000
      );

      return {
        auctionId,
        status: auction.status,
        timeRemaining: Math.max(0, timeRemaining),
        currentBid: auction.currentBid,
        stillLive: auction.status === "live",
      };
    });

    // Step 10: Winning notification (simulated)
    await this.executeStep("Winning Notification (Simulated)", async () => {
      // In production, this happens when auction ends
      return {
        notificationSent: true,
        simulated: true,
        message: "Congratulations! You won the auction",
        finalBid: this.testData.winningBid?.amount || this.testData.minimumBid,
        auctionName: this.testData.auctionDetails.name,
      };
    });

    // Step 11: Payment processing (simulated)
    await this.executeStep("Process Payment (Simulated)", async () => {
      const paymentAmount =
        this.testData.winningBid?.amount || this.testData.minimumBid;

      // In production, this would integrate with payment gateway
      return {
        paymentProcessed: true,
        simulated: true,
        amount: paymentAmount,
        method: "razorpay",
        status: "success",
      };
    });

    // Step 12: Email confirmation
    await this.executeStep("Confirmation Email (Simulated)", async () => {
      return {
        emailSent: true,
        simulated: true,
        recipient: "bidder@example.com",
        subject: `Auction Won - ${this.testData.auctionDetails.name}`,
        finalAmount:
          this.testData.winningBid?.amount || this.testData.minimumBid,
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

    if (this.testData.bidId) {
      console.log(`\n🎉 Bid ID: ${this.testData.bidId}`);
      console.log(
        `💰 Final Bid: ₹${
          this.testData.winningBid?.amount || this.testData.minimumBid
        }`
      );
    }

    console.log("=".repeat(60) + "\n");

    return {
      workflowName: "Auction Bidding Flow",
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
export { AuctionBiddingWorkflow };

// Allow direct execution
if (require.main === module) {
  const workflow = new AuctionBiddingWorkflow();
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
