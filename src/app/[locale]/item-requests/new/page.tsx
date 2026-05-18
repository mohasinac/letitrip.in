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
  Textarea,
  ROUTES,
  useToast,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    brand: "",
    maxBudgetInPaise: 0,
  });
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      showToast("Title and description are required", "error");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/item-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Request submitted for approval", "success");
      router.push(String(ROUTES.PUBLIC.ITEM_REQUESTS));
    } else {
      showToast("Submit failed", "error");
    }
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>Post an Item Request</Heading>
          <Text className="text-zinc-600 dark:text-slate-400">
            Tell sellers what you're hunting. Requests are approved before going live.
          </Text>
          <Stack gap="md">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Looking for Shadowless Charizard PSA 8+"
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              placeholder="Condition, year, edition, budget range, any other notes…"
            />
            <Row className="gap-4">
              <Input
                label="Category (slug)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="trading-cards"
              />
              <Input
                label="Brand (slug)"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="pokemon"
              />
            </Row>
            <Input
              type="number"
              label="Max budget (paise)"
              value={String(form.maxBudgetInPaise)}
              onChange={(e) =>
                setForm({ ...form, maxBudgetInPaise: Number(e.target.value) || 0 })
              }
            />
          </Stack>
          <Row className="gap-2 justify-end">
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>
              Submit for review
            </Button>
          </Row>
        </Stack>
      </Container>
    </Section>
  );
}
