import { create } from 'zustand';
import { UserDto } from '@/types/erp.types';

interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserDto, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('erp_access_token', token);
      localStorage.setItem('erp_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('erp_access_token');
      localStorage.removeItem('erp_user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
