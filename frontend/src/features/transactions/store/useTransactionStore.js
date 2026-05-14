import { create } from 'zustand';
import api from '../../../shared/api/axios';

const mapTransaction = (tx) => ({
  ...tx,
  type: tx.tipo_transaccion,
  amount: tx.monto,
  // cuenta_origen y cuenta_destinataria pueden ser objetos (populados) o strings
  sourceAccount: tx.cuenta_origen?.no_cuenta || tx.cuenta_origen || null,
  destinationAccount: tx.cuenta_destinatoria?.no_cuenta || tx.cuenta_destinatoria || null,
  description: tx.descripcion || null,
});

export const useTransactionStore = create((set) => ({
  history: [],
  deposits: [],
  withdrawals: [],
  isLoading: false,

  // ── TRANSFERENCIA: POST /transactions ─────────────────────────────────
  transfer: async (data) => {
    set({ isLoading: true });
    try {
      const payload = {
        monto: parseFloat(data.amount),
        tipo_transaccion: 'TRANSFERENCIA',
        cuenta_origen: data.sourceAccountNumber,
        cuenta_destinatoria: data.destinationAccount,
      };
      const response = await api.post('/transactions', payload);
      set({ isLoading: false });
      return { success: true, message: response.data.message, data: response.data.data };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error en la transferencia' };
    }
  },

  // ── DEPÓSITO: POST /deposits ───────────────────────────────────────────
  deposit: async (data) => {
    set({ isLoading: true });
    try {
      const payload = {
        no_cuenta: data.accountNumber,
        monto: parseFloat(data.amount),
      };
      const response = await api.post('/deposits', payload);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error en el depósito' };
    }
  },

  // ── RETIRO: POST /withdrawals ──────────────────────────────────────────
  withdraw: async (data) => {
    set({ isLoading: true });
    try {
      const payload = {
        no_cuenta: data.accountNumber,
        monto: parseFloat(data.amount),
      };
      const response = await api.post('/withdrawals', payload);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error en el retiro' };
    }
  },

  // ── HISTORIAL DE TRANSACCIONES: GET /transactions/account/:id ─────────
  getHistory: async (accountId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/transactions/account/${accountId}`);
      const raw = response.data.data || response.data;
      const mapped = (Array.isArray(raw) ? raw : []).map(mapTransaction);
      set({ history: mapped, isLoading: false });
    } catch (error) {
      set({ isLoading: false, history: [] });
      console.error('Error fetching transaction history:', error);
    }
  },

  // ── HISTORIAL DE DEPÓSITOS: GET /deposits/cuenta/:id ──────────────────
  getDepositHistory: async (accountId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/deposits/cuenta/${accountId}`);
      const raw = response.data.data || response.data;
      set({ deposits: Array.isArray(raw) ? raw : [], isLoading: false });
    } catch (error) {
      set({ isLoading: false, deposits: [] });
    }
  },

  // ── HISTORIAL DE RETIROS: GET /withdrawals/cuenta/:id ─────────────────
  getWithdrawalHistory: async (accountId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/withdrawals/cuenta/${accountId}`);
      const raw = response.data.data || response.data;
      set({ withdrawals: Array.isArray(raw) ? raw : [], isLoading: false });
    } catch (error) {
      set({ isLoading: false, withdrawals: [] });
    }
  },

deleteTransaction: async (id_transaction, accountId) => {
  set({ isLoading: true }); 
  try {
    await api.delete(`/transactions/cancelar/${id_transaction}`); 
  
    if (accountId) {
      const response = await api.get(`/transactions/account/${accountId}`);
      const raw = response.data.data || response.data;
      const mapped = (Array.isArray(raw) ? raw : []).map(mapTransaction);
      set({ history: mapped, isLoading: false });
    } else {
      set({ isLoading: false });
    }

    return { success: true };
  } catch (error) {
    set({ isLoading: false });
    console.error("Error detallado:", error.response || error);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al procesar la cancelación'
    };
  }
}
}));
