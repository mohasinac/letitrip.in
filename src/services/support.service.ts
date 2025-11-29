import { apiService } from "./api.service";
import { TICKET_ROUTES } from "@/constants/api-routes";
import type {
  SupportTicketBE,
  SupportTicketMessageBE,
  SupportTicketFiltersBE,
} from "@/types/backend/support-ticket.types";
import type {
  SupportTicketFE,
  SupportTicketMessageFE,
  SupportTicketFormFE,
  UpdateTicketFormFE,
  ReplyToTicketFormFE,
  AssignTicketFormFE,
} from "@/types/frontend/support-ticket.types";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";
import type {
  TicketCategory,
  TicketPriority,
} from "@/types/shared/common.types";
import {
  toFESupportTicket,
  toFESupportTickets,
  toFESupportTicketMessage,
  toFESupportTicketMessages,
  toBECreateSupportTicketRequest,
  toBEUpdateSupportTicketRequest,
  toBEReplyToTicketRequest,
  toBEAssignTicketRequest,
} from "@/types/transforms/support-ticket.transforms";

/**
 * Support/Tickets Service
 * Manages support tickets with role-based access (User, Seller, Admin)
 */

class SupportService {
  // List tickets (role-filtered: user sees own, seller sees shop, admin sees all)
  async listTickets(
    filters?: Partial<SupportTicketFiltersBE>,
  ): Promise<PaginatedResponseFE<SupportTicketFE>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${TICKET_ROUTES.LIST}?${queryString}`
      : TICKET_ROUTES.LIST;

    const response =
      await apiService.get<PaginatedResponseBE<SupportTicketBE>>(endpoint);

    return {
      data: toFESupportTickets(response.data),
      count: response.count,
      pagination: response.pagination,
    };
  }

  // Get ticket by ID (owner, related seller, or admin only)
  async getTicket(id: string): Promise<SupportTicketFE> {
    const response: any = await apiService.get(TICKET_ROUTES.BY_ID(id));
    return toFESupportTicket(response.data);
  }

  // Create ticket (authenticated users only)
  async createTicket(data: SupportTicketFormFE): Promise<SupportTicketFE> {
    const request = toBECreateSupportTicketRequest(data);
    const response: any = await apiService.post(TICKET_ROUTES.LIST, request);
    return toFESupportTicket(response.data);
  }

  // Update ticket (owner with limited fields, admin with all fields)
  async updateTicket(
    id: string,
    data: UpdateTicketFormFE,
  ): Promise<SupportTicketFE> {
    const request = toBEUpdateSupportTicketRequest(data);
    const response: any = await apiService.patch(
      TICKET_ROUTES.BY_ID(id),
      request,
    );
    return toFESupportTicket(response.data);
  }

  // Close ticket (now uses PATCH with status update)
  async closeTicket(id: string): Promise<SupportTicketFE> {
    const response: any = await apiService.patch(TICKET_ROUTES.BY_ID(id), {
      status: "closed",
    });
    return toFESupportTicket(response.data);
  }

  // Get ticket messages
  async getMessages(
    ticketId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResponseFE<SupportTicketMessageFE>> {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/support/tickets/${ticketId}/messages?${queryString}`
      : `/support/tickets/${ticketId}/messages`;

    const response =
      await apiService.get<PaginatedResponseBE<SupportTicketMessageBE>>(
        endpoint,
      );

    return {
      data: toFESupportTicketMessages(response.data),
      count: response.count,
      pagination: response.pagination,
    };
  }

  // Reply to ticket (owner, seller, or admin)
  async replyToTicket(
    ticketId: string,
    data: ReplyToTicketFormFE,
  ): Promise<SupportTicketMessageFE> {
    const request = toBEReplyToTicketRequest(data);
    const response: any = await apiService.post(
      TICKET_ROUTES.REPLY(ticketId),
      request,
    );
    return toFESupportTicketMessage(response.data);
  }

  // Assign ticket (admin only - now uses bulk endpoint)
  async assignTicket(
    id: string,
    data: AssignTicketFormFE,
  ): Promise<SupportTicketFE> {
    const request = toBEAssignTicketRequest(data);
    await apiService.post(TICKET_ROUTES.BULK, {
      action: "assign",
      ids: [id],
      updates: request,
    });
    return this.getTicket(id);
  }

  // Escalate ticket (admin only - now uses bulk endpoint)
  async escalateTicket(id: string): Promise<SupportTicketFE> {
    await apiService.post(TICKET_ROUTES.BULK, {
      action: "escalate",
      ids: [id],
    });
    return this.getTicket(id);
  }

  // Bulk operations (admin only)
  async bulkDelete(ids: string[]): Promise<void> {
    await apiService.post(TICKET_ROUTES.BULK, {
      action: "delete",
      ids,
    });
  }

  async bulkUpdate(
    ids: string[],
    updates: Partial<UpdateTicketFormFE>,
  ): Promise<void> {
    await apiService.post(TICKET_ROUTES.BULK, {
      action: "update",
      ids,
      updates,
    });
  }

  async bulkResolve(ids: string[]): Promise<void> {
    await apiService.post(TICKET_ROUTES.BULK, {
      action: "resolve",
      ids,
    });
  }

  async bulkClose(ids: string[]): Promise<void> {
    await apiService.post(TICKET_ROUTES.BULK, {
      action: "close",
      ids,
    });
  }

  // Upload attachment
  async uploadAttachment(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/support/attachments", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload attachment");
    }

    return response.json();
  }

  // Get ticket statistics (admin only)
  async getStats(filters?: {
    shopId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    ticketsByCategory: Record<TicketCategory, number>;
    ticketsByPriority: Record<TicketPriority, number>;
  }> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/support/stats?${queryString}`
      : "/support/stats";

    return apiService.get<any>(endpoint);
  }

  // Get my tickets
  async getMyTickets(
    filters?: Omit<Partial<SupportTicketFiltersBE>, "assignedTo">,
  ): Promise<PaginatedResponseFE<SupportTicketFE>> {
    return this.listTickets(filters);
  }

  // Get ticket count
  async getTicketCount(
    filters?: Pick<Partial<SupportTicketFiltersBE>, "status" | "category">,
  ): Promise<{ count: number }> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/support/count?${queryString}`
      : "/support/count";

    return apiService.get<{ count: number }>(endpoint);
  }
}

export const supportService = new SupportService();
// Types are now exported from type system
// Use SupportTicketFiltersBE, SupportTicketFormFE, etc. from @/types/
