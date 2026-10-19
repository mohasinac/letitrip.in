import { db } from "./tmp-diag-cat.mjs";
const CAT = "category-original-plastic-gen";
const s = await db.collection("products")
  .where("categorySlugs", "array-contains", CAT)
  .get();
console.log("products tagged with", CAT, "=", s.size);
for (const d of s.docs) {
  const p = d.data();
  console.log("---", d.id);
  console.log("   listingType:", p.listingType, "| status:", p.status, "| isSold:", p.isSold, "| stockQuantity:", p.stockQuantity, "| isTestData:", p.isTestData);
  console.log("   prizeRevealStatus:", p.prizeRevealStatus, "| prizeDrawMode:", p.prizeDrawMode, "| entriesSold:", p.entriesSold, "| totalEntries:", p.totalEntries);
  console.log("   categorySlugs:", JSON.stringify(p.categorySlugs));
}
process.exit(0);
