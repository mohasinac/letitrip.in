/*
 * The ONE owner of "which OS processes belong to a spawn of this harness, and
 * how to kill them" — the same single-owner argument lib/batch-keys.mjs makes
 * for the filename transform.
 *
 * 🛑 WHY THIS EXISTS: THE HARNESS LEAKS ONE PROCESS PER SPAWN.
 *
 * `@playwright/mcp`'s `setupExitWatchdog` (playwright-core/lib/coreBundle.js)
 * shuts down on stdin close or POSIX signals ONLY. Windows never delivers
 * SIGTERM, so stdin EOF is the sole real trigger — and it is missed whenever
 * `claude` is torn down abruptly, notably the `--max-budget-usd` stop that
 * run.mjs explicitly tolerates as exit 143. `spawnSync` does not reap
 * grandchildren and Node uses no Job Object, so the MCP server survives.
 *
 * Measured: ~1 orphan per claude spawn at ~56 MB PRIVATE COMMIT each. Working
 * set is trimmed by Windows to 0–16 MB, which is why it looked harmless — but
 * commit is what hits the limit. On this machine (27.5 GB commit limit) a
 * 204-batch sweep with no cleanup projects to ~26 GB of orphans and dies around
 * batch 120.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛑 THE ONE THING THAT MUST NOT GO WRONG
 *
 * Every `@playwright/mcp` process on a developer machine may belong to a LIVE
 * Claude Code editor session. Measured 2026-09-07: three such processes, all
 * with a live `claude.exe` parent from the VS Code extension — one of them the
 * session that was writing this file.
 *
 * A "kill all playwright MCP" sweep destroys them. So the predicate is FOUR
 * conjuncts and every one is load-bearing:
 *
 *   1. node.exe whose command line contains "@playwright/mcp"
 *   2. NOT present in the pre-spawn snapshot
 *   3. created at or after the spawn started   (kills PID-reuse ambiguity)
 *   4. its parent is OUR claude pid, OR its parent is gone
 *
 * Conjunct 4 is what spares a session opened MID-sweep: a live editor session's
 * MCP always has a live parent, so it fails 4 even though it passes 1–3. An
 * orphan, by definition, does not.
 *
 * Anything matching (1) but failing (2)–(4) is SPARED and logged. Rising
 * `spared` with flat `killed` is the signature of a predicate that has stopped
 * matching — visible in the transcript rather than silent.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { execFileSync, spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const IS_WIN = process.platform === "win32";

/** The substring that identifies our MCP server, and the browser home. */
const MCP_MARKER = "@playwright/mcp";
const BROWSER_HOME = "\\ms-playwright\\";
const BROWSER_NAMES = new Set(["chrome.exe", "chrome-headless-shell.exe", "headless_shell.exe"]);

/**
 * 🛑 `wmic` DOES NOT EXIST on Windows 11 26200 — it was removed, and it is not
 * on PATH nor at System32\wbem. A sweep built on it enumerates nothing, kills
 * nothing, and reports success: the silent-zero failure this codebase has been
 * bitten by three times. PowerShell CIM is the only enumeration used here, and
 * audit rule R18 blocks `wmic` under tester/scripts/ for the same reason.
 */
function powershell(script) {
  try {
    return execFileSync(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, windowsHide: true },
    );
  } catch {
    return "";
  }
}

/**
 * 🛑 `ConvertTo-Json` collapses a ONE-element array to a bare object. Without
 * the `@(…)` wrapper on the PowerShell side and this guard on the Node side,
 * the sweep silently reclaims nothing whenever exactly one orphan exists —
 * which is the single most likely count.
 */
function parseRows(json) {
  if (!json || !json.trim()) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [v];
  } catch {
    return [];
  }
}

/** Windows CIM datetime (20260907143012.123456+330) → epoch ms. */
function cimDateToMs(s) {
  if (typeof s !== "string" || s.length < 14) return 0;
  const [y, mo, d, h, mi, sec] = [
    s.slice(0, 4), s.slice(4, 6), s.slice(6, 8),
    s.slice(8, 10), s.slice(10, 12), s.slice(12, 14),
  ].map(Number);
  return new Date(y, mo - 1, d, h, mi, sec).getTime();
}

