#!/usr/bin/env node
// Spawns `next dev` and on exit kills the entire process tree (Windows-safe).
import { spawn, spawnSync } from "child_process";

const child = spawn("node", ["node_modules/next/dist/bin/next", "dev", "--webpack"], {
  stdio: "inherit",
  env: { ...process.env },
  shell: false,
});

function killTree() {
  if (child.pid) {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  }
}

process.on("SIGINT", killTree);
process.on("SIGTERM", killTree);

child.on("exit", (code) => {
  killTree();
  process.exit(code ?? 0);
});
