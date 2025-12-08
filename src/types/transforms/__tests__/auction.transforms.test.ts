/**
 * AUCTION TRANSFORMATION TESTS
 *
 * Tests for auction type transformations between Backend and Frontend
 */

import { Timestamp } from "firebase/firestore";
import {
  AuctionBE,
  AuctionListItemBE,
  BidBE,
} from "../../backend/auction.types";
import { PlaceBidFormFE } from "../../frontend/auction.types";
import { AuctionStatus, AuctionType } from "../../shared/common.types";
import {
  toBECreateAuctionRequest,
  toBEPlaceBidRequest,
  toFEAuction,
  toFEAuctionCard,
  toFEAuctionCards,
  toFEAuctions,
  toFEBid,
} from "../auction.transforms";

describe("Auction Transformations", () => {
  const mockNow = new Date("2024-01-15T10:00:00Z");
  const mockPastTime = Timestamp.fromDate(new Date("2024-01-14T10:00:00Z"));
  const mockFutureTime = Timestamp.fromDate(new Date("2024-01-20T10:00:00Z"));
  const mockRecentTime = Timestamp.fromDate(new Date("2024-01-15T09:30:00Z"));

  // Mock current time for testing
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockNow);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const mockBidBE: BidBE = {
    id: "bid_123",
    auctionId: "auction_123",
    userId: "user_123",
    userName: "John Doe",
    amount: 5000,
    isAutoBid: false,
    maxAutoBidAmount: null,
    createdAt: mockRecentTime,
  };

  const mockAuctionBE: AuctionBE = {
    id: "auction_123",
    productId: "prod_123",
    productName: "Vintage Watch",
    productSlug: "vintage-watch",
    productImage: "https://example.com/watch.jpg",
    productDescription: "A beautiful vintage watch from 1950s",
    sellerId: "seller_123",
    sellerName: "John Seller",
    shopId: "shop_123",
    shopName: "Vintage Shop",
    type: AuctionType.ENGLISH,
    status: AuctionStatus.ACTIVE,
    startingPrice: 1000,
    reservePrice: 5000,
    currentPrice: 5000,
    buyNowPrice: 10000,
    bidIncrement: 500,
    minimumBid: 5500,
    totalBids: 25,
    uniqueBidders: 10,
    highestBidderId: "user_456",
    highestBidderName: "Jane Doe",
    hasAutoBid: false,
    autoBidMaxAmount: null,
    startTime: mockPastTime,
    endTime: mockFutureTime,
    duration: 518400, // 6 days in seconds
    allowExtension: true,
    extensionTime: 300,
    timesExtended: 0,
    isActive: true,
    isEnded: false,
    hasBids: true,
    hasWinner: false,
    winnerId: null,
    winnerName: null,
    winningBid: null,
    reserveMet: true,
    createdAt: mockPastTime,
    updatedAt: mockRecentTime,
    metadata: {},
    images: [
      "https://example.com/watch1.jpg",
      "https://example.com/watch2.jpg",
    ],
    videos: [],
    slug: "vintage-watch-auction",
  };

  describe("toFEBid", () => {
    it("should transform basic bid fields", () => {
      const result = toFEBid(mockBidBE);

      expect(result.id).toBe("bid_123");
      expect(result.auctionId).toBe("auction_123");
      expect(result.userId).toBe("user_123");
      expect(result.userName).toBe("John Doe");
      expect(result.amount).toBe(5000);
      expect(result.isAutoBid).toBe(false);
    });

    it("should format bid amount", () => {
      const result = toFEBid(mockBidBE);

      expect(result.formattedAmount).toContain("5,000");
      expect(result.formattedAmount).toContain("₹");
    });

    it("should calculate time ago for recent bids", () => {
      const result = toFEBid(mockBidBE);

      expect(result.timeAgo).toContain("m ago");
    });

    it("should calculate time ago for older bids", () => {
      const oldBid = { ...mockBidBE, createdAt: mockPastTime };
      const result = toFEBid(oldBid);

      expect(result.timeAgo).toContain("h ago");
    });

    it("should mark highest bid", () => {
      const result = toFEBid(mockBidBE, undefined, "bid_123");

      expect(result.isHighest).toBe(true);
    });

    it("should not mark non-highest bid", () => {
      const result = toFEBid(mockBidBE, undefined, "bid_456");

      expect(result.isHighest).toBe(false);
    });

    it("should mark user's bid", () => {
      const result = toFEBid(mockBidBE, "user_123");

      expect(result.isYourBid).toBe(true);
    });

    it("should not mark other user's bid", () => {
      const result = toFEBid(mockBidBE, "user_456");

      expect(result.isYourBid).toBe(false);
    });

    it("should include backwards compatibility fields", () => {
      const result = toFEBid(mockBidBE);

      expect(result.bidTime).toBeInstanceOf(Date);
      expect(result.bidAmount).toBe(5000);
    });
  });

  describe("toFEAuction", () => {
    it("should transform basic auction fields", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.id).toBe("auction_123");
      expect(result.productId).toBe("prod_123");
      expect(result.productName).toBe("Vintage Watch");
      expect(result.productSlug).toBe("vintage-watch");
      expect(result.productImage).toContain("watch.jpg");
      expect(result.productDescription).toContain("vintage watch");
    });

    it("should transform seller information", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.sellerId).toBe("seller_123");
      expect(result.sellerName).toBe("John Seller");
      expect(result.shopId).toBe("shop_123");
      expect(result.shopName).toBe("Vintage Shop");
    });

    it("should transform auction type and status", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.type).toBe(AuctionType.ENGLISH);
      expect(result.status).toBe(AuctionStatus.ACTIVE);
    });

    it("should format all prices", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.formattedStartingPrice).toContain("1,000");
      expect(result.formattedCurrentPrice).toContain("5,000");
      expect(result.formattedBuyNowPrice).toContain("10,000");
      expect(result.formattedReservePrice).toContain("5,000");
      expect(result.formattedBidIncrement).toContain("500");
      expect(result.formattedMinimumBid).toContain("5,500");
    });

    it("should handle null reserve price", () => {
      const auctionWithoutReserve = { ...mockAuctionBE, reservePrice: null };
      const result = toFEAuction(auctionWithoutReserve);

      expect(result.formattedReservePrice).toBeNull();
    });

    it("should handle null buy now price", () => {
      const auctionWithoutBuyNow = { ...mockAuctionBE, buyNowPrice: null };
      const result = toFEAuction(auctionWithoutBuyNow);

      expect(result.formattedBuyNowPrice).toBeNull();
    });

    it("should transform bid information", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.totalBids).toBe(25);
      expect(result.uniqueBidders).toBe(10);
      expect(result.highestBidderId).toBe("user_456");
      expect(result.highestBidderName).toBe("Jane Doe");
    });

    it("should calculate time remaining", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.timeRemaining).toBeTruthy();
      expect(result.timeRemainingSeconds).toBeGreaterThan(0);
    });

    it("should format start and end time displays", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.startTimeDisplay).toBeTruthy();
      expect(result.endTimeDisplay).toBeTruthy();
    });

    it("should format duration display", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.durationDisplay).toContain("days");
    });

    it("should set isActive flag correctly", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.isActive).toBe(true);
    });

    it("should set isEnded flag for expired auctions", () => {
      const expiredAuction = {
        ...mockAuctionBE,
        endTime: mockPastTime,
        isEnded: true,
      };
      const result = toFEAuction(expiredAuction);

      expect(result.isEnded).toBe(true);
      expect(result.isActive).toBe(false);
    });

    it("should set isUpcoming flag for future auctions", () => {
      const futureAuction = { ...mockAuctionBE, startTime: mockFutureTime };
      const result = toFEAuction(futureAuction);

      expect(result.isUpcoming).toBe(true);
    });

    it("should set isLive flag for active auctions", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.isLive).toBe(true);
    });

    it("should set isEndingSoon flag", () => {
      const endingSoonAuction = {
        ...mockAuctionBE,
        endTime: Timestamp.fromDate(new Date("2024-01-15T10:30:00Z")),
      };
      const result = toFEAuction(endingSoonAuction);

      expect(result.isEndingSoon).toBe(true);
    });

    it("should set canBid flag for eligible users", () => {
      const result = toFEAuction(mockAuctionBE, "user_789");

      expect(result.canBid).toBe(true);
    });

    it("should not allow seller to bid", () => {
      const result = toFEAuction(mockAuctionBE, "seller_123");

      expect(result.canBid).toBe(false);
    });

    it("should set canBuyNow flag", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.canBuyNow).toBe(true);
    });

    it("should mark seller's auction", () => {
      const result = toFEAuction(mockAuctionBE, "seller_123");

      expect(result.isYourAuction).toBe(true);
    });

    it("should mark if user is winning", () => {
      const result = toFEAuction(mockAuctionBE, "user_456");

      expect(result.isYouWinning).toBe(true);
    });

    it("should mark if user won", () => {
      const wonAuction = {
        ...mockAuctionBE,
        status: AuctionStatus.COMPLETED,
        winnerId: "user_123",
        winnerName: "John Doe",
        winningBid: 5000,
      };
      const result = toFEAuction(wonAuction, "user_123");

      expect(result.isYouWinner).toBe(true);
      expect(result.formattedWinningBid).toContain("5,000");
    });

    it("should show reserve status", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.reserveStatus).toBe("Reserve met");
    });

    it("should show reserve not met", () => {
      const auctionBelowReserve = { ...mockAuctionBE, reserveMet: false };
      const result = toFEAuction(auctionBelowReserve);

      expect(result.reserveStatus).toBe("Reserve not met");
    });

    it("should show no reserve", () => {
      const auctionWithoutReserve = { ...mockAuctionBE, reservePrice: null };
      const result = toFEAuction(auctionWithoutReserve);

      expect(result.reserveStatus).toBe("No reserve");
    });

    it("should calculate price progress", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.priceProgress).toBeGreaterThanOrEqual(0);
      expect(result.priceProgress).toBeLessThanOrEqual(100);
    });

    it("should calculate bid progress", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.bidProgress).toBeGreaterThanOrEqual(0);
      expect(result.bidProgress).toBeLessThanOrEqual(100);
    });

    it("should calculate time progress", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.timeProgress).toBeGreaterThanOrEqual(0);
      expect(result.timeProgress).toBeLessThanOrEqual(100);
    });

    it("should generate auction badges", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.badges).toContain("Live");
    });

    it("should add reserve met badge", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.badges).toContain("Reserve Met");
    });

    it("should add buy now badge", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.badges).toContain("Buy Now Available");
    });

    it("should add hot badge for popular auctions", () => {
      const hotAuction = { ...mockAuctionBE, totalBids: 100 };
      const result = toFEAuction(hotAuction);

      expect(result.badges).toContain("Hot");
    });

    it("should add ending soon badge", () => {
      const endingSoonAuction = {
        ...mockAuctionBE,
        endTime: Timestamp.fromDate(new Date("2024-01-15T10:30:00Z")),
      };
      const result = toFEAuction(endingSoonAuction);

      expect(result.badges).toContain("Ending Soon");
    });

    it("should add silent auction badge", () => {
      const silentAuction = { ...mockAuctionBE, type: AuctionType.SILENT };
      const result = toFEAuction(silentAuction);

      expect(result.badges).toContain("Silent");
    });

    it("should include backwards compatibility fields", () => {
      const result = toFEAuction(mockAuctionBE);

      expect(result.currentBid).toBe(5000);
      expect(result.name).toBe("Vintage Watch");
      expect(result.images).toEqual([
        "https://example.com/watch1.jpg",
        "https://example.com/watch2.jpg",
      ]);
      expect(result.videos).toEqual([]);
      expect(result.description).toContain("vintage watch");
      expect(result.bidCount).toBe(25);
    });

    it("should fallback to product image if no images array", () => {
      const auctionWithoutImages = { ...mockAuctionBE, images: [] };
      const result = toFEAuction(auctionWithoutImages);

      expect(result.images).toContain("https://example.com/watch.jpg");
    });
  });

  describe("toFEAuctionCard", () => {
    const mockAuctionListItem: AuctionListItemBE = {
      id: "auction_123",
      productId: "prod_123",
      productName: "Vintage Watch",
      productSlug: "vintage-watch",
      productImage: "https://example.com/watch.jpg",
      type: AuctionType.ENGLISH,
      status: AuctionStatus.ACTIVE,
      currentPrice: 5000,
      buyNowPrice: 10000,
      totalBids: 25,
      endTime: mockFutureTime,
      isActive: true,
      slug: "vintage-watch-auction",
      images: ["https://example.com/watch1.jpg"],
      videos: [],
    };

    it("should transform auction list item to card", () => {
      const result = toFEAuctionCard(mockAuctionListItem);

      expect(result.id).toBe("auction_123");
      expect(result.productId).toBe("prod_123");
      expect(result.productName).toBe("Vintage Watch");
      expect(result.productSlug).toBe("vintage-watch");
      expect(result.productImage).toContain("watch.jpg");
      expect(result.type).toBe(AuctionType.ENGLISH);
      expect(result.status).toBe(AuctionStatus.ACTIVE);
    });

    it("should format prices", () => {
      const result = toFEAuctionCard(mockAuctionListItem);

      expect(result.formattedCurrentPrice).toContain("5,000");
      expect(result.formattedBuyNowPrice).toContain("10,000");
    });

    it("should calculate time remaining", () => {
      const result = toFEAuctionCard(mockAuctionListItem);

      expect(result.timeRemaining).toBeTruthy();
      expect(result.timeRemainingSeconds).toBeGreaterThan(0);
    });

    it("should set isActive flag", () => {
      const result = toFEAuctionCard(mockAuctionListItem);

      expect(result.isActive).toBe(true);
    });

    it("should set isEndingSoon flag", () => {
      const endingSoonAuction = {
        ...mockAuctionListItem,
        endTime: Timestamp.fromDate(new Date("2024-01-15T10:30:00Z")),
      };
      const result = toFEAuctionCard(endingSoonAuction);

      expect(result.isEndingSoon).toBe(true);
    });

    it("should add live badge", () => {
      const result = toFEAuctionCard(mockAuctionListItem);

      expect(result.badges).toContain("Live");
    });

    it("should not add live badge for ended auctions", () => {
      const endedAuction = {
        ...mockAuctionListItem,
        status: AuctionStatus.COMPLETED,
        endTime: mockPastTime,
      };
      const result = toFEAuctionCard(endedAuction);

      expect(result.badges).not.toContain("Live");
    });

    it("should include backwards compatibility fields", () => {
      const result = toFEAuctionCard(mockAuctionListItem);

      expect(result.slug).toBe("vintage-watch-auction");
      expect(result.name).toBe("Vintage Watch");
      expect(result.images).toContain("https://example.com/watch1.jpg");
      expect(result.currentBid).toBe(5000);
      expect(result.bidCount).toBe(25);
      expect(result.startingBid).toBeUndefined();
      expect(result.reservePrice).toBeUndefined();
      expect(result.featured).toBe(false);
    });

    it("should fallback to product slug if no slug", () => {
      const auctionWithoutSlug = { ...mockAuctionListItem, slug: null };
      const result = toFEAuctionCard(auctionWithoutSlug);

      expect(result.slug).toBe("vintage-watch");
    });
  });

  describe("toBECreateAuctionRequest", () => {
    const mockFormData = {
      productId: "prod_123",
      type: AuctionType.ENGLISH,
      startingPrice: 1000,
      reservePrice: 5000,
      buyNowPrice: 10000,
      bidIncrement: 500,
      startTime: new Date("2024-01-14T10:00:00Z"),
      endTime: new Date("2024-01-20T10:00:00Z"),
      allowExtension: true,
      extensionTime: 300,
    };

    it("should transform form data to BE request", () => {
      const result = toBECreateAuctionRequest(mockFormData);

      expect(result.productId).toBe("prod_123");
      expect(result.type).toBe(AuctionType.ENGLISH);
      expect(result.startingPrice).toBe(1000);
      expect(result.reservePrice).toBe(5000);
      expect(result.buyNowPrice).toBe(10000);
      expect(result.bidIncrement).toBe(500);
      expect(result.allowExtension).toBe(true);
      expect(result.extensionTime).toBe(300);
    });

    it("should convert dates to ISO strings", () => {
      const result = toBECreateAuctionRequest(mockFormData);

      expect(result.startTime).toBeTruthy();
      expect(result.endTime).toBeTruthy();
    });
  });

  describe("toBEPlaceBidRequest", () => {
    const mockBidForm: PlaceBidFormFE = {
      amount: 5500,
      isAutoBid: false,
      maxAutoBidAmount: null,
    };

    it("should transform bid form to BE request", () => {
      const result = toBEPlaceBidRequest(mockBidForm);

      expect(result.amount).toBe(5500);
      expect(result.isAutoBid).toBe(false);
      expect(result.maxAutoBidAmount).toBeNull();
    });

    it("should handle auto bid", () => {
      const autoBidForm: PlaceBidFormFE = {
        amount: 5500,
        isAutoBid: true,
        maxAutoBidAmount: 8000,
      };
      const result = toBEPlaceBidRequest(autoBidForm);

      expect(result.isAutoBid).toBe(true);
      expect(result.maxAutoBidAmount).toBe(8000);
    });
  });

  describe("Batch transformations", () => {
    it("should transform multiple auctions", () => {
      const auctions = [mockAuctionBE, { ...mockAuctionBE, id: "auction_456" }];
      const result = toFEAuctions(auctions);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("auction_123");
      expect(result[1].id).toBe("auction_456");
    });

    it("should transform multiple auction cards", () => {
      const mockListItem: AuctionListItemBE = {
        id: "auction_123",
        productId: "prod_123",
        productName: "Vintage Watch",
        productSlug: "vintage-watch",
        productImage: "https://example.com/watch.jpg",
        type: AuctionType.ENGLISH,
        status: AuctionStatus.ACTIVE,
        currentPrice: 5000,
        buyNowPrice: 10000,
        totalBids: 25,
        endTime: mockFutureTime,
        isActive: true,
        slug: "vintage-watch-auction",
        images: [],
        videos: [],
      };
      const auctions = [mockListItem, { ...mockListItem, id: "auction_456" }];
      const result = toFEAuctionCards(auctions);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("auction_123");
      expect(result[1].id).toBe("auction_456");
    });

    it("should handle empty arrays", () => {
      expect(toFEAuctions([])).toEqual([]);
      expect(toFEAuctionCards([])).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("should handle auctions with null values", () => {
      const auctionWithNulls = {
        ...mockAuctionBE,
        reservePrice: null,
        buyNowPrice: null,
        highestBidderId: null,
        highestBidderName: null,
        winnerId: null,
        winnerName: null,
        winningBid: null,
      };
      const result = toFEAuction(auctionWithNulls);

      expect(result.formattedReservePrice).toBeNull();
      expect(result.formattedBuyNowPrice).toBeNull();
      expect(result.formattedWinningBid).toBeNull();
    });

    it("should handle auctions with special characters", () => {
      const auctionWithSpecialChars = {
        ...mockAuctionBE,
        productName: "Rare Item: 'The One' & Only",
        productDescription: "A rare item with special characters: < > & ' \"",
      };
      const result = toFEAuction(auctionWithSpecialChars);

      expect(result.productName).toContain("'The One'");
      expect(result.productDescription).toContain("&");
    });

    it("should handle auctions with Unicode characters", () => {
      const auctionWithUnicode = {
        ...mockAuctionBE,
        productName: "प्राचीन वस्तु",
        productDescription: "एक प्राचीन वस्तु",
      };
      const result = toFEAuction(auctionWithUnicode);

      expect(result.productName).toBe("प्राचीन वस्तु");
      expect(result.productDescription).toContain("प्राचीन");
    });

    it("should handle auctions with very high prices", () => {
      const highPriceAuction = {
        ...mockAuctionBE,
        startingPrice: 1000000,
        currentPrice: 5000000,
        buyNowPrice: 10000000,
      };
      const result = toFEAuction(highPriceAuction);

      expect(result.formattedCurrentPrice).toContain("50,00,000");
    });

    it("should handle auctions with many bids", () => {
      const popularAuction = {
        ...mockAuctionBE,
        totalBids: 500,
        uniqueBidders: 200,
      };
      const result = toFEAuction(popularAuction);

      expect(result.totalBids).toBe(500);
      expect(result.uniqueBidders).toBe(200);
      expect(result.badges).toContain("Hot");
    });
  });
});
