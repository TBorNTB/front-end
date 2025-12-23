// src/lib/api/config.ts
// API 설정 중앙화 - BASE_URL, API_ENDPOINTS 관리

const API_CONFIG = {
  DEVELOPMENT: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  STAGING: 'https://api.sejongssg.kr',
  PRODUCTION: 'https://api.sejongssg.kr',
};

// 환경에 맞는 Base URL 반환
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || API_CONFIG.STAGING;
  }
  return process.env.NEXT_PUBLIC_API_URL || API_CONFIG.STAGING;
};

export const BASE_URL = getBaseUrl();

// 디버그용 로그
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Base URL:', BASE_URL);
}

// 모든 마이크로서비스 엔드포인트 정의
export const API_ENDPOINTS = {
  // User-service endpoints
  USERS: {
    LOGIN: '/user-service/users/login',
    SIGNUP: '/user-service/users',
    LOGOUT: '/user-service/users/logout',
    ROLE: '/user-service/users/role/one',
    PROFILE: '/user-service/users/profile',
    GET_ALL: '/user-service/users',
    GET_PAGED: '/user-service/users/page',
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
    GET_CATEGORIES: '/project-service/api/category',
  },

  // Meta-service endpoints
  META: {
    COUNT: '/meta-service/api/meta/count',
    COMMENTS: '/meta-service/comments',
    COMMENTS_BY_POST: '/meta-service/comments/post/:postId',
    LIKES: '/meta-service/likes',
    LIKE_POST: '/meta-service/likes/post/:postId',
  },

  // Elastic-service endpoints
  ELASTIC: {
    PROJECT_SEARCH: '/elastic-service/api/elastic/project/search',
    PROJECT_SEARCH_LATEST: '/elastic-service/api/elastic/project/search/latest',
    PROJECT_SUGGESTION: '/elastic-service/api/elastic/project/suggestion',
    NEWS_SEARCH: '/elastic-service/api/elastic/news/search',
    NEWS_SEARCH_LATEST: '/elastic-service/api/elastic/news/search/latest',
    NEWS_SUGGESTION: '/elastic-service/api/elastic/news/suggestion',
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

  // RAG Service endpoints
  RAG: {
    QUERY: '/elastic-service/api/v1/rag/query',
  },
} as const;

// API URL 생성 헬퍼 함수
export const getApiUrl = (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 API Request: ${url}`);
  }

  return url;
};
