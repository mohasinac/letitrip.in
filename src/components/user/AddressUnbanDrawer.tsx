"use client";

/**
 * Request that a banned address be unbanned.
 *
 * ## Why this is its own file
 *
 * It was inline in `UserAddressesClient`, a listing page, and its submit was
 * `if (!unbanAddressId || !unbanNote.trim()) return;` — a silent no-op that
 * told the user nothing, backed by a disabled button that also explained
 * nothing. The note is the entire case a support agent reads when deciding
 * whether to restore an address the platform has flagged; "why is the button
 * greyed out" is the wrong way to learn it is required.
 *
 * Extracting it also takes the listing below the sectionising audit's control
 * floor, which is correct: a search box and a label filter are not a form, and
 * the one real form on that page is this drawer.
 */

import { useState } from "react";
import {
  Button,
  FieldTextarea,
  FormErrorSummary,
  SideDrawer,
  Stack,
  Text,
  applyZodIssues,
  useApiMutation,
  useFormShellState,
  FormShellContext,
  addressUnbanRequestSchema,
} from "@mohasinac/appkit/client";
import { requestAddressUnban } from "@/lib/api/user-client";

export interface AddressUnbanDrawerProps {
  /** The address under review, or `null` when the drawer is closed. */
  addressId: string | null;
  onClose: () => void;
  onSubmitted: () => void;
}

export function AddressUnbanDrawer({
  addressId,
  onClose,
  onSubmitted,
}: AddressUnbanDrawerProps) {
  const [note, setNote] = useState("");
  const { shellCtx, setFieldError, clearErrors, markSubmitAttempted } =
    useFormShellState(addressUnbanRequestSchema);

  const requestUnban = useApiMutation<void, Error, { id: string; note: string }>({
    mutationFn: async ({ id, note: body }) => {
      const res = await requestAddressUnban(id, body);
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Failed to submit unban request.");
      }
    },
    successMessage: "Unban request submitted. Our team will review it shortly.",
    onSuccess: () => {
      setNote("");
      onSubmitted();
    },
  });

  const close = () => {
    setNote("");
    clearErrors();
    onClose();
  };

  const submit = () => {
    if (!addressId) return;
    markSubmitAttempted();
    clearErrors();
    const parsed = addressUnbanRequestSchema.safeParse({ note });
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }
    requestUnban.mutate({ id: addressId, note: parsed.data.note });
  };

  return (
    <SideDrawer
      isOpen={!!addressId}
      onClose={close}
      title="Request address unban"
      mode="edit"
      footer={
        /* Bare buttons — the SideDrawer footer slot supplies the ActionRow. */
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={close}
            disabled={requestUnban.isPending}
          >
            Cancel
          </Button>
          {/*
            Deliberately NOT disabled on an empty note. A greyed-out button
            that will not say why is what this replaced; the schema now names
            the problem on the field.
          */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={requestUnban.isPending}
            onClick={submit}
          >
            Submit request
          </Button>
        </>
      }
    >
      <FormShellContext.Provider value={shellCtx}>
        <Stack gap="md">
          <Text size="sm" color="muted">
            Explain why this address should be unbanned. Our support team will
            review your request within 1–3 business days.
          </Text>
          <FormErrorSummary />
          <FieldTextarea
            name="note"
            label="Reason for unban request"
            required
            rows={5}
            value={note}
            onChange={setNote}
            placeholder="e.g. This is my home address and I made an innocent mistake…"
          />
        </Stack>
      </FormShellContext.Provider>
    </SideDrawer>
  );
}
