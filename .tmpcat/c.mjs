import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
globalThis.require = require; globalThis.module = { require };
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(process.cwd(), true, { info(){}, error: console.error });
const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert({
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY||"").replace(/\n/g,"\n"),
})});
const db=admin.firestore();
const cats=(await db.collection("categories").get()).docs.map(d=>({id:d.id,...d.data()}));
const by={};
for(const c of cats){const k=c.categoryType??"(none)";(by[k]=by[k]||[]).push(c);}
for(const [k,v] of Object.entries(by)) console.log(`${String(v.length).padStart(5)}  categoryType=${k}`);
console.log("\n--- categoryType=bundle ---");
(by.bundle||[]).forEach(c=>console.log(`  ${c.id}  "${c.name}"  members=${(c.bundleProductIds||[]).length}  price=${c.bundlePrice??"-"}  isActive=${c.isActive}`));
console.log("\n--- categoryType=franchise ---");
(by.franchise||[]).forEach(c=>console.log(`  ${c.id}  "${c.name}"  isActive=${c.isActive}`));
