"use client";

import { AuctionSellerInfo as LibraryAuctionSellerInfo } from "@letitrip/react-library";
import { Calendar, MessageCircle, Star, Store } from "lucide-react";
import Link from "next/link";

export interface AuctionSellerInfoProps {
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating: number;
  sellerReviewCount: number;
  memberSince: string;
  shopId?: string;
  shopName?: string;
  shopSlug?: string;
  onContactSeller?: () => void;
  className?: string;
}

export function AuctionSellerInfo(props: AuctionSellerInfoProps) {
  return (
    <LibraryAuctionSellerInfo
      {...props}
      LinkComponent={Link as any}
      icons={{
        store: <Store className="w-4 h-4" />,
        star: <Star className="w-4 h-4 fill-current" />,
        calendar: <Calendar className="w-4 h-4" />,
        messageCircle: <MessageCircle className="w-4 h-4" />,
      }}
    />
  );
}

export default AuctionSellerInfo;
