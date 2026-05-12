---
description: Re-load prompt.md and pick up the next ⏳ session
---

Re-read `prompt.md` from the project root. Identify state:

1. If 🔄 CURRENT is set → resume that task. Show the user the current task name and ask if they want to continue or switch.
2. Otherwise → pick the first ⏳ row in the SESSION STATE → NEXT UP table.

Then write a PLAN (3–5 bullets) covering:
- Files you intend to change
- Refactor checklist items that will apply (ROUTES / TOKENS / WRAPPERS / SSR LAYERING / REPO HOOKS / ROLE GATE / SEED / INDICES)
- Whether this session needs new Firestore indices, Firebase Functions, or seed data deploys
- Estimated commit count

**Do not start coding.** Wait for the user to confirm the plan — CLAUDE.md Rule #1 (stop and ask). Once confirmed, follow the per-task loop in prompt.md § HOW TO WORK and end with the per-session refactor + prod-deploy checklists.
