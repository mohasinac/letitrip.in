"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import { useSession, ROUTES } from "@mohasinac/appkit/client";
import { Shield, AlertTriangle, ChevronLeft, Loader2 } from "lucide-react";

const LOGIN_HREF =
  `${String(ROUTES.AUTH.LOGIN)}?redirect=${encodeURIComponent("/scams/report")}` as const;

function ScamReportForm({ userId }: { userId: string }) {
  // userId is passed to confirm auth; actual submission will POST to API in future SCAM6 task.
  void userId;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <Link
        href={String(ROUTES.PUBLIC.SCAMS)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Scam Registry
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Report a Scammer</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Your report will be reviewed by our moderation team before it appears publicly.
          All submissions are confidential — your identity is never shared without your consent.
        </p>
      </div>

      {/* Awareness notice */}
      <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/40 dark:bg-amber-950/20">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="text-sm text-amber-700 dark:text-amber-300">
          <p className="mb-1 font-medium">Before you submit</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Only report genuine scam incidents — false reports can be contested.</li>
            <li>Max 5 pending reports per user. Verified reports are not counted.</li>
            <li>Evidence (screenshots, receipts) significantly speeds up verification.</li>
          </ul>
        </div>
      </div>

      {/* Placeholder — SCAM6 will wire the actual form fields + API submission */}
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <Shield className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
        <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">Report form coming soon</p>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          The submission form is being built. In the meantime, use the{" "}
          <Link href={String(ROUTES.PUBLIC.CONTACT)} className="text-blue-600 hover:underline dark:text-blue-400">
            contact page
          </Link>{" "}
          to report a scammer directly.
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(LOGIN_HREF as Parameters<typeof router.replace>[0]);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) {
    // Render nothing while redirect fires.
    return null;
  }

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <ScamReportForm userId={user.uid} />
    </main>
  );
}
