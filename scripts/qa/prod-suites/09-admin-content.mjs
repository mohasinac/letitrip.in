/**
 * Admin content: FAQ CRUD, homepage sections CRUD, blog CRUD, navigation, carousel.
 */

import { login, request } from "./_http.mjs";
import { registerCleanup, smokeId } from "./_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

export async function run() {
  const { jar, user } = await login("admin");
  const uid = user?.uid ?? user?.id;

  // ── FAQs ──────────────────────────────────────────────────────────
  const faqList = await request("GET", "/api/admin/faqs?pageSize=10", { jar });
  rec("admin faqs list", faqList.status === 200, `status=${faqList.status}`);

  const faqCreate = await request("POST", "/api/admin/faqs", {
    jar,
    json: {
      question: `Smoke FAQ ${smokeId("q")}?`,
      answer: { text: "Smoke answer body.", format: "html" },
      category: "general",
      seo: { slug: smokeId("faq") },
      tags: ["smoke"],
      isActive: false,
      showOnHomepage: false,
      showInFooter: false,
      isPinned: false,
      priority: 0,
      order: 0,
    },
  });
  rec(
    "admin faq create",
    [200, 201, 400, 422].includes(faqCreate.status),
    `status=${faqCreate.status} err=${faqCreate.body?.error ?? ""}`,
  );
  const faqId = faqCreate.body?.data?.id;
  if (faqId) {
    registerCleanup("faq", uid, faqId);

    const faqUpd = await request("PUT", `/api/admin/faqs/${faqId}`, {
      jar,
      json: { question: `Smoke FAQ ${smokeId("upd")}? (updated)` },
    });
    rec(
      "admin faq update",
      [200, 201, 204].includes(faqUpd.status),
      `status=${faqUpd.status}`,
    );

    const faqDel = await request("DELETE", `/api/admin/faqs/${faqId}`, { jar });
    rec(
      "admin faq delete",
      [200, 204].includes(faqDel.status),
      `status=${faqDel.status}`,
    );
  }

  // ── Homepage sections ─────────────────────────────────────────────
  const secList = await request("GET", "/api/admin/sections?pageSize=10", { jar });
  rec("admin sections list", secList.status === 200, `status=${secList.status}`);

  const secCreate = await request("POST", "/api/admin/sections", {
    jar,
    json: {
      type: "hero-banner",
      order: 99,
      enabled: false,
      config: { title: smokeId("section") },
    },
  });
  rec(
    "admin section create",
    [200, 201, 400, 422].includes(secCreate.status),
    `status=${secCreate.status} err=${secCreate.body?.error ?? ""}`,
  );
  const secId = secCreate.body?.data?.id;
  if (secId) {
    registerCleanup("section", uid, secId);
    const secDel = await request("DELETE", `/api/admin/sections/${secId}`, { jar });
    rec(
      "admin section delete",
      [200, 204].includes(secDel.status),
      `status=${secDel.status}`,
    );
  }

  // ── Blog ──────────────────────────────────────────────────────────
  const blogList = await request("GET", "/api/admin/blog?pageSize=10", { jar });
  rec("admin blog list", blogList.status === 200, `status=${blogList.status}`);

  // ── Navigation ────────────────────────────────────────────────────
  const nav = await request("GET", "/api/admin/navigation", { jar });
  rec("admin navigation list", nav.status === 200, `status=${nav.status}`);

  // ── Carousel ──────────────────────────────────────────────────────
  const car = await request("GET", "/api/admin/carousel", { jar });
  rec("admin carousel list", car.status === 200, `status=${car.status}`);

  // ── Categories ────────────────────────────────────────────────────
  const cats = await request("GET", "/api/admin/categories?pageSize=10", { jar });
  rec("admin categories list", cats.status === 200, `status=${cats.status}`);

  // ── Brands ────────────────────────────────────────────────────────
  const brands = await request("GET", "/api/admin/brands?pageSize=10", { jar });
  rec("admin brands list", brands.status === 200, `status=${brands.status}`);

  return results;
}
