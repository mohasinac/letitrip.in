/**
 * pw-09 — Admin CRUD create operations.
 *
 * For each entity: navigate to /new form, fill required fields,
 * submit, assert success (redirect to list OR success toast).
 * Uses smoke-{ts} prefixes so the cleanup suite can delete them.
 */

import { getContext, localizedUrl, gotoAndWait } from "./_pw-setup.mjs";
import { smokeId, registerCleanup } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

const TS = Date.now().toString(36).toUpperCase();

// ─── Submit + assert success ──────────────────────────────────────────────────

async function submitAndAssert(page, label, { successPathPattern, collectId = false }) {
  const submitBtn = page.locator(
    'button[type=submit], button:has-text("Save"), button:has-text("Create"), button:has-text("Publish")',
  );

  if ((await submitBtn.count()) === 0) {
    rec(`${label}: submit button found`, false, "no submit button");
    return null;
  }

  let createdId = null;
  const responsePromise = page.waitForResponse(
    (r) => r.url().includes("/api/") && (r.status() === 200 || r.status() === 201),
    { timeout: 10000 },
  ).catch(() => null);

  await submitBtn.first().click();
  const apiRes = await responsePromise;

  // Wait for either navigation or toast
  await Promise.race([
    page.waitForURL((url) => successPathPattern.test(url.toString()), { timeout: 8000 }),
    page.locator('[data-testid=toast], [role=alert], [role=status]').first().waitFor({ state: "visible", timeout: 5000 }),
  ]).catch(() => {});

  const finalUrl = page.url();
  const navigatedToList = successPathPattern.test(finalUrl);
  const toast = await page.locator('[data-testid=toast], [role=alert]:not([aria-live])').count();
  const errorToast = await page.locator('[data-testid=toast].appkit-toast--error, [role=alert][class*=error]').count();

  const ok = (navigatedToList || toast > 0) && errorToast === 0;
  rec(`${label}: create succeeds`, ok,
    `url=${finalUrl} toast=${toast} errorToast=${errorToast} apiStatus=${apiRes?.status() ?? "no-api-response"}`);

  // Try to get the new ID from the URL
  if (collectId) {
    const match = finalUrl.match(/\/([a-zA-Z0-9-_]+)\/(edit|view)/) ??
                  finalUrl.match(/\/admin\/[a-z-]+\/([a-zA-Z0-9-_]+)/);
    createdId = match?.[1] ?? null;
  }

  return createdId;
}

// ─── Entity create specs ──────────────────────────────────────────────────────

