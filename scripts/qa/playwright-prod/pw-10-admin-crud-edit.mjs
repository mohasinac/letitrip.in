/**
 * pw-10 — Admin CRUD edit operations.
 *
 * For each entity: fetch the first real ID, open its edit form,
 * mutate one text field (append " [smoke-edited]"), save,
 * assert success toast or redirect.
 */

import { getContext, localizedUrl, gotoAndWait, fetchFirstId, getCookieHeader } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

const SUFFIX = " [smoke-edited]";

async function editOneField(page, label, { apiPath, editPath, fieldSelector, successPattern }) {
  try {
    const ctx = await getContext("admin");
    const cookieHeader = await getCookieHeader(ctx, BASE_URL);

    const id = await fetchFirstId(BASE_URL, apiPath, { cookieHeader });
    if (!id) {
      rec(`${label}: found item`, false, `no items at ${apiPath}`);
      return;
    }
    rec(`${label}: found item`, true, `id=${id}`);

    const page = await ctx.newPage();
    page.setDefaultTimeout(5000); // fills/clicks fail fast if element absent
    const path = typeof editPath === "function" ? editPath(id) : editPath.replace("{id}", id);

    const { finalUrl } = await gotoAndWait(page, localizedUrl(path));
    const redirected = /\/auth\/login|\/unauthorized/.test(finalUrl);
    if (redirected) {
      rec(`${label}: no redirect`, false, `url=${finalUrl}`);
      await page.close();
      return;
    }
    rec(`${label}: no redirect`, true, "");

    // Find and edit a text field
    const field = page.locator(fieldSelector);
    if ((await field.count()) === 0) {
      rec(`${label}: field found`, false, `selector="${fieldSelector}"`);
      await page.close();
      return;
    }

    const originalValue = await field.first().inputValue().catch(() => "");
    const newValue = originalValue.endsWith(SUFFIX)
      ? originalValue
      : originalValue.slice(0, 60) + SUFFIX;

    await field.first().fill(newValue);
    rec(`${label}: field mutated`, true, `was="${originalValue.slice(0, 40)}" → "${newValue.slice(0, 40)}"`);

    // Submit
    const submitBtn = page.locator(
      'button[type=submit], button:has-text("Save"), button:has-text("Update")',
    );
    await submitBtn.first().click();

    // Wait for toast or redirect
    await Promise.race([
      page.waitForURL((url) => successPattern.test(url.toString()), { timeout: 8000 }),
      page.locator('[data-testid=toast], [role=alert]').first().waitFor({ state: "visible", timeout: 5000 }),
    ]).catch(() => {});

    const errorToast = await page.locator('.appkit-toast--error, [role=alert][class*=error]').count();
    const toast = await page.locator('[data-testid=toast]').count();
    const finalUrl2 = page.url();
    const ok = errorToast === 0 && (toast > 0 || successPattern.test(finalUrl2));
    rec(`${label}: save succeeds`, ok,
      `url=${finalUrl2} toast=${toast} errorToast=${errorToast}`);

    await page.close();
  } catch (e) {
    rec(`${label}: shell`, false, e.message);
  }
}

export async function run() {
  const ctx = await getContext("admin");

  const EDIT_SPECS = [
    {
      label: "edit brand",
      apiPath: "/api/admin/brands",
      editPath: (id) => `/admin/brands/${id}/edit`,
      fieldSelector: 'input[name=name]',
      successPattern: /\/admin\/brands/,
    },
    {
      label: "edit category",
      apiPath: "/api/admin/categories",
      editPath: (id) => `/admin/categories/${id}/edit`,
      fieldSelector: 'input[name=name]',
      successPattern: /\/admin\/categories/,
    },
    {
      label: "edit faq",
      apiPath: "/api/admin/faqs",
      editPath: (id) => `/admin/faqs/${id}/edit`,
      fieldSelector: 'input[name=question], textarea[name=question]',
      successPattern: /\/admin\/faqs/,
    },
    {
      label: "edit coupon",
      apiPath: "/api/admin/coupons",
      editPath: (id) => `/admin/coupons/${id}/edit`,
      fieldSelector: 'input[name=name]',
      successPattern: /\/admin\/coupons/,
    },
    {
      label: "edit blog post",
      apiPath: "/api/admin/blog",
      editPath: (id) => `/admin/blog/${id}/edit`,
      fieldSelector: 'input[name=title]',
      successPattern: /\/admin\/blog/,
    },
    {
      label: "edit event",
      apiPath: "/api/admin/events",
      editPath: (id) => `/admin/events/${id}/edit`,
      fieldSelector: 'input[name=title]',
      successPattern: /\/admin\/events/,
    },
    {
      label: "edit sublisting category",
      apiPath: "/api/admin/sublisting-categories",
      editPath: (id) => `/admin/sublisting-categories/${id}/edit`,
      fieldSelector: 'input[name=name]',
      successPattern: /\/admin\/sublisting-categories/,
    },
    {
      label: "edit product feature",
      apiPath: "/api/admin/features",
      editPath: (id) => `/admin/features/${id}/edit`,
      fieldSelector: 'input[name=name], input[name=label], input[name=title]',
      successPattern: /\/admin\/features/,
    },
  ];

  for (const spec of EDIT_SPECS) {
    await editOneField(null, spec.label, spec);
  }

  // ── Site settings edit ────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(5000);
    const label = "edit site settings";
    try {
      await gotoAndWait(page, localizedUrl("/admin/site"));
      const textInput = page.locator('input[type=text]:not([type=hidden])').first();
      if ((await textInput.count()) > 0) {
        const original = await textInput.inputValue().catch(() => "");
        await textInput.fill(original || "LetItRip").catch(() => {});
        const submitBtn = page.locator('button[type=submit], button:has-text("Save")');
        if ((await submitBtn.count()) > 0) {
          await submitBtn.first().click();
          const toast = await page.locator('[data-testid=toast]').waitFor({ state: "visible", timeout: 5000 }).then(() => 1).catch(() => 0);
          rec(`${label}: save`, toast > 0, `toast=${toast}`);
        } else {
          rec(`${label}: save button found`, false, "no submit button");
        }
      } else {
        rec(`${label}: text input found`, false, "no text inputs");
      }
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  return results;
}
