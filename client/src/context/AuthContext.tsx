import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { AuthContextType, User, LoginResponse } from '../types';
import apiClient from '../api/client';

type UpdateProfilePayload = {
  fullName?: string;
  email?: string;
  password?: string;
};

const normalizeUser = (raw: any): User => ({
  ...raw,
  id: raw?.id ?? raw?._id ?? raw?._id?.toString?.() ?? '',
  role: raw?.role ?? 'student',
});

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    try {
      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(normalizeUser(parsedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  const persistSession = useCallback((newToken: string, newUser: User) => {
    const safeUser = normalizeUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(safeUser));
    setToken(newToken);
    setUser(safeUser);
    setIsAuthenticated(true);
    setIsAuthReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email: normalizedEmail,
        password,
      });

      persistSession(response.data.token, normalizeUser(response.data.user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [persistSession]);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await apiClient.post<LoginResponse>('/auth/register', {
        fullName,
        email: normalizedEmail,
        password,
      });

      persistSession(response.data.token, normalizeUser(response.data.user));
    } catch (error) {
      console.error('Register failed:', error);
      throw error;
    }
  }, [persistSession]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }

    const response = await apiClient.get<User>('/users/me');
    const nextUser = normalizeUser(response.data);
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
  }, [token]);

  const updateProfile = useCallback(async (updates: UpdateProfilePayload) => {
    if (!user?.id) {
      throw new Error('No active user');
    }

    const response = await apiClient.put<User>(`/users/${user.id}`, updates);
    const nextUser = normalizeUser(response.data);
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
  }, [user?.id]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, register, updateProfile, refreshUser, logout, isAuthenticated, isAuthReady }),
    [user, token, login, register, updateProfile, refreshUser, logout, isAuthenticated, isAuthReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
