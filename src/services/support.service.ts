import { apiService } from "./api.service";
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
  EscalateTicketFormFE,
} from "@/types/frontend/support-ticket.types";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";
import type {
  TicketStatus,
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
  toBEEscalateTicketRequest,
} from "@/types/transforms/support-ticket.transforms";

// Removed old interfaces - now using types from type system

class SupportService {
  // List tickets (role-filtered)
  async listTickets(
    filters?: Partial<SupportTicketFiltersBE>
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
      ? `/support/tickets?${queryString}`
      : "/support/tickets";

    const response = await apiService.get<PaginatedResponseBE<SupportTicketBE>>(
      endpoint
    );

    return {
      data: toFESupportTickets(response.data),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
      hasMore: response.hasMore,
    };
  }

  // Get ticket by ID
  async getTicket(id: string): Promise<SupportTicketFE> {
    const ticketBE = await apiService.get<SupportTicketBE>(
      `/support/tickets/${id}`
    );
    return toFESupportTicket(ticketBE);
  }

  // Create ticket
  async createTicket(data: SupportTicketFormFE): Promise<SupportTicketFE> {
    const request = toBECreateSupportTicketRequest(data);
    const ticketBE = await apiService.post<SupportTicketBE>(
      "/support/tickets",
      request
    );
    return toFESupportTicket(ticketBE);
  }

  // Update ticket
  async updateTicket(
    id: string,
    data: UpdateTicketFormFE
  ): Promise<SupportTicketFE> {
    const request = toBEUpdateSupportTicketRequest(data);
    const ticketBE = await apiService.patch<SupportTicketBE>(
      `/support/tickets/${id}`,
      request
    );
    return toFESupportTicket(ticketBE);
  }

  // Close ticket
  async closeTicket(id: string): Promise<SupportTicketFE> {
    const ticketBE = await apiService.post<SupportTicketBE>(
      `/support/tickets/${id}/close`,
      {}
    );
    return toFESupportTicket(ticketBE);
  }

  // Get ticket messages
  async getMessages(
    ticketId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponseFE<SupportTicketMessageFE>> {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/support/tickets/${ticketId}/messages?${queryString}`
      : `/support/tickets/${ticketId}/messages`;

    const response = await apiService.get<
      PaginatedResponseBE<SupportTicketMessageBE>
    >(endpoint);

    return {
      data: toFESupportTicketMessages(response.data),
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
      hasMore: response.hasMore,
    };
  }

  // Reply to ticket
  async replyToTicket(
    ticketId: string,
    data: ReplyToTicketFormFE
  ): Promise<SupportTicketMessageFE> {
    const request = toBEReplyToTicketRequest(data);
    const messageBE = await apiService.post<SupportTicketMessageBE>(
      `/support/tickets/${ticketId}/messages`,
      request
    );
    return toFESupportTicketMessage(messageBE);
  }

  // Assign ticket (admin only)
  async assignTicket(
    id: string,
    data: AssignTicketFormFE
  ): Promise<SupportTicketFE> {
    const request = toBEAssignTicketRequest(data);
    const ticketBE = await apiService.post<SupportTicketBE>(
      `/support/tickets/${id}/assign`,
      request
    );
    return toFESupportTicket(ticketBE);
  }

  // Escalate ticket (seller/admin)
  async escalateTicket(
    id: string,
    data: EscalateTicketFormFE
  ): Promise<SupportTicketFE> {
    const request = toBEEscalateTicketRequest(data);
    const ticketBE = await apiService.post<SupportTicketBE>(
      `/support/tickets/${id}/escalate`,
      request
    );
    return toFESupportTicket(ticketBE);
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
    filters?: Omit<Partial<SupportTicketFiltersBE>, "assignedTo">
  ): Promise<PaginatedResponseFE<SupportTicketFE>> {
    return this.listTickets(filters);
  }

  // Get ticket count
  async getTicketCount(
    filters?: Pick<Partial<SupportTicketFiltersBE>, "status" | "category">
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
