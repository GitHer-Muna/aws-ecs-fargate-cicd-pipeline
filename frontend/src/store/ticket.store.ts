import { create } from 'zustand';
import { Ticket, TicketFilters, TicketStats, PaginationMeta } from '@/types';
import { ticketApi } from '@/lib/api';

interface TicketStore {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  stats: TicketStats | null;
  meta: PaginationMeta | null;
  isLoading: boolean;
  filters: TicketFilters;
  fetchTickets: () => Promise<void>;
  fetchTicketById: (id: string) => Promise<void>;
  createTicket: (data: any) => Promise<Ticket>;
  updateTicket: (id: string, data: any) => Promise<Ticket>;
  deleteTicket: (id: string) => Promise<void>;
  addComment: (ticketId: string, content: string, isInternal?: boolean) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: Partial<TicketFilters>) => void;
  clearCurrentTicket: () => void;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  currentTicket: null,
  stats: null,
  meta: null,
  isLoading: false,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },

  setFilters: (filters: Partial<TicketFilters>) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  fetchTickets: async () => {
    set({ isLoading: true });
    try {
      const { tickets, meta } = await ticketApi.getTickets(get().filters);
      set({ tickets, meta });
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTicketById: async (id: string) => {
    set({ isLoading: true });
    try {
      const ticket = await ticketApi.getTicketById(id);
      set({ currentTicket: ticket });
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createTicket: async (data: any) => {
    set({ isLoading: true });
    try {
      const ticket = await ticketApi.createTicket(data);
      await get().fetchTickets();
      return ticket!;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTicket: async (id: string, data: any) => {
    set({ isLoading: true });
    try {
      const ticket = await ticketApi.updateTicket(id, data);
      await get().fetchTickets();
      if (get().currentTicket?.id === id) {
        set({ currentTicket: ticket });
      }
      return ticket!;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTicket: async (id: string) => {
    set({ isLoading: true });
    try {
      await ticketApi.deleteTicket(id);
      await get().fetchTickets();
    } finally {
      set({ isLoading: false });
    }
  },

  addComment: async (ticketId: string, content: string, isInternal: boolean = false) => {
    await ticketApi.addComment(ticketId, content, isInternal);
    if (get().currentTicket?.id === ticketId) {
      await get().fetchTicketById(ticketId);
    }
  },

  fetchStats: async () => {
    try {
      const stats = await ticketApi.getStats();
      set({ stats });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  },

  clearCurrentTicket: () => {
    set({ currentTicket: null });
  },
}));
