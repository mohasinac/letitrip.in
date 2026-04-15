"use client";

import { useTranslations } from "next-intl";
import { AdminCopilotView as AppkitAdminCopilotView } from "@mohasinac/appkit/features/copilot";
import { THEME_CONSTANTS } from "@/constants";
import { AdminPageHeader } from "@/components";
import { API_ENDPOINTS } from "@/constants";

const { spacing } = THEME_CONSTANTS;

export function AdminCopilotView() {
  const t = useTranslations("copilot");

  return (
    <div className={spacing.pageY}>
      <AppkitAdminCopilotView
        endpoint={API_ENDPOINTS.COPILOT.CHAT}
        labels={{
          title: t("title"),
          newConversation: t("newConversation"),
          noMessages: t("noMessages"),
          noMessagesDesc: t("noMessagesDesc"),
          inputPlaceholder: t("placeholder"),
          sendButton: t("send"),
          sendingButton: t("sending"),
          errorLabel: t("errorGeneration"),
        }}
        renderHeader={(onNewConversation) => (
          <AdminPageHeader
            title={t("title")}
            actionLabel={t("newConversation")}
            onAction={onNewConversation}
          />
        )}
      />
    </div>
  );
}

