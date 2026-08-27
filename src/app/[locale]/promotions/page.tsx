import { redirect } from "@/i18n/navigation";

export const revalidate = 120;

/*
 * A bare redirect, deliberately carrying NO metadata.
 *
 * It used to export one with `path: "/promotions/deals"`, which was wrong twice
 * over. It pointed the canonical at the destination when `/promotions` is the
 * URL the sitemap advertises — and more fundamentally it never took effect at
 * all: `redirect()` fires before the document is produced, so anything crawling
 * this route reads the canonical of the page it lands on, not this one.
 *
 * The canonical now lives on `layout.tsx` (`path: "/promotions"`) and the tabs
 * inherit it. Same shape as `stores/[storeSlug]/page.tsx`, which is likewise a
 * bare redirect while its layout owns the metadata.
 */
export default function Page() {
  redirect("/promotions/deals");
}
