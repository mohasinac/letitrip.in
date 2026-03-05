/**
 * User Wishlist Page
 *
 * Route: /user/wishlist
 * Displays the authenticated user's saved items with tabs.
 */

import { WishlistView } from "@/features/wishlist";

export default function UserWishlistPage() {
  return <WishlistView />;
}
