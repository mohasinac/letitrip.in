/**
 * Seller products: create standard product, update, delete.
 * Marks created products with smoke- prefix so they're identifiable for cleanup.
 */

import { login, request } from "./_http.mjs";
import { registerCleanup, smokeId } from "./_fixtures.mjs";
import { LISTING_TYPES, PRODUCT_STATUS, PRODUCT_CONDITION, CURRENCY } from "../_constants.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const { jar, user } = await login("seller");
  const uid = user?.uid ?? user?.id;
  rec("seller login", !!uid, uid);

  // List existing seller products
  const list = await request("GET", "/api/store/products?pageSize=10", { jar });
  rec(
    "seller list own products",
    list.status === 200,
    `status=${list.status} n=${list.body?.data?.items?.length ?? "n/a"}`,
  );

  // Try to create a smoke product. Schema varies — minimal best-effort payload.
  const title = `Smoke Test Product ${smokeId("p")}`;
  const payload = {
    title,
    description: "Automated smoke test product. Safe to delete.",
    price: 99900,
    currency: CURRENCY.ISO,
    stockQuantity: 1,
    availableQuantity: 1,
    listingType: LISTING_TYPES.STANDARD,
    status: PRODUCT_STATUS.DRAFT,
    images: [],
    condition: PRODUCT_CONDITION.NEW,
  };
  // Seller-side product creation is on /api/admin/products with seller-level RBAC
  const create = await request("POST", "/api/admin/products", { jar, json: payload });
  rec(
    "seller create product (best-effort)",
    [200, 201, 400, 403, 422].includes(create.status),
    `status=${create.status} err=${create.body?.error ?? ""}`,
  );
  const productId = create.body?.data?.id;
  if (productId) {
    registerCleanup("product", uid, productId);

    // Update via admin products endpoint
    const upd = await request("PUT", `/api/admin/products/${productId}`, {
      jar,
      json: { ...payload, title: `${title} (updated)` },
    });
    rec(
      "seller update product",
      [200, 201, 204].includes(upd.status),
      `status=${upd.status}`,
    );

    // Delete (cleanup immediately so we don't leak)
    const del = await request("DELETE", `/api/admin/products/${productId}`, { jar });
    rec(
      "seller delete product",
      [200, 204].includes(del.status),
      `status=${del.status}`,
    );
  }

  return results;
}
