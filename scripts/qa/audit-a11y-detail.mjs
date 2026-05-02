#!/usr/bin/env node
// Quick a11y detail report — starts dev server if needed
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForServer(url, ms = 90_000) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    try { const r = await fetch(url); if (r.status < 500) return; } catch {}
    await sleep(1000);
  }
  throw new Error("Server not ready");
}
function killTree(p) {
  if (!p?.pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(p.pid), "/T", "/F"], { stdio: "ignore" });
  else p.kill("SIGTERM");
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AXE_SCRIPT = readFileSync(path.join(__dirname, "../../node_modules/axe-core/axe.min.js"), "utf-8");

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const ROOT = path.join(__dirname, "../..");

// Start server if not reachable
let serverProc = null;
try { await fetch(`${BASE}/en`); } catch {
  console.log("Starting dev server...");
  serverProc = spawn("npx", ["next", "dev", "--port", "3000"], { stdio: "pipe", cwd: ROOT, shell: true });
  await waitForServer(`${BASE}/en`);
  console.log("Server ready.\n");
}

const pages = [
  { path: "/en", name: "home" },
  { path: "/en/products", name: "products" },
  { path: "/en/blog", name: "blog" },
  { path: "/en/contact", name: "contact" },
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

for (const { path: p, name } of pages) {
  await page.goto(`${BASE}${p}`, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.addScriptTag({ content: AXE_SCRIPT });

  const violations = await page.evaluate(async () => {
    const results = await window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    });
    return results.violations
      .filter((v) => v.impact === "critical" || v.impact === "serious")
      .map((v) => ({
        id: v.id,
        impact: v.impact,
        desc: v.description,
        help: v.helpUrl,
        nodes: v.nodes.slice(0, 3).map((n) => ({
          html: n.html.slice(0, 200),
          target: n.target,
          failureSummary: n.failureSummary,
        })),
      }));
  });

  if (violations.length === 0) {
    console.log(`\n[${name}] ✓ no critical/serious violations`);
    continue;
  }

  console.log(`\n[${name}] ${violations.length} critical/serious violations:`);
  for (const v of violations) {
    console.log(`\n  Rule: ${v.id} (${v.impact})`);
    console.log(`  Desc: ${v.desc}`);
    for (const n of v.nodes) {
      console.log(`  HTML: ${n.html}`);
      console.log(`  Target: ${JSON.stringify(n.target)}`);
      console.log(`  Fix: ${n.failureSummary?.split("\n")[0]}`);
    }
  }
}

await browser.close();
if (serverProc) killTree(serverProc);
