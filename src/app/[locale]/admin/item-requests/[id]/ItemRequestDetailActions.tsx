"use client";

// Reuses the exact PATCH call shape the Item Requests list page's inline
// approve/reject controls already use (updateAdminItemRequest ->
// PATCH /api/admin/item-requests/[id]).
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button, Row, useToast, ACTIONS, normalizeError } from "@mohasinac/appkit/client";
import type { ItemRequestDocument } from "@mohasinac/appkit";
import { API_ROUTES } from "@/constants";
import { updateAdminItemRequest } from "@/lib/api/admin-client";

export interface ItemRequestDetailActionsProps {
  id: string;
  status: ItemRequestDocument["status"];
}

export function ItemRequestDetailActions({ id, status }: ItemRequestDetailActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const action = async (nextStatus: ItemRequestDocument["status"]) => {
    setSubmitting(true);
    try {
      await updateAdminItemRequest(API_ROUTES.ADMIN.ITEM_REQUEST_BY_ID(id), { status: nextStatus });
      showToast("Item request updated.", "success");
      router.refresh();
    } catch (err) {
      void normalizeError(err);
      showToast("Failed to update item request.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (status !== "pending-approval") {
    return null;
  }

  return (
    <Row gap="sm">
      <Button variant="primary" onClick={() => action("open")} disabled={submitting} isLoading={submitting}>
        {ACTIONS.ADMIN["approve-product"].label}
      </Button>
      <Button variant="danger" onClick={() => action("rejected")} disabled={submitting}>
        {ACTIONS.ADMIN["reject-product"].label}
      </Button>
    </Row>
  );
}
