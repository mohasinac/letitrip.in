/**
 * Auction Types
 * Shared between UI and Backend
 */

export interface Auction {
  id: string;
  title: string;
  description: string;
  images: string[];
  currentBid: number;
  startingBid: number;
  minimumBid: number;
  endTime: Date;
  status: "upcoming" | "live" | "ended";
  bidCount: number;
  category: string;
  condition: string;
  isAuthentic: boolean;
  sellerId: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    totalSales: number;
    memberSince: string;
    verified: boolean;
  };
  watchlist: string[];
  shippingInfo: {
    domestic: {
      cost: number;
      time: string;
    };
    international?: {
      available: boolean;
      cost?: number;
      time?: string;
    };
  };
  returnPolicy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
}
