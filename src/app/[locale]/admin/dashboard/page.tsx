"use client";
import { AdminDashboardView, ROUTES } from "@mohasinac/appkit/client";
import Link from "next/link";

const QUICK_ACTIONS = [
  { label: "Users", href: ROUTES.ADMIN.USERS },
  { label: "Categories", href: ROUTES.ADMIN.CATEGORIES },
  { label: "Reviews", href: ROUTES.ADMIN.REVIEWS },
  { label: "Coupons", href: ROUTES.ADMIN.COUPONS },
  { label: "FAQs", href: ROUTES.ADMIN.FAQS },
  { label: "Site Settings", href: ROUTES.ADMIN.SITE },
  { label: "Carousel", href: ROUTES.ADMIN.CAROUSEL },
  { label: "Sections", href: ROUTES.ADMIN.SECTIONS },
];

export default function Page() {
  return (
    <AdminDashboardView
      labels={{ title: "Admin Dashboard" }}
      renderQuickActions={() => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ label, href }) => (
            <Link
              key={label}
              href={String(href)}
              className="rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm font-medium text-neutral-700 dark:text-zinc-300 hover:border-primary hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    />
  );
}
