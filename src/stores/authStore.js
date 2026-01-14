import { create } from "zustand";
import { authAPI } from "../lib/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  // Check auth status on app load
  checkAuth: async () => {
    try {
      const response = await authAPI.me();
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  // Login
  login: async (email, password) => {
    const response = await authAPI.login({ email, password });
    set({ user: response.data.user, isAuthenticated: true });
    return response.data;
  },

  // Register
  register: async (email, password, name) => {
    const response = await authAPI.register({ email, password, name });
    set({ user: response.data.user, isAuthenticated: true });
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    set({ user: null, isAuthenticated: false });
  },

  // Update user
  setUser: (user) => set({ user }),
}));
