import { AdminTesterChecklistItemEditorView } from "@mohasinac/appkit";

export const metadata = { title: "New Checklist Item — Admin" };

/**
 * The editor is headless (`embedded` omitted here so it keeps its
 * `StackedViewShell` chrome), so the page is a mount and nothing else — the
 * same 6-line shape as `/admin/features/new`.
 *
 * It was already reachable as a drawer from `/admin/tester-checklist`; what
 * this adds is a URL a checklist item can be linked to and bookmarked, which
 * a drawer cannot be.
 */
export default function Page() {
  return <AdminTesterChecklistItemEditorView />;
}
