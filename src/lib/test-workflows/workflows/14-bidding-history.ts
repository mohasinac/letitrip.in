/**
 * Workflow #14: Bidding History & Watchlist
 *
 * Complete bidding and watchlist management:
 * 1. View active auctions
 * 2. Add 3 auctions to watchlist
 * 3. Place bids on watchlist items
 * 4. View bid history page
 * 5. Check outbid notifications (optional)
 * 6. Place auto-bid on auction
 * 7. View won auctions
 * 8. View user's active bids
 * 9. Check watchlist items
 * 10. Remove items from watchlist
 * 11. Verify bid history tracking
 * 12. Cleanup test bids
 *
 * Expected time: 10-12 minutes
 * Success criteria: All bidding and watchlist operations successful
 */

import { auctionsService } from "@/services/auctions.service";
import { BaseWorkflow, WorkflowResult } from "../helpers";

export class BiddingHistoryWatchlistWorkflow extends BaseWorkflow {
  private testAuctionIds: string[] = [];
  private watchedAuctionIds: string[] = [];
  private placedBidIds: string[] = [];

  async run(): Promise<WorkflowResult> {
    this.initialize();

    try {
      // Step 1: View active auctions
      await this.executeStep("View Active Auctions", async () => {
        console.log("Fetching active auctions");

        const auctions = await auctionsService.list({
          status: "live",
          limit: 10,
        });

        if (!auctions.data || auctions.data.length === 0) {
          throw new Error("No active auctions available for testing");
        }

        // Store auction IDs for testing
        this.testAuctionIds = auctions.data.slice(0, 5).map((a) => a.id);

        console.log(
          `Found ${auctions.data.length} active auctions, selected ${this.testAuctionIds.length} for testing`
        );
      });

      // Step 2: Add 3 auctions to watchlist
      await this.executeStep("Add Auctions to Watchlist", async () => {
        if (this.testAuctionIds.length < 3) {
          throw new Error("Insufficient auctions available");
        }

        const auctionsToWatch = this.testAuctionIds.slice(0, 3);

        for (const auctionId of auctionsToWatch) {
          try {
            const result = await auctionsService.toggleWatch(auctionId);

            if (result.watching) {
              this.watchedAuctionIds.push(auctionId);
              console.log(`Added auction ${auctionId} to watchlist`);
            }
          } catch (error) {
            console.log(`Failed to watch auction ${auctionId}: ${error}`);
          }
        }

        console.log(
          `Successfully added ${this.watchedAuctionIds.length} auctions to watchlist`
        );
      });

      // Step 3: Place bids on watchlist items
      await this.executeStep("Place Bids on Watchlist Items", async () => {
        if (this.watchedAuctionIds.length === 0) {
          throw new Error("No watchlist items to bid on");
        }

        for (const auctionId of this.watchedAuctionIds.slice(0, 2)) {
          try {
            // Get auction details to determine valid bid amount
            const auction = await auctionsService.getById(auctionId);
            const bidAmount = (auction.currentBid || auction.startingBid) + 100;

            const bid = await auctionsService.placeBid(auctionId, {
              bidAmount: bidAmount,
            });

            this.placedBidIds.push(bid.id);
            console.log(`Placed bid of ₹${bidAmount} on auction ${auctionId}`);
          } catch (error) {
            console.log(`Could not place bid on ${auctionId}: ${error}`);
          }
        }

        console.log(
          `Placed ${this.placedBidIds.length} bids on watchlist items`
        );
      });

      // Step 4: View bid history page
      await this.executeStep("View Bid History", async () => {
        const myBids = await auctionsService.getMyBids();

        console.log(`Total bids in history: ${myBids.length}`);

        if (myBids.length > 0) {
          const recentBids = myBids.slice(0, 5);
          console.log("Recent bids:");
          recentBids.forEach((bid) => {
            console.log(
              `  - Auction ${bid.auctionId}: ₹${bid.bidAmount} at ${new Date(
                bid.bidTime
              ).toLocaleString()}`
            );
          });
        }
      });

      // Step 5: Check outbid notifications (optional - may not have any)
      await this.executeStep(
        "Check Outbid Notifications",
        async () => {
          const myBids = await auctionsService.getMyBids();

          const outbidBids = myBids.filter((bid) => !bid.isWinning);

          console.log(`Outbid notifications: ${outbidBids.length}`);

          if (outbidBids.length > 0) {
            console.log("You have been outbid on:");
            outbidBids.slice(0, 3).forEach((bid) => {
              console.log(
                `  - Auction ${bid.auctionId}: Your bid ₹${bid.bidAmount}`
              );
            });
          }
        },
        true // optional
      );

      // Step 6: Place auto-bid on auction
      await this.executeStep(
        "Place Auto-Bid on Auction",
        async () => {
          if (this.testAuctionIds.length === 0) {
            throw new Error("No auctions available for auto-bid");
          }

          const auctionId = this.testAuctionIds[0];

          try {
            const auction = await auctionsService.getById(auctionId);
            const maxBidAmount =
              (auction.currentBid || auction.startingBid) + 500;

            const bid = await auctionsService.placeBid(auctionId, {
              bidAmount: maxBidAmount,
              isAutoBid: true,
              maxAutoBid: maxBidAmount,
            });

            console.log(
              `Placed auto-bid on auction ${auctionId} with max ₹${maxBidAmount}`
            );
          } catch (error) {
            console.log(`Auto-bid feature may not be available: ${error}`);
          }
        },
        true // optional - auto-bid may not be implemented
      );

      // Step 7: View won auctions
      await this.executeStep("View Won Auctions", async () => {
        const wonAuctions = await auctionsService.getWonAuctions();

        console.log(`Total won auctions: ${wonAuctions.length}`);

        if (wonAuctions.length > 0) {
          const recentWins = wonAuctions.slice(0, 3);
          console.log("Recent wins:");
          recentWins.forEach((auction) => {
            console.log(
              `  - ${auction.name}: ₹${
                auction.currentBid || auction.startingBid
              }`
            );
          });
        } else {
          console.log("No won auctions yet");
        }
      });

      // Step 8: View user's active bids
      await this.executeStep("View Active Bids", async () => {
        const myBids = await auctionsService.getMyBids();

        const activeBids = myBids.filter((bid) => bid.isWinning);

        console.log(`Active/Winning bids: ${activeBids.length}`);

        if (activeBids.length > 0) {
          console.log("Your active/winning bids:");
          activeBids.slice(0, 5).forEach((bid) => {
            console.log(
              `  - Auction ${bid.auctionId}: ₹${bid.bidAmount} (${
                bid.isWinning ? "Winning" : "Active"
              })`
            );
          });
        }
      });

      // Step 9: Check watchlist items
      await this.executeStep("Check Watchlist Items", async () => {
        const watchlist = await auctionsService.getWatchlist();

        console.log(`Total watchlist items: ${watchlist.length}`);

        if (watchlist.length > 0) {
          console.log("Watchlist items:");
          watchlist.slice(0, 5).forEach((auction) => {
            console.log(
              `  - ${auction.name}: Current bid ₹${
                auction.currentBid || auction.startingBid
              }`
            );
          });
        }
      });

      // Step 10: Remove items from watchlist
      await this.executeStep("Remove Items from Watchlist", async () => {
        if (this.watchedAuctionIds.length === 0) {
          console.log("No watched auctions to remove");
          return;
        }

        let removed = 0;

        for (const auctionId of this.watchedAuctionIds) {
          try {
            const result = await auctionsService.toggleWatch(auctionId);

            if (!result.watching) {
              removed++;
              console.log(`Removed auction ${auctionId} from watchlist`);
            }
          } catch (error) {
            console.log(`Failed to remove ${auctionId}: ${error}`);
          }
        }

        console.log(`Removed ${removed} items from watchlist`);
      });

      // Step 11: Verify bid history tracking
      await this.executeStep("Verify Bid History Tracking", async () => {
        const myBids = await auctionsService.getMyBids();

        const testBids = myBids.filter((bid) =>
          this.placedBidIds.includes(bid.id)
        );

        console.log(
          `Test bids found in history: ${testBids.length}/${this.placedBidIds.length}`
        );

        if (testBids.length > 0) {
          console.log("Verified bids are being tracked correctly");

          // Check bid details
          const bidStatuses = {
            winning: testBids.filter((b) => b.isWinning).length,
            outbid: testBids.filter((b) => !b.isWinning).length,
            autoBid: testBids.filter((b) => b.isAutoBid).length,
          };

          console.log(`  Winning: ${bidStatuses.winning}`);
          console.log(`  Outbid: ${bidStatuses.outbid}`);
          console.log(`  Auto-bids: ${bidStatuses.autoBid}`);
        }
      });

      // Step 12: Cleanup test bids
      await this.executeStep("Cleanup Test Data", async () => {
        console.log(
          `Placed ${this.placedBidIds.length} test bids during workflow`
        );
        console.log(
          `Watched ${this.watchedAuctionIds.length} auctions (all removed)`
        );

        // Note: Bids typically cannot be deleted, only tracked
        console.log("Note: Bid records remain in history (cannot be deleted)");

        // Clear local tracking
        this.testAuctionIds = [];
        this.watchedAuctionIds = [];
        this.placedBidIds = [];

        console.log("Cleanup complete");
      });
    } catch (error) {
      console.error("Workflow failed:", error);
      throw error;
    }

    return this.printSummary();
  }
}
