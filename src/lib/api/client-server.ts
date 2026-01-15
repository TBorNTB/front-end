// src/lib/api/client.server.ts
// Server-side HTTP client (Next.js RSC/API routes) that can read cookies via next/headers
import { cookies } from 'next/headers';
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

export class GatewayAPIServerClient {
  private baseURL: string;

  constructor() {
    this.baseURL = BASE_URL;
  }

  // Extract cookies (server-only)
  private async getCookieHeader(request?: Request): Promise<string | null> {
    try {
      if (request?.headers) {
        return request.headers.get('cookie');
      }

      const cookieStore = cookies();
      const allCookies = (await cookieStore).getAll();
      return allCookies.length
        ? allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
        : null;
    } catch (error) {
      console.error('Error extracting cookies (server client):', error);
      return null;
    }
  }

  // Extract accessToken from cookie string
  private extractAccessToken(cookieHeader: string | null): string | null {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(/accessToken=([^;]+)/);
    return match ? match[1] : null;
  }

  private hasAuthCookies(cookieHeader: string | null): boolean {
    if (!cookieHeader) return false;
    return (
      cookieHeader.includes('accessToken') ||
      cookieHeader.includes('refreshToken') ||
      cookieHeader.includes('sessionToken')
    );
  }

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
      const accessToken = this.extractAccessToken(cookieHeader);

      if (requireAuth && !accessToken) {
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
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
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
      console.error('❌ API error:', res.status, endpoint, errorData);
      return {
        success: false,
        error: (errorData as any).message || (errorData as any).error || 'Request failed',
        status: res.status,
      };
    } catch (error) {
      console.error('Gateway API request error (server client):', error);
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

// Export single instance for server usage
export const serverApiClient = new GatewayAPIServerClient();
