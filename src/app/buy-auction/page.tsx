/**
 * Auctions Redirect Page
 *
 * Redirects /buy-auction to /buy-auction-all
 */

import { redirect } from "next/navigation";

export default function BuyAuctionPage() {
  redirect("/buy-auction-all");
}
