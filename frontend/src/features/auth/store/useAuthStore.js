import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../shared/api/axios';
import { useAccountStore } from '../../accounts/store/useAccountStore';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            role: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (emailOrUsername, password) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/login', { emailOrUsername, password });
                    const { token, userDetails } = response.data;

                    set({
                        token,
                        user: userDetails,
                        role: userDetails?.role,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        error: error.response?.data?.message || 'Error al iniciar sesión'
                    };
                }
            },