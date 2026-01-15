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

  // Note: In the browser, httpOnly auth cookies are NOT readable via document.cookie.
  // We therefore must not pre-check auth cookies client-side; rely on the server response.

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
    } = options;

    try {
      const isBrowser = typeof window !== 'undefined';
      const cookieHeader = request?.headers?.get('cookie') ?? null;

      const fetchOptions: RequestInit = {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // Only attach explicit Cookie header in non-browser environments.
          ...(cookieHeader && !isBrowser ? { Cookie: cookieHeader } : {}),
          ...headers,
        },
        // Ensure httpOnly cookies are sent with requests (especially cross-origin gateway).
        credentials: 'include',
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
  get<T>(endpoint: string, request?: Request, options?: Partial<RequestOptions>) {
    return this.request<T>(endpoint, { method: 'GET', request, ...(options || {}) });
  }

  post<T>(endpoint: string, body?: any, request?: Request, options?: Partial<RequestOptions>) {
    return this.request<T>(endpoint, { method: 'POST', body, request, ...(options || {}) });
  }

  put<T>(endpoint: string, body?: any, request?: Request, options?: Partial<RequestOptions>) {
    return this.request<T>(endpoint, { method: 'PUT', body, request, ...(options || {}) });
  }

  delete<T>(endpoint: string, request?: Request, options?: Partial<RequestOptions>) {
    return this.request<T>(endpoint, { method: 'DELETE', request, ...(options || {}) });
  }

  patch<T>(endpoint: string, body?: any, request?: Request, options?: Partial<RequestOptions>) {
    return this.request<T>(endpoint, { method: 'PATCH', body, request, ...(options || {}) });
  }
}

// Export single instance bound to BASE_URL
export const apiClient = new GatewayAPIClient();