function listMcpProcesses() {
  if (!IS_WIN) {
    const out = spawnSync("ps", ["-eo", "pid,ppid,command"], { encoding: "utf8" });
    return (out.stdout ?? "")
      .split("\n")
      .filter((l) => l.includes(MCP_MARKER))
      .map((l) => {
        const m = l.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/);
        return m ? { ProcessId: Number(m[1]), ParentProcessId: Number(m[2]), CommandLine: m[3], createdMs: 0 } : null;
      })
      .filter(Boolean);
  }
  const rows = parseRows(
    powershell(
      `@(Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ` +
        `Where-Object { $_.CommandLine -like '*${MCP_MARKER}*' } | ` +
        `Select-Object ProcessId,ParentProcessId,CreationDate,` +
        `@{n='PrivMB';e={[math]::Round($_.PrivatePageCount/1MB)}}) | ConvertTo-Json -Compress`,
    ),
  );
  return rows.map((r) => ({ ...r, createdMs: cimDateToMs(String(r.CreationDate ?? "")) }));
}

function livePids() {
  if (!IS_WIN) {
    const out = spawnSync("ps", ["-eo", "pid"], { encoding: "utf8" });
    return new Set((out.stdout ?? "").split("\n").map((l) => Number(l.trim())).filter(Boolean));
  }
  return new Set(
    parseRows(powershell(`@(Get-CimInstance Win32_Process | Select-Object ProcessId) | ConvertTo-Json -Compress`))
      .map((r) => Number(r.ProcessId))
      .filter(Boolean),
  );
}

/** Capture the MCP processes that exist BEFORE a spawn. Conjunct 2's evidence. */
export function snapshotPlaywrightProcesses() {
  const rows = listMcpProcesses();
  return { at: Date.now(), pids: new Set(rows.map((r) => Number(r.ProcessId))), rows };
}

/**
 * 🛑 `/T` IS MANDATORY.
 *
 * Playwright launches the browser from inside the MCP process, so chromium is
 * its child and `/T` takes the whole tree. Killing the node WITHOUT `/T` leaves
 * a chromium tree with a dead parent that nothing can then reach — turning a
 * 56 MB leak into a permanently stranded ~350 MB one. The fix would make the
 * problem worse. Audit R17 asserts every `/PID` carries `/T`.
 */
function killTree(pid) {
  if (IS_WIN) {
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    return;
  }
  try {
    process.kill(-pid, "SIGKILL");
  } catch {
    try {
      process.kill(pid, "SIGKILL");
    } catch {}
  }
}

/**
 * Kill the MCP servers this spawn leaked, and any chromium they stranded.
 *
 * `before` is the snapshot, `ownerPid` the claude pid spawnSync returned, and
 * `since` the millisecond the spawn started. Returns what it killed AND what it
 * deliberately spared, so a predicate that stops matching is visible.
 */
export function sweepPlaywrightOrphans({ before, ownerPid, since, dryRun = false } = {}) {
  const beforePids = before?.pids ?? new Set();
  const startedAt = Number(since ?? before?.at ?? 0);
  const alive = livePids();

  const killed = [];
  const spared = [];
  let reclaimedMb = 0;

  for (const p of listMcpProcesses()) {
    const pid = Number(p.ProcessId);
    const ppid = Number(p.ParentProcessId);
    const priv = Number(p.PrivMB ?? 0);

    // Conjunct 2 — it existed before we spawned, so it is not ours.
    if (beforePids.has(pid)) {
      spared.push({ pid, why: "pre-existing" });
      continue;
    }
    // Conjunct 3 — a pid can be reused; a creation time cannot be faked away.
    if (startedAt && p.createdMs && p.createdMs + 1000 < startedAt) {
      spared.push({ pid, why: "older than this spawn" });
      continue;
    }
    // Conjunct 4 — ours, or nobody's. A LIVE parent that is not our claude pid
    // means somebody else owns it (an editor session opened mid-sweep).
    const parentAlive = alive.has(ppid);
    const isOurs = ownerPid != null && ppid === Number(ownerPid);
    if (parentAlive && !isOurs) {
      spared.push({ pid, why: `live parent ${ppid} is not ours` });
      continue;
    }

    if (!dryRun) killTree(pid);
    killed.push({ pid, privMb: priv });
    reclaimedMb += priv;
  }

  // Second pass: chromium the watchdog stranded. Its unconditional
  // `setTimeout(() => process.exit(0), 15e3)` can exit the node while the
  // browser is still closing, leaving a tree no `/T` from any pid can reach.
  //
  // 🛑 Gated on the executable living under \ms-playwright\ — that is what keeps
  // a developer's own Chrome out of range by construction, not by luck.
  if (IS_WIN) {
    const stillAlive = livePids();
    const browsers = parseRows(
      powershell(
        `@(Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -like '*${BROWSER_HOME.replace(/\\/g, "\\")}*' } | ` +
          `Select-Object ProcessId,ParentProcessId,Name,CreationDate,` +
          `@{n='PrivMB';e={[math]::Round($_.PrivatePageCount/1MB)}}) | ConvertTo-Json -Compress`,
      ),
    );
    const justKilled = new Set(killed.map((k) => k.pid));
    for (const b of browsers) {
      if (!BROWSER_NAMES.has(String(b.Name))) continue;
      const pid = Number(b.ProcessId);
      const ppid = Number(b.ParentProcessId);
      const createdMs = cimDateToMs(String(b.CreationDate ?? ""));
      if (startedAt && createdMs && createdMs + 1000 < startedAt) continue;
      // Only when its parent is gone or was one of ours a moment ago.
      if (stillAlive.has(ppid) && !justKilled.has(ppid)) continue;
      if (!dryRun) killTree(pid);
      killed.push({ pid, privMb: Number(b.PrivMB ?? 0), browser: true });
      reclaimedMb += Number(b.PrivMB ?? 0);
    }
  }

  return { killed, spared, reclaimedMb };
}

