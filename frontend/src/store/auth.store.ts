import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setTokens: (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const tokens = await authApi.login({ email, password });
          if (tokens) {
            get().setTokens(tokens.accessToken, tokens.refreshToken);
            await get().loadUser();
          }
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          await authApi.register(data);
          // Don't auto-login, let user login manually
          // This avoids issues with async state updates
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch (error) {
            console.error('Logout error:', error);
          }
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      loadUser: async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const user = await authApi.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch (error) {
          set({ isAuthenticated: false });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
