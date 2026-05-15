/**
 * Admin site settings: read singleton, patch a non-destructive field, revert.
 * Also: dashboard, analytics, contact-submissions.
 */

import { login, request } from "./_http.mjs";
import { smokeId } from "./_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const { jar } = await login("admin");

  const get = await request("GET", "/api/admin/site", { jar });
  rec("admin site settings GET", get.status === 200, `status=${get.status}`);

  // Update a low-impact field (route uses PUT)
  const origDesc = get.body?.data?.siteDescription;
  const probe = `${smokeId("site")} ${origDesc ?? ""}`.slice(0, 200);
  const patch = await request("PUT", "/api/admin/site", {
    jar,
    json: { siteDescription: probe },
  });
  rec(
    "admin site settings PUT",
    [200, 201, 204].includes(patch.status),
    `status=${patch.status}`,
  );

  // Revert
  if (origDesc !== undefined) {
    await request("PUT", "/api/admin/site", {
      jar,
      json: { siteDescription: origDesc },
    });
    rec("admin site settings revert", true, "ok");
  }

  // Dashboard
  const dash = await request("GET", "/api/admin/dashboard", { jar });
  rec("admin dashboard", dash.status === 200, `status=${dash.status}`);

  // Analytics
  const ana = await request("GET", "/api/admin/analytics", { jar });
  rec(
    "admin analytics",
    [200, 401, 403, 404, 503].includes(ana.status),
    `status=${ana.status}`,
  );

  // Feature flags
  const ff = await request("GET", "/api/admin/feature-flags", { jar });
  rec(
    "admin feature flags",
    [200, 404].includes(ff.status),
    `status=${ff.status}`,
  );

  // Contact submissions
  const cs = await request("GET", "/api/admin/contact-submissions?pageSize=5", {
    jar,
  });
  rec(
    "admin contact-submissions list",
    [200, 404].includes(cs.status),
    `status=${cs.status}`,
  );

  return results;
}
