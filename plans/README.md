# Plans

Project planning documents for LetItRip. Kept in the repo so they're version-controlled alongside the code.

| File | What it is |
|------|-----------|
| [p1-master-plan.md](p1-master-plan.md) | P-1 MVP master todo list (Groups A–O2) + full platform use-case and architecture diagrams |
| [p1-post-deploy-changes.md](p1-post-deploy-changes.md) | Post-deploy P-1 changes: clear-all seed, SeedPanel trim, homepage section flags |
| [rtdb-resilience-fixes.md](rtdb-resilience-fixes.md) | RTDB hard-failure resilience: seed/event/init, auth/google, payment/event routes |
| [dark-mode-gradient-fixes.md](dark-mode-gradient-fixes.md) | Dark mode gradient + active nav contrast + breakpoint overlap + hamburger wiring |
| [logo-nav-breakpoint-fixes.md](logo-nav-breakpoint-fixes.md) | SiteLogo dark mode + active nav contrast + sidebar breakpoint + mobile hamburger |
| [lottery-consolidation.md](lottery-consolidation.md) | Lottery entries collection + event/prize-draw schema bug fixes (Phase 1 confirmed bugs) |
| [unit-test-coverage.md](unit-test-coverage.md) | Exhaustive Vitest coverage plan: routes (175 files), repos, jobs, actions, hooks |
| [suppression-cleanup.md](suppression-cleanup.md) | Remove all audit suppression comments by fixing root causes (~397 markers, 14 phases) |
| [stress-test.md](stress-test.md) | Local stress-test script: find Vercel Hobby heap/concurrency ceiling under load |
