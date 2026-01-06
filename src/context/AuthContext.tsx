// context/AuthContext.tsx - Merged with profileService
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { profileService, UserResponse } from '@/lib/api/services/user-service';
import { 
  AuthUser, 
  AuthContextType, 
  mapUserToAuthUser,
  AuthResponse 
} from '@/app/(auth)/types/auth';
import { handleAuthError } from '@/lib/form-utils';

// ✅ Unified User type (extends both)
type UnifiedUser = AuthUser & UserResponse;

const AuthContext = createContext<AuthContextType & {
  loadUser: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
} | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Your existing token validation
  const checkTokenValidity = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      const data: AuthResponse = await response.json();
      return response.ok && data.authenticated;
    } catch (error) {
      console.error('Token validation error:', handleAuthError(error));
      return false;
    }
  };

  // ✅ Enhanced fetchUserProfile (your API + profileService fallback)
  const fetchUserProfile = async (): Promise<UnifiedUser | null> => {
    try {
      // 1. Primary: Your existing /api/auth/user
      const userResponse = await fetch('/api/auth/user', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (userResponse.ok) {
        const userData: AuthResponse = await userResponse.json();
        if (userData.authenticated && userData.user) {
          return mapUserToAuthUser(userData.user) as UnifiedUser; // ✅ Type mapping
        }
      }

      // 2. Fallback: profileService (detailed profile)
      const profile = await profileService.getProfile();
      return {
        ...profile,
        // Merge AuthUser fields if needed
      } as UnifiedUser;

    } catch (error) {
      console.error('Profile fetch failed:', handleAuthError(error));
      return null;
    }
  };

  // ✅ Your existing clearAuthState
  const clearAuthState = () => {
    setUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('keepSignedIn');
    } catch {}
  };

  // ✅ Initialize (your logic + profileService)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokenValid = await checkTokenValidity();
        if (tokenValid) {
          const serverUser = await fetchUserProfile();
          if (serverUser) {
            console.log('✅ Authenticated:', serverUser.nickname);
            setUser(serverUser);
            setIsAuthenticated(true);
          } else {
            clearAuthState();
          }
        } else {
          clearAuthState();
        }
      } catch (error) {
        console.error('Auth init error:', handleAuthError(error));
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ Your existing login
  const login = (userData: AuthUser, keepSignedIn: boolean = false) => {
    console.log('🔑 Login:', userData.nickname);
    setUser(userData as UnifiedUser);
    setIsAuthenticated(true);
    
    if (keepSignedIn) {
      localStorage.setItem('keepSignedIn', 'true');
      localStorage.setItem('auth_user', JSON.stringify(userData));
    }
  };

  // ✅ Enhanced refresh (profileService integration)
  const refreshUser = async (): Promise<boolean> => {
    try {
      const tokenValid = await checkTokenValidity();
      if (!tokenValid) {
        clearAuthState();
        return false;
      }

      const freshUser = await fetchUserProfile();
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem('auth_user', JSON.stringify(freshUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Refresh error:', handleAuthError(error));
      return false;
    }
  };

  // ✅ Your existing logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    clearAuthState();
    window.location.href = '/';
  };

  // Dedicated loader for consumers that need an on-demand user fetch
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
