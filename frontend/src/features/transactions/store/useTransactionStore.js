import { create } from 'zustand';
import api from '../../../shared/api/axios';

export const useTransactionStore = create((set, get) => ({
  history: [],
  isLoading: false,

  // Realizar Transferencia
  transfer: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/transacciones/transferir', data);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error en transferencia' };
    }
  },

  // Realizar Depósito (Simulado)
  deposit: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/transacciones/depositar', data);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error en depósito' };
    }
  },

  // Realizar Retiro (Simulado)
  withdraw: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/transacciones/retirar', data);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error en retiro' };
    }
  },

  // Obtener Historial de una cuenta
  getHistory: async (accountId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/transacciones/historial/${accountId}`);
      set({ history: response.data.data || response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching history:', error);
    }
  }
}));
