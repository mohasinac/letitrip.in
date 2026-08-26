"use client";

import {
  Container,
  Stack,
  Heading,
  Button,
  Row,
  Section,
  Form,
  FieldInput,
  FieldSelect,
  FieldCheckbox,
  FormErrorSummary,
  applyZodIssues,
  shippingConfigFormSchema,
  SHIPPING_METHOD_OPTIONS,
  ROUTES,
  useToast,
  ACTIONS,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { createShippingConfig } from "@/lib/api/store-client";
import { useState } from "react";

/**
 * Create a shipping configuration.
 *
 * ## It validated NOTHING — not even a non-empty label
 *
 * Its `[id]/edit` sibling has used `shippingConfigFormSchema` for a while;
 * this page never did, and had no `.trim()` check either. An empty-label
 * config saved cleanly and then appeared as a blank row in the seller's
 * shipping list and at checkout. The create/edit asymmetry Root Cause #39
 * describes, on the validation axis.
 *
 * ## Two controls were in the state and rendered nowhere
 *
 * `isDefault` and `isActive` were held in form state and POSTed, with no UI
 * for either — so a seller could never create a config as the default, or
 * create one inactive to set up before switching it on. Both were frozen at
 * `false`/`true` forever. Same shape as Root Cause #52: the data was already
 * flowing, nothing rendered it.
 *
 * The per-method fields (price-per-kg, free-above) are kept conditional as
 * they were — they are meaningless for the other methods, and the edit page
 * showing a flat-rate box for a pickup config is its own smaller gap.
 */
export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    label: "",
    method: "flat",
    flatRate: 0,
    pricePerKg: 0,
    freeAbove: 0,
    estimatedDays: 5,
    isDefault: false,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>New Shipping Configuration</Heading>

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
                  placeholder="e.g. Flat ₹99"
                />
                <FieldSelect
                  name="method"
                  label="Method"
                  required
                  value={form.method}
                  onChange={(v) => setForm({ ...form, method: String(v) })}
                  options={SHIPPING_METHOD_OPTIONS}
                />

                {form.method === "flat" && (
                  <FieldInput
                    name="flatRate"
                    type="number"
                    label="Flat rate (₹)"
                    value={String(form.flatRate)}
                    onChange={(v) => setForm({ ...form, flatRate: Number(v) || 0 })}
                  />
                )}
                {form.method === "weight" && (
                  <FieldInput
                    name="pricePerKg"
                    type="number"
                    label="Price per kg (₹)"
                    value={String(form.pricePerKg)}
                    onChange={(v) => setForm({ ...form, pricePerKg: Number(v) || 0 })}
                  />
                )}
                {form.method === "free" && (
                  <FieldInput
                    name="freeAbove"
                    type="number"
                    label="Free above (₹)"
                    value={String(form.freeAbove)}
                    onChange={(v) => setForm({ ...form, freeAbove: Number(v) || 0 })}
                  />
                )}

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

                <Row justify="end" gap="sm">
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
                      const res = await createShippingConfig(
                        API_ROUTES.STORE.SHIPPING_CONFIGS,
                        parsed.data,
                      );
                      setSaving(false);
                      if (res.ok) {
                        showToast("Saved", "success");
                        router.push(String(ROUTES.STORE.SHIPPING_CONFIGS));
                        return;
                      }
                      /*
                       * Onto the field, not a toast. The old page threw
                       * `new Error("Save failed")` and showed its message,
                       * discarding whatever the server actually said.
                       */
                      const detail = await res
                        .json()
                        .then((j: { error?: string; message?: string }) => j?.error ?? j?.message)
                        .catch(() => undefined);
                      setFieldError("label", detail ?? "Save failed");
                    }}
                  >
                    {ACTIONS.STORE["save-changes"].label}
                  </Button>
                </Row>
              </Stack>
            )}
          </Form>
        </Stack>
      </Container>
    </Section>
  );
}
