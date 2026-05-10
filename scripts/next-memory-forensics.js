const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, execSync } = require("child_process");
const inspector = require("inspector");

const ROOT = process.cwd();

const OUT_DIR = path.join(
  ROOT,
  `memory-forensics-${Date.now()}`
);

fs.mkdirSync(OUT_DIR, { recursive: true });

const LOG_FILE = path.join(OUT_DIR, "master-log.txt");
const METRICS_FILE = path.join(OUT_DIR, "metrics.ndjson");
const ROOT_CAUSE_FILE = path.join(
  OUT_DIR,
  "root-cause-analysis.txt"
);

function append(file, text) {
  try {
    fs.appendFileSync(file, text + "\n", {
      encoding: "utf8",
    });

    const fd = fs.openSync(file, "r+");
    fs.fsyncSync(fd);
    fs.closeSync(fd);

  } catch (e) {
    console.error("FAILED TO WRITE LOG", e);
  }
}

function log(text) {
  const line = `[${new Date().toISOString()}] ${text}`;

  console.log(line);

  append(LOG_FILE, line);
}

function metric(obj) {
  append(
    METRICS_FILE,
    JSON.stringify({
      ts: Date.now(),
      ...obj,
    })
  );
}

function safeJson(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "JSON_PARSE_FAILED";
  }
}

function mb(v) {
  return Math.round(v / 1024 / 1024);
}

process.on("uncaughtException", (err) => {
  log("UNCAUGHT EXCEPTION");
  log(err.stack || err.message || String(err));
});

process.on("unhandledRejection", (err) => {
  log("UNHANDLED REJECTION");
  log(String(err));
});

process.on("warning", (w) => {
  log(`NODE WARNING: ${w.name} ${w.message}`);
});

process.on("exit", (code) => {
  log(`PROCESS EXIT ${code}`);
});

process.on("SIGINT", () => {
  log("SIGINT");
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("SIGTERM");
  process.exit(0);
});

function getNodeProcesses() {
  try {

    if (process.platform === "win32") {

      return execSync(
        `wmic process where "name='node.exe'" get ProcessId,ParentProcessId,WorkingSetSize,CommandLine /format:list`,
        {
          encoding: "utf8",
          maxBuffer: 1024 * 1024 * 50,
        }
      );
    }

    return execSync(
      `ps aux | grep node`,
      {
        encoding: "utf8",
      }
    );

  } catch (e) {
    return String(e);
  }
}

function dumpProcesses() {

  const text = getNodeProcesses();

  append(
    path.join(OUT_DIR, "process-tree.txt"),
    `\n\n========== ${new Date().toISOString()} ==========\n\n${text}`
  );

  const lower = text.toLowerCase();

  const suspicious = [
    "postcss",
    "tailwind",
    "turbopack",
    "next-server",
    "watchpack",
    "webpack",
  ];

  suspicious.forEach((k) => {

    const count =
      lower.split(k).length - 1;

    if (count > 5) {

      log(
        `SUSPICIOUS PROCESS MULTIPLICATION: ${k} x${count}`
      );

      append(
        ROOT_CAUSE_FILE,
        `[${new Date().toISOString()}] Possible orphan process leak: ${k} count=${count}`
      );
    }
  });
}

function getRealProcessMemoryDetails() {

  try {

    if (process.platform !== "win32") {
      return;
    }

    const out = execSync(
      `wmic process where "name='node.exe'" get ProcessId,WorkingSetSize,ParentProcessId,CommandLine /format:csv`,
      {
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 50,
      }
    );

    append(
      path.join(
        OUT_DIR,
        "real-process-memory.txt"
      ),
      `\n\n=== ${new Date().toISOString()} ===\n${out}`
    );

  } catch (e) {

    log(
      `PROCESS MEMORY READ FAILED ${e}`
    );
  }
}

function dumpMemory() {

  const mem = process.memoryUsage();

  const data = {
    rssMB: mb(mem.rss),
    heapTotalMB: mb(mem.heapTotal),
    heapUsedMB: mb(mem.heapUsed),
    externalMB: mb(mem.external),
    arrayBuffersMB: mb(mem.arrayBuffers || 0),
    freeSystemMB: mb(os.freemem()),
    totalSystemMB: mb(os.totalmem()),
    uptime: process.uptime(),
  };

  metric({
    type: "memory",
    ...data,
  });

  log(
    `MEM RSS=${data.rssMB}MB HEAP=${data.heapUsedMB}/${data.heapTotalMB}MB FREE_SYS=${data.freeSystemMB}MB`
  );

  if (data.rssMB > 4000) {

    append(
      ROOT_CAUSE_FILE,
      `[${new Date().toISOString()}] High RSS memory detected ${data.rssMB}MB`
    );
  }

  if (data.freeSystemMB < 1000) {

    append(
      ROOT_CAUSE_FILE,
      `[${new Date().toISOString()}] SYSTEM MEMORY EXHAUSTION`
    );
  }
}

function dumpHandles() {

  try {

    const handles =
      process._getActiveHandles();

    const grouped = {};

    handles.forEach((h) => {

      const n =
        h?.constructor?.name || "Unknown";

      grouped[n] =
        (grouped[n] || 0) + 1;
    });

    metric({
      type: "handles",
      grouped,
    });

    append(
      path.join(OUT_DIR, "handles.txt"),
      `\n\n=== ${new Date().toISOString()} ===\n${safeJson(grouped)}`
    );

    if (
      (grouped.FSWatcher || 0) > 1000
    ) {

      log(
        `POSSIBLE WATCHER LEAK FSWatcher=${grouped.FSWatcher}`
      );

      append(
        ROOT_CAUSE_FILE,
        `[${new Date().toISOString()}] FSWatcher leak suspected count=${grouped.FSWatcher}`
      );
    }

  } catch (e) {

    log(
      `HANDLE ANALYSIS FAILED ${e}`
    );
  }
}

