import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_URL}/api/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken } = response.data.data;
                localStorage.setItem('accessToken', accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API (per strict spec)
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    refresh: (refreshToken: string) =>
        api.post('/auth/refresh', { refreshToken }),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
    getUser: (id: string) => api.get(`/auth/users/${id}`),
};

// Admin API (per strict spec - Protected, Admin only)
export const adminApi = {
    // User management
    createUser: (data: {
        name: string;
        username: string;
        email: string;
        password: string;
        role_id: number;
    }) => api.post('/admin/users', data),
    getUsers: () => api.get('/admin/users'),
    getUser: (id: string) => api.get(`/admin/users/${id}`),
    updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
    deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

    // Canvas sessions (view only - admins cannot design)
    getCanvasSessions: () => api.get('/admin/canvas-sessions'),
    getActiveCanvasSessions: () => api.get('/admin/canvas-sessions/active'),

    // Activity logs
    getActivityLogs: (canvasSessionId?: string) =>
        api.get('/admin/activity-logs', { params: { canvasSessionId } }),

    // Certificates
    getCertificates: () => api.get('/admin/certificates'),

    // Verification links
    getVerificationLinks: () => api.get('/admin/verification-links'),

    // Uploaded files
    getUploadedFiles: () => api.get('/admin/files'),
};

// Canvas API (per strict spec - /api/canva/session)
export const canvasApi = {
    // POST /api/canva/session
    create: (title: string, width?: number, height?: number) =>
        api.post('/canva/session', { title, width, height }),

    // GET /api/canva/session
    getAll: () => api.get('/canva/session'),

    // GET /api/canva/session/:id
    getOne: (id: string) => api.get(`/canva/session/${id}`),

    // PATCH /api/canva/session/:id
    update: (id: string, data: {
        canvas_data?: any;
        title?: string;
        background_color?: string;
        background_image?: string;
    }) => api.patch(`/canva/session/${id}`, data),

    // DELETE /api/canva/session/:id
    delete: (id: string) => api.delete(`/canva/session/${id}`),

    // Save canvas - generates verification link
    save: (id: string, data: { canvas_data: any; title: string; author_name: string }) =>
        api.post(`/canva/session/${id}/save`, data),

    // Export check and logging
    checkExport: (id: string) => api.get(`/canva/session/${id}/export`),
    logExport: (id: string, format: string) =>
        api.post(`/canva/session/${id}/export`, { format }),

    // Activity tracking
    updateActivity: (id: string) => api.post(`/canva/session/${id}/activity`),
    endSession: (id: string) => api.post(`/canva/session/${id}/end`),
};

// Images API (per strict spec - /api/images)
export const imagesApi = {
    // POST /api/images - Upload image
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // GET /api/images - Get all images
    getAll: () => api.get('/images'),

    // GET /api/images/:id - Get single image
    getOne: (id: string) => api.get(`/images/${id}`),

    // DELETE /api/images/:id - Delete image
    delete: (id: string) => api.delete(`/images/${id}`),
};

// Verification API (Public - per strict spec - /api/authorized/:id)
export const verificationApi = {
    // GET /api/authorized/:id - Public verification (no login required)
    verify: (id: string) => api.get(`/authorized/${id}`),
};

export default api;

