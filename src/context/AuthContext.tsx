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
      console.log('Logout initiated');
      
      // 클라이언트 사이드에서도 쿠키 삭제 시도 (httpOnly가 아닌 경우)
      // httpOnly 쿠키는 서버에서만 삭제 가능하지만, 혹시 모를 경우를 대비
      const cookieNames = ['accessToken', 'refreshToken', 'keepSignedIn'];
      cookieNames.forEach(name => {
        // 여러 path에서 삭제 시도
        ['/', '/api', '/api/auth'].forEach(path => {
          document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
          document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
        });
        // path 없이도 시도
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      });
      
      const response = await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Logout response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // 서버가 항상 쿠키를 삭제하므로, 응답 상태와 관계없이 상태를 정리
      clearAuthState();
      
      // 응답 본문 확인 (디버깅용)
      try {
        const data = await response.json();
        console.log('Logout response data:', data);
      } catch (e) {
        // JSON 파싱 실패는 무시 (이미 상태는 정리됨)
        console.warn('Could not parse logout response:', e);
      }
      
      // 상태 정리 후 리다이렉트 (강제 새로고침으로 쿠키 상태 확인)
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // 네트워크 에러 등이 발생해도 상태는 정리
      clearAuthState();
      window.location.href = '/';
    }
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
