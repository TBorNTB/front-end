// src/lib/api/endpoints/user.ts
import { getApiUrl } from '@/lib/api/config'; // Shared gateway (unchanged)

// Feature-specific endpoints (unchanged - perfect!)
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
    SEARCH_CURSOR: '/user-service/users/search/cursor',
    SEARCH_CURSOR_BY_NAME: '/user-service/users/search/cursor/name',
    DELETE_USER: '/user-service/users',
    UPDATE_USER: '/user-service/users',
    CONFIRM_USER: '/user-service/users/{username}/confirm',
    GRANT_ADMIN: '/user-service/users/{grantedUsername}/admin',
    SEND_VERIFICATION_CODE: '/user-service/users/auth/verification-code',                                     
    RESET_PASSWORD: '/user-service/users/auth/reset-password',
    COUNT_NEW: '/user-service/users/count/new',
    ROLE_ALL: '/user-service/users/role/all',
    ROLE_MANAGE: '/user-service/users/role/manage/:id',
    SEARCH: '/user-service/users/search', 
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
    MARK_AS_SEEN: '/user-service/alarm/{alarmId}/seen',
  },

  // View & Like endpoints
  VIEW: {
    COUNT: '/user-service/api/view/:id/count',
    INCREMENT: '/user-service/api/view/:id',
    WEEKLY_COUNT: '/user-service/api/view/count/weekly',
    DAILY_COUNT_BETWEEN: '/user-service/api/view/count/daily/between',
  },
  LIKE: {
    COUNT: '/user-service/api/like/:id/count',
    STATUS: '/user-service/api/like/:id/me',
    TOGGLE: '/user-service/api/like/:id',
  },

  // Comment endpoints
  COMMENT: {
    CREATE: '/user-service/api/comment/:postId',
    UPDATE: '/user-service/api/comment/:commentId',
    DELETE: '/user-service/api/comment/:commentId',
    GET_LIST: '/user-service/api/comment/:postId',
    CREATE_REPLY: '/user-service/api/comment/:postId/reply/:parentId',
    GET_REPLIES: '/user-service/api/comment/:commentId/replies',
  },

} as const;

// Use shared logging from config, no process.env duplication
export const getUserApiUrl = (endpoint: string) => {
  return getApiUrl(endpoint); // Delegates to config (handles logging + mocks)
};
