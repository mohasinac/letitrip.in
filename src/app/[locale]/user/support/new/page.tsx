"use client";
import { normalizeError } from "@mohasinac/appkit/client";
import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import {
  useSession,
  useToast,
  ROUTES,
  Div,
  Heading,
  Text,
  Stack,
  Row,
  Button,
  Form,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  FormErrorSummary,
  applyZodIssues,
  supportTicketCreateSchema,
} from "@mohasinac/appkit/client";
import { TICKET_CATEGORIES, type TicketCategory } from "@/constants";
import { createSupportTicket } from "@/lib/api/support-client";

const __P = {
  p5: "p-[var(--appkit-space-5)]",
} as const;

const MIN_SUBJECT = 3;
const MIN_DESCRIPTION = 10;

export default function NewSupportTicketPage() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const { showToast } = useToast();

  const [category, setCategory] = useState<TicketCategory>("general");
  const [subject, setSubject] = useState("");
  const [orderId, setOrderId] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!sessionLoading && !user) {
    return (
      <Div padding="y-6xl" className="text-center">
        <Text variant="secondary">Sign in to open a support ticket.</Text>
      </Div>
    );
  }

  async function submit(setFieldError: (name: string, error: string | null) => void) {
    if (submitting) return;

    /*
     * The schema replaces a `canSubmit` boolean that DISABLED the button. A
     * disabled submit with no explanation is worse than an error: the user
     * cannot tell whether the subject is too short, the description too
     * short, or the order id missing — the three things it silently gated on.
     */
    const parsed = supportTicketCreateSchema.safeParse({
      category,
      subject: subject.trim(),
      description: description.trim(),
      orderId: orderId.trim() || undefined,
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
        showToast(json?.error ?? "Could not create ticket.", "error");
        return;
      }
      showToast("Ticket created.", "success");
      const newId = json?.data?.id ?? json?.data?.ticket?.id;
      router.push(String(newId ? ROUTES.USER.SUPPORT_TICKET(newId) : ROUTES.USER.SUPPORT));
    } catch (e: any) {
      void normalizeError(e);
      showToast(e?.message ?? "Network error.", "error");
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
        <Heading level={1} className="text-[var(--appkit-color-text)] mt-1" size="2xl" weight="semibold">
          New support ticket
        </Heading>
        <Text variant="secondary" className="mt-0.5" size="sm">
          Tell us what happened. Include as much detail as you can — order ids, product names, what you expected and what you got. We typically respond within 24 hours.
        </Text>
      </Div>

      <Form
        schema={supportTicketCreateSchema}
        onSubmit={(e) => e.preventDefault()}
        className={`border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__P.p5} rounded-xl`}
      >
        {({ setFieldError, clearErrors }) => (
        <Stack gap="md">
        <FormErrorSummary />
        <FieldSelect
          name="category"
          label="Category"
          value={category}
          onChange={(v) => setCategory(v as TicketCategory)}
          options={[...TICKET_CATEGORIES]}
        />

        {category === "order_issue" && (
          <FieldInput
            name="orderId"
            label="Order ID"
            placeholder="e.g. order-3-20260508-a1b2c3"
            value={orderId}
            onChange={setOrderId}
            hint="Required for order issues. You can find this on My Orders."
            required
          />
        )}

        <FieldInput
          name="subject"
          label="Subject"
          placeholder="Short summary (e.g. Wrong item delivered)"
          value={subject}
          onChange={setSubject}
          required
          hint={`${subject.trim().length}/200 — at least ${MIN_SUBJECT} characters`}
        />

        <FieldTextarea
          name="description"
          label="Describe the issue"
          value={description}
          onChange={setDescription}
          rows={8}
          placeholder="What happened, when, and what would you like us to do? Include screenshots in a follow-up reply if helpful."
          required
          hint={`${description.trim().length}/5000 — at least ${MIN_DESCRIPTION} characters`}
        />

        <Row gap="sm" padding="t-xs">
          <Button
            type="submit"
            variant="primary"
            onClick={() => {
              clearErrors();
              void submit(setFieldError);
            }}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit ticket"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(String(ROUTES.USER.SUPPORT))}
            disabled={submitting}
          >
            Cancel
          </Button>
        </Row>
        </Stack>
        )}
      </Form>
    </Stack>
  );
}