export function describeSweep(r, commitFreeMb) {
  if (!r) return "";
  const bits = [`swept ${r.killed.length}`];
  if (r.reclaimedMb) bits.push(`~${r.reclaimedMb} MB`);
  if (r.spared.length) bits.push(`spared ${r.spared.length}`);
  if (commitFreeMb != null) bits.push(`commit free ${(commitFreeMb / 1024).toFixed(1)} GB`);
  return `    ${bits.join(" · ")}`;
}

/**
 * 🛑 COMMIT, NOT `os.freemem()`.
 *
 * Measured 2026-09-07: free PHYSICAL 6.7 GB vs free COMMIT 17 GB — they
 * disagree by 10 GB and only commit is the constraint. Free physical is
 * dominated by file cache and standby list: it looks alarming when nothing is
 * wrong and barely moves when many small processes exhaust commit, which is
 * exactly the shape of this leak (56 MB private commit, ~0 MB working set).
 *
 * Gating on the wrong number fires 10 GB early and teaches everyone to raise the
 * threshold until it never fires at all. Audit R21 pins this.
 */
export function readCommit() {
  if (!IS_WIN) {
    // Honest about being a different measurement rather than pretending parity.
    const os = { freemem: () => 0 };
    return { platform: process.platform, commitFreeMb: null, physFreeMb: Math.round(os.freemem() / 1048576) };
  }
  const rows = parseRows(
    powershell(
      `@(Get-CimInstance Win32_OperatingSystem | Select-Object FreeVirtualMemory,TotalVirtualMemorySize,FreePhysicalMemory) | ConvertTo-Json -Compress`,
    ),
  );
  const r = rows[0] ?? {};
  return {
    platform: "win32",
    commitFreeMb: Math.round(Number(r.FreeVirtualMemory ?? 0) / 1024),
    commitLimitMb: Math.round(Number(r.TotalVirtualMemorySize ?? 0) / 1024),
    physFreeMb: Math.round(Number(r.FreePhysicalMemory ?? 0) / 1024),
  };
}

/* ── CLI: recover after a hard kill of run.mjs itself ────────────────────────
 *
 * Neither the SIGINT flag nor `process.on("exit")` survives a `/F` of the
 * harness, so there has to be a way to clean up from outside it.
 *
 *   node tester/scripts/lib/process-cleanup.mjs --orphans [--dry-run]
 *
 * With no snapshot, "orphan" is decided by conjunct 4 alone: a dead parent.
 * That is the conservative reading — a live editor session is never touched.
 */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dryRun = process.argv.includes("--dry-run");
  const alive = livePids();
  const rows = listMcpProcesses();
  const orphans = rows.filter((r) => !alive.has(Number(r.ParentProcessId)));

  console.log(`${rows.length} playwright MCP process(es); ${orphans.length} orphaned (parent gone).`);
  for (const r of rows) {
    const orphan = !alive.has(Number(r.ParentProcessId));
    console.log(
      `  pid=${String(r.ProcessId).padEnd(7)} ppid=${String(r.ParentProcessId).padEnd(7)} ` +
        `${String(r.PrivMB ?? "?").padStart(4)} MB  ${orphan ? "ORPHAN" : "live parent — spared"}`,
    );
  }
  if (orphans.length && !dryRun) {
    for (const r of orphans) killTree(Number(r.ProcessId));
    console.log(`✓ Killed ${orphans.length} orphan(s) with taskkill /T /F.`);
  }
  const mem = readCommit();
  if (mem.commitFreeMb != null) console.log(`commit free: ${(mem.commitFreeMb / 1024).toFixed(1)} GB`);
  process.exit(0);
}

export const __testing = { cimDateToMs, parseRows, dirname: () => dirname(fileURLToPath(import.meta.url)) };
