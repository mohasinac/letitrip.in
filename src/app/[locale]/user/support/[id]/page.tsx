"use client";
import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import {
  useSession,
  useToast,
  ROUTES,
  Div,
  Heading,
  Text,
  Stack,
  Row,
  Textarea,
  Button,
  Badge,
} from "@mohasinac/appkit/client";

const __P = {
  p5: "p-5",
} as const;

interface TicketMessage {
  id: string;
  authorId: string;
  authorRole: "user" | "support" | "admin";
  body: string;
  createdAt: string | Date;
}

interface TicketDoc {
  id: string;
  subject: string;
  category: string;
  status: string;
  description: string;
  orderId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  messages?: TicketMessage[];
}

const STATUS_VARIANT: Record<string, "active" | "pending" | "danger" | "info" | "admin"> = {
  open:             "pending",
  in_progress:      "info",
  waiting_on_user:  "pending",
  resolved:         "active",
  closed:           "admin",
};

function formatDateTime(d: string | Date) {
  return d
    ? new Date(d).toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TicketDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { user, loading: sessionLoading } = useSession();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [reply, setReply] = useState("");

  const { data: ticket, isLoading } = useQuery<TicketDoc>({
    queryKey: ["user-support-ticket", id],
    queryFn: () =>
      fetch(`/api/support/tickets/${id}`)
        .then((r) => r.json())
        .then((r) => r.data),
    enabled: !sessionLoading && !!user,
    staleTime: 15_000,
  });

  const sendReply = useMutation({
    mutationFn: (body: string) =>
      fetch(`/api/support/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      }).then(async (r) => {
        const j = await r.json();
        if (!r.ok || !j?.ok) throw new Error(j?.error ?? "Could not send reply.");
        return j.data;
      }),
    onSuccess: () => {
      setReply("");
      queryClient.invalidateQueries({ queryKey: ["user-support-ticket", id] });
      showToast("Reply sent.", "success");
    },
    onError: (e: any) => showToast(e?.message ?? "Failed to send reply.", "error"),
  });

  if (isLoading) {
    return (
      <Div className="w-full max-w-3xl space-y-4">
        <Div className={`animate-pulse rounded-xl border border-[var(--appkit-color-border)] ${__P.p5} space-y-3`}>
          <Div className="h-4 w-1/3 rounded bg-[var(--appkit-color-border)]" />
          <Div className="h-3 w-2/3 rounded bg-[var(--appkit-color-border)]" />
        </Div>
      </Div>
    );
  }

  if (!ticket) {
    return (
      <Div className="py-24 text-center">
        <Text variant="secondary">Ticket not found.</Text>
        <Link href={String(ROUTES.USER.SUPPORT)} className="mt-3 inline-block text-sm text-[var(--appkit-color-primary)] hover:underline">
          ← Back to all tickets
        </Link>
      </Div>
    );
  }

  const closed = ticket.status === "closed" || ticket.status === "resolved";
  const messages = ticket.messages ?? [];

  return (
    <Div className="w-full max-w-3xl space-y-6">
      <Div>
        <Link
          href={String(ROUTES.USER.SUPPORT)}
          className="text-xs text-[var(--appkit-color-primary)] hover:underline"
        >
          ← All tickets
        </Link>
        <Row justify="between" align="start" wrap gap="3" className="mt-1">
          <Div className="min-w-0">
            <Heading level={1} className="text-2xl font-semibold text-[var(--appkit-color-text)]">
              {ticket.subject}
            </Heading>
            <Row gap="sm" className="mt-1 flex-wrap">
              <Text variant="secondary" className="text-xs capitalize">
                {(ticket.category ?? "general").replaceAll("_", " ")}
              </Text>
              {ticket.orderId && (
                <Text variant="secondary" className="text-xs">
                  · Order{" "}
                  <Link
                    href={String(ROUTES.USER.ORDER_DETAIL(ticket.orderId))}
                    className="text-[var(--appkit-color-primary)] hover:underline"
                  >
                    {ticket.orderId}
                  </Link>
                </Text>
              )}
              <Text variant="secondary" className="text-xs">· Opened {formatDateTime(ticket.createdAt)}</Text>
            </Row>
          </Div>
          <Badge variant={STATUS_VARIANT[ticket.status] ?? "pending"} className="shrink-0 capitalize">
            {(ticket.status ?? "open").replaceAll("_", " ")}
          </Badge>
        </Row>
      </Div>

      <Div className={`rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__P.p5}`}>
        <Text className="text-xs font-semibold text-[var(--appkit-color-text-muted)] uppercase tracking-wider mb-2">
          Your original message
        </Text>
        <Text className="text-sm text-[var(--appkit-color-text)] whitespace-pre-wrap">{ticket.description}</Text>
      </Div>

      <Stack gap="md">
        <Text className="text-sm font-semibold text-[var(--appkit-color-text)]">
          Conversation
        </Text>
        {messages.length === 0 ? (
          <Text variant="secondary" className="text-xs">
            No replies yet. Our support team will respond here.
          </Text>
        ) : (
          messages.map((m) => {
            const mine = m.authorRole === "user";
            return (
              <Div
                key={m.id}
                className={`rounded-xl border p-4 ${
                  mine
                    ? "border-[var(--appkit-color-primary)] bg-[var(--appkit-color-surface)]"
                    : "border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface-input)]"
                }`}
              >
                <Row justify="between" className="mb-2">
                  <Text className="text-xs font-semibold text-[var(--appkit-color-text)] uppercase tracking-wider">
                    {mine ? "You" : m.authorRole === "admin" ? "Admin" : "Support"}
                  </Text>
                  <Text variant="secondary" className="text-xs">{formatDateTime(m.createdAt)}</Text>
                </Row>
                <Text className="text-sm text-[var(--appkit-color-text)] whitespace-pre-wrap">{m.body}</Text>
              </Div>
            );
          })
        )}
      </Stack>

      {closed ? (
        <Div className={`rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__P.p5} text-center`}>
          <Text variant="secondary" className="text-sm">
            This ticket is {ticket.status}. Open a new ticket if you need further help.
          </Text>
        </Div>
      ) : (
        <Stack gap="sm" className={`rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__P.p5}`}>
          <Text className="text-sm font-semibold text-[var(--appkit-color-text)]">Add a reply</Text>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={5}
            placeholder="Type your reply…"
            maxLength={5000}
            className="w-full rounded-md border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-3 py-2 text-sm"
          />
          <Row gap="sm">
            <Button
              type="button"
              variant="primary"
              onClick={() => sendReply.mutate(reply.trim())}
              disabled={reply.trim().length === 0 || sendReply.isPending}
            >
              {sendReply.isPending ? "Sending…" : "Send reply"}
            </Button>
          </Row>
        </Stack>
      )}
    </Div>
  );
}
