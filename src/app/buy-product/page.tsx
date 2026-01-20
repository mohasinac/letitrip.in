/**
 * Products Redirect Page
 *
 * Redirects /buy-product to /buy-product-all
 */

import { redirect } from "next/navigation";

export default function BuyProductPage() {
  redirect("/buy-product-all");
}
