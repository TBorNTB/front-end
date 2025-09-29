// lib/api.ts
// Configuration for frontend API endpoints connecting with SSG backend microservices
const API_CONFIG = {
  DEVELOPMENT: 'http://43.202.91.154:8000', // Your staging server
};

export const BASE_URL = API_CONFIG.DEVELOPMENT;

// Feature-specific endpoints matching your microservices
export const API_ENDPOINTS = {

  // User-service endpoints (based on your Swagger docs)
  USERS: {
    // Authentication endpoints
    LOGIN: '/users/login',           // POST /users/login (사용자 로그인)
    SIGNUP: '/users',                // POST /users (회원가입) 
    LOGOUT: '/users/logout',         // POST /users/logout (로그아웃)
    
    // User management endpoints
    GET_ALL: '/users',               // GET /users (전체 사용자 조회)
    DELETE_USER: '/users',           // DELETE /users (사용자 탈퇴)
    UPDATE_USER: '/users',           // PATCH /users (사용자 정보 수정)
    CONFIRM_USER: '/users/{username}/confirm',  // PATCH /users/{username}/confirm (정식 회원 승인)
    GRANT_ADMIN: '/users/{grantedUsername}/admin', // PATCH /users/{grantedUsername}/admin (관리자 권한 부여)
  },

  // Internal endpoints (based on your Swagger)
  INTERNAL: {
    USER_EXISTS: '/internal/{username}/exists',          // GET (사용자 존재 여부 확인)
    USER_EXISTS_MULTIPLE: '/internal/{username}/exists/multiple', // GET (방장 및 협력자 존재 여부 확인)
    ALL_USERS_EXIST: '/internal/exists',                 // GET (다중 사용자 존재 여부 확인)
    GET_NICKNAMES: '/internal/all',                      // GET (usernames을 받아서 실제 nicknames를 반환)
  },

  // Token management (based on your Swagger)
  TOKEN: {
    REISSUE: '/token/reissue',       // POST (토큰 재발급)
  },

  // S3 File management (based on your Swagger)
  S3: {
    PRESIGNED_URL: '/api/s3/presigned-url', // POST (S3 Presigned URL 생성)
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

  // Meta-service endpoints (comments, likes, etc.)
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

  // Categories (from your article categories enum)
  CATEGORIES: {
    GET_ALL: '/archive-service/categories',
  },
};

// Helper function
export const getApiUrl = (endpoint: string) => {
  return `${BASE_URL}${endpoint}`;
};
