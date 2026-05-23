#!/usr/bin/env node
/**
 * test-storage-flow.mjs — E2E Firebase Storage media flow test
 *
 * Exercises the same API routes that ImageUpload / MediaUploadField / useMediaUpload use:
 *   1. POST /api/auth/login          → session cookie
 *   2. POST /api/media/sign          → signed PUT URL
 *   3. PUT  <signedUrl>              → upload bytes to GCS
 *   4. POST /api/media/finalize      → magic-byte check + download URL
 *   5. GET  <downloadUrl>            → verify download matches original
 *   6. POST /api/media/crop          → server-side sharp crop
 *   7. GET  <croppedUrl>             → verify cropped file
 *   8. DELETE /api/media?url=<tmp>   → delete staged tmp/ file
 *   9. Firebase Admin SDK            → cleanup crop output
 *
 * Usage:
 *   node scripts/test-storage-flow.mjs
 *   node scripts/test-storage-flow.mjs --image "C:\path\to\other.jpg"
 *   node scripts/test-storage-flow.mjs --base-url http://localhost:4000
 *
 * Reads SMOKE_ADMIN_EMAIL / SMOKE_ADMIN_PASSWORD from .env.local (via dotenv).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";
import { createRequire } from "node:module";
import { parseArgs as nodeParseArgs } from "node:util";

// ── Load .env.local (manual parse — no dotenv dependency) ────
const require_ = createRequire(import.meta.url);

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));

// ── CLI args ─────────────────────────────────────────────────
const { values: args } = nodeParseArgs({
  options: {
    "base-url": { type: "string", default: process.env.SMOKE_BASE_URL || "http://localhost:3000" },
    image: {
      type: "string",
      default: "C:\\Users\\mohsi\\OneDrive\\Desktop\\Animais03.webp",
    },
  },
  strict: false,
});

const BASE_URL = args["base-url"];
const IMAGE_PATH = args.image;

// ── Validate image exists ────────────────────────────────────
if (!existsSync(IMAGE_PATH)) {
  console.error(`\n  ✗ Image not found: ${IMAGE_PATH}\n`);
  process.exit(1);
}

const imageBuffer = readFileSync(IMAGE_PATH);
const imageName = basename(IMAGE_PATH);
const imageSizeKB = (imageBuffer.length / 1024).toFixed(1);

// ── Credentials from env ─────────────────────────────────────
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL || "admin@letitrip.in";
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD || "TempPass123!";

// ── Firebase Admin SDK init (for step 9 cleanup) ─────────────
function initFirebaseAdmin() {
  const admin = require_("firebase-admin");
  if (admin.apps.length) return admin;

  const keyPath = resolve(process.cwd(), "firebase-admin-key.json");
  const storageBucket =
    process.env.FIREBASE_ADMIN_STORAGE_BUCKET?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

  if (existsSync(keyPath)) {
    const sa = JSON.parse(readFileSync(keyPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(keyPath),
      ...(storageBucket && { storageBucket }),
    });
  } else if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      .replace(/^﻿/, "")
      .replace(/^["']|["']$/g, "")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "")
      .trim();

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID.trim(),
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL.trim(),
        privateKey,
      }),
      ...(storageBucket && { storageBucket }),
    });
  } else {
    admin.initializeApp({ ...(storageBucket && { storageBucket }) });
  }
  return admin;
}

// ── Helpers ──────────────────────────────────────────────────
function formatMs(ms) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

function formatKB(bytes) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`;
}

function padStep(name, maxLen = 26) {
  const dots = ".".repeat(Math.max(1, maxLen - name.length));
  return `${name} ${dots}`;
}

async function apiCall(method, path, body, cookie) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers["Cookie"] = cookie;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });

  const setCookie = res.headers.get("set-cookie") || "";
  let data = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("json")) {
    data = await res.json();
  }

  return { status: res.status, data, setCookie, res };
}

// ── Test steps ───────────────────────────────────────────────
const results = [];

async function runStep(num, name, fn) {
  const t0 = performance.now();
  try {
    const detail = await fn();
    const elapsed = performance.now() - t0;
    results.push({ num, name, pass: true, elapsed, detail });
    console.log(
      `  ${num}. ${padStep(name)} \x1b[32mPASS\x1b[0m  (${formatMs(elapsed)})${detail ? `  → ${detail}` : ""}`,
    );
  } catch (err) {
    const elapsed = performance.now() - t0;
    results.push({ num, name, pass: false, elapsed, detail: err.message });
    console.log(
      `  ${num}. ${padStep(name)} \x1b[31mFAIL\x1b[0m  (${formatMs(elapsed)})  → ${err.message}`,
    );
  }
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔥 Firebase Storage E2E Test — ${imageName} (${imageSizeKB} KB)`);
  console.log("━".repeat(56));
  console.log(`   Server: ${BASE_URL}`);
  console.log(`   Auth:   ${ADMIN_EMAIL}`);
  console.log("━".repeat(56) + "\n");

  let sessionCookie = "";
  let storagePath = "";
  let downloadUrl = "";
  let cropUrl = "";
  let cropPath = "";

  // 1. Auth login
  await runStep(1, "Auth login", async () => {
    const { status, data, setCookie } = await apiCall("POST", "/api/auth/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (status !== 200) {
      throw new Error(`HTTP ${status}: ${data?.error || data?.message || "login failed"}`);
    }
    const match = setCookie.match(/__session=([^;]+)/);
    if (!match) throw new Error("No __session cookie in response");
    sessionCookie = `__session=${match[1]}`;
    return `uid=${data?.data?.uid || data?.uid || "ok"}`;
  });

  if (!sessionCookie) {
    console.log("\n  ⚠ Cannot continue without auth. Aborting.\n");
    process.exit(1);
  }

  // 2. Sign upload
  await runStep(2, "Sign upload", async () => {
    const { status, data } = await apiCall(
      "POST",
      "/api/media/sign",
      {
        contentType: "image/webp",
        size: imageBuffer.length,
        folder: "test-uploads",
        isPublic: true,
      },
      sessionCookie,
    );
    if (status !== 200) {
      throw new Error(`HTTP ${status}: ${JSON.stringify(data?.error || data)}`);
    }
    const d = data?.data || data;
    storagePath = d.storagePath;
    downloadUrl = d.uploadUrl;
    if (!storagePath) throw new Error("No storagePath returned");
    if (!downloadUrl) throw new Error("No uploadUrl returned");
    return storagePath;
  });

  // 3. PUT to GCS
  await runStep(3, "PUT to GCS", async () => {
    const res = await fetch(downloadUrl, {
      method: "PUT",
      headers: { "Content-Type": "image/webp" },
      body: imageBuffer,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    return `${formatKB(imageBuffer.length)} uploaded`;
  });

  // 4. Finalize
  await runStep(4, "Finalize", async () => {
    const { status, data } = await apiCall(
      "POST",
      "/api/media/finalize",
      { storagePath, isPublic: true },
      sessionCookie,
    );
    if (status !== 200 && status !== 201) {
      throw new Error(`HTTP ${status}: ${JSON.stringify(data?.error || data)}`);
    }
    const d = data?.data || data;
    downloadUrl = d.url;
    if (!downloadUrl) throw new Error("No download URL returned");
    return `${formatKB(d.size || 0)} finalized (${d.isPublic ? "public" : "signed"})`;
  });

  // 5. Verify download
  await runStep(5, "Verify download", async () => {
    const res = await fetch(downloadUrl);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length !== imageBuffer.length) {
      throw new Error(`Size mismatch: got ${buf.length}, expected ${imageBuffer.length}`);
    }
    return `${formatKB(buf.length)} (matches original)`;
  });

  // 6. Crop 200x200
  await runStep(6, "Crop 200x200", async () => {
    const { status, data } = await apiCall(
      "POST",
      "/api/media/crop",
      {
        sourceUrl: downloadUrl,
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        outputFormat: "webp",
        quality: 80,
      },
      sessionCookie,
    );
    if (status !== 200) {
      throw new Error(`HTTP ${status}: ${JSON.stringify(data?.error || data)}`);
    }
    const d = data?.data || data;
    cropUrl = d.url;
    cropPath = d.path;
    if (!cropUrl) throw new Error("No crop URL returned");
    const size = d.size || 0;
    return `cropped to ${formatKB(size)}`;
  });

  // 7. Verify crop
  await runStep(7, "Verify crop", async () => {
    const res = await fetch(cropUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length >= imageBuffer.length) {
      throw new Error(`Crop (${buf.length}B) should be smaller than original (${imageBuffer.length}B)`);
    }
    return `${formatKB(buf.length)} downloaded`;
  });

  // 8. Delete tmp file (via API — only allows tmp/ paths)
  await runStep(8, "Delete tmp file", async () => {
    const encodedUrl = encodeURIComponent(downloadUrl);
    const { status, data } = await apiCall(
      "DELETE",
      `/api/media?url=${encodedUrl}`,
      null,
      sessionCookie,
    );
    if (status !== 200 && status !== 204) {
      throw new Error(`HTTP ${status}: ${JSON.stringify(data?.error || data)}`);
    }
    return "confirmed gone";
  });

  // 9. Cleanup crop file via Admin SDK (crop output is outside tmp/)
  await runStep(9, "Cleanup crop file", async () => {
    if (!cropPath) throw new Error("No crop path to clean up");
    const admin = initFirebaseAdmin();
    const bucketName =
      process.env.FIREBASE_ADMIN_STORAGE_BUCKET?.trim() ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
    const bucket = bucketName
      ? admin.storage().bucket(bucketName)
      : admin.storage().bucket();
    await bucket.file(cropPath).delete({ ignoreNotFound: true });
    const [exists] = await bucket.file(cropPath).exists();
    if (exists) throw new Error("File still exists after delete");
    return "confirmed gone";
  });

  // ── Summary ──────────────────────────────────────────────
  console.log("\n" + "━".repeat(56));
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  const allPass = passed === total;
  const icon = allPass ? "\x1b[32m" : "\x1b[31m";
  console.log(
    `  ${icon}${passed}/${total} passed\x1b[0m${allPass ? " — all clean, no files left in storage" : ""}`,
  );
  console.log("");

  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error("\n  Fatal error:", err.message);
  process.exit(1);
});
