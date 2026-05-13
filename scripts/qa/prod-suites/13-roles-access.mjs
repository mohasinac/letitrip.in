/**
 * Roles & access: assert auth boundaries.
 *  - Anonymous → 401 on /api/user/*, /api/store/*, /api/admin/*
 *  - Buyer → 403 on /api/admin/*, /api/store/* (or 401 if RBAC returns that)
 *  - Seller → 403 on /api/admin/*
 *  - Admin → 200 on /api/admin/*
 */

import { login, request } from "./_http.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

const ANON_PROTECTED = [
  "/api/user/profile",
  "/api/user/orders",
  "/api/user/addresses",
  "/api/user/wishlist",
  "/api/user/notifications",
  "/api/user/sessions",
  "/api/user/bids",
  "/api/user/reviews",
  "/api/store/orders",
  "/api/store/coupons",
  "/api/store/products",
  "/api/store/analytics",
  "/api/admin/users",
  "/api/admin/dashboard",
  "/api/admin/faqs",
  "/api/admin/sections",
  "/api/admin/site",
];

const ADMIN_ONLY = [
  "/api/admin/users",
  "/api/admin/dashboard",
  "/api/admin/faqs",
  "/api/admin/sections",
  "/api/admin/site",
  "/api/admin/categories",
  "/api/admin/brands",
];

const STORE_ONLY = [
  "/api/store/orders",
  "/api/store/products",
  "/api/store/coupons",
  "/api/store/analytics",
  "/api/store/profile",
];

export async function run() {
  // ── Anonymous ─────────────────────────────────────────────────────
  for (const path of ANON_PROTECTED) {
    const r = await request("GET", path);
    rec(`anon ${path} → 401`, r.status === 401, `status=${r.status}`);
  }

  // ── Buyer hitting admin/store endpoints ──────────────────────────
  const buyer = await login("buyer");
  for (const path of ADMIN_ONLY) {
    const r = await request("GET", path, { jar: buyer.jar });
    rec(
      `buyer ${path} denied (401/403)`,
      [401, 403].includes(r.status),
      `status=${r.status}`,
    );
  }
  for (const path of STORE_ONLY) {
    const r = await request("GET", path, { jar: buyer.jar });
    rec(
      `buyer ${path} denied (401/403)`,
      [401, 403].includes(r.status),
      `status=${r.status}`,
    );
  }

  // ── Seller hitting admin endpoints ───────────────────────────────
  const seller = await login("seller");
  for (const path of ADMIN_ONLY) {
    const r = await request("GET", path, { jar: seller.jar });
    rec(
      `seller ${path} denied (401/403)`,
      [401, 403].includes(r.status),
      `status=${r.status}`,
    );
  }

  // ── Admin can access admin endpoints ─────────────────────────────
  const admin = await login("admin");
  for (const path of ADMIN_ONLY) {
    const r = await request("GET", path, { jar: admin.jar });
    rec(`admin ${path} allowed`, r.status === 200, `status=${r.status}`);
  }

  return results;
}
