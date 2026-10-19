import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
const BS = String.fromCharCode(92);
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const t = line.trim(); if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("="); if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  if (!(k in process.env)) process.env[k] = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
}
const require = createRequire(import.meta.url);
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.split(BS + "n").join("\n"),
  }),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
});
const bucket = admin.storage().bucket();
console.log("bucket:", bucket.name);
const db = admin.firestore();
const prods = await db.collection("products").select("mainImage").get();
const slugs = new Set();
for (const d of prods.docs) {
  const m = d.data().mainImage;
  if (typeof m === "string" && m.startsWith("/media/")) slugs.add(m.slice(7));
}
for (const slug of slugs) {
  const doc = await db.collection("mediaAssets").doc(slug).get();
  if (!doc.exists) { console.log("MISSING mediaAssets row:", slug); continue; }
  const path = doc.data().storagePath;
  const [exists] = await bucket.file(path).exists();
  console.log(exists ? "ok     " : "MISSING", slug, "->", path);
}
process.exit(0);
