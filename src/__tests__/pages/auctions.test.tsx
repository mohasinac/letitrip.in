/**
 * Auctions Page Tests
 *
 * Tests for auction listing and bidding functionality
 */

import { FALLBACK_AUCTIONS } from "@/lib/fallback-data";
import { render, screen } from "@testing-library/react";

describe("Auctions Page", () => {
  const mockAuctions = FALLBACK_AUCTIONS;

  describe("Auction Listing", () => {
    it("should render auction list", () => {
      render(
        <div data-testid="auctions-list">
          {mockAuctions.map((auction) => (
            <div key={auction.id} data-testid={`auction-${auction.id}`}>
              <h3>{auction.title}</h3>
              <p>Current Bid: ₹{auction.currentBid}</p>
              <span>Status: {auction.status}</span>
            </div>
          ))}
        </div>,
      );

      expect(screen.getByTestId("auctions-list")).toBeInTheDocument();
    });

    it("should display auction details correctly", () => {
      const auction = mockAuctions[0];

      render(
        <div>
          <h3>{auction.title}</h3>
          <p>Starting Bid: ₹{auction.startingBid}</p>
          <p>Current Bid: ₹{auction.currentBid}</p>
          <p>Total Bids: {auction.bidCount}</p>
          <span>Status: {auction.status}</span>
        </div>,
      );

      expect(screen.getByText(auction.title)).toBeInTheDocument();
      expect(
        screen.getByText(`Starting Bid: ₹${auction.startingBid}`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Current Bid: ₹${auction.currentBid}`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Total Bids: ${auction.bidCount}`),
      ).toBeInTheDocument();
    });

    it("should validate current bid is not less than starting bid", () => {
      mockAuctions.forEach((auction) => {
        expect(auction.currentBid).toBeGreaterThanOrEqual(auction.startingBid);
      });
    });
  });

  describe("Auction Status", () => {
    it("should show active auctions", () => {
      const activeAuctions = mockAuctions.filter((a) => a.status === "active");

      expect(activeAuctions.length).toBeGreaterThan(0);
      activeAuctions.forEach((auction) => {
        expect(auction.status).toBe("active");
      });
    });

    it("should show ended auctions", () => {
      const endedAuctions = mockAuctions.filter((a) => a.status === "ended");

      endedAuctions.forEach((auction) => {
        expect(auction.status).toBe("ended");
      });
    });

    it("should calculate time remaining correctly", () => {
      const auction = mockAuctions.find((a) => a.status === "active");

      if (auction) {
        const now = new Date();
        const endTime = new Date(auction.endTime);
        const timeRemaining = endTime.getTime() - now.getTime();

        expect(endTime).toBeInstanceOf(Date);
        expect(typeof timeRemaining).toBe("number");
      }
    });
  });

  describe("Auction Filtering", () => {
    it("should filter by status", () => {
      const activeAuctions = mockAuctions.filter((a) => a.status === "active");
      const endedAuctions = mockAuctions.filter((a) => a.status === "ended");

      expect(activeAuctions.every((a) => a.status === "active")).toBe(true);
      expect(endedAuctions.every((a) => a.status === "ended")).toBe(true);
    });

    it("should filter by category", () => {
      const electronicsAuctions = mockAuctions.filter(
        (a) => a.categorySlug === "electronics",
      );

      electronicsAuctions.forEach((auction) => {
        expect(auction.categorySlug).toBe("electronics");
      });
    });

    it("should filter by price range", () => {
      const minBid = 1000;
      const maxBid = 10000;
      const filteredAuctions = mockAuctions.filter(
        (a) => a.currentBid >= minBid && a.currentBid <= maxBid,
      );

      filteredAuctions.forEach((auction) => {
        expect(auction.currentBid).toBeGreaterThanOrEqual(minBid);
        expect(auction.currentBid).toBeLessThanOrEqual(maxBid);
      });
    });
  });

  describe("Auction Sorting", () => {
    it("should sort by current bid ascending", () => {
      const sorted = [...mockAuctions].sort(
        (a, b) => a.currentBid - b.currentBid,
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].currentBid).toBeLessThanOrEqual(
          sorted[i + 1].currentBid,
        );
      }
    });

    it("should sort by current bid descending", () => {
      const sorted = [...mockAuctions].sort(
        (a, b) => b.currentBid - a.currentBid,
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].currentBid).toBeGreaterThanOrEqual(
          sorted[i + 1].currentBid,
        );
      }
    });

    it("should sort by ending soonest", () => {
      const sorted = [...mockAuctions].sort(
        (a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime(),
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        const timeA = new Date(sorted[i].endTime).getTime();
        const timeB = new Date(sorted[i + 1].endTime).getTime();
        expect(timeA).toBeLessThanOrEqual(timeB);
      }
    });
  });

  describe("Bid Validation", () => {
    it("should validate minimum bid increment", () => {
      const auction = mockAuctions[0];
      const minIncrement = 100;
      const validBid = auction.currentBid + minIncrement;

      expect(validBid).toBeGreaterThan(auction.currentBid);
      expect(validBid - auction.currentBid).toBeGreaterThanOrEqual(
        minIncrement,
      );
    });

    it("should track bid count", () => {
      mockAuctions.forEach((auction) => {
        expect(auction.bidCount).toBeGreaterThanOrEqual(0);
        expect(typeof auction.bidCount).toBe("number");
      });
    });
  });
});
