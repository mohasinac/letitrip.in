import { db } from "./tmp-diag-cat.mjs";
const slug = "product-customize-set-c-cx-20-image";
const doc = await db.collection("mediaAssets").doc(slug).get();
console.log("mediaAssets/" + slug, "exists:", doc.exists);
if (doc.exists) console.log(JSON.stringify(doc.data(), null, 2).slice(0, 600));
const all = await db.collection("mediaAssets").count().get();
console.log("mediaAssets total docs:", all.data().count);
// how many products reference a /media/ slug that may not exist
const prods = await db.collection("products").select("mainImage").get();
const refs = new Set();
for (const d of prods.docs) {
  const m = d.data().mainImage;
  if (typeof m === "string" && m.startsWith("/media/")) refs.add(m.slice("/media/".length));
}
console.log("distinct /media/ slugs referenced by product.mainImage:", refs.size);
process.exit(0);
