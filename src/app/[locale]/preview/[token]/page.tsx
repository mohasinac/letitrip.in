import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container, Div, Section, Text } from "@mohasinac/appkit";
import { getAdminDb } from "@mohasinac/appkit/server";

const __P = {
  p4: "p-4",
} as const;


const __O = {
  auto: "overflow-auto",
} as const;
const PREVIEW_COLLECTION = "previewDrafts";

const PREVIEW_COPY = {
  pageTitle: "Draft preview — LetItRip",
  banner: "Draft preview · not visible to buyers until published",
  kindSuffix: " preview",
  rendererNote:
    "Rich layout rendering per kind (product/auction/blog/event) is delivered by the per-resource preview shell. This page is the token-resolution entry point.",
} as const;

export const metadata: Metadata = {
  title: PREVIEW_COPY.pageTitle,
  robots: { index: false, follow: false },
};

interface PreviewDoc {
  kind: string;
  draft: Record<string, unknown>;
  expiresAt: { toDate?: () => Date };
}

async function loadPreview(token: string): Promise<PreviewDoc | null> {
  try {
    const snap = await getAdminDb()
      .collection(PREVIEW_COLLECTION)
      .doc(token)
      .get();
    if (!snap.exists) return null;
    const data = snap.data() as PreviewDoc | undefined;
    if (!data) return null;
    const expiresAt = data.expiresAt?.toDate?.() ?? new Date(0);
    if (expiresAt.getTime() < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await loadPreview(token);
  if (!preview) notFound();

  return (
    <Section surface="default" className="min-h-screen">
      <Div className="bg-warning-surface border-b border-warning/30 px-4 py-2 text-center">
        <Text className="text-sm font-medium text-warning">
          {PREVIEW_COPY.banner}
        </Text>
      </Div>
      <Container className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Text className="mb-4 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {preview.kind}
          {PREVIEW_COPY.kindSuffix}
        </Text>
        <Div className={`${__O.auto} rounded-lg bg-zinc-50 dark:bg-slate-800 ${__P.p4} font-mono text-xs whitespace-pre`}>
          {JSON.stringify(preview.draft, null, 2)}
        </Div>
        <Text className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          {PREVIEW_COPY.rendererNote}
        </Text>
      </Container>
    </Section>
  );
}
