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

  // PUT /users/:userId/status  → body: { accountStatus: 'activo'|'deshabilitado' }
  updateUserStatus: async (userId, isActive) => {
    set({ isLoading: true });
    try {
      // El backend acepta: 'activo' | 'inactivo' | 'deshabilitado'
      // Para activar → 'activo', para desactivar → 'deshabilitado'
      const accountStatus = isActive ? 'activo' : 'deshabilitado';
      const response = await api.put(`/users/${userId}/status`, { accountStatus });

      // Actualizar el usuario en el array local inmediatamente (sin esperar re-fetch)
      // El backend devuelve status (boolean) según accountStatus === 'activo'
      set((state) => ({
        isLoading: false,
        users: state.users.map((u) =>
          u.id === userId ? { ...u, status: isActive } : u
        ),
      }));

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
      // Actualizar el rol del usuario en el array local inmediatamente
      set((state) => ({
        isLoading: false,
        users: state.users.map((u) =>
          u.id === userId ? { ...u, role: roleName } : u
        ),
      }));
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
