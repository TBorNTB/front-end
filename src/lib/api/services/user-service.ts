// lib/user-service.ts
// Configuration for frontend API endpoints connecting with SSG backend microservices

const API_CONFIG = {
  DEVELOPMENT: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080', // Local backend
  STAGING: 'https://api.sejongssg.kr', // Your deployed server
  PRODUCTION: 'https://api.sejongssg.kr', // Same for now, change later if needed
};

// ✅ Auto-detect environment
const getBaseUrl = () => {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    // Use environment variable if set, otherwise use staging
    return process.env.NEXT_PUBLIC_API_URL || API_CONFIG.STAGING;
  }
  
  // Server-side: use environment variable or staging
  return process.env.NEXT_PUBLIC_API_URL || API_CONFIG.STAGING;
};

export const BASE_URL = getBaseUrl();

// Feature-specific endpoints matching microservices
export const API_ENDPOINTS = {
  // User-service endpoints 
  USERS: {
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

  // Archive-service endpoints
  ARCHIVES: {
    GET_ALL: '/archive-service/archives',
    GET_BY_ID: '/archive-service/archives/:id',
    GET_BY_CATEGORY: '/archive-service/archives/category/:category',
    CREATE: '/archive-service/archives',
    UPDATE: '/archive-service/archives/:id',
    DELETE: '/archive-service/archives/:id',
  },

  // Project-service endpoints  
  PROJECTS: {
    GET_ALL: '/project-service/projects',
    GET_BY_ID: '/project-service/projects/:id',
    GET_BY_CATEGORY: '/project-service/projects/category/:category',
    CREATE: '/project-service/projects',
    UPDATE: '/project-service/projects/:id',
    DELETE: '/project-service/projects/:id',
    GET_COLLABORATORS: '/project-service/projects/:id/collaborators',
  },

  // Meta-service endpoints
  META: {
    COMMENTS: '/meta-service/comments',
    COMMENTS_BY_POST: '/meta-service/comments/post/:postId',
    LIKES: '/meta-service/likes',
    LIKE_POST: '/meta-service/likes/post/:postId',
  },

  // Newsletter-service endpoints
  NEWSLETTER: {
    SUBSCRIBE: '/newsletter-service/subscribe',
    UNSUBSCRIBE: '/newsletter-service/unsubscribe',
  },

  // Categories
  CATEGORIES: {
    GET_ALL: '/archive-service/categories',
  },

  // Alarm endpoints
  ALARM: {
    RECEIVED: '/user-service/alarm/received',
  },
} as const;

// ✅ Helper function with environment logging
export const getApiUrl = (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 API Request: ${url}`);
  }
  
  return url;
};
