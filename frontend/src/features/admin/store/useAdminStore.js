import { create } from 'zustand';
import api from '../../../shared/api/axios';

export const useAdminStore = create((set) => ({
  users: [],
  requests: [],
  isLoading: false,

  // ── USUARIOS ──────────────────────────────────────────────────────────
  getAllUsers: async (page = 1, limit = 50) => {
    set({ isLoading: true });
    try {
      const response = await api.get('/users', { params: { page, limit } });
      const raw = response.data.data || response.data;
      set({ users: Array.isArray(raw) ? raw : [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching users:', error);
    }
  },

  // PUT /users/:userId/status  → body: { accountStatus: 'activo' | 'deshabilitado' }
  updateUserStatus: async (userId, isActive) => {
    set({ isLoading: true });
    try {
      const accountStatus = isActive ? 'activo' : 'deshabilitado';
      const response = await api.put(`/users/${userId}/status`, { accountStatus });
      // Refrescar la lista para reflejar el nuevo estado
      const usersRes = await api.get('/users', { params: { page: 1, limit: 50 } });
      const raw = usersRes.data.data || usersRes.data;
      set({ users: Array.isArray(raw) ? raw : [], isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar estado',
      };
    }
  },

  // PUT /users/:userId/role  → body: { roleName: 'ADMIN_ROLE' | 'USER_ROLE' }
  updateUserRole: async (userId, roleName) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/users/${userId}/role`, { roleName });
      const usersRes = await api.get('/users', { params: { page: 1, limit: 50 } });
      const raw = usersRes.data.data || usersRes.data;
      set({ users: Array.isArray(raw) ? raw : [], isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar rol',
      };
    }
  },

  // ── SOLICITUDES DE CUENTA ─────────────────────────────────────────────
  getAccountRequests: async (estado = '') => {
    set({ isLoading: true });
    try {
      const params = estado ? { estado_solicitud: estado } : {};
      const response = await api.get('/request_accounts', { params });
      const raw = response.data.data || response.data;
      set({ requests: Array.isArray(raw) ? raw : [], isLoading: false });
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
      return {
        success: false,
        error: error.response?.data?.message || 'Error al aprobar',
      };
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
      return {
        success: false,
        error: error.response?.data?.message || 'Error al rechazar',
      };
    }
  },
}));
