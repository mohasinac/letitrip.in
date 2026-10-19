import { db } from "./tmp-diag-cat.mjs";
const s = await db.collection("products").where("listingType", "==", "pre-order").get();
console.log("pre-orders:", s.size);
let noMain = 0, noImages = 0;
for (const d of s.docs) {
  const p = d.data();
  const imgs = p.images;
  const shape = Array.isArray(imgs) ? (imgs.length ? typeof imgs[0] : "empty[]") : typeof imgs;
  const first = Array.isArray(imgs) && imgs.length ? JSON.stringify(imgs[0]).slice(0, 110) : "-";
  if (!p.mainImage) noMain++;
  if (!Array.isArray(imgs) || imgs.length === 0) noImages++;
  console.log("---", d.id);
  console.log("   mainImage:", p.mainImage ?? "(none)");
  console.log("   images:", shape, "len", Array.isArray(imgs) ? imgs.length : "-", "| first:", first);
}
console.log(`\nmissing mainImage: ${noMain}/${s.size}  |  missing images[]: ${noImages}/${s.size}`);
process.exit(0);
