#!/usr/bin/env node
// Kills any process listening on the dev ports (3000–3010) so `npm run dev`
// can start cleanly. Safer than `taskkill /IM node.exe` which would also
// kill the npm process running this script.
import { execSync } from "child_process";

const PORTS = [3000, 3001, 3002, 3003, 3004, 3005];
const isWin = process.platform === "win32";
const selfPid = process.pid;
const parentPid = process.ppid;

const killed = new Set();

function kill(pid) {
  if (!pid || pid === selfPid || pid === parentPid) return;
  if (killed.has(pid)) return;
  killed.add(pid);
  try {
    if (isWin) execSync(`taskkill /F /PID ${pid} /T`, { stdio: "ignore" });
    else process.kill(pid, "SIGKILL");
  } catch {}
}

for (const port of PORTS) {
  try {
    if (isWin) {
      const out = execSync(`netstat -ano -p tcp | findstr :${port}`, {
        encoding: "utf8",
      });
      for (const line of out.split(/\r?\n/)) {
        const m = line.trim().match(/\s(\d+)$/);
        if (m) kill(Number(m[1]));
      }
    } else {
      const out = execSync(`lsof -ti tcp:${port}`, { encoding: "utf8" });
      for (const pid of out.trim().split(/\s+/)) kill(Number(pid));
    }
  } catch {}
}

if (killed.size) console.log(`[stop-dev] killed ${killed.size} process(es) on dev ports`);
else console.log("[stop-dev] no dev-port processes running");
