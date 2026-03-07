/**
 * Guest Cart Utilities
 *
 * Stores unauthenticated users' cart items in localStorage.
 * No server-side storage — fully browser-local.
 * On login, `useGuestCartMerge` reads these items and POSTs them to /api/cart/merge.
 */

const GUEST_CART_KEY = "letitrip_guest_cart";

export interface GuestCartItem {
  productId: string;
  quantity: number;
  /** Snapshot captured at add-to-cart time (not available for items added before this field existed). */
  productTitle?: string;
  productImage?: string;
  price?: number;
}

/** Read all guest cart items from localStorage. Returns [] on server or parse failure. */
export function getGuestCartItems(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as GuestCartItem[];
  } catch {
    return [];
  }
}

/**
 * Add or increment a product in the guest cart.
 * Pass `snapshot` to store display data (title, image, price) alongside the item.
 * Returns the updated items array.
 */
export function addToGuestCart(
  productId: string,
  quantity: number,
  snapshot?: { productTitle?: string; productImage?: string; price?: number },
): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  const items = getGuestCartItems();
  const existing = items.find((i) => i.productId === productId);
  const updated: GuestCartItem[] = existing
    ? items.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(i.quantity + quantity, 99) }
          : i,
      )
    : [...items, { productId, quantity, ...snapshot }];
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
  return updated;
}

/** Remove a single product from the guest cart. Returns the updated items array. */
export function removeFromGuestCart(productId: string): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  const items = getGuestCartItems().filter((i) => i.productId !== productId);
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  return items;
}

/**
 * Set the quantity of a product in the guest cart.
 * Quantity ≤ 0 removes the item. Returns the updated items array.
 */
export function updateGuestCartQuantity(
  productId: string,
  quantity: number,
): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  const items = getGuestCartItems();
  const updated =
    quantity <= 0
      ? items.filter((i) => i.productId !== productId)
      : items.map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.min(quantity, 99) }
            : i,
        );
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updated));
  return updated;
}

/** Remove all guest cart items from localStorage. */
export function clearGuestCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
}

/** Total number of units across all guest cart items. */
export function getGuestCartCount(): number {
  return getGuestCartItems().reduce((sum, i) => sum + i.quantity, 0);
}

// ---------------------------------------------------------------------------
// Post-login redirect intent
// Stores the URL the guest wanted to reach (e.g. /checkout) so that
// useGuestCartMerge can navigate there after the merge completes.
// ---------------------------------------------------------------------------

const GUEST_RETURN_TO_KEY = "letitrip_guest_return_to";

/** Persist a post-login destination (e.g. ROUTES.USER.CHECKOUT). */
export function setGuestReturnTo(url: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_RETURN_TO_KEY, url);
}

/** Read the stored destination. Returns null if not set or on server. */
export function getGuestReturnTo(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_RETURN_TO_KEY);
}

/** Remove the stored destination. */
export function clearGuestReturnTo(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_RETURN_TO_KEY);
}
