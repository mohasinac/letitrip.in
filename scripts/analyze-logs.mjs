#!/usr/bin/env node
/**
 * analyze-logs — CLI front-end for the maintenance analyzer.
 *
 *   npm run analyze:logs -- --days=7 --source=all --format=markdown
 *
 * Args:
 *   --days=<N>          look-back window 1..30 (default 7)
 *   --source=server|client|function|all  (default all)  — "server" maps to "vercel"
 *   --format=text|json|markdown          (default text)
 *   --out=<path>        optional output file
 *   --maxDocs=<N>       hard cap on documents loaded (default 5000)
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Boot Firebase Admin via the appkit-server bundle so the same lazy ADC path runs.
const { analyzeLogs } = await import("@mohasinac/appkit/server");

function arg(name, def) {
  const m = process.argv.find((a) => a.startsWith(`--${name}=`));
  return m ? m.slice(name.length + 3) : def;
}

const days = Math.max(1, Math.min(30, Number(arg("days", 7))));
const sourceArg = arg("source", "all");
const source = sourceArg === "server" ? "vercel" : sourceArg;
const format = arg("format", "text");
const out = arg("out", null);
const maxDocs = Number(arg("maxDocs", 5000));

const report = await analyzeLogs({ days, source, maxDocs });

function spark(values) {
  const max = Math.max(...values, 1);
  const bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  return values
    .map((v) => bars[Math.min(bars.length - 1, Math.floor((v / max) * (bars.length - 1)))])
    .join("");
}

function renderText() {
  const lines = [];
  lines.push(`# Server-error analysis`);
  lines.push(`window: last ${days}d (source=${source})`);
  lines.push(`total: ${report.totalErrors}   unique users impacted: ${report.uniqueUsers}`);
  lines.push("");
  lines.push("## Top codes");
  for (const c of report.topCodes) {
    lines.push(`  ${c.count.toString().padStart(6)}  ${c.code.padEnd(30)} users=${c.userImpact}`);
  }
  lines.push("");
  lines.push("## Top routes");
  for (const r of report.topRoutes) {
    lines.push(`  ${r.count.toString().padStart(6)}  [${r.source}] ${r.route}`);
  }
  lines.push("");
  lines.push("## Hourly (last 24h slice)");
  const last24 = report.hourlyHistogram.slice(-24);
  lines.push("  " + spark(last24.map((h) => h.count)));
  lines.push("");
  if (report.stackClusters.length) {
    lines.push("## Stack clusters (≥5)");
    for (const cl of report.stackClusters) {
      lines.push(`  ${cl.count.toString().padStart(4)}× ${cl.signature}`);
      lines.push(`        sample: ${cl.sampleMessage}`);
    }
    lines.push("");
  }
  if (report.burstWindows.length) {
    lines.push("## 5xx burst windows");
    for (const b of report.burstWindows) {
      lines.push(`  ${b.start}  count=${b.count}  ${b.multiplier}×`);
    }
    lines.push("");
  }
  if (report.clientServerCorrelation.length) {
    lines.push("## Client/server correlation (shared requestId)");
    for (const c of report.clientServerCorrelation) {
      lines.push(`  ${c.requestId}   server=${c.serverCode}   client=${c.clientCode}`);
    }
    lines.push("");
  }
  lines.push("## Recommendations");
  for (const r of report.recommendations) lines.push(`  - ${r}`);
  lines.push("");
  return lines.join("\n");
}

function renderMarkdown() {
  const lines = [];
  lines.push(`# Server-error analysis`);
  lines.push("");
  lines.push(`- **window**: last ${days} day(s)`);
  lines.push(`- **source**: \`${source}\``);
  lines.push(`- **total errors**: ${report.totalErrors}`);
  lines.push(`- **unique users impacted**: ${report.uniqueUsers}`);
  lines.push(`- **generated at**: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Top codes");
  lines.push("| Code | Count | Users impacted |");
  lines.push("| --- | ---: | ---: |");
  for (const c of report.topCodes) {
    lines.push(`| \`${c.code}\` | ${c.count} | ${c.userImpact} |`);
  }
  lines.push("");
  lines.push("## Top routes");
  lines.push("| Source | Route | Count |");
  lines.push("| --- | --- | ---: |");
  for (const r of report.topRoutes) {
    lines.push(`| \`${r.source}\` | \`${r.route}\` | ${r.count} |`);
  }
  lines.push("");
  lines.push("## Hourly (last 24h)");
  const last24 = report.hourlyHistogram.slice(-24);
  lines.push("```");
  lines.push(spark(last24.map((h) => h.count)));
  lines.push("```");
  lines.push("");
  if (report.stackClusters.length) {
    lines.push("## Stack clusters (≥5 occurrences)");
    for (const cl of report.stackClusters) {
      lines.push(`- **${cl.count}×** \`${cl.signature}\``);
      lines.push(`  - sample: ${cl.sampleMessage}`);
    }
    lines.push("");
  }
  if (report.burstWindows.length) {
    lines.push("## 5xx burst windows");
    lines.push("| Window start | Count | Multiplier vs avg |");
    lines.push("| --- | ---: | ---: |");
    for (const b of report.burstWindows) {
      lines.push(`| ${b.start} | ${b.count} | ${b.multiplier}× |`);
    }
    lines.push("");
  }
  if (report.clientServerCorrelation.length) {
    lines.push("## Client/server correlation");
    lines.push("| requestId | server code | client code |");
    lines.push("| --- | --- | --- |");
    for (const c of report.clientServerCorrelation) {
      lines.push(`| \`${c.requestId}\` | \`${c.serverCode}\` | \`${c.clientCode}\` |`);
    }
    lines.push("");
  }
  lines.push("## Recommendations");
  for (const r of report.recommendations) lines.push(`- ${r}`);
  lines.push("");
  return lines.join("\n");
}

const output =
  format === "json"
    ? JSON.stringify(report, null, 2)
    : format === "markdown"
      ? renderMarkdown()
      : renderText();

if (out) {
  writeFileSync(resolve(process.cwd(), out), output);
  console.log(`Report written to ${out}`);
} else {
  process.stdout.write(output + "\n");
}
