#!/usr/bin/env node
/**
 * test-storage-upload.mjs — S-STORE-3-E
 *
 * Verifies the end-to-end media upload flow against a running dev or staging server:
 *   1. POST /api/media/signed-url → receives upload URL + slug
 *   2. PUT the bytes to the signed URL
 *   3. POST /api/media/finalize → confirms slug + returns public URL
 *
 * Usage:
 *   node scripts/test-storage-upload.mjs --base http://localhost:3000 --token <auth>
 *
 * Exit codes:
 *   0  all steps succeeded
 *   1  signed-URL request failed
 *   2  upload PUT failed
 *   3  finalize failed
 *   4  public URL fetch failed
 */

import { argv, exit } from "node:process";
import { readFile } from "node:fs/promises";

function arg(name, fallback) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : fallback;
}

const BASE = arg("base", process.env.BASE_URL ?? "http://localhost:3000");
const TOKEN = arg("token", process.env.AUTH_TOKEN ?? "");
const FILE = arg("file", "");
const CONTEXT_TYPE = arg("context", "product-image");
const SLUG = arg("slug", `test-${Date.now()}`);

async function main() {
  const headers = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};

  // Step 1 — signed URL
  console.log(`[1/4] POST ${BASE}/api/media/signed-url`);
  const signedRes = await fetch(`${BASE}/api/media/signed-url`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      contextType: CONTEXT_TYPE,
      slug: SLUG,
      contentType: "image/png",
    }),
  });
  if (!signedRes.ok) {
    console.error("signed-url failed:", signedRes.status, await signedRes.text());
    exit(1);
  }
  const signed = await signedRes.json();
  console.log("  → slug:", signed?.data?.slug ?? signed?.slug);

  // Step 2 — PUT bytes
  console.log(`[2/4] PUT ${signed?.data?.uploadUrl?.slice(0, 60) ?? "<no uploadUrl>"}…`);
  const bytes = FILE
    ? await readFile(FILE)
    : Buffer.from(
        // 1x1 transparent PNG
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        "base64",
      );
  const putRes = await fetch(signed?.data?.uploadUrl ?? signed?.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/png" },
    body: bytes,
  });
  if (!putRes.ok) {
    console.error("upload PUT failed:", putRes.status, await putRes.text());
    exit(2);
  }

  // Step 3 — finalize
  console.log(`[3/4] POST ${BASE}/api/media/finalize`);
  const finalRes = await fetch(`${BASE}/api/media/finalize`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ slug: signed?.data?.slug ?? signed?.slug }),
  });
  if (!finalRes.ok) {
    console.error("finalize failed:", finalRes.status, await finalRes.text());
    exit(3);
  }
  const final = await finalRes.json();
  console.log("  → publicUrl:", final?.data?.publicUrl ?? final?.publicUrl);

  // Step 4 — read back via media proxy
  const publicUrl = final?.data?.publicUrl ?? final?.publicUrl;
  if (publicUrl) {
    console.log(`[4/4] GET ${publicUrl}`);
    const fetched = await fetch(publicUrl.startsWith("http") ? publicUrl : `${BASE}${publicUrl}`);
    if (!fetched.ok) {
      console.error("public URL fetch failed:", fetched.status);
      exit(4);
    }
    console.log("  → bytes:", (await fetched.arrayBuffer()).byteLength);
  }

  console.log("\n✅ Storage upload flow verified");
}

main().catch((err) => {
  console.error(err);
  exit(1);
});
