import { db } from "./tmp-diag-cat.mjs";
for (const name of ["Dranzer S", "Dranzer S (A-5)"]) {
  const s = await db.collection("categories").where("name", "==", name).get();
  console.log(`"${name}" -> ${s.size}`);
  for (const d of s.docs) {
    const x = d.data();
    console.log("  ", d.id, "| tier", x.tier, "| parents", JSON.stringify(x.parentIds), "| isLeaf", x.isLeaf, "| type", x.categoryType ?? "(none)");
  }
}
process.exit(0);
