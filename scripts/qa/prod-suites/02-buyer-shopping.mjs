/**
 * Buyer shopping CRUD: cart, wishlist, history, addresses.
 * Uses buyer role. Cleans up all created artifacts.
 */

import { login, request } from "./_http.mjs";
import { registerCleanup, smokeId } from "./_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

async function findStandardProduct() {
  const r = await request("GET", "/api/products?pageSize=20&listingType=standard");
  return (r.body?.data?.items ?? []).find(
    (p) => (p.availableQuantity ?? 0) >= 3 && p.status === "published",
  );
}

export async function run() {
  const { jar, user } = await login("buyer");
  const uid = user?.uid ?? user?.id;
  rec("buyer login", !!uid, uid);

  const product = await findStandardProduct();
  if (!product) {
    rec("find product", false, "no standard product with stock");
    return results;
  }

  // ── Cart ──────────────────────────────────────────────────────────
  await request("DELETE", "/api/cart", { jar });
  const add1 = await request("POST", "/api/cart", {
    jar,
    json: { productId: product.id, quantity: 1 },
  });
  rec("cart add", add1.status === 201, `status=${add1.status}`);

  const get1 = await request("GET", "/api/cart", { jar });
  const items = get1.body?.data?.cart?.items ?? [];
  rec("cart get", get1.status === 200 && items.length > 0, `n=${items.length}`);

  const itemId = items[0]?.itemId;
  if (itemId) {
    const del = await request("DELETE", `/api/cart/${itemId}`, { jar });
    rec("cart remove item", del.status === 200, `status=${del.status}`);
  }

  const clear = await request("DELETE", "/api/cart", { jar });
  rec("cart clear", clear.status === 200, `status=${clear.status}`);

  // ── Wishlist ──────────────────────────────────────────────────────
  const wAdd = await request("POST", "/api/wishlist", {
    jar,
    json: { productId: product.id, productType: "standard" },
  });
  rec(
    "wishlist add",
    wAdd.status === 200 || wAdd.status === 201,
    `status=${wAdd.status}`,
  );

  const wList = await request("GET", "/api/wishlist", { jar });
  rec(
    "wishlist list",
    wList.status === 200,
    `status=${wList.status} count=${wList.body?.data?.count ?? wList.body?.data?.items?.length ?? "n/a"}`,
  );

  const wDel = await request("DELETE", `/api/user/wishlist/${product.id}`, { jar });
  rec("wishlist remove", wDel.status === 200, `status=${wDel.status}`);

  // ── History ──────────────────────────────────────────────────────
  const hist = await request("GET", "/api/user/history", { jar });
  rec("history get", hist.status === 200, `status=${hist.status}`);

  // ── Addresses CRUD ───────────────────────────────────────────────
  const addrPayload = {
    label: smokeId("addr"),
    fullName: "Smoke Buyer",
    phone: "9876511111",
    addressLine1: "200 Buyer Lane",
    city: "Pune",
    state: "MH",
    postalCode: "411001",
    country: "India",
    isDefault: false,
  };
  const addrC = await request("POST", "/api/user/addresses", {
    jar,
    json: addrPayload,
  });
  rec(
    "address create",
    addrC.status === 201,
    `status=${addrC.status} id=${addrC.body?.data?.id}`,
  );
  const addrId = addrC.body?.data?.id;
  if (addrId) registerCleanup("address", uid, addrId);

  if (addrId) {
    const addrL = await request("GET", "/api/user/addresses", { jar });
    const found = (addrL.body?.data ?? []).some((a) => a.id === addrId);
    rec("address list contains new", found, `id=${addrId}`);

    const addrU = await request("PATCH", `/api/user/addresses/${addrId}`, {
      jar,
      json: { ...addrPayload, label: smokeId("addr-upd") },
    });
    rec(
      "address update",
      addrU.status === 200 || addrU.status === 201,
      `status=${addrU.status}`,
    );

    const setDef = await request(
      "POST",
      `/api/user/addresses/${addrId}/set-default`,
      { jar, json: {} },
    );
    rec(
      "address set-default",
      setDef.status === 200 || setDef.status === 201 || setDef.status === 204,
      `status=${setDef.status}`,
    );

    const addrD = await request("DELETE", `/api/user/addresses/${addrId}`, { jar });
    rec(
      "address delete",
      addrD.status === 200 || addrD.status === 204,
      `status=${addrD.status}`,
    );
  }

  // ── User profile + orders ────────────────────────────────────────
  const me = await request("GET", "/api/auth/me", { jar });
  rec("auth/me", me.status === 200, `status=${me.status}`);

  const profile = await request("GET", "/api/user/profile", { jar });
  rec("user profile", profile.status === 200, `status=${profile.status}`);

  const orders = await request("GET", "/api/user/orders", { jar });
  rec("user orders", orders.status === 200, `status=${orders.status}`);

  const notifs = await request("GET", "/api/user/notifications", { jar });
  rec("user notifications", notifs.status === 200, `status=${notifs.status}`);

  return results;
}
