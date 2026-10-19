import { db } from "./tmp-diag-cat.mjs";
const s = await db.collection("products").where("listingType","==","prize-draw").limit(3).get();
for (const d of s.docs) {
  const it = d.data().prizeDrawItems;
  console.log(d.id, "items:", Array.isArray(it) ? it.length : "none", "| first images:", JSON.stringify(it?.[0]?.images)?.slice(0,120));
}
process.exit(0);
