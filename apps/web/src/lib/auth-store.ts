import { create } from 'zustand';
import type { AuthUser } from '@dars/contracts';
import { Role } from '@dars/contracts';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  isRole: (role: Role) => boolean;
}

const initialAuth =
  typeof window !== 'undefined'
    ? (window as unknown as { __INITIAL_AUTH__?: { user: AuthUser; token: string } }).__INITIAL_AUTH__
    : undefined;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialAuth?.user ?? null,
  accessToken: initialAuth?.token ?? null,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
  isRole: (role) => get().user?.role === role,
}));
