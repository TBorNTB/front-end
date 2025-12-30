// src/lib/user-service.ts
import { BASE_URL } from '@/lib/api/config'; // <-- use the shared gateway base URL

// Feature-specific endpoints matching microservices
export const USER_ENDPOINTS = {

  // User-service endpoints
  USER: {
    // Authentication endpoints
    LOGIN: '/user-service/users/login',
    SIGNUP: '/user-service/users',
    LOGOUT: '/user-service/users/logout',
    ROLE: '/user-service/users/role/one',
    PROFILE: '/user-service/users/profile',

    // User management endpoints
    GET_ALL: '/user-service/users',
    DELETE_USER: '/user-service/users',
    UPDATE_USER: '/user-service/users',
    CONFIRM_USER: '/user-service/users/{username}/confirm',
    GRANT_ADMIN: '/user-service/users/{grantedUsername}/admin',
  },

  // Token management
  TOKEN: {
    REISSUE: '/user-service/token/reissue',
    REFRESH: '/user-service/token/refresh',
  },

  // S3 File management
  S3: {
    PRESIGNED_URL: '/user-service/api/s3/presigned-url',
  },

  // Alarm endpoints
  ALARM: {
    RECEIVED: '/user-service/alarm/received',
  },

  // RAG Service endpoints
  RAG: {
    QUERY: '/elastic-service/api/v1/rag/query',
  },
} as const;

// ✅ Helper function with environment logging
export const getApiUrl = (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;

  if (process.env.NODE_ENV === 'development') {
    // Avoid noisy logs in production
    console.log(`🔗 API Request: ${url}`);
  }

  return url;
};
