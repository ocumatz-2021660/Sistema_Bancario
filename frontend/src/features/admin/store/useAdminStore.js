import { create } from 'zustand';
import api from '../../../shared/api/axios';

export const useAdminStore = create((set) => ({
  users: [],
  requests: [],
  isLoading: false,

  // --- GESTIÓN DE USUARIOS ---
  getAllUsers: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/users');
      set({ users: response.data.data || response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching users:', error);
    }
  },

  updateUserStatus: async (userId, status) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/users/${userId}/status`, { status });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al actualizar estado' };
    }
  },

  updateUserRole: async (userId, roleName) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/users/${userId}/role`, { roleName });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al actualizar rol' };
    }
  },

  // --- SOLICITUDES DE CUENTA ---
  getAccountRequests: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/request_accounts');
      set({ requests: response.data.data || response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching requests:', error);
    }
  },

  approveRequest: async (requestId) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/request_accounts/${requestId}/aprobar`);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al aprobar' };
    }
  },

  rejectRequest: async (requestId) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/request_accounts/${requestId}/rechazar`);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al rechazar' };
    }
  }
}));
