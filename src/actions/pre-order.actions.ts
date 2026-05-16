"use server";

import { redirect } from "@/i18n/navigation";
import { requireAuthUser, ROUTES } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit";
import { addItemToCart, productRepository } from "@mohasinac/appkit";
import { getDefaultCurrency } from "@mohasinac/appkit";

export async function reservePreOrderAction(productId: string): Promise<void> {
  if (!productId) throw new ValidationError("Product ID is required");

  const user = await requireAuthUser();

  const rl = await rateLimitByIdentifier(
    `pre-order:reserve:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const product = await productRepository.findByIdOrSlug(productId).catch(() => null);
  if (!product) throw new ValidationError("Pre-order product not found.");

  const p = product as unknown as Record<string, unknown>;
  const price = typeof p.price === "number" ? p.price : null;
  if (!price || price <= 0) throw new ValidationError("Invalid product price.");

  const currency =
    typeof p.currency === "string" ? p.currency : getDefaultCurrency();
  const title = String(p.title ?? p.name ?? "Pre-Order Item");
  const image = Array.isArray(p.images)
    ? (p.images as string[])[0] ?? ""
    : typeof p.mainImage === "string"
      ? p.mainImage
      : "";
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
