/**
 * pw-18 — Feature Flags page grouping + Card-section admin CRUD forms.
 *
 * Test groups:
 *  A — Feature Flags page: 3 accordion sections (Platform / Listing Types / Category Types)
 *  B — Admin Product Editor: Card sections + sticky sidebar render; listing-type Tabs present
 *  C — Admin Category Editor: Card sections + sticky sidebar render; slug auto-generated
 *  D — Admin Address Editor: page shell loads; Ownership + Contact & Location + Flags cards
 *  E — Address form API round-trip: POST → 201 created; GET by id returns the doc
 *
 * Environment:
 *   SMOKE_HEADLESS=0 SMOKE_SLOW_MO=100   — watch the flow
 *   SMOKE_RECORD_VIDEO=1                 — capture .webm
 */

import {
  getContext,
  localizedUrl,
  gotoAndWait,
  takeScreenshot,
  getCookieHeader,
  fetchFirstId,
} from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

// ── helpers ────────────────────────────────────────────────────────────────────

/** Count elements that contain the given text substring (case-insensitive). */
async function countText(page, sel, text) {
  return page
    .locator(sel)
    .filter({ hasText: new RegExp(text, "i") })
    .count()
    .catch(() => 0);
}

/** True if any heading/label on the page contains the text. */
async function hasLabel(page, text) {
  const c = await countText(page, "h1, h2, h3, label, [class*=heading], [class*=label], p, span", text);
  return c > 0;
}

// ── Suite ──────────────────────────────────────────────────────────────────────

