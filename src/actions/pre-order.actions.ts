"use server";

import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { requireAuthUser } from "@mohasinac/appkit/providers/auth-firebase/helpers";
import { rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { AuthorizationError } from "@mohasinac/appkit/errors/authorization-error";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { addItemToCart } from "@mohasinac/appkit/features/cart/actions/cart-actions";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { productImageUrls } from "@mohasinac/appkit/features/products/schemas/firestore";
import { getDefaultCurrency } from "@mohasinac/appkit/core/baseline-resolver";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";

export async function reservePreOrderAction(productId: string): Promise<void> {
  if (!productId) throw new ValidationError("Product ID is required");

  const user = await requireAuthUser();

  const rl = await rateLimitByIdentifier(
    `pre-order:reserve:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  // No catch: a Firestore failure here would surface as "Pre-order product not
  // found", which is a different thing and sends the buyer looking for a
  // product that exists. The guard below still handles a genuinely missing one.
  const product = await productRepository.findByIdOrSlug(productId);
  if (!product) throw new ValidationError("Pre-order product not found.");

  const p = product as unknown as Record<string, JsonValue>;
  const price = typeof p.price === "number" ? p.price : null;
  if (!price || price <= 0) throw new ValidationError("Invalid product price.");

  const currency =
    typeof p.currency === "string" ? p.currency : getDefaultCurrency();
  const title = String(p.title ?? p.name ?? "Pre-Order Item");
  // `images` is `ProductImage[]` since A6 — `productImageUrls` spans that and
  // the legacy `string[]`. The old `as string[]` cast put an object into a
  // cart snapshot's `image`, which renders as a placeholder, not an error.
  const image =
    productImageUrls(p.images)[0] ||
    (typeof p.mainImage === "string" ? p.mainImage : "");
  const storeId = typeof p.storeId === "string" ? p.storeId : "";
  const storeName = typeof p.storeName === "string" ? p.storeName : "";

  if (!storeId) throw new ValidationError("Store information missing.");

  await addItemToCart(user.uid, {
    productId: String(product.id),
    productTitle: title,
    productImage: image,
    price,
    currency,
    quantity: 1,
    storeId,
    storeName,
    listingType: "pre-order",
  });

  redirect(String(ROUTES.USER.CHECKOUT));
}
