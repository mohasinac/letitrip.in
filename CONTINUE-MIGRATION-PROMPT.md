# Continue Migration Prompt

Use this prompt when resuming migration work:

---

## 📋 Resume Migration Task

I'm continuing the migration of LetItRip.in to use @letitrip/react-library.

**Current Context:**
- Main tracker: `MIGRATION-TRACKER.md`
- Action plan: `MIGRATION-ACTION-PLAN.md`
- Quick reference: `MIGRATION-QUICK-REFERENCE.md`
- React library location: `react-library/`
- Main app location: `src/`

**Migration Order:**
1. ✅ Public pages (51 pages) - Priority 1
2. ✅ Auth/Login pages (5 pages) - Priority 2
3. ✅ Admin pages (66 pages) - Priority 3
4. ✅ Seller pages (24 pages) - Priority 4
5. ✅ User pages (20 pages) - Priority 5
6. ✅ Remaining pages and routes - Priority 6

**Requirements:**
- Start dev server automatically: `npm run dev`
- Update tracker in real-time after each completion
- Use constants and enums wherever possible
- Create constants in: `src/constants/`
- Document all constants in README
- Commit after each logical change with proper message format
- Test functionality before moving to next item

**Current Phase:** [Check MIGRATION-TRACKER.md for current phase]

**Key Principles:**
1. Library is pure React (no Next.js dependencies)
2. Use Next.js wrappers in main app
3. Use service adapters for API integration
4. Test each change immediately
5. Update tracker after each completion
6. Use constants for:
   - Routes/paths
   - API endpoints
   - Status values
   - Configuration values
   - Magic numbers/strings
   - Enums for categories, types, states

**Instructions:**
Please continue the migration from where we left off. For each item:
1. Read the current page/component code
2. Identify what needs migration
3. Replace with library components
4. Create constants/enums as needed
5. Create wrappers/adapters as needed
6. Test the changes
7. Commit with proper message
8. Update MIGRATION-TRACKER.md progress
9. Move to next item

Start by checking MIGRATION-TRACKER.md to see what's completed and what's next.

---

## 🚀 Quick Start Commands

```powershell
# Start dev server in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\proj\letitrip.in'; npm run dev"

# Or if you want to see output
npm run dev
```

---

## 📊 Check Current Status

```powershell
# View tracker
code MIGRATION-TRACKER.md

# View todo list
code MIGRATION-ACTION-PLAN.md

# Check what's completed
git log --oneline | Select-Object -First 20
```

---

## 🎯 Next Steps

1. Check MIGRATION-TRACKER.md for current phase
2. Start dev server: `npm run dev`
3. Continue with next uncompleted item
4. Follow migration patterns in MIGRATION-QUICK-REFERENCE.md
5. Update tracker after each completion
6. Commit with proper message format

**Let's continue the migration!**
