import { apiService } from './api.service';
import type {
  SupportTicket,
  SupportTicketMessage,
  SupportTicketStatus,
  SupportTicketCategory,
  SupportTicketPriority,
  PaginatedResponse,
} from '@/types';

interface TicketFilters {
  status?: SupportTicketStatus;
  category?: SupportTicketCategory;
  priority?: SupportTicketPriority;
  shopId?: string;
  orderId?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface CreateTicketData {
  category: SupportTicketCategory;
  priority?: SupportTicketPriority;
  subject: string;
  description: string;
  attachments?: string[];
  shopId?: string;
  orderId?: string;
}

interface UpdateTicketData {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  subject?: string;
}

interface ReplyToTicketData {
  message: string;
  attachments?: string[];
  isInternal?: boolean;
}

interface AssignTicketData {
  assignedTo: string;
  notes?: string;
}

interface EscalateTicketData {
  reason: string;
  notes?: string;
}

class SupportService {
  // List tickets (role-filtered)
  async listTickets(filters?: TicketFilters): Promise<PaginatedResponse<SupportTicket>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/support/tickets?${queryString}` : '/support/tickets';
    
    return apiService.get<PaginatedResponse<SupportTicket>>(endpoint);
  }

  // Get ticket by ID
  async getTicket(id: string): Promise<SupportTicket> {
    return apiService.get<SupportTicket>(`/support/tickets/${id}`);
  }

  // Create ticket
  async createTicket(data: CreateTicketData): Promise<SupportTicket> {
    return apiService.post<SupportTicket>('/support/tickets', data);
  }

  // Update ticket
  async updateTicket(id: string, data: UpdateTicketData): Promise<SupportTicket> {
    return apiService.patch<SupportTicket>(`/support/tickets/${id}`, data);
  }

  // Close ticket
  async closeTicket(id: string): Promise<SupportTicket> {
    return apiService.post<SupportTicket>(`/support/tickets/${id}/close`, {});
  }

  // Get ticket messages
  async getMessages(ticketId: string, page?: number, limit?: number): Promise<PaginatedResponse<SupportTicketMessage>> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString 
      ? `/support/tickets/${ticketId}/messages?${queryString}` 
      : `/support/tickets/${ticketId}/messages`;
    
    return apiService.get<PaginatedResponse<SupportTicketMessage>>(endpoint);
  }

  // Reply to ticket
  async replyToTicket(ticketId: string, data: ReplyToTicketData): Promise<SupportTicketMessage> {
    return apiService.post<SupportTicketMessage>(`/support/tickets/${ticketId}/messages`, data);
  }

  // Assign ticket (admin only)
  async assignTicket(id: string, data: AssignTicketData): Promise<SupportTicket> {
    return apiService.post<SupportTicket>(`/support/tickets/${id}/assign`, data);
  }

  // Escalate ticket (seller/admin)
  async escalateTicket(id: string, data: EscalateTicketData): Promise<SupportTicket> {
    return apiService.post<SupportTicket>(`/support/tickets/${id}/escalate`, data);
  }

  // Upload attachment
  async uploadAttachment(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/support/attachments', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload attachment');
    }
    
    return response.json();
  }

  // Get ticket statistics (admin only)
  async getStats(filters?: { shopId?: string; startDate?: string; endDate?: string }): Promise<{
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    ticketsByCategory: Record<SupportTicketCategory, number>;
    ticketsByPriority: Record<SupportTicketPriority, number>;
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
    const endpoint = queryString ? `/support/stats?${queryString}` : '/support/stats';
    
    return apiService.get<any>(endpoint);
  }

  // Get my tickets
  async getMyTickets(filters?: Omit<TicketFilters, 'assignedTo'>): Promise<PaginatedResponse<SupportTicket>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/support/my-tickets?${queryString}` : '/support/my-tickets';
    
    return apiService.get<PaginatedResponse<SupportTicket>>(endpoint);
  }

  // Get ticket count
  async getTicketCount(filters?: Pick<TicketFilters, 'status' | 'category'>): Promise<{ count: number }> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/support/count?${queryString}` : '/support/count';
    
    return apiService.get<{ count: number }>(endpoint);
  }
}

export const supportService = new SupportService();
export type {
  TicketFilters,
  CreateTicketData,
  UpdateTicketData,
  ReplyToTicketData,
  AssignTicketData,
  EscalateTicketData,
};
