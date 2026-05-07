import { create } from 'zustand';
import api from '../../../shared/api/axios';

export const useAccountStore = create((set, get) => ({
  accounts: [],
  requests: [],
  favorites: [],
  isLoading: false,
  error: null,

  searchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/cuentas/buscar/favoritos');
      const raw = response.data.data || response.data;
      const mapped = (Array.isArray(raw) ? raw : []).map(acc => {
        const userData = typeof acc.usuario_cuenta === 'object' ? acc.usuario_cuenta : null;
        return {
          ...acc,
          accountNumber: acc.no_cuenta,
          type: acc.tipo_cuenta,
          balance: acc.saldo,
          points: acc.puntos_cuenta,
          status: acc.isActive,
          user: userData ? {
            name: userData.Name,
            surname: userData.Surname,
            username: userData.Username,
            email: userData.Email
          } : null
        };
      });
      set({ favorites: mapped, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Error al buscar favoritos' });
    }
  },

  // Para usuarios normales: obtiene las cuentas del usuario autenticado
  getAccounts: async (userId) => {
    if (!userId) return;
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/cuentas/usuario/${userId}`);
      const raw = response.data.data || response.data;
      const mapped = (Array.isArray(raw) ? raw : []).map(acc => {
        const userData = typeof acc.usuario_cuenta === 'object' ? acc.usuario_cuenta : null;
        return {
          ...acc,
          accountNumber: acc.no_cuenta,
          type: acc.tipo_cuenta,
          balance: acc.saldo,
          points: acc.puntos_cuenta,
          status: acc.isActive,
          user: userData ? {
            name: userData.Name,
            surname: userData.Surname,
            username: userData.Username,
            email: userData.Email
          } : null
        };
      });
      set({ accounts: mapped, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Error al obtener cuentas' });
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
  },

  // --- ADMIN METHODS ---
  getAllAccounts: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/cuentas'); // GET /cuentas/ - Admin only
      const raw = response.data.data || response.data;
      const mapped = (Array.isArray(raw) ? raw : []).map(acc => {
        const userData = typeof acc.usuario_cuenta === 'object' ? acc.usuario_cuenta : null;
        return {
          ...acc,
          accountNumber: acc.no_cuenta,
          type: acc.tipo_cuenta,
          balance: acc.saldo,
          points: acc.puntos_cuenta,
          status: acc.isActive,
          user: userData ? {
            name: userData.Name,
            surname: userData.Surname,
            username: userData.Username,
            email: userData.Email
          } : null
        };
      });
      set({ accounts: mapped, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  updateSaldo: async (id, saldo) => {
    set({ isLoading: true });
    try {
      await api.put(`/cuentas/${id}/saldo`, { saldo });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message };
    }
  },

  deactivateAccount: async (id) => {
    set({ isLoading: true });
    try {
      await api.put(`/cuentas/${id}/desactivate`);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message };
    }
  },

  deleteAccount: async (id) => {
    set({ isLoading: true });
    try {
      await api.delete(`/cuentas/${id}/delete`);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message };
    }
  }
}));
