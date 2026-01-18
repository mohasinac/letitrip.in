"use client";

import { VerificationGate } from "@/components/auth/VerificationGate";
import type { AuctionInfoProps as LibraryAuctionInfoProps } from "@letitrip/react-library";
import {
  AuctionInfo as LibraryAuctionInfo,
  Price,
} from "@letitrip/react-library";
import { toast } from "sonner";

export type AuctionInfoProps = Omit<
  LibraryAuctionInfoProps,
  | "PriceComponent"
  | "VerificationGateComponent"
  | "onBidSuccess"
  | "onBidError"
  | "onPurchaseSuccess"
  | "onPurchaseError"
  | "onWatchSuccess"
  | "onWatchError"
>;

export function AuctionInfo(props: AuctionInfoProps) {
  return (
    <LibraryAuctionInfo
      {...props}
      PriceComponent={Price}
      VerificationGateComponent={VerificationGate}
      onBidSuccess={(msg) => toast.success(msg)}
      onBidError={(msg) => toast.error(msg)}
      onPurchaseSuccess={(msg) => toast.success(msg)}
      onPurchaseError={(msg) => toast.error(msg)}
      onWatchSuccess={(msg) => toast.success(msg)}
      onWatchError={(msg) => toast.error(msg)}
    />
  );
}

export default AuctionInfo;
