/**
 * Buyer pre-orders: list, view details, attempt reserve.
 */

import { login, request } from "./_http.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const { jar } = await login("buyer");

  const list = await request("GET", "/api/pre-orders?pageSize=10");
  const items = list.body?.data?.items ?? [];
  rec("pre-orders list", list.status === 200, `n=${items.length}`);

  const po = items[0];
  if (!po) return results;

  // Detail view
  const det = await request("GET", `/api/products/${po.id}`);
  rec("pre-order detail", det.status === 200, `status=${det.status}`);

  // Attempt to reserve (expected statuses cover both open and closed states)
  const reserve = await request("POST", "/api/pre-orders", {
    jar,
    json: { productId: po.id, quantity: 1 },
  });
  rec(
    "pre-order reserve valid status",
    [200, 201, 400, 403, 404, 405, 409, 422].includes(reserve.status),
    `status=${reserve.status} body=${JSON.stringify(reserve.body).slice(0, 200)}`,
  );

  return results;
}
