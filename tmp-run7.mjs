import { db } from "./tmp-diag-cat.mjs";
const types = ["standard","auction","pre-order","prize-draw","classified","digital-code","live","art","stickers"];
for (const t of types) {
  const s = await db.collection("products").where("listingType", "==", t).limit(300).get();
  let str = 0, obj = 0, none = 0;
  for (const d of s.docs) {
    const im = d.data().images;
    if (!Array.isArray(im) || im.length === 0) { none++; continue; }
    if (typeof im[0] === "string") str++; else obj++;
  }
  console.log(`${t.padEnd(13)} n=${String(s.size).padEnd(5)} string[]=${String(str).padEnd(5)} object[]=${String(obj).padEnd(5)} empty=${none}`);
}
process.exit(0);