export async function run() {
  const ctx = await getContext("admin");
  const cookieHeader = await getCookieHeader(ctx, BASE_URL);

  // ── A — Feature Flags page: 3 grouped sections ────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "feature-flags";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/admin/feature-flags"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: page loads`, status < 400 && !redirected, `status=${status} url=${finalUrl}`);

      // Expect the 3 section headings
      const platformSection = await countText(page, "*", "Platform Features");
      rec(`${label}: Platform Features section`, platformSection > 0, `count=${platformSection}`);

      const listingSection = await countText(page, "*", "Listing Types");
      rec(`${label}: Listing Types section`, listingSection > 0, `count=${listingSection}`);

      const categorySection = await countText(page, "*", "Category Types");
      rec(`${label}: Category Types section`, categorySection > 0, `count=${categorySection}`);

      // Each section should have at least one toggle (input[type=checkbox] or role=switch)
      const toggleCount = await page
        .locator('input[type="checkbox"], [role="switch"]')
        .count()
        .catch(() => 0);
      rec(`${label}: toggles present`, toggleCount >= 3, `count=${toggleCount}`);

      // Save button must be present
      const saveBtn = await page
        .locator('button:has-text("Save"), button:has-text("Save All")')
        .count()
        .catch(() => 0);
      rec(`${label}: save button present`, saveBtn > 0, `count=${saveBtn}`);

      await takeScreenshot(page, "feature-flags-page");
    } catch (e) {
      await takeScreenshot(page, "feature-flags-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  // ── B — Admin Product Editor: Card sections ───────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "product-editor";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/admin/products/new"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: page loads`, status < 400 && !redirected, `status=${status} url=${finalUrl}`);

      // Listing Type section heading
      const ltSection = await countText(page, "*", "Listing Type");
      rec(`${label}: Listing Type card`, ltSection > 0, `count=${ltSection}`);

      // At least Standard tab must be visible
      const standardTab = await page
        .locator('[role="tab"]:has-text("Standard"), button:has-text("Standard")')
        .count()
        .catch(() => 0);
      rec(`${label}: Standard listing-type tab`, standardTab > 0, `count=${standardTab}`);

      // Classification section heading
      const classSection = await countText(page, "*", "Classification");
      rec(`${label}: Classification card`, classSection > 0, `count=${classSection}`);

      // Title input
      const titleInput = await page
        .locator('input[placeholder*="title" i], input[name="title"], label:has-text("title") + input')
        .count()
        .catch(() => 0);
      rec(`${label}: title input present`, titleInput > 0, `count=${titleInput}`);

      // Save button in sidebar
      const saveBtn = await page
        .locator('button:has-text("Create product"), button:has-text("Save")')
        .count()
        .catch(() => 0);
      rec(`${label}: save button present`, saveBtn > 0, `count=${saveBtn}`);

      await takeScreenshot(page, "product-editor-new");
    } catch (e) {
      await takeScreenshot(page, "product-editor-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  // ── B2 — Product Editor Edit: loads existing product ─────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "product-editor-edit";
    try {
      const productId = await fetchFirstId(BASE_URL, "/api/admin/products", {
        cookieHeader,
        filter: (it) => it.listingType === "standard" || !it.listingType,
      });

      if (!productId) {
        rec(`${label}: product found in seed`, false, "no standard product found");
      } else {
        const { status, finalUrl } = await gotoAndWait(
          page,
          localizedUrl(`/admin/products/${productId}/edit`),
        );
        const redirected = /\/auth\/login/.test(finalUrl);
        rec(`${label}: edit page loads`, status < 400 && !redirected, `status=${status} url=${finalUrl}`);

        // Title input should be populated
        const titleInput = page.locator('input[placeholder*="title" i], input[name="title"]').first();
        const titleValue = await titleInput.inputValue().catch(() => "");
        rec(`${label}: title pre-populated`, titleValue.length > 0, `title="${titleValue.slice(0, 40)}"`);

        // Save changes button
        const saveBtn = await page.locator('button:has-text("Save changes")').count().catch(() => 0);
        rec(`${label}: save changes button`, saveBtn > 0, `count=${saveBtn}`);

        await takeScreenshot(page, "product-editor-edit");
      }
    } catch (e) {
      await takeScreenshot(page, "product-editor-edit-fail").catch(() => {});
      rec(`${label}: edit page loads`, false, e.message);
    }
    await page.close();
  }

  // ── C — Admin Category Editor: Card sections ──────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "category-editor";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/admin/categories/new"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: page loads`, status < 400 && !redirected, `status=${status} url=${finalUrl}`);

      // Identity section heading
      const identitySection = await countText(page, "*", "Identity");
      rec(`${label}: Identity card`, identitySection > 0, `count=${identitySection}`);

      // Name input
      const nameInput = await page
        .locator('input[placeholder*="name" i], label:has-text("Category name") ~ input, label:has-text("name") ~ input')
        .count()
        .catch(() => 0);
      rec(`${label}: name input present`, nameInput > 0, `count=${nameInput}`);

      // Slug input
      const slugInput = await page.locator('input[placeholder*="slug" i]').count().catch(() => 0);
      rec(`${label}: slug input present`, slugInput > 0, `count=${slugInput}`);

      // Display section
      const displaySection = await countText(page, "*", "Display");
      rec(`${label}: Display card`, displaySection > 0, `count=${displaySection}`);

      // Save button
      const saveBtn = await page
        .locator('button:has-text("Create category"), button:has-text("Save")')
        .count()
        .catch(() => 0);
      rec(`${label}: save button present`, saveBtn > 0, `count=${saveBtn}`);

      // Slug auto-generation: type a name and verify slug updates
      const nameField = page
        .locator('input[placeholder*="name" i], label:has-text("Category name") ~ * input')
        .first();
      const slugField = page.locator('input[placeholder*="slug" i]').first();
      const nameExists = await nameField.count().catch(() => 0);
      const slugExists = await slugField.count().catch(() => 0);
      if (nameExists > 0 && slugExists > 0) {
        await nameField.fill("Smoke Test Category");
        await page.waitForTimeout(300);
        const slugVal = await slugField.inputValue().catch(() => "");
        rec(`${label}: slug auto-generated from name`, slugVal.includes("smoke"), `slug="${slugVal}"`);
      } else {
        rec(`${label}: slug auto-generated from name`, false, "name or slug field not found");
      }

      await takeScreenshot(page, "category-editor-new");
    } catch (e) {
      await takeScreenshot(page, "category-editor-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  // ── D — Admin Address Editor: page shell + card sections ─────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "address-editor";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/admin/addresses/new"));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: page loads`, status < 400 && !redirected, `status=${status} url=${finalUrl}`);

      // Ownership card
      const ownerSection = await countText(page, "*", "Ownership");
      rec(`${label}: Ownership card`, ownerSection > 0, `count=${ownerSection}`);

      // Owner type radio (user / store)
      const radioUser = await page
        .locator('input[type="radio"][value="user"], label:has-text("User")')
        .count()
        .catch(() => 0);
      const radioStore = await page
        .locator('input[type="radio"][value="store"], label:has-text("Store")')
        .count()
        .catch(() => 0);
      rec(`${label}: owner-type radios`, radioUser > 0 && radioStore > 0,
        `user=${radioUser} store=${radioStore}`);

      // Contact / Location section
      const contactSection = await countText(page, "*", "Contact");
      rec(`${label}: Contact card`, contactSection > 0, `count=${contactSection}`);

      // Key fields: Full Name, Phone, City
      const fullNameField = await page
        .locator('input[placeholder*="full name" i], label:has-text("Full Name") ~ * input')
        .count()
        .catch(() => 0);
      rec(`${label}: Full Name field`, fullNameField > 0, `count=${fullNameField}`);

      const cityField = await page
        .locator('input[placeholder*="city" i], label:has-text("City") ~ * input')
        .count()
        .catch(() => 0);
      rec(`${label}: City field`, cityField > 0, `count=${cityField}`);

      // State select
      const stateSelect = await page
        .locator('select[name="state"], label:has-text("State") ~ * select')
        .count()
        .catch(() => 0);
      rec(`${label}: State select`, stateSelect > 0, `count=${stateSelect}`);

      // Flags section (Is Default toggle)
      const flagsSection = await countText(page, "*", "Flags");
      rec(`${label}: Flags card`, flagsSection > 0, `count=${flagsSection}`);

      // Save button
      const saveBtn = await page
        .locator('button:has-text("Create address"), button:has-text("Save")')
        .count()
        .catch(() => 0);
      rec(`${label}: save button present`, saveBtn > 0, `count=${saveBtn}`);

      await takeScreenshot(page, "address-editor-new");
    } catch (e) {
      await takeScreenshot(page, "address-editor-fail").catch(() => {});
      rec(`${label}: page loads`, false, e.message);
    }
    await page.close();
  }

  // ── E — Address API round-trip: POST → GET ────────────────────────────────
  {
    const label = "address-api";
    try {
      // POST /api/admin/addresses — create a test address
      const postBody = {
        ownerType: "user",
        ownerId: "user-ravi-kumar",
        label: "pw-18 smoke",
        fullName: "Playwright Smoke",
        phone: "9000000018",
        addressLine1: "18 Test Street",
        city: "Mumbai",
        state: "MH",
        postalCode: "400001",
        country: "India",
        isDefault: false,
      };
      const createRes = await fetch(`${BASE_URL}/api/admin/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookieHeader },
        body: JSON.stringify(postBody),
      });
      rec(`${label}: POST 201`, createRes.status === 201, `status=${createRes.status}`);

      const createJson = await createRes.json().catch(() => ({}));
      const newId = createJson?.data?.id ?? createJson?.id ?? null;
      rec(`${label}: response has id`, Boolean(newId), `id=${newId}`);

      if (newId) {
        // GET /api/admin/addresses/[id]
        const getRes = await fetch(`${BASE_URL}/api/admin/addresses/${newId}`, {
          headers: { Cookie: cookieHeader },
        });
        rec(`${label}: GET by id 200`, getRes.status === 200, `status=${getRes.status}`);

        const getJson = await getRes.json().catch(() => ({}));
        const fetchedId = getJson?.data?.id ?? getJson?.id ?? null;
        rec(`${label}: fetched id matches`, fetchedId === newId, `fetched=${fetchedId} created=${newId}`);

        // Cleanup — DELETE
        const delRes = await fetch(`${BASE_URL}/api/admin/addresses/${newId}`, {
          method: "DELETE",
          headers: { Cookie: cookieHeader },
        });
        rec(`${label}: DELETE cleanup 200`, delRes.status === 200, `status=${delRes.status}`);
      }
    } catch (e) {
      rec(`${label}: POST 201`, false, e.message);
    }
  }

  return results;
}
