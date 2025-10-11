import { BASE_URL, API_ENDPOINTS } from '@/lib/endpoints';
import { LoginRequest, SignupRequest, AuthResponse } from './types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.USERS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.USERS.SIGNUP}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  },

  logout: async (): Promise<void> => {
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.USERS.LOGOUT}`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },
};