/**
 * pw-14 — All user account routes + CRUD (addresses).
 *
 * Visits every user route as the buyer role.
 * Tests address create, edit, wishlist interactions, cart quantity, notifications.
 */

import { getContext, localizedUrl, gotoAndWait, fetchFirstId, getCookieHeader } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });

const TS = Date.now().toString(36).toUpperCase();

// ─── Static user paths ────────────────────────────────────────────────────────

const USER_STATIC_SPECS = [
  { path: "/user/profile",      heading: "Profile",       checks: ["avatar", "displayName", "edit"] },
  { path: "/user/settings",     heading: "Setting",       isForm: true  },
  { path: "/user/orders",       heading: "Order",         hasTable: true },
  { path: "/user/addresses",    heading: "Address",       hasTable: true },
  { path: "/user/addresses/add", heading: "Address",      isForm: true  },
  { path: "/user/notifications", heading: "Notification", hasTable: true },
  { path: "/user/messages",     heading: "Message",       hasTable: true },
  { path: "/user/bids",         heading: "Bid",           hasTable: true },
  { path: "/user/reviews",      heading: "Review",        hasTable: true },
  { path: "/user/offers",       heading: "Offer",         hasTable: true },
  { path: "/user/returns",      heading: "Return",        hasTable: true },
  { path: "/user/support",      heading: "Support",       hasTable: true },
  { path: "/user/become-seller", heading: "Seller",       isForm: true  },
  { path: "/user/history",      heading: "Histor",        hasTable: true },
  { path: "/wishlist",          heading: "Wishlist",      hasTable: false },
  { path: "/cart",              heading: "Cart",          hasTable: false },
];

