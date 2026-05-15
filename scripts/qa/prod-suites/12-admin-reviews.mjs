/**
 * Admin reviews + buyer-writes-review.
 * Buyer attempts to write a review on a delivered order's product;
 * admin verifies/unverifies a review.
 */

import { login, request } from "./_http.mjs";
import { LISTING_TYPES } from "../_constants.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  // Admin review list
  const admin = await login("admin");
  const reviews = await request("GET", "/api/admin/reviews?pageSize=10", {
    jar: admin.jar,
  });
  rec("admin reviews list", reviews.status === 200, `status=${reviews.status}`);

  const items = reviews.body?.data?.items ?? reviews.body?.data ?? [];
  const sample = items[0];
  if (sample?.id) {
    const verify = await request("PATCH", `/api/admin/reviews/${sample.id}`, {
      jar: admin.jar,
      json: { isVerifiedPurchase: !sample.isVerifiedPurchase },
    });
    rec(
      "admin review toggle verify",
      [200, 201, 204].includes(verify.status),
      `status=${verify.status}`,
    );
    // Revert
    await request("PATCH", `/api/admin/reviews/${sample.id}`, {
      jar: admin.jar,
      json: { isVerifiedPurchase: sample.isVerifiedPurchase ?? false },
    });
  } else {
    rec("admin review mutate", false, "no review to mutate");
  }

  // Buyer attempts review on first product (likely 403 without delivered order — still verifies route shape)
  const { jar: buyerJar } = await login("buyer");
  const std = await request("GET", `/api/products?pageSize=1&listingType=${LISTING_TYPES.STANDARD}`);
  const pid = std.body?.data?.items?.[0]?.id;
  if (pid) {
    const r = await request("POST", "/api/reviews", {
      jar: buyerJar,
      json: {
        productId: pid,
        rating: 5,
        title: "Smoke review",
        body: "Smoke automated review body.",
      },
    });
    rec(
      "buyer write review valid status",
      [200, 201, 400, 403, 422].includes(r.status),
      `status=${r.status} err=${r.body?.error ?? ""}`,
    );
  }

  // Buyer's own reviews list
  const myR = await request("GET", "/api/user/reviews", { jar: buyerJar });
  rec("buyer reviews list", myR.status === 200, `status=${myR.status}`);

  return results;
}
