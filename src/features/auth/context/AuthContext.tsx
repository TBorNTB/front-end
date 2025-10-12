// src/context/AuthContext.tsx - FIXED VERSION
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

  // ✅ Enhanced: Check if user should stay signed in
  const shouldKeepSignedIn = (): boolean => {
    try {
      return localStorage.getItem('keepSignedIn') === 'true';
    } catch {
      return false;
    }
  };

  // Fetch user profile and role from backend using token
  const fetchUserProfile = async (): Promise<AuthUser | null> => {
    try {
      const userResponse = await fetch('/api/auth/user', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        if (userData.authenticated && userData.user) {
          const authUser: AuthUser = {
            nickname: userData.user.nickname || "user",
            full_name: userData.user.realName || userData.user.full_name || userData.user.nickname || "User",
            email: userData.user.email || "",
            role: userData.user.role as UserRole,
            profile_image: userData.user.profileImageUrl || userData.user.profile_image,
          };

          return authUser;
        }
      }

      // ✅ SKIP refresh token attempt if backend doesn't support it
      // Uncomment these lines if your backend supports refresh tokens:
      
      /*
      console.log('⚠️ Auth failed, trying refresh token...');
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });

      if (refreshResponse.ok) {
        // Retry user fetch after refresh
        const retryUserResponse = await fetch('/api/auth/user', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (retryUserResponse.ok) {
          const userData = await retryUserResponse.json();
          if (userData.authenticated && userData.user) {
            // ... handle refreshed user data
          }
        }
      }
      */

      return null;
    } catch (error) {
      console.error('❌ Network error fetching user profile:', error);
      return null;
    }
  };

  // In AuthContext initialization
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const keepSignedInEnabled = shouldKeepSignedIn();
        
        if (keepSignedInEnabled) {
          try {
            const savedUser = localStorage.getItem('auth_user');
            if (savedUser) {
              const userData = JSON.parse(savedUser);
              console.log('✅ Restored user from localStorage:', userData.nickname);
              setUser(userData);
              setIsAuthenticated(true);
              
              // ✅ Background refresh - don't log if it fails
              fetchUserProfile().then(freshUser => {
                if (freshUser) {
                  setUser(freshUser);
                  localStorage.setItem('auth_user', JSON.stringify(freshUser));
                }
              });
              
              setLoading(false);
              return;
            }
          } catch (error) {
            // Clear invalid data
            localStorage.removeItem('auth_user');
            localStorage.removeItem('keepSignedIn');
          }
        }

        // ✅ Check server token silently
        const serverUser = await fetchUserProfile();
        if (serverUser) {
          console.log('✅ Server auth successful:', serverUser.nickname);
          setUser(serverUser);
          setIsAuthenticated(true);
        } else {
          // ✅ SILENT: Don't log when user is simply not logged in
          setUser(null);
          setIsAuthenticated(false);
        }
        
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);


  // ✅ FIXED: Login function with proper keepSignedIn handling
  const login = (userData: AuthUser, keepSignedIn: boolean = false) => {
    console.log('🔑 AuthContext login called with:', userData.nickname, userData.role, 'keepSignedIn:', keepSignedIn);
    
    setUser(userData);
    setIsAuthenticated(true);

    // ✅ Store keepSignedIn preference
    try {
      if (keepSignedIn) {
        localStorage.setItem('keepSignedIn', 'true');
        localStorage.setItem('auth_user', JSON.stringify(userData));
        console.log('✅ User data saved to localStorage for persistent login');
      } else {
        localStorage.removeItem('keepSignedIn');
        localStorage.removeItem('auth_user');
        console.log('✅ Non-persistent login - localStorage cleared');
      }
    } catch (error) {
      console.error('❌ Error managing localStorage:', error);
    }
  };

  // ✅ Refresh user function
  const refreshUser = async (): Promise<boolean> => {
    try {
      const freshUser = await fetchUserProfile();
      if (freshUser) {
        setUser(freshUser);
        setIsAuthenticated(true);
        
        // Update localStorage if keep signed in is enabled
        if (shouldKeepSignedIn()) {
          localStorage.setItem('auth_user', JSON.stringify(freshUser));
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Refresh user error:', error);
      return false;
    }
  };

  // ✅ FIXED: Logout function
  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Call backend logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
    } catch (error) {
      console.error('❌ Logout API error:', error);
    } finally {
      // ✅ Always clear client state regardless of API success
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear all stored data
      try {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('keepSignedIn');
        console.log('✅ Cleared all authentication data');
      } catch (error) {
        console.error('❌ Error clearing localStorage:', error);
      }
      
      // Redirect to home
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
      refreshUser,
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
