import { type Page, type Cookie } from "@playwright/test";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

/** Seed credentials — must match seeded users in Firestore. */
const CREDS = {
  admin: { email: "admin@letitrip.in", password: "Admin@123456" },
  seller: { email: "seller@letitrip.in", password: "Seller@123456" },
  buyer: { email: "buyer@letitrip.in", password: "Buyer@123456" },
};

async function loginAs(page: Page, role: keyof typeof CREDS) {
  const { email, password } = CREDS[role];
  const res = await page.request.post(`${BASE_URL}/api/auth/login`, {
    data: { email, password },
  });
  if (!res.ok()) throw new Error(`Login as ${role} failed: ${res.status()}`);
  // Session cookie is set automatically via Set-Cookie header.
}

export async function loginAsAdmin(page: Page) {
  return loginAs(page, "admin");
}

export async function loginAsSeller(page: Page) {
  return loginAs(page, "seller");
}

export async function loginAsBuyer(page: Page) {
  return loginAs(page, "buyer");
}

export async function gotoAndWait(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

export async function fetchFirstId(
  page: Page,
  apiPath: string,
): Promise<string | null> {
  const res = await page.request.get(`${BASE_URL}${apiPath}`);
  if (!res.ok()) return null;
  const json = (await res.json()) as { data?: { items?: Array<{ id: string }> } };
  return json.data?.items?.[0]?.id ?? null;
}

export async function getCookieHeader(cookies: Cookie[]): string {
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

export async function uploadFile(
  page: Page,
  selector: string,
  filePath: string,
) {
  const fileInput = page.locator(selector);
  await fileInput.setInputFiles(filePath);
}
