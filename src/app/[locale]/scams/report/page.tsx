"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import { useSession, ROUTES } from "@mohasinac/appkit/client";
import { Alert, Stack, Heading, Text, EmptyState } from "@mohasinac/appkit";
import { Shield, ChevronLeft, Loader2 } from "lucide-react";

const LOGIN_HREF =
  `${String(ROUTES.AUTH.LOGIN)}?redirect=${encodeURIComponent("/scams/report")}` as const;

function ScamReportForm({ userId }: { userId: string }) {
  // userId confirms auth; actual submission will POST to API in SCAM6.
  void userId;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={String(ROUTES.PUBLIC.SCAMS)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[color:var(--appkit-color-text-muted,theme(colors.zinc.500))] hover:text-[color:var(--appkit-color-text,theme(colors.zinc.700))]"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Scam Registry
      </Link>

      <Stack gap="lg">
        <Stack gap="xs">
          <Heading level={1} className="text-2xl font-bold">
            Report a Scammer
          </Heading>
          <Text variant="secondary" className="text-sm">
            Your report will be reviewed by our moderation team before it appears publicly. All
            submissions are confidential — your identity is never shared without your consent.
          </Text>
        </Stack>

        <Alert variant="warning" title="Before you submit">
          <ul className="list-disc space-y-1 pl-4 text-sm">
            <li>Only report genuine scam incidents — false reports can be contested.</li>
            <li>Max 5 pending reports per user. Verified reports are not counted.</li>
            <li>Evidence (screenshots, receipts) significantly speeds up verification.</li>
          </ul>
        </Alert>

        {/* Placeholder — SCAM6 will wire the actual form fields + API submission */}
        <EmptyState
          icon={<Shield className="h-10 w-10" />}
          title="Report form coming soon"
          description={
            <>
              The submission form is being built. In the meantime, use the{" "}
              <Link
                href={String(ROUTES.PUBLIC.CONTACT)}
                className="text-[color:var(--appkit-color-primary,theme(colors.blue.600))] hover:underline"
              >
                contact page
              </Link>{" "}
              to report a scammer directly.
            </>
          }
        />
      </Stack>
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
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--appkit-color-text-muted,theme(colors.zinc.400))]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <ScamReportForm userId={user.uid} />
    </main>
  );
}
