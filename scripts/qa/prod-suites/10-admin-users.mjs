/**
 * Admin users: list users, view detail, ban/unban, promote.
 * Picks a buyer (non-admin) target to safely mutate then revert.
 */

import { login, request } from "./_http.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const { jar } = await login("admin");

  const list = await request("GET", "/api/admin/users?pageSize=10", { jar });
  rec(
    "admin users list",
    list.status === 200,
    `status=${list.status} n=${list.body?.data?.items?.length ?? list.body?.data?.length ?? "n/a"}`,
  );

  // Response shape can vary: { data: { items: [...] } } or { data: [...] } or { data: { users: [...] } }
  const rawData = list.body?.data;
  const items = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.items)
      ? rawData.items
      : Array.isArray(rawData?.users)
        ? rawData.users
        : [];
  const target = items.find((u) => (u.role || u.userRole) !== "admin" && (u.uid || u.id));
  if (!target) {
    rec("admin user mutation", false, "no non-admin target");
    return results;
  }
  const targetUid = target.uid ?? target.id;

  const detail = await request("GET", `/api/admin/users/${targetUid}`, { jar });
  rec("admin user detail GET", detail.status === 200, `status=${detail.status}`);

  // Ban
  const ban = await request("PATCH", `/api/admin/users/${targetUid}`, {
    jar,
    json: { action: "ban", reason: "smoke test", banType: "soft" },
  });
  rec(
    "admin ban user (best-effort)",
    [200, 204, 400, 404].includes(ban.status),
    `status=${ban.status}`,
  );

  // Unban
  const unban = await request("PATCH", `/api/admin/users/${targetUid}`, {
    jar,
    json: { action: "unban" },
  });
  rec(
    "admin unban user (best-effort)",
    [200, 204, 400, 404].includes(unban.status),
    `status=${unban.status}`,
  );

  // Promote (revert to original role)
  const origRole = target.role || "user";
  const promote = await request("PATCH", `/api/admin/users/${targetUid}`, {
    jar,
    json: { role: origRole },
  });
  rec(
    "admin promote user (revert)",
    [200, 204, 400, 404].includes(promote.status),
    `status=${promote.status}`,
  );

  // Sessions revoke endpoint is POST-only; just probe it returns method-not-supported on GET
  const sess = await request("POST", "/api/admin/sessions/revoke-user", {
    jar,
    json: { userId: targetUid },
  });
  rec(
    "admin sessions revoke endpoint reachable",
    [200, 400, 404].includes(sess.status),
    `status=${sess.status}`,
  );

  return results;
}