function scanNextMutations() {

  const target =
    path.join(ROOT, ".next");

  if (!fs.existsSync(target)) {
    return;
  }

  let changed = 0;

  function walk(dir) {

    let items = [];

    try {
      items = fs.readdirSync(dir);
    } catch {
      return;
    }

    for (const item of items) {

      const full =
        path.join(dir, item);

      try {

        const stat =
          fs.statSync(full);

        if (
          Date.now() - stat.mtimeMs <
          10000
        ) {
          changed++;
        }

        if (stat.isDirectory()) {
          walk(full);
        }

      } catch {}
    }
  }

  walk(target);

  metric({
    type: "next_mutation",
    changed,
  });

  if (changed > 100) {

    log(
      `POSSIBLE REBUILD LOOP recent_changes=${changed}`
    );

    append(
      ROOT_CAUSE_FILE,
      `[${new Date().toISOString()}] Infinite rebuild loop suspected changes=${changed}`
    );
  }
}

async function takeHeapSnapshot() {

  return new Promise((resolve) => {

    try {

      const session =
        new inspector.Session();

      session.connect();

      const file = path.join(
        OUT_DIR,
        `heap-${Date.now()}.heapsnapshot`
      );

      session.on(
        "HeapProfiler.addHeapSnapshotChunk",
        (m) => {

          fs.appendFileSync(
            file,
            m.params.chunk
          );
        }
      );

      session.post(
        "HeapProfiler.takeHeapSnapshot",
        null,
        () => {

          log(
            `HEAP SNAPSHOT SAVED ${file}`
          );

          session.disconnect();

          resolve();
        }
      );

    } catch (e) {

      log(
        `HEAP SNAPSHOT FAILED ${e}`
      );

      resolve();
    }
  });
}

function setupFileMutationWatcher() {

  const tracked = [
    ".next",
    "src",
    "app",
    "pages",
  ];

  tracked.forEach((dir) => {

    const full =
      path.join(ROOT, dir);

    if (!fs.existsSync(full)) {
      return;
    }

    try {

      fs.watch(
        full,
        { recursive: true },
        (event, filename) => {

          append(
            path.join(
              OUT_DIR,
              "file-mutations.txt"
            ),
            `[${new Date().toISOString()}] ${dir} ${event} ${filename}`
          );
        }
      );

      log(`WATCHING ${dir}`);

    } catch (e) {

      log(
        `FAILED WATCHING ${dir}`
      );
    }
  });
}

async function main() {

  log(
    "STARTING NEXT FORENSICS"
  );

  setupFileMutationWatcher();

  const child = spawn(
    process.execPath,
    ["scripts/dev-next.mjs"],
    {
      shell: false,
      cwd: ROOT,
      env: {
        ...process.env,

        NODE_OPTIONS: [
          "--max-old-space-size=4096",
          "--inspect=9230",
          "--heapsnapshot-near-heap-limit=5",
        ].join(" "),
      },
    }
  );

  global.__NEXT_CHILD__ = child;

  child.stdout.on(
    "data",
    (d) => {

      const text = d.toString();

      append(
        path.join(
          OUT_DIR,
          "next-stdout.txt"
        ),
        text
      );

      process.stdout.write(text);

      const lower =
        text.toLowerCase();

      if (
        lower.includes("compiling") ||
        lower.includes("compiled") ||
        lower.includes("rebuilding")
      ) {

        log(
          "NEXT REBUILD DETECTED"
        );
      }

      if (
        lower.includes("turbopack")
      ) {

        append(
          ROOT_CAUSE_FILE,
          `[${new Date().toISOString()}] TURBOPACK ACTIVE`
        );
      }
    }
  );

  child.stderr.on(
    "data",
    (d) => {

      const text = d.toString();

      append(
        path.join(
          OUT_DIR,
          "next-stderr.txt"
        ),
        text
      );

      process.stderr.write(text);

      const lower =
        text.toLowerCase();

      if (
        lower.includes(
          "heap out of memory"
        )
      ) {

        append(
          ROOT_CAUSE_FILE,
          `[${new Date().toISOString()}] NODE OOM DETECTED`
        );
      }

      if (
        lower.includes(
          "postcss"
        )
      ) {

        append(
          ROOT_CAUSE_FILE,
          `[${new Date().toISOString()}] POSTCSS INVOLVEMENT DETECTED`
        );
      }

      if (
        lower.includes("gc")
      ) {

        append(
          path.join(
            OUT_DIR,
            "gc-traces.txt"
          ),
          text
        );
      }
    }
  );

  child.on(
    "exit",
    (code) => {

      log(
        `NEXT PROCESS EXIT ${code}`
      );
    }
  );

  setInterval(() => {
    dumpMemory();
  }, 5000);

  setInterval(() => {
    dumpHandles();
  }, 15000);

  setInterval(() => {
    dumpProcesses();
  }, 20000);

  setInterval(() => {
    getRealProcessMemoryDetails();
  }, 10000);

  setInterval(() => {
    scanNextMutations();
  }, 10000);

  setInterval(async () => {
    await takeHeapSnapshot();
  }, 1000 * 60 * 3);
}

main();