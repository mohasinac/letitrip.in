"use client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Button,
  Row,
  Section,
  Textarea,
  Divider,
  EmptyState,
  Skeleton,
} from "@mohasinac/appkit/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ItemRequestDocument } from "@mohasinac/appkit";

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [doc, setDoc] = useState<ItemRequestDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [posting, setPosting] = useState(false);

  const load = () => {
    fetch(`/api/item-requests/${id}`)
      .then((r) => r.json())
      .then((j) => setDoc(j?.data ?? null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const postReply = async () => {
    if (!reply.trim()) return;
    setPosting(true);
    await fetch(`/api/item-requests/${id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });
    setReply("");
    setPosting(false);
    load();
  };

  if (loading) return (
    <Section>
      <Container size="md">
        <Stack gap="md" className="py-6">
          <Skeleton variant="rectangular" height="32px" />
          <Skeleton variant="rectangular" height="120px" />
          <Skeleton variant="rectangular" height="80px" />
        </Stack>
      </Container>
    </Section>
  );
  if (!doc) return <Section><Container size="md"><EmptyState title="Not found" description="This request may have been removed." /></Container></Section>;

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Stack gap="xs">
            <Heading level={1}>{doc.title}</Heading>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
              by {doc.opDisplayName} · {doc.replyCount} replies · status {doc.status}
            </Text>
          </Stack>
          <Text>{doc.description}</Text>
          <Row className="gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            {doc.category ? <Text>Category: {doc.category}</Text> : null}
            {doc.brand ? <Text>Brand: {doc.brand}</Text> : null}
            {doc.maxBudgetInPaise ? (
              <Text>Budget ≤ Rs {(doc.maxBudgetInPaise / 100).toLocaleString("en-IN")}</Text>
            ) : null}
          </Row>
          <Divider />
          <Heading level={2}>Replies</Heading>
          {doc.replies.length === 0 ? (
            <EmptyState title="No replies yet" description="Be the first to respond." />
          ) : (
            <Stack gap="sm">
              {doc.replies.map((r) => (
                <Stack
                  key={r.id}
                  gap="xs"
                  className="p-3 rounded border border-zinc-200 dark:border-slate-700"
                >
                  <Text className="text-xs text-zinc-500 dark:text-zinc-400">
                    {r.authorName ?? r.authorId} ·{" "}
                    {new Date(r.createdAt).toLocaleString()}
                    {r.isOpInitiatedThread ? " · OP-initiated chat" : ""}
                  </Text>
                  <Text>{r.body}</Text>
                </Stack>
              ))}
            </Stack>
          )}
          {doc.status === "open" && (
            <Stack gap="sm">
              <Textarea
                label="Add a reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Sellers: keep contact details private; LetItRip filters PII automatically."
              />
              <Row justify="end">
                <Button variant="primary" onClick={postReply} disabled={posting} isLoading={posting}>
                  Post reply
                </Button>
              </Row>
            </Stack>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
