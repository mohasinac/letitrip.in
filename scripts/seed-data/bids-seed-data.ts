/**
 * Bids Seed Data
 * Auction bids for testing - related to vintage camera auction
 */

import type { BidDocument } from "@/db/schema";

export const bidsSeedData: Partial<BidDocument>[] = [
  // Bid 1 - Initial bid by John
  {
    id: "bid-vintage-canon-ae-1-film-camera-john-20260120-p3q7r2",
    productId:
      "auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    productTitle: "Vintage Canon AE-1 Film Camera",
    userId: "user-john-doe-johndoe",
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    bidAmount: 15000,
    currency: "INR",
    status: "outbid",
    isWinning: false,
    bidDate: new Date("2026-01-20T14:30:00Z"),
    createdAt: new Date("2026-01-20T14:30:00Z"),
    updatedAt: new Date("2026-01-21T09:15:00Z"), // Updated when outbid
  },
  // Bid 2 - Jane outbids John
  {
    id: "bid-vintage-canon-ae-1-film-camera-jane-20260121-k8m2n5",
    productId:
      "auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    productTitle: "Vintage Canon AE-1 Film Camera",
    userId: "user-jane-smith-janes",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    bidAmount: 16500,
    currency: "INR",
    status: "outbid",
    isWinning: false,
    bidDate: new Date("2026-01-21T09:15:00Z"),
    createdAt: new Date("2026-01-21T09:15:00Z"),
    updatedAt: new Date("2026-01-22T11:20:00Z"),
  },
  // Bid 3 - Mike enters the bidding
  {
    id: "bid-vintage-canon-ae-1-film-camera-mike-20260122-w4x9y1",
    productId:
      "auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    productTitle: "Vintage Canon AE-1 Film Camera",
    userId: "user-mike-johnson-mikejohn",
    userName: "Mike Johnson",
    userEmail: "mike.johnson@example.com",
    bidAmount: 17500,
    currency: "INR",
    status: "outbid",
    isWinning: false,
    bidDate: new Date("2026-01-22T11:20:00Z"),
    createdAt: new Date("2026-01-22T11:20:00Z"),
    updatedAt: new Date("2026-01-23T15:45:00Z"),
  },
  // Bid 4 - John raises his bid
  {
    id: "bid-vintage-canon-ae-1-film-camera-john-20260123-b7c1d4",
    productId:
      "auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    productTitle: "Vintage Canon AE-1 Film Camera",
    userId: "user-john-doe-johndoe",
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    bidAmount: 18500,
    currency: "INR",
    status: "outbid",
    isWinning: false,
    previousBidAmount: 15000,
    bidDate: new Date("2026-01-23T15:45:00Z"),
    createdAt: new Date("2026-01-23T15:45:00Z"),
    updatedAt: new Date("2026-01-25T10:30:00Z"),
  },
  // Bid 5 - Jane counters
  {
    id: "bid-vintage-canon-ae-1-film-camera-jane-20260125-e2f6g3",
    productId:
      "auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    productTitle: "Vintage Canon AE-1 Film Camera",
    userId: "user-jane-smith-janes",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    bidAmount: 19500,
    currency: "INR",
    status: "outbid",
    isWinning: false,
    previousBidAmount: 16500,
    bidDate: new Date("2026-01-25T10:30:00Z"),
    createdAt: new Date("2026-01-25T10:30:00Z"),
    updatedAt: new Date("2026-01-28T14:15:00Z"),
  },
  // Bid 6 - Mike raises the stakes
  {
    id: "bid-vintage-canon-ae-1-film-camera-mike-20260128-h5j9k2",
    productId:
      "auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    productTitle: "Vintage Canon AE-1 Film Camera",
    userId: "user-mike-johnson-mikejohn",
    userName: "Mike Johnson",
    userEmail: "mike.johnson@example.com",
    bidAmount: 20500,
    currency: "INR",
    status: "outbid",
    isWinning: false,
    previousBidAmount: 17500,
    bidDate: new Date("2026-01-28T14:15:00Z"),
    createdAt: new Date("2026-01-28T14:15:00Z"),
    updatedAt: new Date("2026-02-03T16:45:00Z"),
  },
  // Bid 7 - John makes a strong bid
  {
    id: "bid-vintage-canon-ae-1-film-camera-john-20260203-l8m3n6",
    productId:
      "auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    productTitle: "Vintage Canon AE-1 Film Camera",
    userId: "user-john-doe-johndoe",
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    bidAmount: 21500,
    currency: "INR",
    status: "outbid",
    isWinning: false,
    previousBidAmount: 18500,
    bidDate: new Date("2026-02-03T16:45:00Z"),
    createdAt: new Date("2026-02-03T16:45:00Z"),
    updatedAt: new Date("2026-02-08T18:30:00Z"),
  },
  // Bid 8 - Jane wins with final bid (current highest)
  {
    id: "bid-vintage-canon-ae-1-film-camera-jane-20260208-p4q8r7",
    productId:
      "auction-vintage-canon-ae-1-film-camera-cameras-photography-used-techhub-electronics-1",
    productTitle: "Vintage Canon AE-1 Film Camera",
    userId: "user-jane-smith-janes",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    bidAmount: 22000,
    currency: "INR",
    status: "active", // Auction still ongoing, so current bid is active
    isWinning: true, // Current highest bid
    previousBidAmount: 19500,
    autoMaxBid: 25000, // Willing to go up to ₹25,000
    bidDate: new Date("2026-02-08T18:30:00Z"),
    createdAt: new Date("2026-02-08T18:30:00Z"),
    updatedAt: new Date("2026-02-08T18:30:00Z"),
  },
];
