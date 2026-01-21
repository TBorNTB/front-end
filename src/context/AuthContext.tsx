// context/AuthContext.tsx
// 인증 상태 관리 + 자동 토큰 갱신
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserResponse } from '@/lib/api/services/user-services';
import {
  AuthUser,
  AuthContextType,
  mapUserToAuthUser,
  AuthResponse
} from '@/app/(auth)/types/auth';
import { fetchWithRefresh } from '@/lib/api/fetch-with-refresh';

type UnifiedUser = AuthUser & UserResponse;

const AuthContext = createContext<AuthContextType & {
  loadUser: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
} | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 유저 프로필 조회 (401 시 자동 토큰 갱신)
  const fetchUserProfile = async (): Promise<UnifiedUser | null> => {
    try {
      const response = await fetchWithRefresh('/api/auth/user', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) return null;

      const data: AuthResponse = await response.json();
      if (data.authenticated && data.user) {
        return mapUserToAuthUser(data.user) as UnifiedUser;
      }
      return null;
    } catch (error) {
      console.error('Profile fetch failed:', error);
      return null;
    }
  };

  const clearAuthState = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // 초기화: 페이지 로드 시 인증 상태 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const serverUser = await fetchUserProfile();
        if (serverUser) {
          setUser(serverUser);
          setIsAuthenticated(true);
        } else {
          clearAuthState();
        }
      } catch {
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // 로그인 성공 시 호출 (keepSignedIn은 서버에서 쿠키로 관리하므로 여기선 무시)
  const login = (userData: AuthUser, _keepSignedIn?: boolean) => {
    setUser(userData as UnifiedUser);
    setIsAuthenticated(true);
  };

  // 유저 정보 새로고침
  const refreshUser = async (): Promise<boolean> => {
    const freshUser = await fetchUserProfile();
    if (freshUser) {
      setUser(freshUser);
      return true;
    }
    clearAuthState();
    return false;
  };

  // 로그아웃
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    clearAuthState();
    window.location.href = '/';
  };

  // 온디맨드 유저 로드
  const loadUser = async () => {
    const freshUser = await fetchUserProfile();
    if (freshUser) {
      setUser(freshUser);
      setIsAuthenticated(true);
    }
  };

  const contextValue: AuthContextType & {
    loadUser: typeof loadUser;
    refreshUser: typeof refreshUser;
  } = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    loadUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
