'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  apiGet,
  apiPost,
  clearAccessToken,
  setAccessToken,
  getAccessToken,
  SESSION_EXPIRED_EVENT,
} from '@/lib/api-client';
import type { User, EmailOtpChallengeResponse, VerifyOtpResponse, AuthLoginResponse } from '@/types';

interface RegisterInput {
  email: string;
  password: string;
  phone: string;
  displayName?: string;
  acceptLegal: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthLoginResponse>;
  register: (input: RegisterInput) => Promise<EmailOtpChallengeResponse>;
  requestEmailOtp: (email: string) => Promise<EmailOtpChallengeResponse>;
  verifyEmailOtp: (otpRequestId: string, code: string) => Promise<VerifyOtpResponse>;
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
    refreshUser().finally(() => setIsLoading(false));
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

  const login = async (email: string, password: string): Promise<AuthLoginResponse> => {
    const result = await apiPost<AuthLoginResponse>('/auth/login', { email, password });
    if (!result.requiresVerification && 'accessToken' in result) {
      setAccessToken(result.accessToken);
      await refreshUser();
    }
    return result;
  };

  const register = async (input: RegisterInput): Promise<EmailOtpChallengeResponse> => {
    return apiPost<EmailOtpChallengeResponse>('/auth/register', {
      email: input.email,
      password: input.password,
      phone: input.phone,
      displayName: input.displayName,
      acceptTerms: input.acceptLegal,
      acceptPrivacy: input.acceptLegal,
    });
  };

  const requestEmailOtp = async (email: string): Promise<EmailOtpChallengeResponse> => {
    return apiPost<EmailOtpChallengeResponse>('/auth/request-email-otp', { email });
  };

  const verifyEmailOtp = async (otpRequestId: string, code: string): Promise<VerifyOtpResponse> => {
    const result = await apiPost<VerifyOtpResponse>('/auth/verify-email-otp', { otpRequestId, code });
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
        window.location.href = '/';
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
        register,
        requestEmailOtp,
        verifyEmailOtp,
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
