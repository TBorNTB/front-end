// src/lib/user-service.ts
import { getApiUrl } from '@/lib/api/config'; // <-- use the shared gateway base URL

// Feature-specific endpoints matching microservices
export const META_ENDPOINTS = {

  // User-service endpoints
  META: {
    COUNT: '/user-service/api/meta/count',
    ADMIN_COUNT: '/user-service/api/meta/admin/count',
    COMMENTS: '/user-service/comments',
    COMMENTS_BY_POST: '/user-service/comments/post/:postId',
    LIKES: '/user-service/likes',
    LIKE_POST: '/user-service/likes/post/:postId',
  },
} as const;

export const getMetaApiUrl = (endpoint: string) => getApiUrl(endpoint);
