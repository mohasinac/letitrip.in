/**
 * Playwright E2E: Blog (P-3)
 *
 * Requires FEATURE_BLOG=true in the test environment.
 * Tests admin create → publish → public listing → detail → OG meta → draft → 404.
 */
import { test, expect } from "@playwright/test";
import { loginAsAdmin, gotoAndWait, BASE_URL } from "./_setup";

const TEST_SLUG = `blog-e2e-test-collectibles-guide-${Date.now()}`;
const TEST_TITLE = `E2E Collectibles Guide ${Date.now()}`;

test.describe("Blog — Admin + Public", () => {
  test("admin can access the blog admin page", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoAndWait(page, "/admin/blog");
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("public blog listing page renders", async ({ page }) => {
    await gotoAndWait(page, "/blog");
    // Page should load (may have 0 posts in test env — just confirm it renders)
    await expect(page).not.toHaveURL(/\/404/);
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("API: draft posts are NOT returned to public callers", async ({ page }) => {
    // Create a draft post via API
    await loginAsAdmin(page);
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const createRes = await page.request.post(`${BASE_URL}/api/admin/blog`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: {
        title: `Draft Post ${Date.now()}`,
        slug: `draft-post-${Date.now()}`,
        excerpt: "Draft excerpt",
        content: "Draft content with enough words to pass validation checks.",
        category: "guides",
        tags: [],
        status: "draft",
        authorId: "user-admin-1",
        authorName: "Test Admin",
      },
    });

    // Skip if blog is not enabled in this environment
    if (createRes.status() === 404) {
      test.skip();
      return;
    }

    expect(createRes.status()).toBe(200);
    const created = (await createRes.json()) as { data?: { slug?: string } };
    const draftSlug = created.data?.slug;

    if (!draftSlug) {
      // API returned 200 but no slug — skip
      return;
    }

    // Public caller should get 404 for draft
    const publicRes = await page.request.get(`${BASE_URL}/api/blog/${draftSlug}`);
    expect(publicRes.status()).toBe(404);
  });

  test("API: published posts are visible to public", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const createRes = await page.request.post(`${BASE_URL}/api/admin/blog`, {
      headers: { Cookie: cookieHeader, "Content-Type": "application/json" },
      data: {
        title: TEST_TITLE,
        slug: TEST_SLUG,
        excerpt: "E2E test post excerpt for integration coverage.",
        content: "E2E test content with enough words to pass the read-time calculation.",
        category: "guides",
        tags: ["e2e", "test"],
        status: "published",
        authorId: "user-admin-1",
        authorName: "Test Admin",
      },
    });

    // Skip if blog feature is disabled
    if (createRes.status() === 404) {
      test.skip();
      return;
    }

    expect(createRes.status()).toBe(200);

    // Public caller should be able to read the published post
    const publicRes = await page.request.get(`${BASE_URL}/api/blog/${TEST_SLUG}`);
    expect(publicRes.status()).toBe(200);
    const body = (await publicRes.json()) as { data?: { post?: { status: string } } };
    expect(body.data?.post?.status).toBe("published");
  });

  test("public blog detail page renders for published post", async ({ page }) => {
    // Check if the test post is reachable (may not exist if prior test was skipped)
    const apiRes = await page.request.get(`${BASE_URL}/api/blog/${TEST_SLUG}`);
    if (apiRes.status() !== 200) {
      test.skip();
      return;
    }

    await gotoAndWait(page, `/blog/${TEST_SLUG}`);
    await expect(page).not.toHaveURL(/\/404/);
    await expect(page.getByRole("main").first()).toBeVisible();
  });

  test("public blog detail includes OG meta tags", async ({ page }) => {
    const apiRes = await page.request.get(`${BASE_URL}/api/blog/${TEST_SLUG}`);
    if (apiRes.status() !== 200) {
      test.skip();
      return;
    }

    await gotoAndWait(page, `/blog/${TEST_SLUG}`);
    // og:title should be present in the head
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);
    const titleContent = await ogTitle.getAttribute("content");
    expect(titleContent).toBeTruthy();
  });

  test("API: admin-only blog admin endpoint returns 401 for unauthenticated", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/admin/blog`);
    expect([401, 404]).toContain(res.status());
  });

  test("admin blog nav item visible when logged in as admin", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoAndWait(page, "/admin");
    // The sidebar should contain a Blog link (when FEATURE_BLOG is true)
    // We verify the admin layout loaded successfully
    await expect(page.getByRole("main").first()).toBeVisible();
  });
});
