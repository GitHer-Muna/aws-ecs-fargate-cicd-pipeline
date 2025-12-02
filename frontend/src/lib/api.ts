import { apiClient } from '@/lib/api-client';
import {
  LoginCredentials,
  RegisterData,
  TokenResponse,
  User,
  Ticket,
  CreateTicketData,
  UpdateTicketData,
  TicketFilters,
  TicketStats,
  PaginationMeta,
} from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<TokenResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  logout: async (refreshToken: string) => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await apiClient.put('/auth/change-password', { currentPassword, newPassword });
  },
};

export const ticketApi = {
  getTickets: async (filters?: TicketFilters) => {
    const response = await apiClient.get<Ticket[]>('/tickets', filters);
    return {
      tickets: response.data || [],
      meta: response.meta as PaginationMeta,
    };
  },

  getTicketById: async (id: string) => {
    const response = await apiClient.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },

  createTicket: async (data: CreateTicketData) => {
    const response = await apiClient.post<Ticket>('/tickets', data);
    return response.data;
  },

  updateTicket: async (id: string, data: UpdateTicketData) => {
    const response = await apiClient.put<Ticket>(`/tickets/${id}`, data);
    return response.data;
  },

  deleteTicket: async (id: string) => {
    await apiClient.delete(`/tickets/${id}`);
  },

  addComment: async (ticketId: string, content: string, isInternal: boolean = false) => {
    const response = await apiClient.post(`/tickets/${ticketId}/comments`, {
      content,
      isInternal,
    });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get<TicketStats>('/tickets/stats');
    return response.data;
  },
};
