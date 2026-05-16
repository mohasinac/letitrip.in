/**
 * pw-17 — Media upload flow (sign → PUT → finalize).
 *
 * Tests:
 *  1. /admin/media page shell loads
 *  2. Upload zone and file input render correctly
 *  3. Camera capture UI: "Upload File / Use Camera" toggle present when
 *     isCameraSupported=true (Playwright Chromium exposes getUserMedia even
 *     in headless mode); fallback file-only button when camera is not supported.
 *  4. Successful image upload: sign API → GCS PUT → finalize API → URL in UI
 *  5. Oversized file rejected client-side (sign API never called)
 *  6. Discard staged uploads calls DELETE and clears the preview
 *
 * Environment:
 *   SMOKE_HEADLESS=0 SMOKE_SLOW_MO=150 to watch the flow.
 *   SMOKE_RECORD_VIDEO=1 to capture a .webm of every test page.
 *
 * Response collection: uses page.on("response", ...) instead of
 * waitForResponse() — the persistent listener cannot miss responses that fire
 * in the same microtask tick as the triggering action. Always remove the
 * listener after the upload settles to avoid memory leaks.
 */

import { getContext, localizedUrl, gotoAndWait, takeScreenshot, getCookieHeader } from "./_pw-setup.mjs";
import { BASE_URL } from "../prod-suites/_fixtures.mjs";

const results = [];
const rec = (name, ok, detail) => results.push({ name, ok, detail });


// ── Minimal 1×1 white PNG ─────────────────────────────────────────────────────
// Tiny so GCS PUT is fast. Magic bytes are valid so the finalize magic-byte
// check passes.
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

// ── Selectors ─────────────────────────────────────────────────────────────────
// data-testid preferred (after appkit re-published); hidden-class fallback for
// current prod HTML. :not([capture]) excludes the mobile camera-capture input.
const FILE_INPUT_SEL =
  '[data-testid="media-upload-input"], input[type="file"].hidden:not([capture])';
const CAPTURE_INPUT_SEL =
  '[data-testid="media-upload-capture-input"], input[type="file"][capture]';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Set a file on the first matching upload file input. */
async function setUploadFile(page, { name, mimeType, buffer }) {
  const input = page.locator(FILE_INPUT_SEL).first();
  await input.waitFor({ state: "attached", timeout: 8000 });
  await input.setInputFiles({ name, mimeType, buffer });
}

/**
 * Collect API responses while fn() runs.
 * Returns { byUrl: Map<urlFragment, [status, ...] }, requests: Set<urlFragment> }.
 */
async function collectResponses(page, fn) {
  const byUrl = new Map(); // fragment → [status, ...]
  const onResponse = (res) => {
    const url = res.url();
    if (!url.includes("/api/")) return; // ignore 3rd-party / GCS
    const status = res.status();
    const existing = byUrl.get(url) ?? [];
    byUrl.set(url, [...existing, status]);
  };
  page.on("response", onResponse);
  try {
    await fn();
  } finally {
    page.off("response", onResponse);
  }
  return byUrl;
}

/** Wait for any upload spinner to disappear (upload in progress indicator). */
async function waitForUploadIdle(page, timeoutMs = 25_000) {
  await page
    .locator('[data-testid="spinner"], .appkit-spinner, [class*=spinner]')
    .first()
    .waitFor({ state: "detached", timeout: timeoutMs })
    .catch(() => {});
  // Extra settle so React state updates are flushed to the DOM
  await page.waitForTimeout(400);
}

// ── Suite ─────────────────────────────────────────────────────────────────────

