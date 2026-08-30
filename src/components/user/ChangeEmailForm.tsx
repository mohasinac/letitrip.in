"use client";

/**
 * Change the account email.
 *
 * ## Why this is its own file
 *
 * It was inline in `/user/settings`, a 381-line four-tab page, and the schema
 * it declared on `<Form>` never ran: the submit handler was
 * `if (!newEmail || !emailPassword) return;` — a silent no-op that told the
 * user nothing, on the form that changes the address every future sign-in and
 * password reset goes to. Both inputs were raw `<Input id=…>` rather than
 * `name=…`, so `applyZodIssues` had nowhere to put an error even had the
 * schema executed, and `required` was an HTML attribute any programmatic
 * submit ignores.
 *
 * Extracting it is what lets the schema run against a draft this component
 * owns, and it takes the settings page below the audit's control floor — the
 * page is a tab shell, not a form, and W8 tabs it properly.
 *
 * Two controls, so `<Form>` rather than `<SectionForm>`: there is nothing to
 * collapse, which is exactly the case `MIN_CONTROLS = 3` draws the line at.
 */

import { useState } from "react";
import {
  ACTIONS,
  Button,
  Div,
  FieldInput,
  Form,
  FormErrorSummary,
  Stack,
  Text,
  applyZodIssues,
  changeEmailSchema,
  useChangeEmail,
  useToast,
} from "@mohasinac/appkit/client";

export function ChangeEmailForm({ onChanged }: { onChanged?: () => void }) {
  const { showToast } = useToast();
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  const changeEmail = useChangeEmail({
    onSuccess: () => {
      showToast(
        `Verification email sent to ${newEmail}. Click the link in the email to confirm your new address.`,
        "success",
      );
      setNewEmail("");
      setEmailPassword("");
      onChanged?.();
    },
    /*
     * `useChangeEmail` is a raw `useMutation` over the client auth provider,
     * not a `useApiMutation` — the whole auth-hook family is — so there is no
     * built-in failure surface and this toast is the only one.
     */
    onError: () => showToast("Failed to update email.", "error"),
  });

  return (
    <Stack gap="md" padding="t-sm">
      <Text variant="secondary" size="xs">
        A verification link will be sent to your new address. Your email updates
        after you click the link.
      </Text>
      <Form
        schema={changeEmailSchema}
        onSubmit={(e) => e.preventDefault()}
        className="grid gap-[1rem] md:grid-cols-[1fr_240px]"
        align="start"
      >
        {({ setFieldError, clearErrors, markSubmitAttempted }) => (
          <>
            <Stack gap="sm">
              <FormErrorSummary />
              <FieldInput
                name="newEmail"
                type="email"
                label="New email address"
                required
                autoComplete="email"
                placeholder="new@example.com"
                value={newEmail}
                onChange={setNewEmail}
              />
              <FieldInput
                name="emailPassword"
                type="password"
                label="Current password"
                required
                autoComplete="current-password"
                value={emailPassword}
                onChange={setEmailPassword}
              />
              <Div>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={changeEmail.isPending}
                  onClick={() => {
                    // A `type="submit"` inside a `<Form>` whose onSubmit only
                    // preventDefaults never marks the attempt, so the summary
                    // would stay hidden on the first failed try.
                    markSubmitAttempted();
                    clearErrors();
                    const parsed = changeEmailSchema.safeParse({
                      newEmail,
                      emailPassword,
                    });
                    if (!parsed.success) {
                      applyZodIssues(parsed.error.issues, setFieldError);
                      return;
                    }
                    changeEmail.mutate({
                      currentPassword: parsed.data.emailPassword,
                      newEmail: parsed.data.newEmail,
                    });
                  }}
                >
                  {ACTIONS.USER["send-verification-email"].label}
                </Button>
              </Div>
            </Stack>
            <Text variant="secondary" className="md:mt-1" size="xs">
              We will email a confirmation link to your new address. Until you
              click it, your sign-in email stays the same. The link expires
              after 24 hours.
            </Text>
          </>
        )}
      </Form>
    </Stack>
  );
}
