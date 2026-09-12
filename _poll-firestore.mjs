import { spawnSync } from "node:child_process";
const started = Date.now();
for (let i = 1; i <= 20; i++) {
  const r = spawnSync("npx", ["appkit-seed", "status", "--collections", "categories"], {
    encoding: "utf8", shell: true,
  });
  const out = (r.stdout || "") + (r.stderr || "");
  const exhausted = /RESOURCE_EXHAUSTED/.test(out);
  const mins = ((Date.now() - started) / 60000).toFixed(1);
  const line = (out.split(/\r?\n/).find((l) => /categories\s+\d+/.test(l)) || "").trim();
  console.log(`[${mins}m] attempt ${i}: ${exhausted ? "STILL EXHAUSTED" : "OK"} | ${line}`);
  if (!exhausted) { console.log("RECOVERED"); process.exit(0); }
  await new Promise((res) => setTimeout(res, 60_000));
}
console.log("STILL FAILING after 20 attempts");
process.exit(1);
