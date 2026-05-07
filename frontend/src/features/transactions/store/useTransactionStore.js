import { create } from 'zustand';
import api from '../../../shared/api/axios';

export const useTransactionStore = create((set, get) => ({
  history: [],
  isLoading: false,

  // Realizar Transferencia
  transfer: async (data) => {
    set({ isLoading: true });
    try {
      const payload = {
        monto: parseFloat(data.amount),
        tipo_transaccion: 'TRANSFERENCIA',
        cuenta_origen: data.sourceAccountNumber, // Necesitamos el número, no el ID
        cuenta_destinatoria: data.destinationAccount,
        descripcion: data.description || 'Transferencia desde banca en línea'
      };
      const response = await api.post('/transactions', payload);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error en transferencia' };
    }
  },

  // Realizar Depósito
  deposit: async (data) => {
    set({ isLoading: true });
    try {
      const payload = {
        no_cuenta: data.accountNumber,
        monto: parseFloat(data.amount)
      };
      const response = await api.post('/deposits', payload);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error en depósito' };
    }
  },

  // Realizar Retiro
  withdraw: async (data) => {
    set({ isLoading: true });
    try {
      const payload = {
        no_cuenta: data.accountNumber,
        monto: parseFloat(data.amount)
      };
      const response = await api.post('/withdrawals', payload);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error en retiro' };
    }
  },

  // Obtener Historial de una cuenta (Últimas 5 según backend)
  getHistory: async (accountId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/transactions/account/${accountId}`);
      const rawHistory = response.data.data || response.data;
      
      const mappedHistory = (Array.isArray(rawHistory) ? rawHistory : []).map(tx => ({
        ...tx,
        type: tx.tipo_transaccion,
        amount: tx.monto,
        description: tx.descripcion || (tx.tipo_transaccion === 'TRANSFERENCIA' ? 'Transferencia Bancaria' : 'Depósito en Efectivo'),
        sourceAccount: tx.cuenta_origen?.accountNumber,
        destinationAccount: tx.cuenta_destinatoria?.accountNumber
      }));

      set({ history: mappedHistory, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching history:', error);
    }
  }
}));
