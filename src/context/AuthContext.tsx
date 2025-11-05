// context/AuthContext.tsx - Updated with consolidated types
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AuthUser, 
  AuthContextType, 
  mapUserToAuthUser,
  AuthResponse 
} from '@/app/(main)/(auth)/types/auth';
import { handleAuthError } from '@/lib/form-utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check if tokens exist and are valid (backend handles expiration)
  const checkTokenValidity = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Token validation error:', handleAuthError(error));
      return false;
    }
  };

  // ✅ Fetch user profile using consolidated type mapping
  const fetchUserProfile = async (): Promise<AuthUser | null> => {
    try {
      const userResponse = await fetch('/api/auth/user', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (userResponse.ok) {
        const userData: AuthResponse = await userResponse.json();
        
        if (userData.authenticated && userData.user) {
          // Use type mapper from consolidated types
          return mapUserToAuthUser(userData.user);
        }
      }

      return null;
    } catch (error) {
      console.error('Network error fetching user profile:', handleAuthError(error));
      return null;
    }
  };

  // ✅ Initialize auth - enhanced with better error handling
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokenValid = await checkTokenValidity();
        
        if (tokenValid) {
          const serverUser = await fetchUserProfile();
          if (serverUser) {
            console.log('✅ Valid token found, user authenticated:', serverUser.nickname);
            setUser(serverUser);
            setIsAuthenticated(true);
          } else {
            console.log('❌ Token valid but no user data found');
            clearAuthState();
          }
        } else {
          console.log('❌ No valid tokens found - user logged out');
          clearAuthState();
        }
        
      } catch (error) {
        console.error('❌ Auth initialization error:', handleAuthError(error));
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ Helper function to clear auth state
  const clearAuthState = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear any stale localStorage data
    try {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('keepSignedIn');
    } catch (error) {
      console.error('Error clearing localStorage:', handleAuthError(error));
    }
  };

  // ✅ Login function with enhanced type safety
  const login = (userData: AuthUser, keepSignedIn: boolean = false) => {
    console.log('🔑 AuthContext login called with:', userData.nickname, userData.role, 'keepSignedIn:', keepSignedIn);
    
    setUser(userData);
    setIsAuthenticated(true);

    // ✅ Store preferences securely
    try {
      if (keepSignedIn) {
        localStorage.setItem('keepSignedIn', 'true');
        localStorage.setItem('auth_user', JSON.stringify(userData));
        console.log('✅ Keep signed in enabled - extended token lifespan requested');
      } else {
        localStorage.removeItem('keepSignedIn');
        localStorage.removeItem('auth_user');
        console.log('✅ Session-only login - standard token lifespan');
      }
    } catch (error) {
      console.error('❌ Error managing localStorage:', handleAuthError(error));
    }
  };

  // ✅ Enhanced refresh function with type mapping
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
        setIsAuthenticated(true);
        
        // Update localStorage with fresh data if keepSignedIn is enabled
        try {
          if (localStorage.getItem('keepSignedIn') === 'true') {
            localStorage.setItem('auth_user', JSON.stringify(freshUser));
          }
        } catch (error) {
          console.error('Error updating localStorage:', handleAuthError(error));
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Refresh user error:', handleAuthError(error));
      return false;
    }
  };

  // ✅ Enhanced logout function
  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Call backend logout to invalidate tokens
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
    } catch (error) {
      console.error('❌ Logout API error:', handleAuthError(error));
    } finally {
      // Always clear client state
      clearAuthState();
      console.log('✅ Cleared all authentication data');
      
      // Redirect to home
      window.location.href = '/';
    }
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
