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

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    refresh: (refreshToken: string) =>
        api.post('/auth/refresh', { refreshToken }),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
};

// Admin API
export const adminApi = {
    createUser: (data: any) => api.post('/admin/users', data),
    getUsers: () => api.get('/admin/users'),
    getUser: (id: string) => api.get(`/admin/users/${id}`),
    updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
    deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};

// Canvas API (Matches Prompt Rule 6)
export const canvasApi = {
    create: (title: string, width?: number, height?: number) =>
        api.post('/canvas/create', { title, width, height }),

    save: (canvasId: string, data: {
        canvas_data: any;
        title: string;
        holder_name: string;
        certificate_title: string;
        issue_date: string;
        organization_name: string;
    }) => api.put(`/canvas/save/${canvasId}`, data),

    getOne: (canvasId: string) => api.get(`/canvas/${canvasId}`),

    getAll: () => api.get('/canvas'),

    delete: (canvasId: string) => api.delete(`/canvas/${canvasId}`),
};

// Certificate API (Matches Prompt Rule 6)
export const certificateApi = {
    authorize: (canvasId: string) =>
        api.post(`/certificate/authorize/${canvasId}`),

    verify: (certificateId: string) =>
        api.get(`/certificate/verify/${certificateId}`),
};

// Images API
export const imagesApi = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getAll: () => api.get('/images'),
    delete: (id: string) => api.delete(`/images/${id}`),
};

export default api;
