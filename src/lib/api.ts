// Configuration for frontend API endpoints connecting with backend
const API_CONFIG = {
  // Development URLs
  DEVELOPMENT: 'http://43.202.91.154:8000', // Staging server (since localhost:8000 not working)
};

// Change this single line to switch environments
export const BASE_URL = API_CONFIG.DEVELOPMENT;

// Feature-specific endpoints for SSG Hub cybersecurity website
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/user-service/users/login',
  SIGNUP: '/user-service/users/signup',
  LOGOUT: '/auth/logout',
  
  // User Management
  GET_USER: '/users/profile',
  EDIT_USER: '/users/edit',
  
  // Articles
  ARTICLES: '/articles',
  ARTICLE_BY_ID: '/articles/:id',
  CREATE_ARTICLE: '/articles',
  
  // Projects
  PROJECTS: '/projects',
  PROJECT_BY_ID: '/projects/:id',
  CREATE_PROJECT: '/projects',
  
  // Topics/Categories
  TOPICS: '/topics',
  TOPICS_BY_CATEGORY: '/topics/:category',
  
  // Comments
  COMMENTS: '/comments',
  ARTICLE_COMMENTS: '/comments/article/:articleId',
  
  // Search
  SEARCH: '/search',
  SEARCH_ARTICLES: '/search/articles',
  
  // Newsletter
  NEWSLETTER_SUBSCRIBE: '/newsletter/subscribe',
  
  // Security Features (SSG-specific)
  VULNERABILITY_SCAN: '/security/scan',
  THREAT_INTEL: '/security/threat-intelligence',
  SECURITY_REPORTS: '/security/reports',
};

// Helper function
export const getApiUrl = (endpoint: string) => {
  return `${BASE_URL}${endpoint}`;
};
