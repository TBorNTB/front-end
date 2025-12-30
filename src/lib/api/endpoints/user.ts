// src/lib/user-service.ts
import { BASE_URL } from '@/lib/api/config'; // <-- use the shared gateway base URL

// Feature-specific endpoints matching microservices
export const USER_ENDPOINTS = {

  // User-service endpoints
  USER: {
    //user endpoints
    LOGIN: '/user-service/users/login',
    SIGNUP: '/user-service/users',
    LOGOUT: '/user-service/users/logout',
    ROLE: '/user-service/users/role/one',
    PROFILE: '/user-service/users/profile',

    //admin endpoints
    GET_ALL: '/user-service/users',
    GET_PAGED: '/user-service/users/page',
    DELETE_USER: '/user-service/users',
    UPDATE_USER: '/user-service/users',
    CONFIRM_USER: '/user-service/users/{username}/confirm',
    GRANT_ADMIN: '/user-service/users/{grantedUsername}/admin',
    SEND_VERIFICATION_CODE: '/user-service/users/auth/verification-code',                                     
    RESET_PASSWORD: '/user-service/users/auth/reset-password', 
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

} as const;

// ✅ Helper function with environment logging
export const getUserApiUrl = (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;

  if (process.env.NODE_ENV === 'development') {
    // Avoid noisy logs in production
    console.log(`🔗 API Request: ${url}`);
  }

  return url;
};
