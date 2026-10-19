import { db } from "./tmp-diag-cat.mjs";
const s = await db.collection("products").where("listingType","==","standard").limit(6).select("slug","mainImage").get();
for (const d of s.docs) console.log(d.id, "|", d.data().mainImage);
process.exit(0);
