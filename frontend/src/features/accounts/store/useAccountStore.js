import { create } from 'zustand';
import api from '../../../shared/api/axios';

export const useAccountStore = create((set, get) => ({
  accounts: [],
  requests: [],
  isLoading: false,

  getAccounts: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/cuentas');
      set({ accounts: response.data.data || response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching accounts:', error);
    }
  },

  createAccountRequest: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/request_accounts', data);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message };
    }
  },

  getAdminRequests: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/request_accounts');
      set({ requests: response.data.data || response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  approveRequest: async (id) => {
    try {
      await api.put(`/request_accounts/${id}/aprobar`);
      get().getAdminRequests();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  denyRequest: async (id) => {
    try {
      await api.put(`/request_accounts/${id}/rechazar`);
      get().getAdminRequests();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  }
}));
