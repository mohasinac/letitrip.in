/**
 * Proof suite: full COD checkout flow with OTP bypass.
 *
 * Login (buyer) → create address → clear cart → add standard product → preflight
 *   → seedConsentOtp → POST /api/checkout (cod) → verify order in /api/user/orders
 *   → cleanup address + consentOtp + clear cart.
 */

import { login, request } from "./_http.mjs";
import { seedConsentOtp, clearConsentOtp } from "./_otp-bypass.mjs";
import { registerCleanup, smokeId } from "./_fixtures.mjs";
import { LISTING_TYPES, PRODUCT_STATUS } from "../_constants.mjs";

const results = [];
const rec = (name, ok, detail) =>
  results.push({ name, ok, detail: detail ?? "" });

async function findStandardProduct() {
  const res = await request("GET", `/api/products?pageSize=40&listingType=${LISTING_TYPES.STANDARD}`);
  if (res.status !== 200) return null;
  const items = res.body?.data?.items ?? [];
  return items.find(
    (p) =>
      p.listingType === LISTING_TYPES.STANDARD &&
      (p.availableQuantity ?? 0) >= 5 &&
      p.status === PRODUCT_STATUS.PUBLISHED,
  );
}

export async function run() {
  const { jar, user } = await login("admin");
  const uid = user?.uid ?? user?.id ?? user?.user?.uid;
  rec("login admin", !!uid, uid);

  const product = await findStandardProduct();
  rec(
    "find standard product",
    !!product,
    product?.id ?? "none with stock",
  );
  if (!product) return results;

  // Clear cart first
  const clearRes = await request("DELETE", "/api/cart", { jar });
  rec("clear cart", clearRes.status === 200, `status=${clearRes.status}`);

  // Create address
  const addrPayload = {
    label: smokeId("addr"),
    fullName: "Smoke Buyer",
    phone: "9876500000",
    addressLine1: "100 Smoke Plaza Floor 1",
    city: "Mumbai",
    state: "MH",
    postalCode: "400001",
    country: "India",
    isDefault: false,
  };
  const addr = await request("POST", "/api/user/addresses", {
    jar,
    json: addrPayload,
  });
  rec(
    "create address",
    addr.status === 201 && !!addr.body?.data?.id,
    `status=${addr.status} id=${addr.body?.data?.id}`,
  );
  const addressId = addr.body?.data?.id;
  if (!addressId) return results;
  registerCleanup("address", uid, addressId);

  // Add to cart
  const cartAdd = await request("POST", "/api/cart", {
    jar,
    json: { productId: product.id, quantity: 1 },
  });
  rec(
    "add to cart",
    cartAdd.status === 201,
    `status=${cartAdd.status}`,
  );

  // Preflight
  const pre = await request("POST", "/api/checkout/preflight", {
    jar,
    json: { addressId, paymentMethod: "cod" },
  });
  const preAvailable = (pre.body?.data?.available ?? []).length;
  rec(
    "preflight returns available items",
    pre.status === 200 && preAvailable > 0,
    `status=${pre.status} available=${preAvailable}`,
  );

  // Seed consent OTP directly into Firestore
  let seedErr = null;
  try {
    await seedConsentOtp(uid, addressId);
  } catch (e) {
    seedErr = e.message;
  }
  rec("seed consent otp", !seedErr, seedErr ?? "ok");
  if (seedErr) return results;

  // Place the order
  const co = await request("POST", "/api/checkout", {
    jar,
    json: {
      addressId,
      paymentMethod: "cod",
      excludedProductIds: [],
    },
  });
  const orderIds = co.body?.data?.orderIds ?? [];
  rec(
    "checkout cod places order",
    (co.status === 200 || co.status === 201) && orderIds.length > 0,
    `status=${co.status} ids=${orderIds.join(",") || "none"} err=${co.body?.error ?? ""}`,
  );
  for (const oid of orderIds) registerCleanup("order", uid, oid);

  // Verify order appears in user orders
  if (orderIds.length > 0) {
    const orders = await request("GET", "/api/user/orders", { jar });
    const list = orders.body?.data?.items ?? [];
    const found = list.find((o) => orderIds.includes(o.id));
    rec(
      "order visible in user orders",
      !!found,
      found ? `${found.id} status=${found.status}` : "not found",
    );
  }

  // Cleanup
  await clearConsentOtp(uid, addressId);
  await request("DELETE", `/api/user/addresses/${addressId}`, { jar });

  return results;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  (async () => {
    const out = await run();
    let pass = 0,
      fail = 0;
    for (const r of out) {
      const tag = r.ok ? "PASS" : "FAIL";
      console.log(`${tag}  ${r.name}  ::  ${r.detail}`);
      r.ok ? pass++ : fail++;
    }
    console.log(`\n[03-buyer-checkout-cod] ${pass}/${pass + fail} passed`);
    process.exit(fail === 0 ? 0 : 1);
  })();
}
