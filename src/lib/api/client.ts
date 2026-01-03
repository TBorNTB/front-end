// src/lib/api/client.ts
// HTTP client for browser-side usage (no next/headers import)
import { BASE_URL } from './config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  request?: Request; // API route request (to reuse incoming cookies)
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

interface GatewayResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export class GatewayAPIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = BASE_URL;
  }

  // Extract cookies for authorization (client/env-agnostic, no next/headers)
  private async getCookieHeader(request?: Request): Promise<string | null> {
    try {
      if (request?.headers) {
        return request.headers.get('cookie');
      }

      // Client-side: document.cookie (httpOnly cookies still ride along with credentials)
      if (typeof document !== 'undefined') {
        return document.cookie || null;
      }

      return null; // SSR without request: caller should supply headers or use server client
    } catch (error) {
      console.error('Error extracting cookies:', error);
      return null;
    }
  }

  private hasAuthCookies(cookieHeader: string | null): boolean {
    if (!cookieHeader) return false;
    return (
      cookieHeader.includes('accessToken') ||
      cookieHeader.includes('refreshToken') ||
      cookieHeader.includes('sessionToken')
    );
  }

  // Core request method to gateway
  async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<GatewayResult<T>> {
    const {
      method = 'GET',
      body,
      request,
      headers = {},
      requireAuth = true,
    } = options;

    try {
      const cookieHeader = await this.getCookieHeader(request);

      // Pre-check only if we actually have readable cookies in this environment
      if (requireAuth && !this.hasAuthCookies(cookieHeader)) {
        return {
          success: false,
          error: 'Authentication required',
          status: 401,
        };
      }

      const fetchOptions: RequestInit = {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(cookieHeader && { Cookie: cookieHeader }),
          ...headers,
        },
        cache: 'no-store',
      };

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      const res = await fetch(`${this.baseURL}${endpoint}`, fetchOptions);

      if (res.ok) {
        const data = (await res.json().catch(() => null)) as T | null;
        return {
          success: true,
          data: data ?? undefined,
          status: res.status,
        };
      }

      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          error: 'Authentication failed',
          status: res.status,
        };
      }

      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: (errorData as any).message || 'Request failed',
        status: res.status,
      };
    } catch (error) {
      console.error('Gateway API request error:', error);
      return {
        success: false,
        error: 'Network error',
        status: 500,
      };
    }
  }

  // Convenience methods
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

// Export single instance bound to BASE_URL
export const apiClient = new GatewayAPIClient();
