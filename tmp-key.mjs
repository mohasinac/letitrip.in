import { readFileSync } from "node:fs";
const raw = readFileSync(".env.local", "utf8");
const l = raw.split("\n").find((x) => x.startsWith("FIREBASE_ADMIN_PRIVATE_KEY"));
const v = l.trim().slice("FIREBASE_ADMIN_PRIVATE_KEY=".length).trim().replace(/^["']|["']$/g, "");
const BS = String.fromCharCode(92);
console.log("backslashes:", v.split(BS).length - 1);
console.log("first 60:", JSON.stringify(v.slice(0, 60)));
const fixed = v.split(BS + "n").join("\n");
console.log("after join newlines:", (fixed.match(/\n/g) || []).length);