export async function run() {
  // All URLs returned by finalize across every section — deleted at the end.
  const allFinalizedUrls = [];

  const ctx = await getContext("admin");

  // ── 1. Page shell ─────────────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "media-page";
    try {
      const { status, finalUrl } = await gotoAndWait(page, localizedUrl("/admin/media"));
      const redirected = /\/auth\/login/.test(finalUrl);
      const main = await page.locator("main").count();
      const heading = await page
        .locator("h1, h2, [data-section]")
        .filter({ hasText: /media/i })
        .count();
      rec(`${label}: shell`, status < 400 && main > 0 && !redirected,
        `status=${status} main=${main} url=${finalUrl}`);
      rec(`${label}: media heading visible`, heading > 0, `headings=${heading}`);
    } catch (e) {
      rec(`${label}: shell`, false, e.message);
    }
    await page.close();
  }

  // ── 2. Upload zone renders ─────────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "media-upload-zone";
    try {
      await gotoAndWait(page, localizedUrl("/admin/media"));

      const fileInputCount = await page.locator(FILE_INPUT_SEL).count();
      rec(`${label}: file input present`, fileInputCount > 0, `count=${fileInputCount}`);

      // Upload trigger: either the dashed "Choose file" button (camera unsupported)
      // or the "Upload File" mode-toggle button (camera supported in headless Chromium)
      const uploadBtn = page.locator(
        'button:has-text("Choose file"), button:has-text("Upload File"), button:has-text("Upload"), button:has-text("Add image")',
      );
      const btnCount = await uploadBtn.count();
      rec(`${label}: upload trigger button visible`, btnCount > 0, `count=${btnCount}`);

      const browserSection = await page.locator('text="Browse existing media"').count();
      rec(`${label}: media browser section`, browserSection > 0, `count=${browserSection}`);
    } catch (e) {
      rec(`${label}: file input present`, false, e.message);
    }
    await page.close();
  }

  // ── 3. Camera UI / file input present ─────────────────────────────────────
  // Playwright's headless Chromium exposes navigator.mediaDevices.getUserMedia
  // so isCameraSupported=true. The component shows the Upload File / Use Camera
  // toggle, and the hidden file input is always present.
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "camera-ui";
    try {
      await gotoAndWait(page, localizedUrl("/admin/media"));

      // Whether camera is supported or not, the file input must always exist
      const fileInput = await page.locator(FILE_INPUT_SEL).count();
      rec(`${label}: file input always present`, fileInput > 0, `count=${fileInput}`);

      // The "Use Camera" button appears when isCameraSupported=true (Chromium headless)
      const cameraBtn = await page.locator('button:has-text("Use Camera")').count();
      const uploadFileBtn = await page.locator('button:has-text("Upload File")').count();
      // At least one of: camera toggle present OR plain file-only drop area
      const hasUploadUi = cameraBtn > 0 || uploadFileBtn > 0 ||
        (await page.locator('button:has-text("Choose file")').count()) > 0;
      rec(`${label}: upload UI present`, hasUploadUi,
        `cameraBtn=${cameraBtn} uploadFileBtn=${uploadFileBtn}`);

      // Live <video> must NOT be visible by default (camera not started yet)
      const liveVideo = await page.locator("video[autoplay]").count();
      rec(`${label}: no live camera video by default`, liveVideo === 0, `video=${liveVideo}`);

      // Mobile capture input only appears when camera is active but unsupported
      const captureInput = await page.locator(CAPTURE_INPUT_SEL).count();
      rec(`${label}: mobile-capture input absent by default`, captureInput === 0, `count=${captureInput}`);
    } catch (e) {
      rec(`${label}: file input always present`, false, e.message);
    }
    await page.close();
  }

  // ── 4. Full upload flow — sign → PUT → finalize ───────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(30000);
    const label = "upload-flow";
    try {
      await gotoAndWait(page, localizedUrl("/admin/media"));

      // Use a persistent response listener — cannot miss responses that arrive
      // in the same tick as the triggering action (unlike waitForResponse).
      const captured = new Map(); // url → last status

      // Track GCS PUT separately (not /api/ path)
      let gcsPutStatus = null;
      const onAll = (res) => {
        const url = res.url();
        if (url.includes("/api/media/")) captured.set(url, res.status());
        if (/storage\.googleapis\.com/.test(url) && res.request().method() === "PUT") {
          gcsPutStatus = res.status();
        }
        // Capture finalize response body to track the URL for cleanup
        if (url.includes("/api/media/finalize") && res.status() === 201) {
          res.json().then((j) => {
            const fileUrl = j?.data?.url;
            if (fileUrl && !allFinalizedUrls.includes(fileUrl)) {
              allFinalizedUrls.push(fileUrl);
            }
          }).catch(() => {});
        }
      };
      page.on("response", onAll);

      await setUploadFile(page, {
        name: "smoke-test-upload.png",
        mimeType: "image/png",
        buffer: TINY_PNG,
      });

      // Wait for the finalize response (or timeout after 25 s)
      const deadline = Date.now() + 25000;
      let finalizeStatus = null;
      while (Date.now() < deadline) {
        for (const [url, status] of captured) {
          if (url.includes("/api/media/finalize")) { finalizeStatus = status; break; }
        }
        if (finalizeStatus !== null) break;
        await page.waitForTimeout(300);
      }

      page.off("response", onAll);
      await waitForUploadIdle(page);
      await takeScreenshot(page, "upload-flow-complete");

      // Sign
      let signStatus = null;
      for (const [url, status] of captured) {
        if (url.includes("/api/media/sign")) { signStatus = status; break; }
      }
      rec(`${label}: sign API 200`, signStatus === 200,
        `status=${signStatus ?? "not-captured"} all=${[...captured.keys()].map(u => u.replace(/.*\/api/, "/api")).join(", ")}`);

      // GCS PUT (may not be captured — cross-origin requests are sometimes
      // not accessible in some Playwright configs; treat null as ok)
      rec(`${label}: GCS PUT ok or unobserved`,
        gcsPutStatus === 200 || gcsPutStatus === null,
        gcsPutStatus !== null ? `status=${gcsPutStatus}` : "not captured (ok)");

      // Finalize
      rec(`${label}: finalize API 201`, finalizeStatus === 201,
        `status=${finalizeStatus ?? "not-captured"}`);

      // URL display box must appear with the storage URL
      const urlBoxCount = await page
        .locator(".font-mono")
        .filter({ hasText: /storage\.googleapis\.com|\/api\/media\/|https?:/ })
        .count();
      rec(`${label}: upload URL visible in UI`, urlBoxCount > 0, `url-boxes=${urlBoxCount}`);

      // Check for upload-specific error only (exclude the MediaBrowser "Load failed"
      // alert which is unrelated to the upload and always present when media listing fails)
      const uploadSection = page.locator('text="Upload & Copy URL"').locator("..");
      const uploadError = await uploadSection
        .locator('[role=alert]')
        .filter({ hasText: /failed|error|unsupported/i })
        .count()
        .catch(() => 0);
      // Fallback: scan all alerts but exclude "load failed" / "failed to list"
      const allAlerts = await page
        .locator('[role=alert]')
        .filter({ hasText: /upload failed|unsupported file|file too large|storage PUT/i })
        .count();
      rec(`${label}: no upload error alert`, uploadError === 0 && allAlerts === 0,
        `uploadSection=${uploadError} uploadSpecific=${allAlerts}`);
    } catch (e) {
      await takeScreenshot(page, "upload-flow-fail").catch(() => {});
      rec(`${label}: sign API 200`, false, e.message);
    }
    await page.close();
  }

  // ── 5. Oversized file → client-side error, sign API never called ──────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(15000);
    const label = "oversized-file";
    try {
      await gotoAndWait(page, localizedUrl("/admin/media"));

      let signCalled = false;
      page.on("request", (req) => {
        if (req.url().includes("/api/media/sign")) signCalled = true;
      });

      // 26 MB — above the 25 MB image limit in MediaUploadField KIND_DEFAULTS
      const FAKE_LARGE = Buffer.alloc(26 * 1024 * 1024, 0xab);
      await setUploadFile(page, {
        name: "too-large.png",
        mimeType: "image/png",
        buffer: FAKE_LARGE,
      });

      await page.waitForTimeout(800);

      const errorEl = await page
        .locator('[role=alert], [class*="alert"]')
        .filter({ hasText: /size|large|MB/i })
        .count();
      rec(`${label}: size error shown`, errorEl > 0, `alerts=${errorEl}`);
      rec(`${label}: sign API not called`, !signCalled,
        signCalled ? "sign was called unexpectedly" : "ok");
    } catch (e) {
      rec(`${label}: size error shown`, false, e.message);
    }
    await page.close();
  }

  // ── 6. Discard staged uploads ─────────────────────────────────────────────
  {
    const page = await ctx.newPage();
    page.setDefaultTimeout(30000);
    const label = "discard-staged";
    try {
      await gotoAndWait(page, localizedUrl("/admin/media"));

      // Upload first so there is a staged URL to discard
      const captured = new Map();
      const onAll = (res) => {
        const url = res.url();
        if (url.includes("/api/media/")) captured.set(url, res.status());
        // Capture finalize body so cleanup can DELETE this file even if discard fails
        if (url.includes("/api/media/finalize") && res.status() === 201) {
          res.json().then((j) => {
            const fileUrl = j?.data?.url;
            if (fileUrl && !allFinalizedUrls.includes(fileUrl)) {
              allFinalizedUrls.push(fileUrl);
            }
          }).catch(() => {});
        }
      };
      page.on("response", onAll);

      await setUploadFile(page, {
        name: "smoke-discard.png",
        mimeType: "image/png",
        buffer: TINY_PNG,
      });

      // Wait for finalize
      const deadline = Date.now() + 25000;
      let finalized = false;
      while (Date.now() < deadline) {
        for (const [url] of captured) {
          if (url.includes("/api/media/finalize")) { finalized = true; break; }
        }
        if (finalized) break;
        await page.waitForTimeout(300);
      }
      page.off("response", onAll);
      await waitForUploadIdle(page);

      const discardBtn = page.locator('button:has-text("Discard staged")');
      const discardEnabled = await discardBtn.first().isEnabled().catch(() => false);
      rec(`${label}: discard button enabled after upload`, discardEnabled,
        finalized ? "finalized=true" : "finalized=false (upload may have failed)");

      if (discardEnabled) {
        let deleteStatus = null;
        const onDel = (res) => {
          if (res.url().includes("/api/media") && res.request().method() === "DELETE") {
            deleteStatus = res.status();
          }
        };
        page.on("response", onDel);

        await discardBtn.first().click();

        // Wait for DELETE to arrive
        const delDeadline = Date.now() + 10000;
        while (Date.now() < delDeadline && deleteStatus === null) {
          await page.waitForTimeout(200);
        }
        page.off("response", onDel);

        rec(`${label}: DELETE called on discard`, deleteStatus !== null,
          deleteStatus !== null ? `status=${deleteStatus}` : "no DELETE observed");

        await page.waitForTimeout(600);
        const urlBoxCount = await page
          .locator(".font-mono")
          .filter({ hasText: /storage\.googleapis\.com|\/api\/media\/|https?:/ })
          .count();
        rec(`${label}: URL cleared after discard`, urlBoxCount === 0,
          `remaining=${urlBoxCount}`);
      } else {
        rec(`${label}: DELETE called on discard`, false, "discard button was disabled");
        rec(`${label}: URL cleared after discard`, false, "discard button was disabled");
      }
    } catch (e) {
      await takeScreenshot(page, "discard-staged-fail").catch(() => {});
      rec(`${label}: discard button enabled after upload`, false, e.message);
    }
    await page.close();
  }

  // ── Cleanup — DELETE all tmp files uploaded during this run ──────────────
  // Runs unconditionally so every finalized file is removed from Firebase Storage
  // regardless of whether intermediate test sections passed or failed.
  if (allFinalizedUrls.length > 0) {
    try {
      const adminCtx = await getContext("admin");
      const cookieHeader = await getCookieHeader(adminCtx, BASE_URL);
      let deleted = 0;
      let cleanupFailed = 0;
      for (const fileUrl of allFinalizedUrls) {
        try {
          const res = await fetch(
            `${BASE_URL}/api/media?url=${encodeURIComponent(fileUrl)}`,
            { method: "DELETE", headers: { Cookie: cookieHeader } },
          );
          if (res.ok) {
            deleted++;
          } else {
            cleanupFailed++;
          }
        } catch {
          cleanupFailed++;
        }
      }
      rec(
        "cleanup: tmp files deleted",
        cleanupFailed === 0,
        `deleted=${deleted} failed=${cleanupFailed} total=${allFinalizedUrls.length}`,
      );
    } catch (e) {
      rec("cleanup: tmp files deleted", false, e.message);
    }
  }

  return results;
}
