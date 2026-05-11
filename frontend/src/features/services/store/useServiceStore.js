import { create } from 'zustand';
import api from '../../../shared/api/axios';

export const useServiceStore = create((set) => ({
  services: [],
  redeems: [],
  isLoading: false,
  error: null,

  // Obtener catálogo de servicios
  getServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/services');
      const rawServices = response.data.data || response.data;
      
      // Mapear campos de backend a frontend para consistencia
      const mappedServices = (Array.isArray(rawServices) ? rawServices : []).map(s => ({
        ...s,
        name: s.nombre || s.name,
        description: s.descripcion || s.description,
        points: s.puntos_requeridos || s.points
      }));

      set({ services: mappedServices, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || 'Error al obtener servicios' });
      console.error('Error fetching services:', error);
    }
  },

  // Canjear un servicio
  redeemService: async (data) => {
    set({ isLoading: true });
    try {
      const payload = {
        cuenta_id: data.accountId,
        servicio_id: data.serviceId
      };
      const response = await api.post('/redeem_services/redeem', payload);
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
      const rawRedeems = response.data.data || response.data;

      // Mapear para facilitar el renderizado
      const mappedRedeems = (Array.isArray(rawRedeems) ? rawRedeems : []).map(r => ({
        ...r,
        serviceName: r.servicio_canje?.nombre_servicio || 'Servicio Desconocido',
        description: r.servicio_canje?.descripcion_servicio || '',
        cost: r.servicio_canje?.puntos_requeridos || 0,
        date: r.createdAt
      }));

      set({ redeems: mappedRedeems, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching redeems:', error);
    }
  },

  // --- ADMIN METHODS ---
  createService: async (data) => {
    set({ isLoading: true });
    try {
      const payload = {
        nombre_servicio: data.name,
        descripcion_servicio: data.description,
        puntos_requeridos: parseFloat(data.points)
      };
      const response = await api.post('/services/create', payload);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al crear servicio' };
    }
  },

  updateService: async (id, data) => {
    set({ isLoading: true });
    try {
      const payload = {
        nombre_servicio: data.name,
        descripcion_servicio: data.description,
        puntos_requeridos: parseFloat(data.points)
      };
      const response = await api.put(`/services/update/${id}`, payload);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al actualizar servicio' };
    }
  },

  deleteService: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.delete(`/services/delete/${id}`);
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al eliminar servicio' };
    }
  }
}));