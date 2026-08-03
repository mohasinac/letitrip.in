import { type Page, type Cookie } from "@playwright/test";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

/** Seed credentials — must match seeded users in Firestore.
 *  Reads from env vars (SMOKE_*) so CI can override without editing code.
 */
const CREDS = {
  admin: {
    email: process.env.SMOKE_ADMIN_EMAIL ?? "admin@letitrip.in",
    password: process.env.SMOKE_ADMIN_PASSWORD ?? "TempPass123!",
  },
  seller: {
    email: process.env.SMOKE_SELLER_EMAIL ?? "ash@pokemonpalace.in",
    password: process.env.SMOKE_SELLER_PASSWORD ?? "TempPass123!",
  },
  buyer: {
    email: process.env.SMOKE_BUYER_EMAIL ?? "yugi@duelkingdom.in",
    password: process.env.SMOKE_BUYER_PASSWORD ?? "TempPass123!",
  },
};

/**
 * Module-level session cache.
 * With workers=1, all tests share one process. Login once per role per run.
 */
const sessionCache: Partial<Record<keyof typeof CREDS, string>> = {};

async function loginAs(page: Page, role: keyof typeof CREDS, maxRetries = 3) {
  const cached = sessionCache[role];
  if (cached) {
    // Inject cached session into this page's context — avoids re-calling the API.
    const hostname = new URL(BASE_URL).hostname;
    await page.context().addCookies([
      {
        name: "__session",
        value: cached,
        domain: hostname,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      },
    ]);
    return;
  }

  const { email, password } = CREDS[role];
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await page.request.post(`${BASE_URL}/api/auth/login`, {
      data: { email, password },
    });
    if (res.ok()) {
      // Extract session cookie and cache it for the rest of the run.
      const cookies = await page.context().cookies();
      const session = cookies.find((c) => c.name === "__session");
      if (session) sessionCache[role] = session.value;
      return;
    }
    if (res.status() === 429 && attempt < maxRetries) {
      // Rate limited — wait before retry (5s, 10s, 15s)
      await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
      continue;
    }
    throw new Error(`Login as ${role} failed: ${res.status()} — check SMOKE_* env vars`);
  }
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

/** Navigate and wait for the page to be interactive.
 *  Uses "load" (not "networkidle") because RTDB + analytics connections
 *  never fully settle and would cause false timeouts.
 */
export async function gotoAndWait(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("load");
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

export function getCookieHeader(cookies: Cookie[]): string {
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

export { BASE_URL };

export async function uploadFile(
  page: Page,
  selector: string,
  filePath: string,
) {
  const fileInput = page.locator(selector);
  await fileInput.setInputFiles(filePath);
}
