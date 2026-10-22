const authored = {
  "checklist-search-and-nav-employee-permissions-employee-sees-only-their-permissions": {
    roles: ["employee", "admin"],
    startPage: "/admin",
    steps: [
      "Sign in as employee-blog@letitrip.in / TempPass123!.",
      "Open /admin and count every entry in the sidebar.",
      "Read every group heading that is present.",
      "Look specifically for Finance, Procurement, Catalog, Testing, Site, Events, Trust & Safety, System and Maintenance.",
      "Sign out and sign in as employee-trust@letitrip.in / TempPass123!.",
      "Open /admin and count the sidebar entries again.",
      "Sign out and sign in as admin@letitrip.in / TempPass123!, then open /admin and count the entries."
    ],
    inputs: { blogEmployee: "employee-blog@letitrip.in", trustEmployee: "employee-trust@letitrip.in" },
    expectedBehaviour: "Nav filtering keys on each item's own id to look up its required permission. `filterNavItems` opens with `if (!item.id) return true;` and no item in the config had one \u2014 so all 90 entries passed for everybody and every requiredPermission was decorative. A group left with no visible children is removed entirely rather than rendering an empty heading.",
    expectedUiState: "The blog employee sees FIVE entries, not 90. Finance, Procurement, Catalog, Testing, Site, Events, Trust & Safety and System and Maintenance are absent as HEADINGS, not present-and-empty. The trust employee sees 24. The admin sees all 90 across 12 groups. Three genuinely different counts is the pass; three identical counts is the exact bug \u2014 and 90 for all three is the specific bug this replaced.",
    expectedData: { blogEntries: 5, trustEntries: 24, adminEntries: 90, adminGroups: 12 },
    endResult: "Read-only; nothing persists. Comparing two presets against each other AND against admin is what distinguishes real filtering from a filter that happens to hide the same fixed set from everyone."
  },
  "checklist-search-and-nav-employee-permissions-employee-sidebar-never-empty": {
    roles: ["admin", "employee"],
    startPage: "/admin/team",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/team and open the editor for employee-blog@letitrip.in.",
      "Read every permission preset the editor offers and count them \u2014 there are 20.",
      "Set the account to blog_poster, the smallest preset, and save.",
      "Sign out, sign in as employee-blog@letitrip.in / TempPass123!, open /admin and count the sidebar entries.",
      "Sign back in as admin, set the account to maintenance_employee, the most permissive preset, and save.",
      "Sign in as the employee again and count the entries.",
      "Sign back in as admin and set the account back to blog_poster as the last step.",
      "For the remaining 18 presets, run `node scripts/diff-employee-sidebar.mjs` rather than signing in 18 more times \u2014 it computes every preset's count from the same config the sidebar reads."
    ],
    inputs: { employee: "employee-blog@letitrip.in" },
    expectedBehaviour: "No preset produces a completely blank sidebar. At minimum every employee reaches the dashboard itself, so the portal is navigable from the moment they sign in. Measured: the smallest of the 20 presets is blog_poster at 5 entries and the largest is maintenance_employee at 77, so the floor is well clear of zero.",
    expectedUiState: "Both presets checked by hand show entries \u2014 5 for blog_poster and 77 for maintenance_employee \u2014 and the script reports no preset below 5. A blank sidebar is the failure: an employee cannot tell it from a broken account and will report it as one, which is a support ticket the permission system caused rather than prevented.",
    expectedData: { blogPosterEntries: 5, maintenanceEmployeeEntries: 77, presetCount: 20 },
    endResult: "The account is back on blog_poster, which the case above depends on. Leaving it on another preset silently breaks that case's expected count of exactly 5."
  }
};
export {
  authored
};
