import { create } from 'zustand';
import api from '../../../shared/api/axios';

export const useAccountStore = create((set, get) => ({
  accounts: [],
  requests: [],
  favorites: [],
  isLoading: false,
  error: null,
  lastFetch: {},

  searchFavorites: async () => {
    const now = Date.now();
    if (get().isLoading || get().error || (get().lastFetch.favorites && now - get().lastFetch.favorites < 5000)) return;
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
      set({ favorites: mapped, isLoading: false, lastFetch: { ...get().lastFetch, favorites: Date.now() } });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Error al buscar favoritos' });
    }
  },

  // Para usuarios normales: obtiene las cuentas del usuario autenticado
  getAccounts: async (userId) => {
    const now = Date.now();
    if (!userId || get().isLoading || get().error || (get().lastFetch.accounts && now - get().lastFetch.accounts < 5000)) return;
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
      set({ accounts: mapped, isLoading: false, lastFetch: { ...get().lastFetch, accounts: Date.now() } });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Error al obtener cuentas' });
      console.error('Error fetching accounts:', error);
    }
  },

  createAccountRequest: async (data) => {
    set({ isLoading: true });
    try {
      const payload = {
        tipo_cuenta: data.type,
        saldo: parseFloat(data.balance),
        alias: data.alias
      };
      const response = await api.post('/cuentas/create', payload);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al enviar solicitud' };
    }
  },

  getAdminRequests: async () => {
    const now = Date.now();
    if (get().isLoading || get().error || (get().lastFetch.requests && now - get().lastFetch.requests < 5000)) return;
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/request_accounts/');
      const raw = response.data.data || response.data;
      const mapped = (Array.isArray(raw) ? raw : []).map(req => ({
        ...req,
        status: req.estado_solicitud,
        type: req.cuenta?.tipo_cuenta,
        initialBalance: req.cuenta?.saldo,
        user: req.cuenta?.usuario_cuenta ? {
          name: req.cuenta.usuario_cuenta.Name,
          surname: req.cuenta.usuario_cuenta.Surname,
          username: req.cuenta.usuario_cuenta.Username
        } : null
      }));
      set({ requests: mapped, isLoading: false, lastFetch: { ...get().lastFetch, requests: Date.now() } });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Error al obtener solicitudes' });
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
    const now = Date.now();
    if (get().isLoading || get().error || (get().lastFetch.allAccounts && now - get().lastFetch.allAccounts < 5000)) return;
    set({ isLoading: true, error: null });
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
      set({ accounts: mapped, isLoading: false, lastFetch: { ...get().lastFetch, allAccounts: Date.now() } });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Error al obtener todas las cuentas' });
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
