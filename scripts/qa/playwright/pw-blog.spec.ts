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
  test("admin blog page renders with heading", async ({ page }) => {
    await loginAsAdmin(page);
    const res = await page.request.get(`${BASE_URL}/api/admin/blog`);
    expect(res.status(), "Blog admin API must be available — check FEATURE_BLOG flag").toBe(200);
    await gotoAndWait(page, "/admin/blog");
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("public blog listing page renders with heading", async ({ page }) => {
    await gotoAndWait(page, "/blog");
    await expect(page).not.toHaveURL(/\/404/);
    await expect(page.getByRole("main").first()).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10000 });
  });

  test("API: draft posts are NOT returned to public callers", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies([BASE_URL]);
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

    expect(createRes.status(), "Blog create API must be available — check FEATURE_BLOG flag").toBe(200);
    const created = (await createRes.json()) as { data?: { slug?: string } };
    const draftSlug = created.data?.slug;
    expect(draftSlug, "Blog create must return a slug").toBeTruthy();

    // Public caller must get 404 for draft
    const publicRes = await page.request.get(`${BASE_URL}/api/blog/${draftSlug}`);
    expect(publicRes.status()).toBe(404);
  });

  test("API: published posts are visible to public", async ({ page }) => {
    await loginAsAdmin(page);
    const cookies = await page.context().cookies([BASE_URL]);
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

    expect(createRes.status(), "Blog create API must be available — check FEATURE_BLOG flag").toBe(200);

    const publicRes = await page.request.get(`${BASE_URL}/api/blog/${TEST_SLUG}`);
    expect(publicRes.status()).toBe(200);
    const body = (await publicRes.json()) as { data?: { post?: { status: string; title: string } } };
    expect(body.data?.post?.status).toBe("published");
    expect(body.data?.post?.title).toBeTruthy();
  });

  test("public blog detail page shows post title heading", async ({ page }) => {
    const apiRes = await page.request.get(`${BASE_URL}/api/blog/${TEST_SLUG}`);
    expect(apiRes.status(), `Blog post ${TEST_SLUG} must exist — run the 'published posts' test first`).toBe(200);
    const body = await apiRes.json() as { data?: { post?: { title: string } } };
    const expectedTitle = body.data?.post?.title;

    await gotoAndWait(page, `/blog/${TEST_SLUG}`);
    await expect(page).not.toHaveURL(/\/404/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10000 });
    if (expectedTitle) {
      await expect(page.getByText(expectedTitle).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("public blog detail includes OG meta tags with title", async ({ page }) => {
    const apiRes = await page.request.get(`${BASE_URL}/api/blog/${TEST_SLUG}`);
    expect(apiRes.status(), `Blog post ${TEST_SLUG} must exist`).toBe(200);

    await gotoAndWait(page, `/blog/${TEST_SLUG}`);
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveCount(1);
    const titleContent = await ogTitle.getAttribute("content");
    expect(titleContent, "og:title must be non-empty").toBeTruthy();
  });

  test("API: admin-only blog endpoint returns 401 for unauthenticated", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/admin/blog`);
    expect([401, 403]).toContain(res.status());
  });

  test("public blog listing contains at least one seeded post", async ({ page }) => {
    const res = await page.request.get(`${BASE_URL}/api/blog?status=published&pageSize=5`);
    expect(res.status()).toBe(200);
    const body = await res.json() as { data?: { items?: unknown[] } };
    expect(body.data?.items?.length, "At least one published blog post must be seeded").toBeGreaterThan(0);
  });
});
