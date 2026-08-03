"use client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Button,
  Row,
  Section,
  Input,
  Select,
  Textarea,
  useToast,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { submitReport } from "@/lib/api/report-client";
import { useState } from "react";

const ENTITY_TYPES = [
  { value: "product", label: "Product" },
  { value: "store", label: "Store" },
  { value: "review", label: "Review" },
  { value: "event", label: "Event" },
  { value: "user", label: "User" },
  { value: "blog", label: "Blog" },
  { value: "comment", label: "Comment" },
];

const REASONS = [
  { value: "scam", label: "Scam" },
  { value: "counterfeit", label: "Counterfeit" },
  { value: "prohibited", label: "Prohibited item" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "ip-violation", label: "IP violation" },
  { value: "other", label: "Other" },
];

interface Props {
  initialEntityType: string;
  initialEntityId: string;
}

export function ReportFormClient({ initialEntityType, initialEntityId }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    entityType: initialEntityType,
    entityId: initialEntityId,
    reason: "scam",
    detail: "",
    evidenceUrls: "",
  });
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!form.entityId.trim() || !form.detail.trim()) {
      showToast("Entity and detail are required", "error");
      return;
    }
    setSaving(true);
    const res = await submitReport({
      entityType: form.entityType,
      entityId: form.entityId,
      reason: form.reason,
      detail: form.detail,
      evidenceUrls: form.evidenceUrls.split("\n").map((s) => s.trim()).filter(Boolean),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Report submitted — thank you", "success");
      router.back();
    } else {
      showToast("Submit failed", "error");
    }
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Report a problem</Heading>
          <Text color="muted">
            Reports go to the LetItRip trust & safety team. Frivolous reports may impact your account.
          </Text>
          <Stack gap="md">
            <Select
              label="What are you reporting?"
              value={form.entityType}
              onValueChange={(v) => setForm({ ...form, entityType: String(v) })}
              options={ENTITY_TYPES}
            />
            <Input
              label="Entity ID / slug"
              value={form.entityId}
              onChange={(e) => setForm({ ...form, entityId: e.target.value })}
              placeholder="product-…, store-…, …"
            />
            <Select
              label="Reason"
              value={form.reason}
              onValueChange={(v) => setForm({ ...form, reason: String(v) })}
              options={REASONS}
            />
            <Textarea
              label="Detail"
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              rows={6}
              placeholder="What happened? What should we look at?"
            />
            <Textarea
              label="Evidence URLs (one per line)"
              value={form.evidenceUrls}
              onChange={(e) => setForm({ ...form, evidenceUrls: e.target.value })}
              rows={3}
              placeholder="https://…"
            />
          </Stack>
          <Row justify="end" gap="sm">
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>
              Submit report
            </Button>
          </Row>
        </Stack>
      </Container>
    </Section>
  );
}
