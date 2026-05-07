import { create } from 'zustand';
import api from '../../../shared/api/axios';

const mapAccount = (acc) => {
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
};

export const useAccountStore = create((set, get) => ({
  accounts: [],
  requests: [],
  favorites: [],
  isLoading: false,
  error: null,

  // ── USER: obtener cuentas activas del usuario autenticado ──────────────
  getAccounts: async (userId) => {
    if (!userId) return;
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/cuentas/usuario/${userId}`);
      const raw = response.data.data || response.data;
      // Solo cuentas activas para el usuario
      const mapped = (Array.isArray(raw) ? raw : [])
        .filter(acc => acc.isActive)
        .map(mapAccount);
      set({ accounts: mapped, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Error al obtener cuentas' });
    }
  },

  // ── USER: solicitar nueva cuenta → POST /cuentas/create ───────────────
  createAccountRequest: async (data) => {
    set({ isLoading: true });
    try {
      const payload = {
        tipo_cuenta: data.type,
        saldo: parseFloat(data.balance),
        alias: data.alias || undefined,
      };
      const response = await api.post('/cuentas/create', payload);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al crear la solicitud' };
    }
  },

  // ── USER/ADMIN: favoritos reales del usuario autenticado (GET /favorite) ─
  getFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/favorite');
      const raw = response.data.data || response.data;
      set({ favorites: Array.isArray(raw) ? raw : [], isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Error al obtener favoritos' });
    }
  },

  addFavorite: async (no_cuenta, alias_favorito) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/favorite', { no_cuenta, alias_favorito });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al agregar favorito' };
    }
  },

  updateFavoriteAlias: async (id, alias_favorito) => {
    try {
      const response = await api.put(`/favorite/${id}`, { alias_favorito });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al actualizar favorito' };
    }
  },

  deleteFavorite: async (id) => {
    try {
      await api.delete(`/favorite/${id}`);
      // Refrescar lista
      get().getFavorites();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al eliminar favorito' };
    }
  },

  // Buscar cuentas con alias para la vista de favoritos de búsqueda (admin/transfer)
  searchFavorites: async (search = '') => {
    set({ isLoading: true, error: null });
    try {
      const params = search ? { search } : {};
      const response = await api.get('/cuentas/buscar/favoritos', { params });
      const raw = response.data.data || response.data;
      const mapped = (Array.isArray(raw) ? raw : []).map(mapAccount);
      set({ favorites: mapped, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Error al buscar favoritos' });
    }
  },

  // ── ADMIN: solicitudes de cuenta ───────────────────────────────────────
  getAdminRequests: async (filter = '') => {
    set({ isLoading: true });
    try {
      const params = filter ? { estado_solicitud: filter } : {};
      const response = await api.get('/request_accounts', { params });
      const raw = response.data.data || response.data;
      set({ requests: Array.isArray(raw) ? raw : [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  approveRequest: async (id) => {
    try {
      const response = await api.put(`/request_accounts/${id}/aprobar`);
      get().getAdminRequests();
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al aprobar' };
    }
  },

  denyRequest: async (id) => {
    try {
      const response = await api.put(`/request_accounts/${id}/rechazar`);
      get().getAdminRequests();
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al rechazar' };
    }
  },

  // ── ADMIN: todas las cuentas ───────────────────────────────────────────
  getAllAccounts: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const response = await api.get('/cuentas', { params: filters });
      const raw = response.data.data || response.data;
      const mapped = (Array.isArray(raw) ? raw : []).map(mapAccount);
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
      return { success: false, error: error.response?.data?.message || 'Error al actualizar saldo' };
    }
  },

  activateAccount: async (id) => {
    set({ isLoading: true });
    try {
      await api.put(`/cuentas/${id}/activate`);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al activar' };
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
      return { success: false, error: error.response?.data?.message || 'Error al desactivar' };
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
      return { success: false, error: error.response?.data?.message || 'Error al eliminar' };
    }
  }
}));
