"use client";
import { normalizeError } from "@mohasinac/appkit";
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
  Input,
  Textarea,
  Button,
  FieldSelect,
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

  const canSubmit =
    subject.trim().length >= MIN_SUBJECT &&
    description.trim().length >= MIN_DESCRIPTION &&
    (category !== "order_issue" || orderId.trim().length > 0);

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const res = await createSupportTicket({
        category,
        subject: subject.trim(),
        description: description.trim(),
        ...(category === "order_issue" ? { orderId: orderId.trim() } : {}),
      });
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

      <Stack gap="md" className={`border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__P.p5}`} rounded="xl">
        <Div>
          <Text className="text-[var(--appkit-color-text-muted)] mb-1" size="xs" weight="medium">Category</Text>
          <FieldSelect
            name="category"
            aria-label="Ticket category"
            value={category}
            onChange={(v) => setCategory(v as TicketCategory)}
            options={[...TICKET_CATEGORIES]}
          />
        </Div>

        {category === "order_issue" && (
          <Input
            id="order-id"
            label="Order ID"
            placeholder="e.g. order-3-20260508-a1b2c3"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            helperText="Required for order issues. You can find this on My Orders."
            required
          />
        )}

        <Input
          id="subject"
          label="Subject"
          placeholder="Short summary (e.g. Wrong item delivered)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          minLength={MIN_SUBJECT}
          maxLength={200}
          helperText={`${subject.trim().length}/200 — at least ${MIN_SUBJECT} characters`}
        />

        <Stack gap="xs">
          <Text className="text-[var(--appkit-color-text-muted)]" size="xs" weight="medium">Describe the issue</Text>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            placeholder="What happened, when, and what would you like us to do? Include screenshots in a follow-up reply if helpful."
            maxLength={5000}
            className="w-full rounded-md border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-[var(--appkit-space-3)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)]"
          />
          <Text variant="secondary" size="xs" align="end">
            {description.trim().length}/5000 — at least {MIN_DESCRIPTION} characters
          </Text>
        </Stack>

        <Row gap="sm" padding="t-xs">
          <Button
            type="button"
            variant="primary"
            onClick={submit}
            disabled={!canSubmit || submitting}
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
    </Stack>
  );
}
