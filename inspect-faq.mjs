import admin from "firebase-admin";
import { readFileSync } from "fs";
const sa = JSON.parse(readFileSync("./firebase-admin-key.json", "utf8"));
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const db = admin.firestore();

const section = await db.doc("homepageSections/section-homepage-faq").get();
console.log("SECTION exists:", section.exists);
if (section.exists) {
  const d = section.data();
  console.log("  enabled:", d.enabled, "type:", d.type, "order:", d.order);
  console.log("  config:", JSON.stringify(d.config));
}

const snap = await db.collection("faqs")
  .where("showOnHomepage", "==", true)
  .where("isActive", "==", true)
  .orderBy("priority", "desc")
  .get();
console.log("\nFAQ query (showOnHomepage==true & isActive==true, order priority desc):", snap.size, "docs");
snap.docs.slice(0, 5).forEach(d => {
  const x = d.data();
  console.log("  -", d.id, "| priority:", x.priority, "| category:", x.category, "| isActive:", x.isActive, "| showOnHomepage:", x.showOnHomepage);
});

const all = await db.collection("faqs").where("showOnHomepage", "==", true).get();
console.log("\nFAQs with showOnHomepage==true (no isActive filter):", all.size);
all.docs.forEach(d => {
  const x = d.data();
  console.log("  -", d.id, "isActive:", x.isActive, "priority:", x.priority);
});

process.exit(0);
