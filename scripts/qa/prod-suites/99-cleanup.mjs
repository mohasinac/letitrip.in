/**
 * Cleanup pass — walks the in-memory registry and deletes resources
 * created by earlier suites in this run. Uses the Firebase Admin SDK
 * for direct doc deletion (so we don't rely on API DELETE working).
 */

import { listCleanup } from "./_fixtures.mjs";
import { adminDelete } from "./_otp-bypass.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

const PATH_BY_KIND = {
  address: (uid, id) => `users/${uid}/addresses/${id}`,
  order: (_uid, id) => `orders/${id}`,
  product: (_uid, id) => `products/${id}`,
  coupon: (_uid, id) => `coupons/${id}`,
  faq: (_uid, id) => `faqs/${id}`,
  section: (_uid, id) => `homepageSections/${id}`,
};

export async function run() {
  const entries = listCleanup();
  rec("cleanup entries collected", true, `n=${entries.length}`);

  for (const { kind, uid, resourceId } of entries) {
    const builder = PATH_BY_KIND[kind];
    if (!builder) {
      rec(`cleanup ${kind}/${resourceId}`, false, "no path builder");
      continue;
    }
    const path = builder(uid, resourceId);
    try {
      await adminDelete(path);
      rec(`cleanup ${kind}/${resourceId}`, true, path);
    } catch (e) {
      rec(`cleanup ${kind}/${resourceId}`, false, String(e?.message));
    }
  }

  return results;
}
