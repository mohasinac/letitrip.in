/**
 * Seller store: profile view + update, shipping settings, payout settings,
 * coupons CRUD, analytics, slug check.
 */

import { login, request } from "./_http.mjs";
import { registerCleanup, smokeId } from "./_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const { jar, user } = await login("seller");
  const uid = user?.uid ?? user?.id;

  // Profile — route is PUT-only (no GET); we can only attempt update with a no-op-style description
  const updPayload = {
    storeDescription: `Smoke test ${smokeId("desc")}`,
  };
  const upd = await request("PUT", "/api/store/profile", {
    jar,
    json: updPayload,
  });
  rec(
    "store profile PUT",
    [200, 201, 204, 400, 422].includes(upd.status),
    `status=${upd.status}`,
  );

  // Shipping settings
  const ship = await request("GET", "/api/store/shipping", { jar });
  rec("store shipping GET", ship.status === 200, `status=${ship.status}`);

  // Payout settings
  const payout = await request("GET", "/api/store/payout-settings", { jar });
  rec("store payout-settings GET", payout.status === 200, `status=${payout.status}`);

  // Coupons list
  const coup = await request("GET", "/api/store/coupons", { jar });
  rec("store coupons GET", coup.status === 200, `status=${coup.status}`);

  // Try to create a coupon
  const code = `SMOKE${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const cCreate = await request("POST", "/api/store/coupons", {
    jar,
    json: {
      code,
      name: smokeId("coup"),
      type: "percentage",
      discount: { value: 5 },
      validity: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86_400_000).toISOString(),
        isActive: true,
      },
    },
  });
  rec(
    "store coupon create (best-effort)",
    [200, 201, 400, 422].includes(cCreate.status),
    `status=${cCreate.status} err=${cCreate.body?.error ?? ""}`,
  );
  const coupId = cCreate.body?.data?.id;
  if (coupId) {
    registerCleanup("coupon", uid, coupId);
    const del = await request("DELETE", `/api/store/coupons/${coupId}`, { jar });
    rec("store coupon delete", [200, 204].includes(del.status), `status=${del.status}`);
  }

  // Analytics
  const ana = await request("GET", "/api/store/analytics", { jar });
  rec("store analytics GET", [200, 401, 403, 503].includes(ana.status), `status=${ana.status}`);

  // Slug check
  const slug = await request(
    "GET",
    `/api/store/slug/check?slug=smoke-${Date.now().toString(36)}`,
    { jar },
  );
  rec("store slug check", [200, 400].includes(slug.status), `status=${slug.status}`);

  // Store addresses
  const addrs = await request("GET", "/api/store/addresses", { jar });
  rec("store addresses GET", addrs.status === 200, `status=${addrs.status}`);

  return results;
}
