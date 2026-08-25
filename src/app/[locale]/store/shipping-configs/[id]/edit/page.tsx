"use client";

/**
 * Edit a shipping rule.
 *
 * ## What changed
 *
 * `shippingConfigFormSchema` already existed and already validated the route;
 * this page used raw controls and ignored it. That mattered more here than on
 * most pages: the schema's `superRefine` enforces "a rate rule must have a
 * rate" per method, so a flat-rate rule with no flat rate was previously
 * rejected only by the server, as an opaque toast.
 *
 * The method dropdown also carried its own inline copy of the six options;
 * both it and the schema's enum now derive from one label map.
 */

import {
  Container,
  Stack,
  Heading,
  Button,
  Row,
  Section,
  Skeleton,
  Form,
  FieldInput,
  FieldSelect,
  FieldCheckbox,
  FormErrorSummary,
  applyZodIssues,
  ROUTES,
  useToast,
  ConfirmDeleteModal,
  ACTIONS,
  shippingConfigFormSchema,
  SHIPPING_METHOD_OPTIONS,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { API_ROUTES } from "@/constants";
import {
  getShippingConfig,
  updateShippingConfig,
  deleteShippingConfig,
} from "@/lib/api/store-client";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [form, setForm] = useState({
    label: "",
    method: "flat",
    flatRate: 0,
    estimatedDays: 0,
    isDefault: false,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getShippingConfig(API_ROUTES.STORE.SHIPPING_CONFIG_BY_ID(id))
      .then((r) => r.json())
      .then((j) => {
        const d = (j?.data ?? {}) as Record<string, unknown>;
        setForm({
          label: String(d.label ?? ""),
          method: String(d.method ?? "flat"),
          flatRate: Number(d.flatRate ?? 0),
          estimatedDays: Number(d.estimatedDays ?? 0),
          isDefault: Boolean(d.isDefault),
          isActive: d.isActive !== false,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onDelete = async () => {
    await deleteShippingConfig(API_ROUTES.STORE.SHIPPING_CONFIG_BY_ID(id));
    router.push(String(ROUTES.STORE.SHIPPING_CONFIGS));
  };

  if (loading) {
    return (
      <Section>
        <Container size="md">
          <Stack gap="md" padding="y-lg">
            <Skeleton variant="rectangular" height="32px" />
            <Skeleton variant="rectangular" height="56px" />
            <Skeleton variant="rectangular" height="56px" />
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Edit Shipping Configuration</Heading>
          <Form schema={shippingConfigFormSchema} onSubmit={(e) => e.preventDefault()}>
            {({ setFieldError, clearErrors }) => (
              <Stack gap="md">
                <FormErrorSummary />
                <FieldInput
                  name="label"
                  label="Label"
                  required
                  value={form.label}
                  onChange={(v) => setForm({ ...form, label: v })}
                />
                <FieldSelect
                  name="method"
                  label="Method"
                  required
                  value={form.method}
                  onChange={(v) => setForm({ ...form, method: String(v) })}
                  options={SHIPPING_METHOD_OPTIONS}
                />
                <FieldInput
                  name="flatRate"
                  type="number"
                  label="Flat rate (₹)"
                  value={String(form.flatRate)}
                  onChange={(v) => setForm({ ...form, flatRate: Number(v) || 0 })}
                />
                <FieldInput
                  name="estimatedDays"
                  type="number"
                  label="Estimated days"
                  value={String(form.estimatedDays)}
                  onChange={(v) => setForm({ ...form, estimatedDays: Number(v) || 0 })}
                />
                <Row gap="md" wrap>
                  <FieldCheckbox
                    name="isDefault"
                    label="Default"
                    checked={form.isDefault}
                    onChange={(v) => setForm({ ...form, isDefault: v })}
                  />
                  <FieldCheckbox
                    name="isActive"
                    label="Active"
                    checked={form.isActive}
                    onChange={(v) => setForm({ ...form, isActive: v })}
                  />
                </Row>
                <Row justify="between" gap="sm">
                  <Button variant="danger" type="button" onClick={() => setConfirmDelete(true)}>
                    {ACTIONS.STORE["delete-listing"].label}
                  </Button>
                  <Row gap="sm">
                    <Button variant="ghost" type="button" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={saving}
                      isLoading={saving}
                      onClick={async () => {
                        clearErrors();
                        const parsed = shippingConfigFormSchema.safeParse(form);
                        if (!parsed.success) {
                          applyZodIssues(parsed.error.issues, setFieldError);
                          return;
                        }
                        setSaving(true);
                        const res = await updateShippingConfig(
                          API_ROUTES.STORE.SHIPPING_CONFIG_BY_ID(id),
                          parsed.data,
                        );
                        setSaving(false);
                        if (res.ok) {
                          showToast("Saved", "success");
                          router.push(String(ROUTES.STORE.SHIPPING_CONFIGS));
                        } else {
                          const detail = await res
                            .json()
                            .then((j: { error?: string; message?: string }) => j?.error ?? j?.message)
                            .catch(() => undefined);
                          setFieldError("label", detail ?? "Save failed");
                        }
                      }}
                    >
                      {ACTIONS.STORE["save-changes"].label}
                    </Button>
                  </Row>
                </Row>
              </Stack>
            )}
          </Form>
        </Stack>
      </Container>
      <ConfirmDeleteModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        title="Delete shipping config?"
        message="This cannot be undone."
      />
    </Section>
  );
}
