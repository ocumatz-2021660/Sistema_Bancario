import { create } from 'zustand';
import api from '../../../shared/api/axios';

export const useAdminStore = create((set, get) => ({
  users: [],
  requests: [],
  isLoading: false,
  error: null,
  lastFetch: {},

  // --- GESTIÓN DE USUARIOS ---
  getAllUsers: async () => {
    const now = Date.now();
    if (get().isLoading || get().error || (get().lastFetch.users && now - get().lastFetch.users < 5000)) return;
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/users');
      set({ users: response.data.data || response.data, isLoading: false, lastFetch: { ...get().lastFetch, users: Date.now() } });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Error al obtener usuarios' });
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
