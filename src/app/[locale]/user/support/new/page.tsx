"use client";

/**
 * Open a support ticket.
 *
 * Fields come from `supportTicketCreateSchema`'s annotations, including the
 * `when` on `orderId` that replaces the hand-written
 * `{category === "order_issue" && …}` conditional, and its `superRefine` that
 * makes the id required in that one case.
 *
 * The payload is built from `visibleValues`, so an order id typed and then
 * abandoned by switching category is not submitted with a ticket that has
 * nothing to do with an order.
 */

import { useMemo, useState } from "react";

import {
  Div,
  FormErrorSummary,
  FormShellContext,
  Heading,
  ROUTES,
  SectionForm,
  Stack,
  Text,
  applyZodIssues,
  buildSectionsFromSchema,
  normalizeError,
  supportTicketCreateSchema,
  useFormShellState,
  useSectionFormNav,
  useSession,
  useToast,
  visibleValues,
} from "@mohasinac/appkit/client";
import { Link, useRouter } from "@/i18n/navigation";
import { createSupportTicket } from "@/lib/api/support-client";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender, and any client tree
 * reaching useSearchParams() throws during prerender without a boundary
 * (Root Cause #17). Kept from the concurrent build-fix work; the rest of that
 * file's version was dropped because it predated the SectionForm migration.
 */
export const dynamic = "force-dynamic";


interface Values {
  [key: string]: unknown;
  category: string;
  subject: string;
  description: string;
  orderId: string;
}

const EMPTY: Values = { category: "general", subject: "", description: "", orderId: "" };

export default function NewSupportTicketPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const { showToast } = useToast();

  const [form, setForm] = useState<Values>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const sections = useMemo(() => buildSectionsFromSchema<Values>(supportTicketCreateSchema), []);
  const nav = useSectionFormNav(sections, form, { scope: "user:support-new" });
  const { shellCtx, setFieldError, clearErrors } = useFormShellState(supportTicketCreateSchema, {
    sections: nav.sectionMeta,
    onGoToSection: nav.goToSection,
    fieldToSectionIndex: nav.fieldToSectionIndex,
  });

  if (!sessionLoading && !user) {
    return (
      <Div padding="y-6xl" className="text-center">
        <Text variant="secondary">Sign in to open a support ticket.</Text>
      </Div>
    );
  }

  async function onSubmit() {
    if (submitting) return;
    clearErrors();

    const draft = visibleValues(supportTicketCreateSchema, form) as Partial<Values>;
    const parsed = supportTicketCreateSchema.safeParse({
      category: draft.category,
      subject: draft.subject?.trim(),
      description: draft.description?.trim(),
      orderId: draft.orderId?.trim() || undefined,
    });
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSupportTicket(parsed.data);
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        // On a field, not a toast — the route names what it objected to.
        setFieldError("subject", json?.error ?? "Could not create ticket.");
        return;
      }
      showToast("Ticket created.", "success");
      const newId = json?.data?.id ?? json?.data?.ticket?.id;
      router.push(String(newId ? ROUTES.USER.SUPPORT_TICKET(newId) : ROUTES.USER.SUPPORT));
    } catch (e: unknown) {
      const normalized = normalizeError(e);
      setFieldError("subject", normalized.message ?? "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack className="w-full max-w-3xl" gap="lg">
      <Div>
        <Link
          href={String(ROUTES.USER.SUPPORT)}
          className="text-[length:var(--appkit-text-xs)] text-[var(--appkit-color-primary)] hover:underline"
        >
          ← All tickets
        </Link>
        <Heading
          level={1}
          className="text-[var(--appkit-color-text)] mt-1"
          size="2xl"
          weight="semibold"
        >
          New support ticket
        </Heading>
        <Text variant="secondary" className="mt-0.5" size="sm">
          Tell us what happened. Include as much detail as you can — order ids, product names, what
          you expected and what you got. We typically respond within 24 hours.
        </Text>
      </Div>

      <FormShellContext.Provider value={shellCtx}>
        <FormErrorSummary />
        <SectionForm<Values>
          sections={sections}
          values={form}
          onChange={(partial) => setForm((prev) => Object.assign({}, prev, partial))}
          onSubmit={onSubmit}
          schema={supportTicketCreateSchema}
          openIds={nav.openIds}
          onOpenChange={nav.setOpenIds}
          isLoading={submitting}
          submitLabel="Submit ticket"
          onCancel={() => router.push(String(ROUTES.USER.SUPPORT))}
          cancelLabel="Cancel"
        />
      </FormShellContext.Provider>
    </Stack>
  );
}
