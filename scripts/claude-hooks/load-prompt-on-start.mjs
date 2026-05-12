#!/usr/bin/env node
/**
 * Claude Code SessionStart hook — auto-loads prompt.md into the model's context
 * so the next ⏳ session can begin without the user re-pasting.
 *
 * Outputs JSON on stdout with `hookSpecificOutput.additionalContext` containing
 * the full prompt.md plus a directive to start the next session in the
 * SESSION STATE → NEXT UP block.
 *
 * Exit semantics:
 *   - exit 0 + JSON on stdout → additionalContext injected into model context
 *   - exit 0 + empty stdout   → silent no-op (prompt.md missing)
 *   - non-zero exit           → non-blocking error shown to user
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const PROMPT_PATH = join(ROOT, "prompt.md");

if (!existsSync(PROMPT_PATH)) {
  process.exit(0);
}

const prompt = readFileSync(PROMPT_PATH, "utf8");

const directive = [
  "═══════════════════════════════════════════════════════════════════════════",
  "AUTO-LOADED prompt.md (SessionStart hook) — letitrip.in working prompt",
  "═══════════════════════════════════════════════════════════════════════════",
  "",
  prompt,
  "",
  "═══════════════════════════════════════════════════════════════════════════",
  "DIRECTIVE: read the SESSION STATE block above. If 🔄 CURRENT is set, resume",
  "that task. Otherwise pick the first ⏳ session in NEXT UP and begin its",
  "PLAN phase (3-5 bullets of intended file changes per the per-task loop).",
  "DO NOT start coding until the user confirms the plan — CLAUDE.md Rule #1.",
  "Apply the PER-SESSION REFACTOR CHECKLIST to every file you open.",
  "═══════════════════════════════════════════════════════════════════════════",
].join("\n");

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: directive,
    },
  }),
);
