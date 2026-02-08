import { create } from "zustand";

export const useDashboardStore = create((set) => ({
  user: {},
  dashboard: null,
  isAuthenticated: false,
  loading: true,

  setSession: ({ user, dashboard }) =>
    set({ user, dashboard, isAuthenticated: true, loading: false }),

  clearSession: () =>
    set({ user: null, dashboard: null, isAuthenticated: false, loading: true }),
}));
