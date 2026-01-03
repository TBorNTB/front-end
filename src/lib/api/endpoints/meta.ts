// src/lib/user-service.ts
import { BASE_URL } from '@/lib/api/config'; // <-- use the shared gateway base URL

// Feature-specific endpoints matching microservices
export const META_ENDPOINTS = {

  // Meta-service endpoints
  META: {
    COUNT: '/meta-service/api/meta/count',
    COMMENTS: '/meta-service/comments',
    COMMENTS_BY_POST: '/meta-service/comments/post/:postId',
    LIKES: '/meta-service/likes',
    LIKE_POST: '/meta-service/likes/post/:postId',
  },
} as const;

// ✅ Helper function with environment logging
export const getMetaApiUrl = (endpoint: string) => {
  const url = `${BASE_URL}${endpoint}`;

  if (process.env.NODE_ENV === 'development') {
    // Avoid noisy logs in production
    console.log(`🔗 API Request: ${url}`);
  }

  return url;
};