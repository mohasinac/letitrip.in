import { db } from "./tmp-diag-cat.mjs";
// Which categories list sublisting-dranzer-s-a-5 as a child?
const kids = await db.collection("categories").where("parentIds", "array-contains", "category-original-plastic-gen").get();
console.log("children of category-original-plastic-gen:", kids.size);
for (const d of kids.docs) console.log("  ", d.id, "|", d.data().name, "| tier", d.data().tier);
process.exit(0);
