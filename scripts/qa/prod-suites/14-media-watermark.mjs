/**
 * Media + watermark probe.
 *  - All product images on prod must be served via /api/media/... (not raw Storage URLs)
 *  - The /api/media/[slug] proxy applies a watermark.
 *  - Spot-check that fetching a product image URL returns 200 and Content-Type image/*.
 */

import { request } from "./_http.mjs";
import { BASE_URL } from "./_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  // Fetch a product with images
  const list = await request("GET", "/api/products?pageSize=10&listingType=standard");
  const items = list.body?.data?.items ?? [];
  const product = items.find((p) => Array.isArray(p.images) && p.images.length > 0);
  if (!product) {
    rec("find product with images", false, "no products with images");
    return results;
  }
  rec("find product with images", true, product.id);

  const img = product.images[0];
  const isProxied = /\/(api\/)?media\//.test(img);
  rec(
    "product image is proxied (not raw Storage)",
    isProxied || !/firebasestorage|googleapis/.test(img),
    `url=${img.slice(0, 100)}`,
  );

  // Fetch it
  const url = img.startsWith("http") ? img : `${BASE_URL}${img}`;
  try {
    const res = await fetch(url);
    const ct = res.headers.get("content-type") ?? "";
    rec(
      "product image loads",
      res.status === 200 && ct.startsWith("image/"),
      `status=${res.status} ct=${ct}`,
    );
  } catch (e) {
    rec("product image loads", false, String(e?.message));
  }

  // Site logo / OG image (Next routes opengraph-image.tsx)
  try {
    const res = await fetch(`${BASE_URL}/opengraph-image`);
    rec(
      "opengraph-image responds",
      res.status === 200 || res.status === 308,
      `status=${res.status}`,
    );
  } catch (e) {
    rec("opengraph-image responds", false, String(e?.message));
  }

  return results;
}
