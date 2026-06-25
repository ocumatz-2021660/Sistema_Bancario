import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const publicRoutes = [
            '/auth/login',
            '/auth/register',
            '/auth/verify-email',
            '/auth/forgot-password',
            '/auth/reset-password',
        ];

        const isPublicRoute = publicRoutes.some((route) => config.url?.includes(route));

        if (!isPublicRoute) {
            const state = useAuthStore.getState();
            const token = state.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
                const state = useAuthStore.getState();
                if (state.logout) {
                    state.logout();
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
