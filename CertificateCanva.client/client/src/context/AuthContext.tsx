import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

export interface User {
    id: string;
    username: string;
    name: string;
    email: string;
    role_name: string;
    role_id: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    const res = await authApi.getCurrentUser();
                    // Handle response structure: res.data.data or res.data
                    const userData = res.data.data || res.data;
                    setUser(userData);
                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await authApi.login(email, password);
        const { accessToken, refreshToken } = res.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Fetch user details immediately after login
        const userRes = await authApi.getCurrentUser();
        const userData = userRes.data.data || userRes.data;
        setUser(userData);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    };

    const isAdmin = user?.role_name === 'admin' || user?.role_id === 1;

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};
