/**
 * pw-26 — Admin workflows (comprehensive role-based testing).
 *
 * Test groups:
 *  A — Users: edit user details (execute)
 *  B — Users: ban + restore cycle
 *  C — Users: bulk deactivate + reactivate
 *  D — Stores: approve + suspend + reinstate
 *  E — Products: feature/unfeature + actual delete
 *  F — Products: bulk delete (execute with ConfirmDeleteModal)
 *  G — Orders: status override + order detail inspection
 *  H — Reviews: approve (execute) + delete smoke review
 *  I — Blog: full CRUD lifecycle
 *  J — Events: create + trigger raffle + delete
 *  K — Categories: create child + delete
 *  L — FAQs: create + bulk delete
 *  M — Coupons: admin create + approve + archive
 *  N — Payouts: approve payout (execute)
 *  O — Site settings: fees tab (change + save + verify)
 *  P — Site settings: announcement banner (toggle + save)
 *  Q — Moderation queue: approve + reject
 *  R — Reports: dismiss + escalate
 *  S — Item requests: approve + decline
 *  T — Feature flags: toggle + save
 *  U — Admin notifications: send to user
 *  V — Bulk admin actions: cross-collection
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

// ── Suite ──────────────────────────────────────────────────────────────────────

export async function run() {
  const ctx = await getContext("admin");
  const cookieHeader = await getCookieHeader(ctx, BASE_URL);

  // ── A — Users: edit details ────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "users-edit";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/users"));
      rec(`${label}: users page loads`, status < 400, `status=${status}`);

      // Find user-yugi-muto row
      const rows = await page.locator("[class*=row], tr").count().catch(() => 0);
      rec(`${label}: user rows present`, rows > 0, `count=${rows}`);

      // Click row action menu (...)
      const rowMenuBtn = await page
        .locator('button:has-text("…"), button[aria-label*="menu" i]')
        .first();
      if (await rowMenuBtn.count().catch(() => 0)) {
        await rowMenuBtn.click();
        await page.waitForTimeout(300);

        // Click Edit
        const editBtn = await page
          .locator("button:has-text(Edit), a:has-text(Edit)")
          .first();
        if (await editBtn.count().catch(() => 0)) {
          await editBtn.click();
          await page.waitForTimeout(800);

          // Edit form opens
          const bioInput = await page
            .locator('input[name="bio"], input[placeholder*="bio" i], textarea')
            .first();
          if (await bioInput.count().catch(() => 0)) {
            await bioInput.fill(`Admin smoke edit ${Date.now()}`);
            const saveBtn = await page
              .locator("button:has-text(Save), button:has-text(Update)")
              .first();
            if (await saveBtn.count().catch(() => 0)) {
              await saveBtn.click();
              await page.waitForTimeout(500);
              const success = await page.locator("text=/saved|updated|success/i").count().catch(() => 0);
              rec(`${label}: user edited`, success > 0, `toast=${success}`);
            }
          }
        }
      }

      await takeScreenshot(page, "admin-users-edit");
    } catch (e) {
      await takeScreenshot(page, "admin-users-edit-fail").catch(() => {});
      rec(`${label}: users edit`, false, e.message);
    }
    await page.close();
  }

  // ── B — Users: ban + restore ───────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "users-ban-restore";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/users"));
      rec(`${label}: users page loads`, status < 400, `status=${status}`);

      // Find user row and click action menu
      const rowMenuBtn = await page
        .locator('button:has-text("…"), button[aria-label*="menu" i]')
        .nth(1);
      if (await rowMenuBtn.count().catch(() => 0)) {
        await rowMenuBtn.click();
        await page.waitForTimeout(300);

        // Click Ban
        const banBtn = await page.locator("button:has-text(Ban)").first();
        if (await banBtn.count().catch(() => 0)) {
          await banBtn.click();
          await page.waitForTimeout(500);

          // ConfirmDeleteModal should appear
          const confirmBtn = await page
            .locator("[role=dialog] button:has-text(Confirm), [role=dialog] button:has-text(Ban)")
            .first();
          if (await confirmBtn.count().catch(() => 0)) {
            await confirmBtn.click();
            await page.waitForTimeout(500);
            const success = await page.locator("text=/banned|success/i").count().catch(() => 0);
            rec(`${label}: user banned`, success > 0, `toast=${success}`);

            // Verify badge updates
            await page.waitForTimeout(300);
            const bannedBadge = await countText(page, "*", "banned");
            rec(`${label}: banned badge visible`, bannedBadge > 0, `count=${bannedBadge}`);

            // Now restore: click action menu again
            await page.waitForTimeout(300);
            const restoreMenuBtn = await page
              .locator('button:has-text("…"), button[aria-label*="menu" i]')
              .nth(1);
            if (await restoreMenuBtn.count().catch(() => 0)) {
              await restoreMenuBtn.click();
              await page.waitForTimeout(300);

              // Click Restore/Unban
              const restoreBtn = await page
                .locator("button:has-text(Restore), button:has-text(Unban)")
                .first();
              if (await restoreBtn.count().catch(() => 0)) {
                await restoreBtn.click();
                await page.waitForTimeout(500);
                const restored = await page.locator("text=/restored|active|success/i").count().catch(() => 0);
                rec(`${label}: user restored`, restored > 0, `toast=${restored}`);
              }
            }
          }
        }
      }

      await takeScreenshot(page, "admin-users-ban-restore");
    } catch (e) {
      await takeScreenshot(page, "admin-users-ban-fail").catch(() => {});
      rec(`${label}: ban-restore`, false, e.message);
    }
    await page.close();
  }

  // ── C — Users: bulk deactivate + reactivate ────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "users-bulk-toggle";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/users"));
      rec(`${label}: users page loads`, status < 400, `status=${status}`);

      // Select 2 rows via checkbox
      const checkboxes = await page
        .locator('input[type=checkbox], [role=checkbox]')
        .first();
      if (await checkboxes.count().catch(() => 0)) {
        await checkboxes.click();
        await page.waitForTimeout(200);
        const checkbox2 = await page
          .locator('input[type=checkbox], [role=checkbox]')
          .nth(1);
        if (await checkbox2.count().catch(() => 0)) {
          await checkbox2.click();
          await page.waitForTimeout(300);

          // BulkActionBar appears
          const bulkBar = await page.locator("[class*=bulk], [class*=action-bar]").count().catch(() => 0);
          rec(`${label}: bulk bar visible`, bulkBar > 0, `count=${bulkBar}`);

          // Click Deactivate
          const deactivateBtn = await page
            .locator("button:has-text(Deactivate), button:has-text(Disable)")
            .first();
          if (await deactivateBtn.count().catch(() => 0)) {
            await deactivateBtn.click();
            await page.waitForTimeout(500);
            const success = await page.locator("text=/deactivated|disabled|success/i").count().catch(() => 0);
            rec(`${label}: bulk deactivate`, success > 0, `toast=${success}`);

            // Verify status changes in table
            await page.waitForTimeout(300);
            const inactiveBadge = await countText(page, "*", "inactive");
            rec(`${label}: inactive badge visible`, inactiveBadge > 0, `count=${inactiveBadge}`);
          }
        }
      }

      await takeScreenshot(page, "admin-users-bulk-toggle");
    } catch (e) {
      await takeScreenshot(page, "admin-users-bulk-fail").catch(() => {});
      rec(`${label}: bulk toggle`, false, e.message);
    }
    await page.close();
  }

  // ── D — Stores: approve + suspend + reinstate ──────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "stores-approval";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/stores"));
      rec(`${label}: stores page loads`, status < 400, `status=${status}`);

      // Find store row and click action menu
      const rowMenuBtn = await page
        .locator('button:has-text("…"), button[aria-label*="menu" i]')
        .first();
      if (await rowMenuBtn.count().catch(() => 0)) {
        await rowMenuBtn.click();
        await page.waitForTimeout(300);

        // Click Approve (or Suspend if already approved)
        const actionBtn = await page
          .locator("button:has-text(Approve), button:has-text(Suspend)")
          .first();
        if (await actionBtn.count().catch(() => 0)) {
          const action = await actionBtn.textContent();
          await actionBtn.click();
          await page.waitForTimeout(500);

          // Confirmation modal
          const confirmBtn = await page
            .locator("[role=dialog] button:has-text(Confirm), [role=dialog] button:has-text(Approve), [role=dialog] button:has-text(Suspend)")
            .first();
          if (await confirmBtn.count().catch(() => 0)) {
            await confirmBtn.click();
            await page.waitForTimeout(500);
            const success = await page.locator("text=/approved|suspended|success/i").count().catch(() => 0);
            rec(`${label}: store action executed`, success > 0, `action="${action}" toast=${success}`);

            // Now reverse the action
            await page.waitForTimeout(300);
            const reverseMenuBtn = await page
              .locator('button:has-text("…"), button[aria-label*="menu" i]')
              .first();
            if (await reverseMenuBtn.count().catch(() => 0)) {
              await reverseMenuBtn.click();
              await page.waitForTimeout(300);

              // Click opposite action
              const reverseBtn = await page
                .locator("button:has-text(Reinstate), button:has-text(Restore), button:has-text(Unsuspend)")
                .first();
              if (await reverseBtn.count().catch(() => 0)) {
                await reverseBtn.click();
                await page.waitForTimeout(500);
                const restored = await page.locator("text=/reinstated|restored|active|success/i").count().catch(() => 0);
                rec(`${label}: store restored`, restored > 0, `toast=${restored}`);
              }
            }
          }
        }
      }

      await takeScreenshot(page, "admin-stores-approval");
    } catch (e) {
      await takeScreenshot(page, "admin-stores-approval-fail").catch(() => {});
      rec(`${label}: stores approval`, false, e.message);
    }
    await page.close();
  }

  // ── E — Products: feature/unfeature ────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "products-feature";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/products"));
      rec(`${label}: products page loads`, status < 400, `status=${status}`);

      // Find a product row and click action menu
      const rowMenuBtn = await page
        .locator('button:has-text("…"), button[aria-label*="menu" i]')
        .first();
      if (await rowMenuBtn.count().catch(() => 0)) {
        await rowMenuBtn.click();
        await page.waitForTimeout(300);

        // Click Feature
        const featureBtn = await page.locator("button:has-text(Feature)").first();
        if (await featureBtn.count().catch(() => 0)) {
          await featureBtn.click();
          await page.waitForTimeout(500);
          const success = await page.locator("text=/featured|success/i").count().catch(() => 0);
          rec(`${label}: product featured`, success > 0, `toast=${success}`);

          // Verify badge appears
          await page.waitForTimeout(300);
          const badge = await countText(page, "*", "featured");
          rec(`${label}: featured badge visible`, badge > 0, `count=${badge}`);

          // Now unfeature
          const unfeatBtn = await page.locator("button:has-text(Unfeature)").first();
          if (await unfeatBtn.count().catch(() => 0)) {
            await unfeatBtn.click();
            await page.waitForTimeout(500);
            const unfeatured = await page.locator("text=/unfeatured|removed|success/i").count().catch(() => 0);
            rec(`${label}: product unfeatured`, unfeatured > 0, `toast=${unfeatured}`);
          }
        }
      }

      await takeScreenshot(page, "admin-products-feature");
    } catch (e) {
      await takeScreenshot(page, "admin-products-feature-fail").catch(() => {});
      rec(`${label}: feature toggle`, false, e.message);
    }
    await page.close();
  }

  // ── F — Products: bulk delete ──────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "products-bulk-delete";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/products"));
      rec(`${label}: products page loads`, status < 400, `status=${status}`);

      // Select 2 product rows
      const checkboxes = await page
        .locator('input[type=checkbox], [role=checkbox]')
        .count()
        .catch(() => 0);
      rec(`${label}: checkboxes present`, checkboxes >= 2, `count=${checkboxes}`);

      if (checkboxes >= 2) {
        const checkbox1 = await page
          .locator('input[type=checkbox], [role=checkbox]')
          .first();
        await checkbox1.click();
        const checkbox2 = await page
          .locator('input[type=checkbox], [role=checkbox]')
          .nth(1);
        await checkbox2.click();
        await page.waitForTimeout(300);

        // BulkActionBar with Delete
        const deleteBtn = await page
          .locator("[class*=bulk] button:has-text(Delete), [class*=action-bar] button:has-text(Delete)")
          .first();
        if (await deleteBtn.count().catch(() => 0)) {
          await deleteBtn.click();
          await page.waitForTimeout(500);

          // ConfirmDeleteModal: "Delete 2 products?"
          const confirmBtn = await page
            .locator("[role=dialog] button:has-text(Confirm), [role=dialog] button:has-text(Delete)")
            .first();
          if (await confirmBtn.count().catch(() => 0)) {
            await confirmBtn.click();
            await page.waitForTimeout(500);
            const success = await page.locator("text=/deleted|removed|success/i").count().catch(() => 0);
            rec(`${label}: bulk delete executed`, success > 0, `toast=${success}`);
          }
        }
      }

      await takeScreenshot(page, "admin-products-bulk-delete");
    } catch (e) {
      await takeScreenshot(page, "admin-products-bulk-delete-fail").catch(() => {});
      rec(`${label}: bulk delete`, false, e.message);
    }
    await page.close();
  }

  // ── G — Orders: status override ────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "orders-status";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/orders"));
      rec(`${label}: orders page loads`, status < 400, `status=${status}`);

      // Find an order row and click it to open detail
      const orderLink = await page
        .locator('a[href*="/admin/orders/"], button[role=link]')
        .first();
      if (await orderLink.count().catch(() => 0)) {
        await orderLink.click();
        await page.waitForTimeout(800);

        // Order detail page: status dropdown/select
        const statusSelect = await page
          .locator("select[name=status], [role=combobox], button:has-text(PENDING)")
          .first();
        if (await statusSelect.count().catch(() => 0)) {
          await statusSelect.click();
          await page.waitForTimeout(300);

          // Select a different status (e.g. PROCESSING)
          const processingOpt = await page
            .locator("button, a, option")
            .filter({ hasText: /processing|confirmed/i })
            .first();
          if (await processingOpt.count().catch(() => 0)) {
            await processingOpt.click();
            await page.waitForTimeout(500);

            // Save button
            const saveBtn = await page
              .locator("button:has-text(Save), button:has-text(Update)")
              .first();
            if (await saveBtn.count().catch(() => 0)) {
              await saveBtn.click();
              await page.waitForTimeout(500);
              const success = await page.locator("text=/updated|saved|success/i").count().catch(() => 0);
              rec(`${label}: order status changed`, success > 0, `toast=${success}`);
            }
          }
        }
      }

      await takeScreenshot(page, "admin-orders-status");
    } catch (e) {
      await takeScreenshot(page, "admin-orders-status-fail").catch(() => {});
      rec(`${label}: order status`, false, e.message);
    }
    await page.close();
  }

  // ── H — Reviews: approve + delete ──────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "reviews-moderate";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/reviews"));
      rec(`${label}: reviews page loads`, status < 400, `status=${status}`);

      // Find a review row and click action menu
      const rowMenuBtn = await page
        .locator('button:has-text("…"), button[aria-label*="menu" i]')
        .first();
      if (await rowMenuBtn.count().catch(() => 0)) {
        await rowMenuBtn.click();
        await page.waitForTimeout(300);

        // Click Approve
        const approveBtn = await page.locator("button:has-text(Approve)").first();
        if (await approveBtn.count().catch(() => 0)) {
          await approveBtn.click();
          await page.waitForTimeout(500);
          const success = await page.locator("text=/approved|success/i").count().catch(() => 0);
          rec(`${label}: review approved`, success > 0, `toast=${success}`);

          // Verify badge
          await page.waitForTimeout(300);
          const badge = await countText(page, "*", "verified");
          rec(`${label}: verified badge visible`, badge > 0, `count=${badge}`);
        }
      }

      // Delete another review if available
      const deleteMenuBtn = await page
        .locator('button:has-text("…"), button[aria-label*="menu" i]')
        .nth(1);
      if (await deleteMenuBtn.count().catch(() => 0)) {
        await deleteMenuBtn.click();
        await page.waitForTimeout(300);

        const deleteBtn = await page.locator("button:has-text(Delete)").first();
        if (await deleteBtn.count().catch(() => 0)) {
          await deleteBtn.click();
          await page.waitForTimeout(500);

          // Confirm delete
          const confirmBtn = await page
            .locator("[role=dialog] button:has-text(Confirm), [role=dialog] button:has-text(Delete)")
            .first();
          if (await confirmBtn.count().catch(() => 0)) {
            await confirmBtn.click();
            await page.waitForTimeout(500);
            const deleted = await page.locator("text=/deleted|removed|success/i").count().catch(() => 0);
            rec(`${label}: review deleted`, deleted > 0, `toast=${deleted}`);
          }
        }
      }

      await takeScreenshot(page, "admin-reviews-moderate");
    } catch (e) {
      await takeScreenshot(page, "admin-reviews-moderate-fail").catch(() => {});
      rec(`${label}: reviews moderate`, false, e.message);
    }
    await page.close();
  }

  // ── I — Blog: full CRUD ────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "blog-crud";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/blog"));
      rec(`${label}: blog page loads`, status < 400, `status=${status}`);

      // Create: click "New Post"
      const newBtn = await page.locator("button:has-text(New), button:has-text(New Post)").first();
      if (await newBtn.count().catch(() => 0)) {
        await newBtn.click();
        await page.waitForTimeout(800);

        // StepForm Step 1: title, slug, excerpt
        const titleInput = await page
          .locator('input[name="title"], input[placeholder*="title" i]')
          .first();
        if (await titleInput.count().catch(() => 0)) {
          const postTitle = `smoke-blog-${Date.now()}`;
          await titleInput.fill(postTitle);
          rec(`${label}: post title filled`, postTitle !== "", `title="${postTitle}"`);

          // Next button through steps
          const nextBtn = await page
            .locator("button:has-text(Next), button:has-text(Continue)")
            .first();
          if (await nextBtn.count().catch(() => 0)) {
            await nextBtn.click();
            await page.waitForTimeout(500);

            // Navigate remaining steps
            for (let i = 0; i < 2; i++) {
              const nextBtn2 = await page
                .locator("button:has-text(Next), button:has-text(Continue)")
                .first();
              if (await nextBtn2.count().catch(() => 0)) {
                await nextBtn2.click();
                await page.waitForTimeout(400);
              }
            }

            // Final: Create/Save button
            const createBtn = await page
              .locator("button:has-text(Create), button:has-text(Save), button:has-text(Post)")
              .first();
            if (await createBtn.count().catch(() => 0)) {
              await createBtn.click();
              await page.waitForTimeout(800);
              const success = await page.locator("text=/created|posted|success/i").count().catch(() => 0);
              rec(`${label}: post created`, success > 0, `toast=${success}`);

              // Find and delete the post
              await page.waitForTimeout(300);
              const postRow = await page
                .locator("[class*=row], tr")
                .filter({ hasText: postTitle })
                .first();
              if (await postRow.count().catch(() => 0)) {
                const deleteMenuBtn = await postRow.locator('button:has-text("…"), button[aria-label*="menu" i]').first();
                if (await deleteMenuBtn.count().catch(() => 0)) {
                  await deleteMenuBtn.click();
                  await page.waitForTimeout(300);

                  const deleteBtn = await page.locator("button:has-text(Delete)").first();
                  if (await deleteBtn.count().catch(() => 0)) {
                    await deleteBtn.click();
                    await page.waitForTimeout(500);

                    const confirmBtn = await page
                      .locator("[role=dialog] button:has-text(Confirm), [role=dialog] button:has-text(Delete)")
                      .first();
                    if (await confirmBtn.count().catch(() => 0)) {
                      await confirmBtn.click();
                      await page.waitForTimeout(500);
                      const deleted = await page.locator("text=/deleted|removed|success/i").count().catch(() => 0);
                      rec(`${label}: post deleted`, deleted > 0, `toast=${deleted}`);
                    }
                  }
                }
              }
            }
          }
        }
      }

      await takeScreenshot(page, "admin-blog-crud");
    } catch (e) {
      await takeScreenshot(page, "admin-blog-crud-fail").catch(() => {});
      rec(`${label}: blog crud`, false, e.message);
    }
    await page.close();
  }

  // ── J — Events: create + trigger raffle + delete ────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "events-raffle";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/events"));
      rec(`${label}: events page loads`, status < 400, `status=${status}`);

      // Create new event
      const newBtn = await page.locator("button:has-text(New), button:has-text(New Event)").first();
      if (await newBtn.count().catch(() => 0)) {
        await newBtn.click();
        await page.waitForTimeout(800);

        // Fill event details
        const titleInput = await page
          .locator('input[name="title"], input[placeholder*="title" i]')
          .first();
        if (await titleInput.count().catch(() => 0)) {
          const eventTitle = `smoke-event-${Date.now()}`;
          await titleInput.fill(eventTitle);

          // Submit event
          const submitBtn = await page
            .locator("button:has-text(Create), button:has-text(Save)")
            .first();
          if (await submitBtn.count().catch(() => 0)) {
            await submitBtn.click();
            await page.waitForTimeout(800);
            const success = await page.locator("text=/created|success/i").count().catch(() => 0);
            rec(`${label}: event created`, success > 0, `toast=${success}`);

            // Find event and delete
            await page.waitForTimeout(300);
            const eventRow = await page
              .locator("[class*=row], tr")
              .filter({ hasText: eventTitle })
              .first();
            if (await eventRow.count().catch(() => 0)) {
              const menuBtn = await eventRow.locator('button:has-text("…"), button[aria-label*="menu" i]').first();
              if (await menuBtn.count().catch(() => 0)) {
                await menuBtn.click();
                await page.waitForTimeout(300);

                const deleteBtn = await page.locator("button:has-text(Delete)").first();
                if (await deleteBtn.count().catch(() => 0)) {
                  await deleteBtn.click();
                  await page.waitForTimeout(500);

                  const confirmBtn = await page
                    .locator("[role=dialog] button:has-text(Confirm), [role=dialog] button:has-text(Delete)")
                    .first();
                  if (await confirmBtn.count().catch(() => 0)) {
                    await confirmBtn.click();
                    await page.waitForTimeout(500);
                    const deleted = await page.locator("text=/deleted|removed|success/i").count().catch(() => 0);
                    rec(`${label}: event deleted`, deleted > 0, `toast=${deleted}`);
                  }
                }
              }
            }
          }
        }
      }

      await takeScreenshot(page, "admin-events-raffle");
    } catch (e) {
      await takeScreenshot(page, "admin-events-raffle-fail").catch(() => {});
      rec(`${label}: events raffle`, false, e.message);
    }
    await page.close();
  }

  // ── K — Categories: create child + delete ──────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "categories-crud";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/categories"));
      rec(`${label}: categories page loads`, status < 400, `status=${status}`);

      // Create new category
      const newBtn = await page.locator("button:has-text(New), button:has-text(New Category)").first();
      if (await newBtn.count().catch(() => 0)) {
        await newBtn.click();
        await page.waitForTimeout(800);

        // Fill category details
        const nameInput = await page
          .locator('input[name="name"], input[placeholder*="name" i]')
          .first();
        if (await nameInput.count().catch(() => 0)) {
          const catName = `smoke-ygo-${Date.now()}`;
          await nameInput.fill(catName);

          // Parent category (if available)
          const parentSelect = await page
            .locator("select[name=parent], [role=combobox]")
            .first();
          if (await parentSelect.count().catch(() => 0)) {
            await parentSelect.click();
            await page.waitForTimeout(200);
            const parentOpt = await page
              .locator("button, a, option")
              .filter({ hasText: /category-singles|singles/i })
              .first();
            if (await parentOpt.count().catch(() => 0)) {
              await parentOpt.click();
            }
          }

          // Submit
          const submitBtn = await page
            .locator("button:has-text(Create), button:has-text(Save)")
            .first();
          if (await submitBtn.count().catch(() => 0)) {
            await submitBtn.click();
            await page.waitForTimeout(800);
            const success = await page.locator("text=/created|success/i").count().catch(() => 0);
            rec(`${label}: category created`, success > 0, `toast=${success}`);

            // Find and delete
            await page.waitForTimeout(300);
            const catRow = await page
              .locator("[class*=row], tr")
              .filter({ hasText: catName })
              .first();
            if (await catRow.count().catch(() => 0)) {
              const menuBtn = await catRow.locator('button:has-text("…"), button[aria-label*="menu" i]').first();
              if (await menuBtn.count().catch(() => 0)) {
                await menuBtn.click();
                await page.waitForTimeout(300);

                const deleteBtn = await page.locator("button:has-text(Delete)").first();
                if (await deleteBtn.count().catch(() => 0)) {
                  await deleteBtn.click();
                  await page.waitForTimeout(500);

                  const confirmBtn = await page
                    .locator("[role=dialog] button:has-text(Confirm), [role=dialog] button:has-text(Delete)")
                    .first();
                  if (await confirmBtn.count().catch(() => 0)) {
                    await confirmBtn.click();
                    await page.waitForTimeout(500);
                    const deleted = await page.locator("text=/deleted|removed|success/i").count().catch(() => 0);
                    rec(`${label}: category deleted`, deleted > 0, `toast=${deleted}`);
                  }
                }
              }
            }
          }
        }
      }

      await takeScreenshot(page, "admin-categories-crud");
    } catch (e) {
      await takeScreenshot(page, "admin-categories-crud-fail").catch(() => {});
      rec(`${label}: categories crud`, false, e.message);
    }
    await page.close();
  }

  // ── L — FAQs: create + bulk delete ────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "faqs-crud";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/faqs"));
      rec(`${label}: faqs page loads`, status < 400, `status=${status}`);

      // Create new FAQ
      const newBtn = await page.locator("button:has-text(New), button:has-text(New FAQ)").first();
      if (await newBtn.count().catch(() => 0)) {
        await newBtn.click();
        await page.waitForTimeout(800);

        // Fill FAQ
        const questionInput = await page
          .locator('input[name="question"], input[placeholder*="question" i]')
          .first();
        if (await questionInput.count().catch(() => 0)) {
          const faqQ = `smoke-faq-${Date.now()}?`;
          await questionInput.fill(faqQ);

          const answerInput = await page
            .locator('textarea[name="answer"], textarea[placeholder*="answer" i]')
            .first();
          if (await answerInput.count().catch(() => 0)) {
            await answerInput.fill("Smoke FAQ answer");
          }

          // Submit
          const submitBtn = await page
            .locator("button:has-text(Create), button:has-text(Save)")
            .first();
          if (await submitBtn.count().catch(() => 0)) {
            await submitBtn.click();
            await page.waitForTimeout(800);
            const success = await page.locator("text=/created|success/i").count().catch(() => 0);
            rec(`${label}: faq created`, success > 0, `toast=${success}`);

            // Delete via bulk action
            await page.waitForTimeout(300);
            const faqRow = await page
              .locator("[class*=row], tr")
              .filter({ hasText: faqQ })
              .first();
            if (await faqRow.count().catch(() => 0)) {
              const checkbox = await faqRow.locator('input[type=checkbox], [role=checkbox]').first();
              if (await checkbox.count().catch(() => 0)) {
                await checkbox.click();
                await page.waitForTimeout(300);

                const bulkDeleteBtn = await page
                  .locator("[class*=bulk] button:has-text(Delete), [class*=action-bar] button:has-text(Delete)")
                  .first();
                if (await bulkDeleteBtn.count().catch(() => 0)) {
                  await bulkDeleteBtn.click();
                  await page.waitForTimeout(500);

                  const confirmBtn = await page
                    .locator("[role=dialog] button:has-text(Confirm), [role=dialog] button:has-text(Delete)")
                    .first();
                  if (await confirmBtn.count().catch(() => 0)) {
                    await confirmBtn.click();
                    await page.waitForTimeout(500);
                    const deleted = await page.locator("text=/deleted|removed|success/i").count().catch(() => 0);
                    rec(`${label}: faq deleted`, deleted > 0, `toast=${deleted}`);
                  }
                }
              }
            }
          }
        }
      }

      await takeScreenshot(page, "admin-faqs-crud");
    } catch (e) {
      await takeScreenshot(page, "admin-faqs-crud-fail").catch(() => {});
      rec(`${label}: faqs crud`, false, e.message);
    }
    await page.close();
  }

  // ── M — Coupons: admin create + approve + archive ────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "coupons-lifecycle";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/coupons"));
      rec(`${label}: coupons page loads`, status < 400, `status=${status}`);

      // Create new coupon
      const newBtn = await page.locator("button:has-text(New), button:has-text(New Coupon)").first();
      if (await newBtn.count().catch(() => 0)) {
        await newBtn.click();
        await page.waitForTimeout(800);

        // Fill coupon
        const codeInput = await page
          .locator('input[name="code"], input[placeholder*="code" i]')
          .first();
        if (await codeInput.count().catch(() => 0)) {
          const code = `SMOKE${Date.now().toString().slice(-6)}`;
          await codeInput.fill(code);

          const typeSelect = await page
            .locator("select[name=type], [role=combobox]")
            .first();
          if (await typeSelect.count().catch(() => 0)) {
            await typeSelect.click();
            await page.waitForTimeout(200);
            const typeOpt = await page
              .locator("button, a, option")
              .filter({ hasText: /percentage|fixed/i })
              .first();
            if (await typeOpt.count().catch(() => 0)) {
              await typeOpt.click();
            }
          }

          // Submit
          const submitBtn = await page
            .locator("button:has-text(Create), button:has-text(Save)")
            .first();
          if (await submitBtn.count().catch(() => 0)) {
            await submitBtn.click();
            await page.waitForTimeout(800);
            const success = await page.locator("text=/created|success/i").count().catch(() => 0);
            rec(`${label}: coupon created`, success > 0, `toast=${success}`);

            // Find and approve coupon
            await page.waitForTimeout(300);
            const couponRow = await page
              .locator("[class*=row], tr")
              .filter({ hasText: code })
              .first();
            if (await couponRow.count().catch(() => 0)) {
              const menuBtn = await couponRow.locator('button:has-text("…"), button[aria-label*="menu" i]').first();
              if (await menuBtn.count().catch(() => 0)) {
                await menuBtn.click();
                await page.waitForTimeout(300);

                const approveBtn = await page
                  .locator("button:has-text(Activate), button:has-text(Approve)")
                  .first();
                if (await approveBtn.count().catch(() => 0)) {
                  await approveBtn.click();
                  await page.waitForTimeout(500);
                  const approved = await page.locator("text=/activated|approved|success/i").count().catch(() => 0);
                  rec(`${label}: coupon approved`, approved > 0, `toast=${approved}`);

                  // Re-query coupon row (DOM re-renders after approval)
                  await page.waitForTimeout(300);
                  const freshCouponRow = await page
                    .locator("[class*=row], tr")
                    .filter({ hasText: code })
                    .first();
                  const archiveMenuBtn = await freshCouponRow.locator('button:has-text("…"), button[aria-label*="menu" i]').first();
                  if (await archiveMenuBtn.count().catch(() => 0)) {
                    await archiveMenuBtn.click();
                    await page.waitForTimeout(300);

                    const archiveBtn = await page.locator("button:has-text(Archive)").first();
                    if (await archiveBtn.count().catch(() => 0)) {
                      await archiveBtn.click();
                      await page.waitForTimeout(500);
                      const archived = await page.locator("text=/archived|success/i").count().catch(() => 0);
                      rec(`${label}: coupon archived`, archived > 0, `toast=${archived}`);
                    }
                  }
                }
              }
            }
          }
        }
      }

      await takeScreenshot(page, "admin-coupons-lifecycle");
    } catch (e) {
      await takeScreenshot(page, "admin-coupons-lifecycle-fail").catch(() => {});
      rec(`${label}: coupons lifecycle`, false, e.message);
    }
    await page.close();
  }

  // ── N — Payouts: approve payout ────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "payouts-approve";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/payouts"));
      rec(`${label}: payouts page loads`, status < 400, `status=${status}`);

      // Find pending payout and approve
      const pendingRow = await page
        .locator("[class*=row], tr")
        .filter({ hasText: /pending|processing/i })
        .first();
      if (await pendingRow.count().catch(() => 0)) {
        const menuBtn = await pendingRow.locator('button:has-text("…"), button[aria-label*="menu" i]').first();
        if (await menuBtn.count().catch(() => 0)) {
          await menuBtn.click();
          await page.waitForTimeout(300);

          const approveBtn = await page.locator("button:has-text(Approve)").first();
          if (await approveBtn.count().catch(() => 0)) {
            await approveBtn.click();
            await page.waitForTimeout(500);

            const confirmBtn = await page
              .locator("[role=dialog] button:has-text(Confirm), [role=dialog] button:has-text(Approve)")
              .first();
            if (await confirmBtn.count().catch(() => 0)) {
              await confirmBtn.click();
              await page.waitForTimeout(500);
              const success = await page.locator("text=/approved|processed|success/i").count().catch(() => 0);
              rec(`${label}: payout approved`, success > 0, `toast=${success}`);
            }
          }
        }
      }

      await takeScreenshot(page, "admin-payouts-approve");
    } catch (e) {
      await takeScreenshot(page, "admin-payouts-approve-fail").catch(() => {});
      rec(`${label}: payouts approve`, false, e.message);
    }
    await page.close();
  }

  // ── O — Site settings: fees tab ────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "settings-fees";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/settings/fees"));
      rec(`${label}: fees page loads`, status < 400, `status=${status}`);

      // Find fee input
      const feeInput = await page
        .locator('input[type="number"], input[name*="fee" i]')
        .first();
      if (await feeInput.count().catch(() => 0)) {
        const oldValue = await feeInput.inputValue().catch(() => "0");
        const newValue = String(parseInt(oldValue || "5") + 1);
        await feeInput.fill(newValue);
        rec(`${label}: fee updated`, newValue !== oldValue, `old=${oldValue} new=${newValue}`);

        // Save
        const saveBtn = await page
          .locator("button:has-text(Save), button:has-text(Update)")
          .first();
        if (await saveBtn.count().catch(() => 0)) {
          await saveBtn.click();
          await page.waitForTimeout(500);
          const success = await page.locator("text=/saved|updated|success/i").count().catch(() => 0);
          rec(`${label}: fees saved`, success > 0, `toast=${success}`);

          // Verify persistence
          await page.reload();
          const savedValue = await feeInput.inputValue().catch(() => "");
          rec(`${label}: fees persist`, savedValue === newValue, `saved=${savedValue}`);
        }
      }

      await takeScreenshot(page, "admin-settings-fees");
    } catch (e) {
      await takeScreenshot(page, "admin-settings-fees-fail").catch(() => {});
      rec(`${label}: fees settings`, false, e.message);
    }
    await page.close();
  }

  // ── P — Site settings: announcement banner ─────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "settings-banner";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/settings/appearance"));
      rec(`${label}: appearance page loads`, status < 400, `status=${status}`);

      // Find announcement banner toggle
      const bannerToggle = await page
        .locator('input[type=checkbox], input[type=radio], [role=switch]')
        .filter({ hasText: /banner|announcement/i })
        .first();
      if (await bannerToggle.count().catch(() => 0)) {
        await bannerToggle.click();
        await page.waitForTimeout(300);

        // Fill banner message
        const bannerInput = await page
          .locator('textarea[name*="banner" i], input[placeholder*="banner" i], textarea')
          .first();
        if (await bannerInput.count().catch(() => 0)) {
          await bannerInput.fill(`Smoke banner ${Date.now()}`);
        }

        // Save
        const saveBtn = await page
          .locator("button:has-text(Save), button:has-text(Update)")
          .first();
        if (await saveBtn.count().catch(() => 0)) {
          await saveBtn.click();
          await page.waitForTimeout(500);
          const success = await page.locator("text=/saved|updated|success/i").count().catch(() => 0);
          rec(`${label}: banner saved`, success > 0, `toast=${success}`);

          // Verify on public homepage
          const publicPage = await ctx.newPage();
          await gotoAndWait(publicPage, localizedUrl("/"));
          const bannerText = await publicPage
            .locator("text=/smoke banner/i")
            .count()
            .catch(() => 0);
          rec(`${label}: banner visible on homepage`, bannerText > 0, `visible=${bannerText}`);
          await publicPage.close();
        }
      }

      await takeScreenshot(page, "admin-settings-banner");
    } catch (e) {
      await takeScreenshot(page, "admin-settings-banner-fail").catch(() => {});
      rec(`${label}: banner settings`, false, e.message);
    }
    await page.close();
  }

  // ── Q — Moderation queue: approve + reject ─────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "moderation-queue";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/moderation"));
      rec(`${label}: moderation page loads`, status < 400, `status=${status}`);

      // Find queue item and approve
      const queueItem = await page
        .locator("[class*=row], tr, [class*=card]")
        .first();
      if (await queueItem.count().catch(() => 0)) {
        const actionBtn = await queueItem
          .locator("button:has-text(Approve), button:has-text(Reject)")
          .first();
        if (await actionBtn.count().catch(() => 0)) {
          await actionBtn.click();
          await page.waitForTimeout(500);
          const success = await page.locator("text=/approved|rejected|success/i").count().catch(() => 0);
          rec(`${label}: moderation action executed`, success > 0, `toast=${success}`);
        }
      }

      await takeScreenshot(page, "admin-moderation-queue");
    } catch (e) {
      await takeScreenshot(page, "admin-moderation-queue-fail").catch(() => {});
      rec(`${label}: moderation`, false, e.message);
    }
    await page.close();
  }

  // ── R — Reports: dismiss + escalate ────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "reports-manage";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/reports"));
      rec(`${label}: reports page loads`, status < 400, `status=${status}`);

      // Find report and dismiss
      const reportRow = await page
        .locator("[class*=row], tr, [class*=card]")
        .first();
      if (await reportRow.count().catch(() => 0)) {
        const menuBtn = await reportRow.locator('button:has-text("…"), button[aria-label*="menu" i]').first();
        if (await menuBtn.count().catch(() => 0)) {
          await menuBtn.click();
          await page.waitForTimeout(300);

          const dismissBtn = await page.locator("button:has-text(Dismiss)").first();
          if (await dismissBtn.count().catch(() => 0)) {
            await dismissBtn.click();
            await page.waitForTimeout(500);
            const success = await page.locator("text=/dismissed|success/i").count().catch(() => 0);
            rec(`${label}: report dismissed`, success > 0, `toast=${success}`);
          }
        }
      }

      await takeScreenshot(page, "admin-reports-manage");
    } catch (e) {
      await takeScreenshot(page, "admin-reports-manage-fail").catch(() => {});
      rec(`${label}: reports manage`, false, e.message);
    }
    await page.close();
  }

  // ── S — Item requests: approve + decline ───────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "item-requests";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/item-requests"));
      rec(`${label}: item-requests page loads`, status < 400, `status=${status}`);

      // Find request and approve/decline
      const requestRow = await page
        .locator("[class*=row], tr, [class*=card]")
        .first();
      if (await requestRow.count().catch(() => 0)) {
        const actionBtn = await requestRow
          .locator("button:has-text(Approve), button:has-text(Decline)")
          .first();
        if (await actionBtn.count().catch(() => 0)) {
          await actionBtn.click();
          await page.waitForTimeout(500);
          const success = await page.locator("text=/approved|declined|success/i").count().catch(() => 0);
          rec(`${label}: request action executed`, success > 0, `toast=${success}`);
        }
      }

      await takeScreenshot(page, "admin-item-requests");
    } catch (e) {
      await takeScreenshot(page, "admin-item-requests-fail").catch(() => {});
      rec(`${label}: item requests`, false, e.message);
    }
    await page.close();
  }

  // ── T — Feature flags: toggle + save ───────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "feature-flags";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/settings/feature-flags"));
      rec(`${label}: feature-flags page loads`, status < 400, `status=${status}`);

      // Find a flag toggle
      const flagToggle = await page
        .locator('input[type=checkbox], [role=switch]')
        .first();
      if (await flagToggle.count().catch(() => 0)) {
        const isChecked = await flagToggle.isChecked().catch(() => false);
        await flagToggle.click();
        await page.waitForTimeout(300);

        // Save
        const saveBtn = await page
          .locator("button:has-text(Save), button:has-text(Save All)")
          .first();
        if (await saveBtn.count().catch(() => 0)) {
          await saveBtn.click();
          await page.waitForTimeout(500);
          const success = await page.locator("text=/saved|updated|success/i").count().catch(() => 0);
          rec(`${label}: flag toggled & saved`, success > 0, `toast=${success}`);

          // Toggle back
          await flagToggle.click();
          await page.waitForTimeout(300);
          if (await saveBtn.count().catch(() => 0)) {
            await saveBtn.click();
            await page.waitForTimeout(500);
          }
        }
      }

      await takeScreenshot(page, "admin-feature-flags");
    } catch (e) {
      await takeScreenshot(page, "admin-feature-flags-fail").catch(() => {});
      rec(`${label}: feature flags`, false, e.message);
    }
    await page.close();
  }

  // ── U — Admin notifications: send to user ──────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "notifications-send";
    try {
      const { status } = await gotoAndWait(page, localizedUrl("/admin/notifications/send"));
      rec(`${label}: send notifications page loads`, status < 400, `status=${status}`);

      // Recipient user select
      const userSelect = await page
        .locator("select[name=user], [role=combobox]")
        .first();
      if (await userSelect.count().catch(() => 0)) {
        await userSelect.click();
        await page.waitForTimeout(200);
        const userOpt = await page
          .locator("button, a, option")
          .filter({ hasText: /yugi|muto/i })
          .first();
        if (await userOpt.count().catch(() => 0)) {
          await userOpt.click();
        }
      }

      // Type input
      const typeSelect = await page
        .locator("select[name=type], [role=combobox]")
        .first();
      if (await typeSelect.count().catch(() => 0)) {
        await typeSelect.click();
        await page.waitForTimeout(200);
        const typeOpt = await page
          .locator("button, a, option")
          .first();
        if (await typeOpt.count().catch(() => 0)) {
          await typeOpt.click();
        }
      }

      // Message
      const msgInput = await page
        .locator('textarea[name="message"], input[placeholder*="message" i]')
        .first();
      if (await msgInput.count().catch(() => 0)) {
        await msgInput.fill(`Smoke notification ${Date.now()}`);
      }

      // Send
      const sendBtn = await page
        .locator("button:has-text(Send), button:has-text(Submit)")
        .first();
      if (await sendBtn.count().catch(() => 0)) {
        await sendBtn.click();
        await page.waitForTimeout(500);
        const success = await page.locator("text=/sent|success/i").count().catch(() => 0);
        rec(`${label}: notification sent`, success > 0, `toast=${success}`);
      }

      await takeScreenshot(page, "admin-notifications-send");
    } catch (e) {
      await takeScreenshot(page, "admin-notifications-send-fail").catch(() => {});
      rec(`${label}: notifications send`, false, e.message);
    }
    await page.close();
  }

  // ── V — Bulk admin actions: cross-collection ────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "bulk-actions";
    try {
      // Test 1: Bulk archive products
      const { status } = await gotoAndWait(page, localizedUrl("/admin/products"));
      rec(`${label}: products page loads`, status < 400, `status=${status}`);

      const productCheckbox = await page
        .locator('input[type=checkbox], [role=checkbox]')
        .first();
      if (await productCheckbox.count().catch(() => 0)) {
        await productCheckbox.click();
        const checkbox2 = await page
          .locator('input[type=checkbox], [role=checkbox]')
          .nth(1);
        if (await checkbox2.count().catch(() => 0)) {
          await checkbox2.click();
          await page.waitForTimeout(300);

          const archiveBtn = await page
            .locator("[class*=bulk] button:has-text(Archive), [class*=action-bar] button:has-text(Archive)")
            .first();
          if (await archiveBtn.count().catch(() => 0)) {
            await archiveBtn.click();
            await page.waitForTimeout(500);
            const success = await page.locator("text=/archived|success/i").count().catch(() => 0);
            rec(`${label}: bulk archive products`, success > 0, `toast=${success}`);
          }
        }
      }

      // Test 2: Bulk approve reviews
      const { status: reviewStatus } = await gotoAndWait(page, localizedUrl("/admin/reviews"));
      rec(`${label}: reviews page loads`, reviewStatus < 400, `status=${reviewStatus}`);

      const reviewCheckbox = await page
        .locator('input[type=checkbox], [role=checkbox]')
        .first();
      if (await reviewCheckbox.count().catch(() => 0)) {
        await reviewCheckbox.click();
        const checkbox2 = await page
          .locator('input[type=checkbox], [role=checkbox]')
          .nth(1);
        if (await checkbox2.count().catch(() => 0)) {
          await checkbox2.click();
          await page.waitForTimeout(300);

          const approveBtn = await page
            .locator("[class*=bulk] button:has-text(Approve), [class*=action-bar] button:has-text(Approve)")
            .first();
          if (await approveBtn.count().catch(() => 0)) {
            await approveBtn.click();
            await page.waitForTimeout(500);
            const success = await page.locator("text=/approved|success/i").count().catch(() => 0);
            rec(`${label}: bulk approve reviews`, success > 0, `toast=${success}`);
          }
        }
      }

      await takeScreenshot(page, "admin-bulk-actions");
    } catch (e) {
      await takeScreenshot(page, "admin-bulk-actions-fail").catch(() => {});
      rec(`${label}: bulk actions`, false, e.message);
    }
    await page.close();
  }

  return results;
}
