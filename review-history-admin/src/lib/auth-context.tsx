'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  apiGet,
  apiPost,
  setAccessToken,
  clearAccessToken,
  getAccessToken,
  SESSION_EXPIRED_EVENT,
} from '@/lib/api-client';
import type { User, AdminLoginResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AdminLoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      if (!getAccessToken()) {
        const refresh = await apiPost<{ accessToken: string; user: User }>('/auth/refresh');
        setAccessToken(refresh.accessToken);
      }
      const userData = await apiGet<User>('/me');
      setUser(userData);
    } catch {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await refreshUser();
      if (mounted) {
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  useEffect(() => {
    const onSessionExpired = () => {
      clearAccessToken();
      setUser(null);
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/login')) {
        window.location.href = '/auth/login?reason=session_expired';
      }
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired as EventListener);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired as EventListener);
  }, []);

  const login = async (email: string, password: string): Promise<AdminLoginResponse> => {
    const result = await apiPost<AdminLoginResponse>('/auth/admin/login', { email, password });
    setAccessToken(result.accessToken);
    setUser(result.user);
    return result;
  };

  const logout = async () => {
    try {
      await apiPost('/auth/logout');
    } finally {
      clearAccessToken();
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
