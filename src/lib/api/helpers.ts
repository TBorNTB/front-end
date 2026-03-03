// src/lib/api/helpers.ts
/**
 * Centralized API helpers for consistent HTTP requests across all microservices
 * Handles: headers, auth, error handling, response normalization
 */

import { UserResponse } from '@/lib/api/services/user-services'; // Adjust import path

// ============================================================================
// 🔐 Authentication Helpers
// ============================================================================

/**
 * Extract access token from browser cookies
 * @returns Access token or undefined if not found
 */
export const getAccessTokenFromCookies = (): string | undefined => {
  // Server-safe check
  if (typeof document === 'undefined') return undefined;

  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('accessToken=')) {
        const rawValue = trimmed.slice('accessToken='.length);
        try {
          return decodeURIComponent(rawValue);
        } catch {
          return rawValue;
        }
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
};

/**
 * Extract access token from browser cookies and throw if missing
 * Useful for APIs that require Authorization header on every request
 */
export const requireAccessTokenFromCookies = (): string => {
  const token = getAccessTokenFromCookies();
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  return token;
};

/**
 * Extract refresh token from browser cookies
 * @returns Refresh token or undefined if not found
 */
export const getRefreshTokenFromCookies = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(cookie => cookie.startsWith('refreshToken='));
  
  return tokenCookie?.split('=')[1];
};

// ============================================================================
// 🌐 HTTP Request Helpers
// ============================================================================

/**
 * Create standardized fetch request configuration
 * Ensures consistent headers, auth, and options across all API calls
 * 
 * @param url - Full API URL
 * @param accessToken - Optional Bearer token
 * @param options - Additional RequestInit options to override defaults
 * @returns Complete RequestInit configuration
 */
export const createFetchRequest = (
  url: string,
  accessToken?: string,
  options: RequestInit = {}
): RequestInit => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Request-ID': crypto.randomUUID(), // For request tracing
    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    ...options.headers, // Allow override
  };

  return {
    method: options.method || 'GET',
    headers,
    credentials: 'include', // Always send cookies
    cache: 'no-store', // Prevent stale data
    ...options, // Allow any override
  };
};

/**
 * Create fetch request with automatic token injection from cookies
 * @param url - Full API URL
 * @param options - Additional RequestInit options
 * @returns Complete RequestInit configuration with auto-injected token
 */
export const createAuthenticatedRequest = (
  url: string,
  options: RequestInit = {}
): RequestInit => {
  const accessToken = getAccessTokenFromCookies();
  return createFetchRequest(url, accessToken, options);
};

// ============================================================================
// 🧹 Response Cleaning Helpers
// ============================================================================

/**
 * Clean individual string value from backend
 * Handles: null, undefined, "null", "undefined", "string", whitespace
 * 
 * @param value - Raw value from backend
 * @returns Cleaned string or empty string
 */
export const cleanStringValue = (value: string | null | undefined): string => {
  if (!value || typeof value !== 'string') return '';
  
  const trimmed = value.trim();
  
  // Handle common backend garbage values
  const invalidValues = ['string', 'null', 'undefined', 'NaN'];
  if (invalidValues.includes(trimmed)) return '';
  
  return trimmed;
};

/**
 * Clean user response from backend
 * Normalizes all string fields to prevent UI issues
 * 
 * @param data - Raw backend response
 * @returns Cleaned UserResponse
 */
export const cleanUserResponse = (data: any): UserResponse => {
  if (!data) {
    throw new Error('No user data received from backend');
  }

  return {
    ...data,
    email: cleanStringValue(data.email),
    realName: cleanStringValue(data.realName),
    nickname: cleanStringValue(data.nickname),
    description: cleanStringValue(data.description),
    githubUrl: cleanStringValue(data.githubUrl),
    linkedinUrl: cleanStringValue(data.linkedinUrl),
    blogUrl: cleanStringValue(data.blogUrl),
    profileImageUrl: cleanStringValue(data.profileImageUrl),
    role: data.role || 'GUEST', // Ensure role always exists
  };
};

// ============================================================================
// 🚨 Error Handling Helpers (보안: 내부 구조·상태코드·서버 메시지 노출 금지)
// ============================================================================

/**
 * API 실패 시 사용자에게 보여줄 안전한 메시지만 반환합니다.
 * 상태 코드, JSON, 서버 상세 메시지는 반환하지 않습니다.
 */
export const getSafeApiErrorMessage = (response: Response, context?: string): string => {
  if (response.status === 401) return '로그인이 필요합니다. 다시 로그인해주세요.';
  if (response.status === 403) return '접근 권한이 없습니다.';
  if (response.status === 400) return '잘못된 요청입니다. 입력 내용을 확인해 주세요.';
  if (response.status === 404) return context ? `${context} 정보를 찾을 수 없습니다.` : '요청한 정보를 찾을 수 없습니다.';
  if (response.status === 409) return '요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.';
  if (response.status >= 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  return '요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.';
};

/**
 * Parse and normalize error from fetch response.
 * 사용자에게 보여줄 메시지만 반환 (상태코드·서버 message/error 필드 노출 안 함).
 */
export const parseApiError = (
  response: Response,
  _data: any,
  context: string
): string => {
  if (response.status === 401) return '로그인이 필요합니다. 다시 로그인해주세요.';
  if (response.status === 403) return '접근 권한이 없습니다.';
  if (response.status === 400) return '잘못된 요청입니다. 입력 내용을 확인해 주세요.';
  if (response.status === 404) return `${context} 정보를 찾을 수 없습니다.`;
  if (response.status === 409) return '요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.';
  if (response.status >= 500) return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  return '요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.';
};

/**
 * Handle fetch errors (network, timeout, etc.)
 * @param error - Caught error object
 * @returns User-friendly error message
 */
export const handleFetchError = (error: unknown): string => {
  if (error instanceof Error) {
    // Network errors
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      return '네트워크 연결을 확인해주세요.';
    }
    
    // Timeout errors
    if (error.name === 'AbortError') {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }
    
    // Pass through existing error messages
    return error.message;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

// ============================================================================
// 🔧 Utility Helpers
// ============================================================================

/**
 * Safe JSON parse with fallback
 * @param response - Fetch Response object
 * @returns Parsed JSON or null
 */
export const safeJsonParse = async (response: Response): Promise<any | null> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Build query string from object
 * @param params - Query parameters object
 * @returns URL query string (e.g., "?key=value&key2=value2")
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  
  return filtered ? `?${filtered}` : '';
};

/**
 * Sleep/delay helper for retry logic
 * @param ms - Milliseconds to wait
 */
export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// 🔄 Retry Helper (for flaky backends)
// ============================================================================

/**
 * Retry fetch request with exponential backoff
 * Useful for handling temporary backend failures
 * 
 * @param fetchFn - Function that returns a Promise
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @param baseDelay - Base delay in ms (default: 1000)
 * @returns Result of fetchFn
 */
export const retryFetch = async <T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on auth errors or client errors
      if (error instanceof Response) {
        if (error.status === 401 || error.status === 403 || error.status < 500) {
          throw error;
        }
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) break;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  
  throw lastError;
};

// ============================================================================
// 📝 Type Guards
// ============================================================================

/**
 * Check if value is a valid email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