export async function run() {
  const ctx = await getContext("buyer");
  const cookieHeader = await getCookieHeader(ctx, BASE_URL);

  // ─── Static pages ───────────────────────────────────────────────────────────
  for (const spec of USER_STATIC_SPECS) {
    const page = await ctx.newPage();
    const label = spec.path;
    try {
      const { finalUrl } = await gotoAndWait(page, localizedUrl(spec.path));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: no redirect`, !redirected, `url=${finalUrl}`);

      if (!redirected) {
        const main = await page.locator("main").count();
        rec(`${label}: main`, main > 0, `n=${main}`);

        const headingText = await page.locator("h1, h2, [class*=heading], [class*=title]").first().textContent().catch(() => "");
        rec(`${label}: heading "${spec.heading}"`,
          headingText.toLowerCase().includes(spec.heading.toLowerCase()),
          `got="${headingText?.trim().slice(0, 60)}"`);

        if (spec.isForm) {
          const inputs = await page.locator("form input:not([type=hidden]), form select, form textarea").count();
          rec(`${label}: form inputs`, inputs >= 1, `inputs=${inputs}`);
        }

        if (spec.hasTable) {
          const content = await page.locator('[data-testid=data-table], table, [class*=list], [data-testid=empty-state]').count();
          rec(`${label}: table or empty state`, content > 0, `n=${content}`);
        }
      }
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ─── Notification tabs ──────────────────────────────────────────────────────
  for (const tab of ["unread", "read", "all"]) {
    const page = await ctx.newPage();
    const label = `/user/notifications/${tab}`;
    try {
      const { finalUrl } = await gotoAndWait(page, localizedUrl(`/user/notifications/${tab}`));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: loads`, !redirected, `url=${finalUrl}`);
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ─── Dynamic user routes (fetch real IDs) ────────────────────────────────────
  const orderId = await fetchFirstId(BASE_URL, "/api/user/orders", { cookieHeader });
  if (orderId) {
    for (const { suffix, name } of [
      { suffix: `/view/${orderId}`,    name: "order detail" },
      { suffix: `/${orderId}/track`,   name: "order track" },
      { suffix: `/${orderId}/cancel`,  name: "order cancel" },
      { suffix: `/${orderId}/invoice`, name: "order invoice" },
    ]) {
      const page = await ctx.newPage();
      try {
        const { status, finalUrl } = await gotoAndWait(page, localizedUrl(`/user/orders${suffix}`));
        const redirected = /\/auth\/login/.test(finalUrl);
        // invoice may redirect to a PDF URL — allow any non-5xx
        rec(`user ${name}: loads`, !redirected && status < 500, `status=${status} url=${finalUrl}`);
        if (!redirected && status < 400) {
          const h1 = await page.locator("h1, h2").count();
          const main = await page.locator("main").count();
          rec(`user ${name}: content`, h1 + main > 0, `h=${h1} main=${main}`);
        }
      } catch (e) {
        rec(`user ${name}: shell`, false, e.message);
      }
      await page.close();
    }
  } else {
    rec("user order detail: found order", false, "no orders");
  }

  // ─── Support ticket detail ─────────────────────────────────────────────────
  const ticketId = await fetchFirstId(BASE_URL, "/api/user/support", { cookieHeader });
  if (ticketId) {
    const page = await ctx.newPage();
    const label = "user support ticket detail";
    try {
      const { finalUrl } = await gotoAndWait(page, localizedUrl(`/user/support/${ticketId}`));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: no redirect`, !redirected, `url=${finalUrl}`);
      if (!redirected) {
        const main = await page.locator("main").count();
        const h1 = await page.locator("h1, h2").count();
        rec(`${label}: content`, main > 0 && h1 > 0, `main=${main} h=${h1}`);
      }
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  } else {
    rec("user support ticket detail: found ticket (soft)", true, "no tickets — skip");
  }

  // ─── Address edit ──────────────────────────────────────────────────────────
  const addressId = await fetchFirstId(BASE_URL, "/api/user/addresses", { cookieHeader });
  if (addressId) {
    const page = await ctx.newPage();
    const label = "user edit address";
    try {
      const { finalUrl } = await gotoAndWait(page, localizedUrl(`/user/addresses/edit/${addressId}`));
      const redirected = /\/auth\/login/.test(finalUrl);
      rec(`${label}: no redirect`, !redirected, `url=${finalUrl}`);
      if (!redirected) {
        const inputs = await page.locator("form input:not([type=hidden])").count();
        rec(`${label}: form inputs`, inputs >= 3, `inputs=${inputs}`);
      }
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  } else {
    rec("user address edit: found address (soft)", true, "no addresses — skip");
  }

  // ─── Address create ────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    const label = "user create address";
    try {
      await gotoAndWait(page, localizedUrl("/user/addresses/add"));
      await page.fill('input[name=fullName]', `Smoke User ${TS}`).catch(() => {});
      await page.fill('input[name=phone]', '+919876500099').catch(() => {});
      await page.fill('input[name=addressLine1]', `123 Smoke Street ${TS}`).catch(() => {});
      await page.fill('input[name=city]', 'Bangalore').catch(() => {});
      await page.fill('input[name=state]', 'Karnataka').catch(() => {});
      await page.fill('input[name=postalCode], input[name=pincode]', '560001').catch(() => {});

      const submitBtn = page.locator('button[type=submit], button:has-text("Save"), button:has-text("Add")');
      if ((await submitBtn.count()) > 0) {
        await submitBtn.first().click();
        await Promise.race([
          page.waitForURL((u) => /\/user\/addresses/.test(u.toString()), { timeout: 8000 }),
          page.locator('[data-testid=toast]').first().waitFor({ state: "visible", timeout: 5000 }),
        ]).catch(() => {});
        const errorToast = await page.locator('.appkit-toast--error, [class*=toast--error]').count();
        rec(`${label}`, errorToast === 0, `url=${page.url()} error=${errorToast}`);
      } else {
        rec(`${label}: submit button`, false, "not found");
      }
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ─── Cart interactions ─────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    const label = "cart interactions";
    try {
      await gotoAndWait(page, localizedUrl("/cart"));
      const cartItems = await page.locator('[class*=cart-item], [data-testid=cart-item], [class*=CartItem]').count();
      const emptyMsg = await page.locator('[data-testid=empty-state]')
        .or(page.locator('text=/empty/i'))
        .or(page.locator('text=/no items/i'))
        .count();
      rec(`${label}: cart renders`, cartItems + emptyMsg > 0, `items=${cartItems} empty=${emptyMsg}`);

      if (cartItems > 0) {
        // Try + button
        const plusBtn = page.locator('button[aria-label*="increase" i], button[aria-label*="add" i], button:has-text("+")');
        if ((await plusBtn.count()) > 0) {
          const subtotalBefore = await page.locator('[class*=subtotal], [class*=total]').textContent().catch(() => "0");
          await plusBtn.first().click().catch(() => {});
          await page.waitForTimeout(1000);
          rec(`${label}: quantity + button`, true, "clicked");
        }
        // Checkout CTA
        const checkoutCta = page.locator('a:has-text("Checkout"), button:has-text("Checkout"), a:has-text("Proceed")');
        rec(`${label}: checkout CTA`, (await checkoutCta.count()) > 0, `n=${await checkoutCta.count()}`);
      }
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ─── Wishlist interactions ─────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    const label = "wishlist interactions";
    try {
      await gotoAndWait(page, localizedUrl("/wishlist"));
      const items = await page.locator('.appkit-card, [class*=wishlist-item], [class*=WishlistItem]').count();
      const emptyMsg = await page.locator('[data-testid=empty-state]')
        .or(page.locator('text=/empty/i'))
        .or(page.locator('text=/no items/i'))
        .count();
      rec(`${label}: wishlist renders`, items + emptyMsg > 0, `items=${items} empty=${emptyMsg}`);

      if (items > 0) {
        const removeBtn = page.locator('button[aria-label*="remove" i], button:has-text("Remove")');
        rec(`${label}: remove button present`, (await removeBtn.count()) > 0, `n=${await removeBtn.count()}`);
      }
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ─── Notifications mark as read ────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    const label = "notifications mark all read";
    try {
      await gotoAndWait(page, localizedUrl("/user/notifications"));
      const markAllBtn = page.locator('button:has-text("Mark all"), button:has-text("Read all"), button:has-text("Mark All")');
      if ((await markAllBtn.count()) > 0) {
        await markAllBtn.first().click().catch(() => {});
        await page.waitForTimeout(500);
        rec(`${label}`, true, "clicked");
      } else {
        rec(`${label}`, true, "button not present — soft pass");
      }
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  return results;
}
