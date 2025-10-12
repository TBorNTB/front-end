"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '@/features/auth/types';
import { UserRole, UserRoleDisplay } from '@/types/core';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (userData: AuthUser, keepSignedIn?: boolean) => void;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ FIX: Check if user has auth cookies before making API calls
  const hasAuthCookies = (): boolean => {
    if (typeof document === 'undefined') return false;
    
    const cookies = document.cookie;
    const hasAccessToken = cookies.includes('accessToken=');
    const hasRefreshToken = cookies.includes('refreshToken=');
    
    console.log('Auth cookies check:', { hasAccessToken, hasRefreshToken });
    return hasAccessToken && hasRefreshToken;
  };

  // Fetch user profile only if we have auth cookies
  const fetchUserProfile = async (): Promise<AuthUser | null> => {
    try {
      // ✅ FIX: Don't make API calls if no auth cookies
      if (!hasAuthCookies()) {
        console.log('No auth cookies found, skipping API call');
        return null;
      }

      console.log('Fetching user profile with auth cookies...');
      
      const userResponse = await fetch('/api/auth/user', {
        credentials: 'include',
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('User data from API:', userData);
        
        if (userData.authenticated && userData.user) {
          const authUser: AuthUser = {
            nickname: userData.user.nickname || "user",
            full_name: userData.user.realName || userData.user.full_name || userData.user.nickname || "User",
            email: userData.user.email || "",
            role: userData.user.role as UserRole,
            profile_image: userData.user.profileImageUrl || userData.user.profile_image,
          };
          
          console.log('Mapped auth user from API:', authUser);
          return authUser;
        }
      } else {
        console.log('API call failed:', userResponse.status);
      }

      return null;

    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // ✅ FIX: First check localStorage for persisted user
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            console.log('Restored user from localStorage:', userData);
            setUser(userData);
            setIsAuthenticated(true);
            
            // ✅ FIX: Only try to refresh if we have auth cookies
            if (hasAuthCookies()) {
              console.log('Has auth cookies, trying to refresh user data...');
              const freshUser = await fetchUserProfile();
              if (freshUser) {
                console.log('Updated with fresh user data');
                setUser(freshUser);
                localStorage.setItem('auth_user', JSON.stringify(freshUser));
              }
            }
            
            return;
          } catch (error) {
            console.error('Error parsing saved user data:', error);
            localStorage.removeItem('auth_user');
          }
        }

        // ✅ FIX: Only try server check if we have auth cookies
        if (hasAuthCookies()) {
          console.log('No saved user, but has auth cookies, checking server...');
          const serverUser = await fetchUserProfile();
          
          if (serverUser) {
            console.log('Server auth successful:', serverUser);
            setUser(serverUser);
            setIsAuthenticated(true);
            return;
          }
        } else {
          console.log('No auth cookies, user not logged in');
        }

      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userData: AuthUser, keepSignedIn: boolean = false) => {
    console.log('AuthContext login called with:', userData, 'keepSignedIn:', keepSignedIn);
    setUser(userData);
    setIsAuthenticated(true);
    
    if (keepSignedIn) {
      try {
        localStorage.setItem('auth_user', JSON.stringify(userData));
        console.log('User data saved to localStorage');
      } catch (error) {
        console.error('Error saving auth to localStorage:', error);
      }
    }
  };

  const refreshUser = async (): Promise<boolean> => {
    try {
      // ✅ FIX: Only refresh if we have auth cookies
      if (!hasAuthCookies()) {
        console.log('No auth cookies for refresh');
        return false;
      }

      const freshUser = await fetchUserProfile();
      
      if (freshUser) {
        setUser(freshUser);
        setIsAuthenticated(true);
        
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          localStorage.setItem('auth_user', JSON.stringify(freshUser));
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Refresh user error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // ✅ FIX: Only call logout API if we have auth cookies
      if (hasAuthCookies()) {
        console.log('Calling logout API...');
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
        
        if (response.ok) {
          console.log('Logout API successful');
        }
      } else {
        console.log('No auth cookies, skipping logout API call');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      setUser(null);
      setIsAuthenticated(false);
      
      try {
        localStorage.removeItem('auth_user');
        console.log('Cleared localStorage');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
      
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout,
      loading,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
