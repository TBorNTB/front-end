/*import { cookies } from 'next/headers';

// ✅ Your existing configuration - single gateway URL
const API_CONFIG = {
  DEVELOPMENT: 'http://43.202.91.154:8000', // API Gateway
};

export const BASE_URL = API_CONFIG.DEVELOPMENT;

// ✅ Universal API client for all microservices through the gateway
export class GatewayAPIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = BASE_URL;
  }

  // ✅ Extract cookies for authorization
  private async getCookieHeader(request?: Request): Promise<string | null> {
    try {
      if (request) {
        return request.headers.get('cookie');
      } else {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        return allCookies
          .map(cookie => `${cookie.name}=${cookie.value}`)
          .join('; ');
      }
    } catch (error) {
      console.error('Error extracting cookies:', error);
      return null;
    }
  }

  // ✅ Check if auth cookies exist
  private hasAuthCookies(cookieHeader: string | null): boolean {
    if (!cookieHeader) return false;
    return cookieHeader.includes('accessToken') || 
           cookieHeader.includes('refreshToken') || 
           cookieHeader.includes('sessionToken');
  }

  // ✅ Make authorized request to any microservice through the gateway
  async request<T = any>(
    endpoint: string, // e.g., '/user-service/users/profile'
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: any;
      request?: Request;
      headers?: Record<string, string>;
      requireAuth?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    data?: T;
    error?: string;
    status: number;
  }> {
    try {
      const { method = 'GET', body, request, headers = {}, requireAuth = true } = options;

      // ✅ Get authorization cookies
      const cookieHeader = await this.getCookieHeader(request);
      
      if (requireAuth && !this.hasAuthCookies(cookieHeader)) {
        return {
          success: false,
          error: 'Authentication required',
          status: 401
        };
      }

      // ✅ Build request for gateway
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(cookieHeader && { 'Cookie': cookieHeader }),
          ...headers
        },
        cache: 'no-store'
      };

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      // ✅ Call through the API gateway
      const response = await fetch(`${this.baseURL}${endpoint}`, fetchOptions);
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data,
          status: response.status
        };
      } else {
        // Handle auth failures gracefully
        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            error: 'Authentication failed',
            status: response.status
          };
        }

        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || 'Request failed',
          status: response.status
        };
      }

    } catch (error) {
      console.error('Gateway API request error:', error);
      return {
        success: false,
        error: 'Network error',
        status: 500
      };
    }
  }

  // ✅ Convenience methods
  get<T>(endpoint: string, request?: Request) {
    return this.request<T>(endpoint, { method: 'GET', request });
  }

  post<T>(endpoint: string, body?: any, request?: Request) {
    return this.request<T>(endpoint, { method: 'POST', body, request });
  }

  put<T>(endpoint: string, body?: any, request?: Request) {
    return this.request<T>(endpoint, { method: 'PUT', body, request });
  }

  delete<T>(endpoint: string, request?: Request) {
    return this.request<T>(endpoint, { method: 'DELETE', request });
  }

  patch<T>(endpoint: string, body?: any, request?: Request) {
    return this.request<T>(endpoint, { method: 'PATCH', body, request });
  }
}

// ✅ Export single instance
export const apiClient = new GatewayAPIClient();
*/