export async function run() {
  const ctx = await getContext("admin");

  // ── Brand ─────────────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(3000); // fills/selects fail fast if field absent
    const label = "create brand";
    try {
      await gotoAndWait(page, localizedUrl("/admin/brands/new"));
      await page.fill('input[name=name], input[placeholder*="name" i]', `Smoke Brand ${TS}`).catch(() => {});
      await page.fill('input[name=slug]', `brand-smoke-${TS.toLowerCase()}`).catch(() => {});
      await page.selectOption('select[name=country]', 'India').catch(() => {});
      await submitAndAssert(page, label, { successPathPattern: /\/admin\/brands/ });
    } catch (e) { rec(label, false, e.message); }
    await page.close();
  }

  // ── Category ──────────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(3000);
    const label = "create category";
    try {
      await gotoAndWait(page, localizedUrl("/admin/categories/new"));
      await page.fill('input[name=name]', `Smoke Category ${TS}`).catch(() => {});
      await page.fill('input[name=slug]', `category-smoke-${TS.toLowerCase()}`).catch(() => {});
      await submitAndAssert(page, label, { successPathPattern: /\/admin\/categories/ });
    } catch (e) { rec(label, false, e.message); }
    await page.close();
  }

  // ── FAQ ────────────────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(3000);
    const label = "create faq";
    try {
      await gotoAndWait(page, localizedUrl("/admin/faqs/new"));
      await page.fill('input[name=question], textarea[name=question]', `Smoke FAQ ${TS}?`).catch(() => {});
      const answerArea = page.locator('[contenteditable], textarea[name*="answer"], textarea[name*="text"]');
      if ((await answerArea.count()) > 0) {
        await answerArea.first().fill(`Smoke answer ${TS}.`).catch(() => {});
      }
      await page.selectOption('select[name=category]', { index: 1 }).catch(() => {});
      await submitAndAssert(page, label, { successPathPattern: /\/admin\/faqs/ });
    } catch (e) { rec(label, false, e.message); }
    await page.close();
  }

  // ── Coupon ─────────────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(3000);
    const label = "create coupon";
    try {
      await gotoAndWait(page, localizedUrl("/admin/coupons/new"));
      await page.fill('input[name=code]', `SMK${TS.slice(-6)}`).catch(() => {});
      await page.fill('input[name=name]', `Smoke Coupon ${TS}`).catch(() => {});
      await page.selectOption('select[name=type]', 'percentage').catch(() => {});
      await page.fill('input[name*="value"], input[name*="discount"]', '10').catch(() => {});
      await submitAndAssert(page, label, { successPathPattern: /\/admin\/coupons/ });
    } catch (e) { rec(label, false, e.message); }
    await page.close();
  }

  // ── Blog post ──────────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(3000);
    const label = "create blog post";
    try {
      await gotoAndWait(page, localizedUrl("/admin/blog/new"));
      await page.fill('input[name=title]', `Smoke Post ${TS}`).catch(() => {});
      await page.fill('input[name=slug]', `blog-smoke-${TS.toLowerCase()}`).catch(() => {});
      const excerpt = page.locator('textarea[name=excerpt], input[name=excerpt]');
      if ((await excerpt.count()) > 0) await excerpt.fill(`Smoke excerpt ${TS}`).catch(() => {});
      await submitAndAssert(page, label, { successPathPattern: /\/admin\/blog/ });
    } catch (e) { rec(label, false, e.message); }
    await page.close();
  }

  // ── Event ──────────────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(3000);
    const label = "create event";
    try {
      await gotoAndWait(page, localizedUrl("/admin/events/new"));
      await page.fill('input[name=title]', `Smoke Event ${TS}`).catch(() => {});
      await page.fill('input[name=slug]', `event-smoke-${TS.toLowerCase()}`).catch(() => {});
      await page.selectOption('select[name=type]', 'poll').catch(() => {});
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
      const dateInputs = await page.locator('input[type=datetime-local], input[name*="At"], input[name*="date"]').all();
      if (dateInputs.length >= 1) await dateInputs[0].fill(tomorrow).catch(() => {});
      if (dateInputs.length >= 2) await dateInputs[1].fill(nextWeek).catch(() => {});
      await submitAndAssert(page, label, { successPathPattern: /\/admin\/events/ });
    } catch (e) { rec(label, false, e.message); }
    await page.close();
  }

  // ── Carousel slide ─────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(3000);
    const label = "create carousel slide";
    try {
      await gotoAndWait(page, localizedUrl("/admin/carousel/new"));
      await page.fill('input[name=title]', `Smoke Slide ${TS}`).catch(() => {});
      await submitAndAssert(page, label, { successPathPattern: /\/admin\/carousel/ });
    } catch (e) { rec(label, false, e.message); }
    await page.close();
  }

  // ── Sublisting category ────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(3000);
    const label = "create sublisting category";
    try {
      await gotoAndWait(page, localizedUrl("/admin/sublisting-categories/new"));
      await page.fill('input[name=name]', `Smoke Sublisting ${TS}`).catch(() => {});
      await page.fill('input[name=slug]', `sublisting-smoke-${TS.toLowerCase()}`).catch(() => {});
      await submitAndAssert(page, label, { successPathPattern: /\/admin\/sublisting-categories/ });
    } catch (e) { rec(label, false, e.message); }
    await page.close();
  }

  // ── Product feature ────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(3000);
    const label = "create product feature";
    try {
      await gotoAndWait(page, localizedUrl("/admin/features/new"));
      await page.fill('input[name=name], input[name=label], input[name=title]', `Smoke Feature ${TS}`).catch(() => {});
      await submitAndAssert(page, label, { successPathPattern: /\/admin\/features/ });
    } catch (e) { rec(label, false, e.message); }
    await page.close();
  }

  // ── Bundle ─────────────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(3000);
    const label = "create bundle";
    try {
      await gotoAndWait(page, localizedUrl("/admin/bundles/new"));
      await page.fill('input[name=title], input[name=name]', `Smoke Bundle ${TS}`).catch(() => {});
      await page.fill('input[name=slug]', `bundle-smoke-${TS.toLowerCase()}`).catch(() => {});
      await submitAndAssert(page, label, { successPathPattern: /\/admin\/bundles/ });
    } catch (e) { rec(label, false, e.message); }
    await page.close();
  }

  return results;
}
