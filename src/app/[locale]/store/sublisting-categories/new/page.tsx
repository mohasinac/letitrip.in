"use client";

import React, { useState } from "react";

import { useRouter } from "@/i18n/navigation";
import { Heading, ROUTES, Row, Text } from "@mohasinac/appkit/client";
import { Div, Button, Form, Label, Input, Textarea, useApiMutation, apiClient } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

const LBL_CLS = "block text-[length:var(--appkit-text-sm)] font-medium text-[var(--appkit-color-text-muted)] mb-1";

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const createMutation = useApiMutation({
    mutationFn: (payload: { name: string; itemCode?: string; description?: string }) =>
      apiClient.post(API_ROUTES.STORE.SUBLISTING_CATEGORIES, payload),
    onSuccess: () => {
      router.push(String(ROUTES.STORE.SUBLISTING_CATEGORIES));
    },
    onError: (err: Error) => {
      setError(err.message ?? "Failed to create category");
    },
  });
  const saving = createMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    createMutation.mutate({
      name: name.trim(),
      itemCode: itemCode.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <Div className="mx-auto max-w-2xl">
      <Div className="mb-6">
        <Heading level={1} size="2xl" weight="bold" color="primary">
          New Sub-listing Category
        </Heading>
        <Text className="mt-1" color="muted" size="sm">
          Group listings of the same real-world collectible across grades, conditions, or prices.
          Example: &ldquo;Base Set Charizard 108/120&rdquo; groups PSA 10, PSA 9, raw copies, etc.
        </Text>
      </Div>

      <Form onSubmit={handleSubmit} spacing="md">
        <>
          <Label className={LBL_CLS}>
            Category name <Text as="span" className="text-error">*</Text>
          </Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            placeholder="e.g. Base Set Charizard 108/120"
            className="w-full rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-[var(--appkit-space-4)] py-[var(--appkit-space-2-5)] text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)]"
          />
        </>

        <>
          <Label className={LBL_CLS}>
            Item code
          </Label>
          <Input
            type="text"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            maxLength={40}
            placeholder="e.g. PSA 10, 108/120, WOTC, STH"
            className="w-full rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-[var(--appkit-space-4)] py-[var(--appkit-space-2-5)] text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)]"
          />
          <Text className="mt-1" color="faint" size="xs">
            Grade, card number, set code, or series. Optional but helps buyers find matches.
          </Text>
        </>

        <>
          <Label className={LBL_CLS}>
            Description
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Brief description shown on the public category page…"
            className="w-full rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-[var(--appkit-space-4)] py-[var(--appkit-space-2-5)] text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)] resize-none"
          />
        </>

        {error && (
          <Div textSize="sm" className="border border-error/20" color="error" surface="danger-surface" padding="inline" rounded="xl">
            {error}
          </Div>
        )}

        <Row gap="3" padding="t-xs">
          <Button rounded="lg"
            type="submit"
            variant="primary"
            disabled={!name.trim() || saving}
            paddingX="lg" textSize="sm" weight="semibold"
            paddingY="y-xs-tall" className="hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create category"}
          </Button>
          <Button rounded="lg" 
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="px-[var(--appkit-space-5)] py-[var(--appkit-space-2-5)] text-[length:var(--appkit-text-sm)] font-medium"
          >
            Cancel
          </Button>
        </Row>
      </Form>
    </Div>
  );
}
