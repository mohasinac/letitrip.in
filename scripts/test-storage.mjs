#!/usr/bin/env node
/**
 * test-storage.mjs — Firebase Storage diagnostic script
 *
 * Tests the full upload flow: Admin SDK init → bucket access → signed URL
 * generation → PUT upload → finalize (metadata read + magic-byte check) → cleanup.
 *
 * Usage:
 *   node scripts/test-storage.mjs
 *
 * Requires .env.local to be loaded (uses dotenv).
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Load .env.local ──────────────────────────────────────────────────
const envPath = resolve(ROOT, ".env.local");
if (!existsSync(envPath)) {
  console.error("❌ .env.local not found at", envPath);
  process.exit(1);
}
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx < 0) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let val = trimmed.slice(eqIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = val;
}

const results = [];
function pass(label, detail) {
  results.push({ label, status: "✅", detail });
  console.log(`  ✅ ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, detail) {
  results.push({ label, status: "❌", detail });
  console.error(`  ❌ ${label}${detail ? ` — ${detail}` : ""}`);
}
function warn(label, detail) {
  results.push({ label, status: "⚠️", detail });
  console.warn(`  ⚠️  ${label}${detail ? ` — ${detail}` : ""}`);
}

console.log("\n🔍 Firebase Storage Diagnostic\n");

// ── Step 1: Check env vars ───────────────────────────────────────────
console.log("Step 1: Environment variables");
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const bucketName = process.env.FIREBASE_ADMIN_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (projectId) pass("FIREBASE_ADMIN_PROJECT_ID", projectId);
else fail("FIREBASE_ADMIN_PROJECT_ID", "missing");

if (privateKey) pass("FIREBASE_ADMIN_PRIVATE_KEY", `${privateKey.length} chars`);
else fail("FIREBASE_ADMIN_PRIVATE_KEY", "missing");

if (clientEmail) pass("FIREBASE_ADMIN_CLIENT_EMAIL", clientEmail);
else warn("FIREBASE_ADMIN_CLIENT_EMAIL", "missing (may use ADC)");

if (bucketName) pass("Storage bucket", bucketName);
else fail("Storage bucket", "neither FIREBASE_ADMIN_STORAGE_BUCKET nor NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET set");

if (!projectId || !privateKey || !bucketName) {
  console.error("\n❌ Cannot proceed — missing required env vars.\n");
  process.exit(1);
}

// ── Step 2: Init Admin SDK ───────────────────────────────────────────
console.log("\nStep 2: Firebase Admin SDK initialization");
let adminApp, adminStorage;
try {
  const { initializeApp, getApps, cert } = await import("firebase-admin/app");
  const { getStorage } = await import("firebase-admin/storage");
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId,
        privateKey: privateKey.replace(/\\n/g, "\n"),
        clientEmail,
      }),
    });
  }
  adminStorage = getStorage;
  pass("Admin SDK initialized");
} catch (err) {
  fail("Admin SDK init", err.message);
  process.exit(1);
}

// ── Step 3: Bucket access ────────────────────────────────────────────
console.log("\nStep 3: Bucket access");
let bucket;
try {
  const storage = adminStorage();
  bucket = storage.bucket(bucketName);
  const [exists] = await bucket.exists();
  if (exists) pass("Bucket exists", bucketName);
  else fail("Bucket does not exist", bucketName);
} catch (err) {
  fail("Bucket access", err.message);
  process.exit(1);
}

// ── Step 4: Signed URL generation ────────────────────────────────────
console.log("\nStep 4: Signed URL generation (v4 PUT)");
const testPath = `tmp/test-storage-diagnostic/${Date.now()}.txt`;
let uploadUrl;
try {
  const fileRef = bucket.file(testPath);
  const [url] = await fileRef.getSignedUrl({
    version: "v4",
    action: "write",
    contentType: "text/plain",
    expires: Date.now() + 15 * 60 * 1000,
  });
  uploadUrl = url;
  pass("Signed PUT URL generated", `${url.slice(0, 80)}...`);
} catch (err) {
  fail("Signed URL generation", err.message);
  if (err.message.includes("Could not load the default credentials") ||
      err.message.includes("Permission") ||
      err.message.includes("iam.serviceAccounts.signBlob")) {
    console.error("\n  💡 The service account may need 'Service Account Token Creator' role");
    console.error("     to generate signed URLs. Run:");
    console.error(`     gcloud projects add-iam-policy-binding ${projectId} \\`);
    console.error(`       --member="serviceAccount:${clientEmail}" \\`);
    console.error("       --role='roles/iam.serviceAccountTokenCreator'\n");
  }
  process.exit(1);
}

// ── Step 5: Upload via signed URL ────────────────────────────────────
console.log("\nStep 5: PUT upload via signed URL");
const testContent = `test-storage-diagnostic ${new Date().toISOString()}`;
try {
  const resp = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: testContent,
  });
  if (resp.ok) {
    pass("PUT upload succeeded", `HTTP ${resp.status}`);
  } else {
    const body = await resp.text();
    fail("PUT upload failed", `HTTP ${resp.status}: ${body.slice(0, 200)}`);
    if (resp.status === 403 || body.includes("CORS") || body.includes("No 'Access-Control-Allow-Origin'")) {
      console.error("\n  💡 This is likely a CORS issue. Run:");
      console.error("     node scripts/test-storage.mjs --fix-cors\n");
    }
  }
} catch (err) {
  fail("PUT upload", err.message);
  if (err.message.includes("fetch") || err.message.includes("network")) {
    warn("Network issue", "Check if the GCS endpoint is reachable");
  }
}

// ── Step 6: Verify uploaded object ───────────────────────────────────
console.log("\nStep 6: Verify uploaded object");
try {
  const fileRef = bucket.file(testPath);
  const [exists] = await fileRef.exists();
  if (exists) {
    const [metadata] = await fileRef.getMetadata();
    pass("Object exists in bucket", `size=${metadata.size}, type=${metadata.contentType}`);
  } else {
    fail("Object not found after upload");
  }
} catch (err) {
  fail("Object verification", err.message);
}

// ── Step 7: Read back content ────────────────────────────────────────
console.log("\nStep 7: Read back content (Admin SDK stream)");
try {
  const fileRef = bucket.file(testPath);
  const chunks = [];
  await new Promise((resolve, reject) => {
    const stream = fileRef.createReadStream();
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", resolve);
    stream.on("error", reject);
  });
  const content = Buffer.concat(chunks).toString("utf-8");
  if (content === testContent) {
    pass("Content matches", `${content.length} bytes`);
  } else {
    fail("Content mismatch", `expected ${testContent.length}B, got ${content.length}B`);
  }
} catch (err) {
  fail("Read stream", err.message);
}

// ── Step 8: Cleanup ──────────────────────────────────────────────────
console.log("\nStep 8: Cleanup test object");
try {
  await bucket.file(testPath).delete({ ignoreNotFound: true });
  pass("Test object deleted", testPath);
} catch (err) {
  warn("Cleanup failed (non-fatal)", err.message);
}

// ── Step 9: CORS check ──────────────────────────────────────────────
console.log("\nStep 9: CORS configuration check");
try {
  const [corsConfig] = await bucket.getCorsConfiguration();
  if (corsConfig && corsConfig.length > 0) {
    const hasOrigins = corsConfig.some(r => r.origin && r.origin.length > 0);
    const hasPut = corsConfig.some(r => r.method && r.method.some(m => m.toUpperCase() === "PUT"));
    if (hasOrigins && hasPut) {
      pass("CORS configured", `${corsConfig.length} rule(s), origins: ${corsConfig.flatMap(r => r.origin || []).join(", ")}`);
    } else if (!hasPut) {
      warn("CORS missing PUT method", "Signed URL uploads will fail from the browser");
    } else {
      warn("CORS has no origins", "May block browser requests");
    }
  } else {
    warn("No CORS rules found", "Browser uploads via signed URLs will be blocked");
    console.error("  💡 Run: node scripts/test-storage.mjs --fix-cors");
  }
} catch (err) {
  if (err.message.includes("getCorsConfiguration")) {
    warn("CORS check not available via Admin SDK", "Use gsutil or the GCS console to verify CORS");
  } else {
    warn("CORS check failed", err.message);
  }
}

// ── Fix CORS (if --fix-cors flag) ────────────────────────────────────
if (process.argv.includes("--fix-cors")) {
  console.log("\n🔧 Applying CORS configuration...");
  const corsRules = [
    {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://letitrip.in",
        "https://www.letitrip.in",
        "https://letitrip-in-app.vercel.app",
      ],
      method: ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
      responseHeader: [
        "Content-Type",
        "Content-Length",
        "Content-Range",
        "x-goog-resumable",
        "x-goog-content-length-range",
      ],
      maxAgeSeconds: 3600,
    },
  ];
  try {
    await bucket.setCorsConfiguration(corsRules);
    pass("CORS rules applied", `${corsRules[0].origin.length} origins, ${corsRules[0].method.length} methods`);
  } catch (err) {
    fail("CORS fix failed", err.message);
    console.error("\n  💡 If the SDK method is unavailable, create cors.json and run:");
    console.error(`     gsutil cors set cors.json gs://${bucketName}\n`);
  }
}

// ── Summary ──────────────────────────────────────────────────────────
console.log("\n" + "─".repeat(60));
const passed = results.filter(r => r.status === "✅").length;
const failed = results.filter(r => r.status === "❌").length;
const warned = results.filter(r => r.status === "⚠️").length;
console.log(`\n  ${passed} passed, ${failed} failed, ${warned} warnings\n`);

if (failed > 0) {
  console.log("❌ Storage diagnostic FAILED — fix the issues above.\n");
  process.exit(1);
} else if (warned > 0) {
  console.log("⚠️  Storage diagnostic PASSED with warnings.\n");
} else {
  console.log("✅ Storage diagnostic PASSED — all checks green.\n");
}
