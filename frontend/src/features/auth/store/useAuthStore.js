import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../shared/api/axios';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (emailOrUsername, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { emailOrUsername, password });
          const { token, userDetails } = response.data;

          set({
            token,
            user: userDetails,
            role: userDetails?.role,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.message || 'Error al iniciar sesión' 
          };
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          set({ isLoading: false });
          return { success: true, message: response.data.message };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || 'Error al registrar usuario',
          };
        }
      },

      logout: () => {
        set({ user: null, token: null, role: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage');
      },

      // Placeholder methods for other auth actions
      verifyEmail: async (token) => {
        try {
          const response = await api.post('/auth/verify-email', { token });
          return { success: true, message: response.data.message };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },

      forgotPassword: async (email) => {
        try {
          const response = await api.post('/auth/forgot-password', { email });
          return { success: true, message: response.data.message };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },

      resetPassword: async (token, newPassword, confirmPassword) => {
        try {
          const response = await api.post('/auth/reset-password', { 
            token, 
            newPassword, 
            confirmPassword 
          });
          return { success: true, message: response.data.message };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
