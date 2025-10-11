import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from './api';
import { LoginFormData, SignupFormData } from './types';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (credentials: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await authApi.login(credentials);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await authApi.signup(userData);
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authApi.logout();
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    login,
    signup,
    logout,
    setError,
  };
}