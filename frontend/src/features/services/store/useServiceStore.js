import { create } from 'zustand';
import api from '../../../shared/api/axios';

export const useServiceStore = create((set) => ({
  services: [],
  redeems: [],
  isLoading: false,

  // Obtener catálogo de servicios
  getServices: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/services');
      set({ services: response.data.data || response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching services:', error);
    }
  },

  // Canjear un servicio
  redeemService: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/redeem_services/redeem', data);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al canjear servicio' };
    }
  },

  // Obtener historial de canjes de una cuenta
  getRedeems: async (accountId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/redeem_services/${accountId}`);
      set({ redeems: response.data.data || response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching redeems:', error);
    }
  }
}));
